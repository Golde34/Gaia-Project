# Sequential Flow - Luồng xử lý từ Chat UseCase đến Orchestrator Service

## Tổng quan
Document này mô tả chi tiết luồng xử lý một message từ user qua các layer: Chat UseCase → Thinking UseCase → Orchestrator Service.

---

## 1. Entry Point: Chat UseCase

### 1.1. ChatInteractionUsecase.handle_send_message()
**File**: `chat_hub/core/usecase/chat_usecase.py`

**Chức năng**: Nhận request từ user và khởi tạo luồng xử lý message

**Input**:
- `user_id`: ID của user
- `request: SendMessageRequest`: Chứa message, dialogue_id, msg_type

**Flow**:
1. Tạo/lấy dialogue từ database
2. Lưu user message vào database → nhận `user_message_id`
3. Lấy model configuration của user từ auth_service
4. Xây dựng `QueryRequest` object:
   ```python
   QueryRequest(
       user_id=user_id,
       query=request.message,
       model=user_model,
       dialogue_id=str(dialogue.id),
       type=request.msg_type,
   )
   ```
5. Convert msg_type → chat_type (ví dụ: DialogueEnum.CHAT_TYPE → ChatType.ABILITIES)
6. **Gọi Thinking UseCase**:
   ```python
   bot_response = await thinking.chat(
       query=query_request,
       chat_type=chat_type,
       user_message_id=user_message_id,
       is_change_title=is_change_title,
       memory_model=user_model.memory_model
   )
   ```
7. Lưu bot response(s) vào database
8. Return data về cho client qua SSE stream

---

## 2. Middle Layer: Thinking UseCase

### 2.1. ThinkingUsecase.chat()
**File**: `chat_hub/core/usecase/thinking_usecase.py`

**Chức năng**: Phân loại và xử lý query dựa trên memory model

**Input**:
- `query: QueryRequest`
- `chat_type: str` (optional, default: abilities)
- `**kwargs`: user_message_id, is_change_title, memory_model

**Flow**:
1. Xác định memory_model (DEFAULT hoặc GRAPH)
2. Route đến flow tương ứng:
   - `chat_with_normal_flow()` - Flow chính (được sử dụng phổ biến)
   - `chat_with_graph_flow()` - Flow dùng graph-based memory

### 2.2. ThinkingUsecase.chat_with_normal_flow()

**Flow chi tiết**:

#### Bước 1: Tool Selection
```python
tool, use_chat_history_prompt = await tool_selection.select_tool_by_router(
    label_value=chat_type, 
    query=query
)
```

**Trong tool_selection.select_tool_by_router()**:
- Nếu chat_type = ABILITIES:
  - Semantic search để shortlist top 5 tools từ vector database
  - Reranking để chọn tool phù hợp nhất
  - Nếu score top1 và top2 gần nhau → dùng LLM để phân loại chính xác
  - Return: `(tool_name, need_history)`

#### Bước 2: Memory Retrieval (nếu cần)
```python
if use_chat_history_prompt:
    query = await memory_service.recall_history_info(query=query, default=default)
```

**Trong memory_service.recall_history_info()**:
- Query recent history từ database/Redis
- Query recursive summary (tóm tắt các đoạn hội thoại cũ)
- Query long-term memory từ vector database
- Reflection: Tạo new_query có context từ history
- Update query.query với context đầy đủ

#### Bước 3: Route và Execute
```python
responses = await chat_routers.call_router_function(
    label_value=chat_type, 
    query=query, 
    guided_route=tool
)
```

**Với chat_type = ABILITIES**:
- Gọi function được register với decorator `@llm_route(label=ChatType.ABILITIES.value)`
- **→ Gọi đến orchestrate() function**

#### Bước 4: Memorize
```python
await memory_service.memorize_info(query=query, is_change_title=is_change_title)
```
- Update chat history vào Redis/database
- Update recursive summary nếu cần
- Tạo long-term memory embedding nếu đủ điều kiện

---

## 3. Execution Layer: Orchestrator Service

### 3.1. orchestrate() - Entry Point
**File**: `chat_hub/core/service/orchestrator_service.py`

**Decorator**: `@llm_route(label=ChatType.ABILITIES.value)`

**Input**:
- `query: QueryRequest`
- `guided_route: str` - Tool name được select từ thinking usecase

**Flow**:
1. Resolve task từ guided_route:
   ```python
   task = orchestrator_service.resolve_tasks(guided_route)
   ```
   - Return: `{"ability": tool_name, "executor": function, "is_sequential": bool}`

2. Execute task:
   ```python
   orchestration_result = await orchestrator_service.execute(query=query, task=task)
   ```

3. Extract responses từ result
4. Return list responses về thinking usecase

### 3.2. OrchestratorService.resolve_tasks()

**Chức năng**: Map tool name → executor function

**Input**: `guided_route: str` (tool name)

**Output**:
```python
{
    "ability": guided_route,
    "executor": FUNCTIONS.get(guided_route, {}).get("executor"),
    "is_sequential": FUNCTIONS.get(guided_route, {}).get("is_sequential", False),
}
```

**FUNCTIONS Registry**:
- Là dictionary chứa các function được register bằng `@function_handler` decorator
- Example:
  ```python
  @function_handler(label=GaiaAbilities.CREATE_TASK.value, is_sequential=True)
  async def create_personal_task(query: QueryRequest):
      # implementation
  ```

### 3.3. OrchestratorService.execute()

**Chức năng**: Điều phối execution dựa trên task type

**Flow**:
1. Kiểm tra task có tồn tại không
2. Branch theo execution type:
   - **Sequential Flow**: `_run_sequential_flow()`
   - **Parallel Flow**: `_run_parallel_flow()`

### 3.4. _run_sequential_flow() - Flow chính cho sequential tasks

**Flow chi tiết**:

#### Bước 1: Execute Task
```python
response, status_value = await task.get("executor")(query=query)
```

**Trong executor wrapper (từ @function_handler)**:
1. Tạo AgentExecution record trong database (status=INIT)
2. Execute actual function (ví dụ: create_personal_task)
3. Update AgentExecution với result:
   - SUCCESS: Lưu tool_output
   - FAILED: Lưu error message
4. Return result

#### Bước 2: Normalize Status
```python
status = self._normalize_status(status_value)
```
- Convert string/any type → TaskStatus enum
- Supported: SUCCESS, FAILED, PENDING

#### Bước 3: Handle Recommendation (nếu SUCCESS)
```python
if status != TaskStatus.PENDING:
    recommendation = await self._handle_recommendation(query)
```

**Trong _handle_recommendation()**:
1. Fetch recommendation từ recommendation_service_client
2. (Optional) Persist recommendation message vào database
3. (Optional) Broadcast recommendation qua SSE
4. Return recommendation text

#### Bước 4: Return Result
```python
return response, recommendation, True
```
- `response`: Kết quả từ executor
- `recommendation`: Gợi ý cho user
- `True`: recommendation_handled flag

### 3.5. _run_parallel_flow() - Flow cho parallel tasks

**Flow**:
1. Run đồng thời:
   - Dispatch task execution (background)
   - Fetch recommendation
2. Task execution chạy trong background thread pool:
   ```python
   background_loop_pool.schedule(
       lambda: self._run_parallel_task(task, query, pending_record),
       callback=log_background_task_error
   )
   ```
3. Return ngay với status=PENDING
4. Khi task complete → publish result qua Kafka

---

## 4. Data Flow Summary

```
User Message
    ↓
ChatInteractionUsecase.handle_send_message()
    ↓
[Create/Get Dialogue, Save User Message]
    ↓
ThinkingUsecase.chat()
    ↓
ThinkingUsecase.chat_with_normal_flow()
    ↓
┌─────────────────────────────────────────────┐
│ 1. Tool Selection                           │
│    - Semantic search (top 5)                │
│    - Reranking                              │
│    - LLM classification (if ambiguous)      │
│    → guided_route = "CREATE_TASK"           │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 2. Memory Retrieval (if needed)             │
│    - Recent history                         │
│    - Recursive summary                      │
│    - Long-term memory                       │
│    - Reflection → new query with context    │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 3. Route & Execute                          │
│    chat_routers.call_router_function()      │
│    → orchestrate(query, guided_route)       │
└─────────────────────────────────────────────┘
    ↓
OrchestratorService.orchestrate()
    ↓
┌─────────────────────────────────────────────┐
│ 1. Resolve Tasks                            │
│    - Get executor function from FUNCTIONS   │
│    - Get is_sequential flag                 │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 2. Execute Task                             │
│    if is_sequential:                        │
│        _run_sequential_flow()               │
│        ├─ Execute function                  │
│        ├─ Create AgentExecution record      │
│        ├─ Update status                     │
│        └─ Fetch recommendation              │
│    else:                                    │
│        _run_parallel_flow()                 │
│        ├─ Dispatch to background            │
│        └─ Return PENDING immediately        │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 3. Extract & Format Response                │
│    - Primary response                       │
│    - Recommendation (if any)                │
└─────────────────────────────────────────────┘
    ↓
Return to ThinkingUsecase
    ↓
┌─────────────────────────────────────────────┐
│ 4. Memorize                                 │
│    - Update chat history                    │
│    - Update recursive summary               │
│    - Create long-term memory                │
└─────────────────────────────────────────────┘
    ↓
Return responses to ChatInteractionUsecase
    ↓
┌─────────────────────────────────────────────┐
│ 5. Store Bot Response(s)                    │
│    - Save to database                       │
│    - Link to user_message_id                │
└─────────────────────────────────────────────┘
    ↓
Return to Client via SSE Stream
```

---

## 5. Key Components

### 5.1. QueryRequest Object
```python
class QueryRequest:
    user_id: int
    query: str                    # Câu hỏi (có thể đã được enrich với context)
    model: LLMModel              # Model config của user
    dialogue_id: str             # ID cuộc hội thoại
    type: str                    # Message type
    user_message_id: str         # ID của user message
```

### 5.2. FUNCTIONS Registry
- Dictionary mapping tool name → executor function
- Được populate bởi `@function_handler` decorator
- Structure:
  ```python
  {
      "CREATE_TASK": {
          "executor": wrapped_create_task_function,
          "is_sequential": True
      },
      "SEARCH": {
          "executor": wrapped_search_function,
          "is_sequential": False
      }
  }
  ```

### 5.3. Task Structure
```python
{
    "ability": "CREATE_TASK",           # Tool name
    "executor": async_function,         # Executable function
    "is_sequential": True/False         # Execution mode
}
```

### 5.4. Orchestration Result
```python
{
    "type": "CREATE_TASK",              # Ability type
    "response": "Task created...",      # Primary response
    "recommendation": "You might...",   # Suggestion
    "recommend_handled": True/False     # Whether recommendation was processed
}
```

---

## 6. Các vấn đề cần lưu ý

### ⚠️ 6.1. Inconsistency trong naming
- `chat_usecase.py` define class `ChatInteractionUsecase`
- Nhưng instance export là `chat_interaction_usecase` (lowercase)
- `thinking_usecase.py` define class `ThinkingUsecase` và import as `thinking`
- Nên thống nhất naming convention

### ⚠️ 6.2. Recommendation handling
Trong `orchestrator_service.py`, có code bị comment:
```python
# await self._persist_recommendation_message(query, recommendation)
# await self._broadcast_recommendation(query, recommendation)
```
- Không rõ lý do tại sao bị comment
- Nếu không cần → nên xóa hẳn các method này
- Nếu cần → nên uncomment và test lại

### ⚠️ 6.3. Agent Execution tracking
Trong `_dispatch_parallel_task()`:
```python
# agent_execution_repo.save_task(query.user_id, task_id, pending_record)
```
- Line này bị comment nhưng không có explanation
- Có thể mất track với parallel tasks

### ⚠️ 6.4. Error handling
- Trong sequential flow, nếu executor raise exception:
  - AgentExecution được update với FAILED status
  - Exception được re-raise
  - Nhưng recommendation vẫn được fetch → không logic
  - Nên skip recommendation khi task failed

### ⚠️ 6.5. Memory model branching
Trong `thinking_usecase.py`:
```python
if memory_model == MemoryModel.GRAPH.value:
    return await cls.chat_with_graph_flow(...)
```
- `chat_with_graph_flow()` còn chưa hoàn thiện
- Các components (STAG, SLTG, EMG) được khởi tạo nhưng không rõ logic xử lý

### ⚠️ 6.6. Return type inconsistency
- `orchestrate()` return `list[str]`
- Nhưng `_run_sequential_flow()` return `Tuple[Dict[str, Any], str, bool]`
- Có layer chuyển đổi ở giữa nhưng không rõ ràng
- Cần document rõ contract giữa các layers

### ✅ 6.7. Điểm tốt
1. **Separation of Concerns**: Mỗi layer có responsibility rõ ràng
2. **Decorator Pattern**: `@function_handler` giúp register functions dễ dàng
3. **Tool Selection**: Semantic search + reranking + LLM là approach tốt
4. **Memory System**: Có cả short-term, recursive summary và long-term memory
5. **Agent Execution Tracking**: Track được execution status và results

---

## 7. Luồng xử lý với ví dụ cụ thể

### Example: User nói "Tạo task làm báo cáo"

1. **ChatInteractionUsecase**:
   - Lưu message vào DB
   - QueryRequest: `{user_id: 123, query: "Tạo task làm báo cáo", ...}`
   - chat_type = ChatType.ABILITIES

2. **ThinkingUsecase**:
   - Tool selection:
     - Semantic search → Top 5: [CREATE_TASK, SEARCH, SCHEDULE, ...]
     - Reranking → Top 3: [CREATE_TASK, SCHEDULE, SEARCH]
     - Score CREATE_TASK cao nhất → guided_route = "CREATE_TASK"
     - need_history = True
   - Memory retrieval:
     - Recent: "User vừa nói về project X"
     - Recursive: "User đang làm về AI assistant"
     - Long-term: "User thường tạo task vào sáng"
     - Reflection: "Tạo task làm báo cáo cho project X về AI assistant"
   - Route đến orchestrate() với enriched query

3. **OrchestratorService**:
   - Resolve: task = {ability: "CREATE_TASK", executor: create_task_func, is_sequential: True}
   - Execute sequential flow:
     - Tạo AgentExecution (id=456, status=INIT)
     - Call create_task_func(query)
     - Task service tạo task thành công
     - Update AgentExecution (id=456, status=SUCCESS, output="Task created with ID 789")
     - Fetch recommendation: "Bạn có muốn set reminder cho task này không?"
   - Return: response="Task đã được tạo với ID 789", recommendation="..."

4. **Back to ChatInteractionUsecase**:
   - Lưu 2 bot messages:
     - Message 1: "Task đã được tạo với ID 789"
     - Message 2: "Bạn có muốn set reminder cho task này không?"
   - Stream về client qua SSE

---

## 8. Race Condition Issue và Giải pháp

### 8.1. Vấn đề hiện tại

**Scenario**: User tạo task "Tạo task làm báo cáo"

**Luồng hiện tại**:
```
[SSE Connection Opened]
    ↓
User Request → ChatUsecase
    ↓
ThinkingUsecase → OrchestratorService
    ↓
create_personal_task() được gọi
    ↓
1. LLM generate task data (2-3 giây)
2. Return response: "Đang tạo task..." + status=PENDING
3. Background task dispatch Kafka message
    ↓
[Kafka processing - rất nhanh, 100-200ms]
    ↓
Task Manager Service tạo task
    ↓
Kafka publish GENERATE_TASK_RESULT
    ↓
Kafka Consumer xử lý → task_status_handler
    ↓
Generate task result message (LLM call ~1-2s)
    ↓
Publish to PUSH_MESSAGE topic
    ↓
Notify Agent nhận message
    ↓
Push qua WebSocket về Client
    ↓
[WebSocket notification arrives] ← ARRIVES FIRST!
    ↓
... (SSE connection vẫn đang xử lý)
    ↓
[SSE Connection Closed] ← Đến sau!
```

**⚠️ Problem**: WebSocket push notification về client **TRƯỚC** khi SSE stream hoàn thành:
- Client nhận 2 messages không đồng bộ
- UI có thể render sai thứ tự
- User experience không tốt (message "jump" around)

### 8.2. Root Causes

#### Cause 1: Sequential Task return quá sớm
```python
# task_service.py - create_personal_task()
task_data = await self._generate_personal_task_llm(query)  # 2-3s
background_task = asyncio.create_task(...)  # Fire and forget
return task_data["response"], TaskStatus.PENDING  # ← Return ngay!
```
- Function return status=PENDING ngay khi có task_data
- Background task chạy song song nhưng SSE stream chưa đóng

#### Cause 2: Kafka quá nhanh
```
LLM generate task data: ~2-3 giây
Background dispatch: ~100ms
Task Manager create: ~50ms
Kafka publish + consume: ~50ms
Generate result (LLM): ~1-2 giây
WebSocket push: ~50ms
------------------------
Total Kafka flow: ~1.5-2.5 giây

Nhưng SSE vẫn đang:
- Chunking response: ~1 giây (10 chunks × 0.1s sleep)
- Sending message_complete event
- Cleanup connection
```

#### Cause 3: Không có coordination mechanism
- SSE stream và Kafka notification **hoàn toàn độc lập**
- Không có cơ chế đợi hoặc synchronize
- Không có sequence number hoặc correlation

### 8.3. Giải pháp đề xuất

#### ✅ Solution 1: Synchronization với Agent Execution ID (Recommended)

**Concept**: Sử dụng `agent_execution_id` làm correlation ID để track và sync

**Flow mới**:
```python
# orchestrator_service.py - _run_sequential_flow()
async def _run_sequential_flow(self, task, query):
    # Tạo execution record trước khi execute
    execution = await agent_execution_repo.create_agent_execution(
        query=query,
        tool_name=task['ability'],
        status=TaskStatus.INIT
    )
    
    # Add execution_id vào query để downstream services track được
    query.agent_execution_id = str(execution.id)
    
    try:
        # Execute task với execution_id
        response, status_value = await task['executor'](query=query)
        status = self._normalize_status(status_value)
        
        if status == TaskStatus.PENDING:
            # Register pending state với execution_id
            await self._register_pending_task(
                execution_id=str(execution.id),
                query=query,
                expected_kafka_topic=KafkaTopic.ABILITY_TASK_RESULT.value
            )
            
            # Wait for Kafka result với timeout
            result = await self._wait_for_kafka_result(
                execution_id=str(execution.id),
                timeout=10.0  # 10 seconds max
            )
            
            if result:
                response = result['response']
                status = TaskStatus.SUCCESS
            else:
                # Timeout - return pending response
                response = response  # Keep original "Đang xử lý..." message
        
        # Update execution status
        await agent_execution_repo.update_agent_execution_status(
            execution_id=execution.id,
            status=status.value,
            tool_output=str(response)
        )
        
        # Fetch recommendation sau khi hoàn tất
        recommendation = ""
        if status == TaskStatus.SUCCESS:
            recommendation = await self._handle_recommendation(query)
        
        return response, recommendation, True
        
    except Exception as exc:
        await agent_execution_repo.update_agent_execution_status(
            execution_id=execution.id,
            status=TaskStatus.FAILED.value,
            tool_output=str(exc)
        )
        raise
```

**Implement waiting mechanism**:
```python
# orchestrator_service.py
class OrchestratorService:
    def __init__(self):
        self._pending_tasks: Dict[str, asyncio.Future] = {}
    
    async def _register_pending_task(self, execution_id: str, query: QueryRequest, expected_kafka_topic: str):
        """Register a pending task that's waiting for Kafka result"""
        future = asyncio.Future()
        self._pending_tasks[execution_id] = future
        
        # Store metadata for validation
        await agent_execution_repo.update_execution_metadata(
            execution_id=execution_id,
            metadata={
                "expected_topic": expected_kafka_topic,
                "waiting_for_kafka": True,
                "registered_at": datetime.utcnow().isoformat()
            }
        )
    
    async def _wait_for_kafka_result(self, execution_id: str, timeout: float = 10.0):
        """Wait for Kafka consumer to complete and provide result"""
        if execution_id not in self._pending_tasks:
            return None
        
        try:
            result = await asyncio.wait_for(
                self._pending_tasks[execution_id],
                timeout=timeout
            )
            return result
        except asyncio.TimeoutError:
            print(f"Timeout waiting for Kafka result for execution {execution_id}")
            return None
        finally:
            # Cleanup
            if execution_id in self._pending_tasks:
                del self._pending_tasks[execution_id]
    
    def resolve_pending_task(self, execution_id: str, result: dict):
        """Called by Kafka consumer to resolve pending task"""
        if execution_id in self._pending_tasks:
            future = self._pending_tasks[execution_id]
            if not future.done():
                future.set_result(result)
```

**Update Kafka consumer**:
```python
# ui/kafka/task_status_handler.py
async def _create_personal_task_result(data: dict) -> str:
    print("Creating personal task result with data:", data)
    task = data.get("task")
    query_data = data.get("query")
    query: QueryRequest = QueryRequest(**query_data)
    
    # Extract execution_id from query
    execution_id = query.agent_execution_id
    
    # Generate task result
    task_result = await personal_task_service.handle_task_result(task=task, query=query)
    
    # Resolve pending task in orchestrator (if SSE is still waiting)
    if execution_id:
        from core.service.orchestrator_service import orchestrator_service
        orchestrator_service.resolve_pending_task(
            execution_id=execution_id,
            result=task_result
        )
    
    # Still push to notify agent for mobile/inactive clients
    await publish_message(
        kafka_enum.KafkaTopic.PUSH_MESSAGE.value,
        kafka_enum.KafkaCommand.GENERATE_TASK_RESULT.value,
        task_result,
    )
```

**Benefits**:
- ✅ SSE stream đợi Kafka hoàn thành → response đầy đủ, đúng thứ tự
- ✅ Có timeout mechanism → không block mãi mãi
- ✅ Vẫn có fallback WebSocket notification cho mobile/inactive clients
- ✅ Track được toàn bộ lifecycle với agent_execution_id

**Drawbacks**:
- ⚠️ SSE connection giữ lâu hơn (~3-5 giây) → tốn resources
- ⚠️ Cần refactor orchestrator_service để support async waiting

---

#### ✅ Solution 2: Debounce với Sequence Number

**Concept**: Client-side debouncing với sequence tracking

**Backend changes**:
```python
# orchestrator_service.py - _run_sequential_flow()
async def _run_sequential_flow(self, task, query):
    # Generate sequence number
    sequence_id = str(uuid.uuid4())
    query.sequence_id = sequence_id
    
    response, status_value = await task['executor'](query=query)
    status = self._normalize_status(status_value)
    
    # Include sequence in response
    return {
        "response": response,
        "sequence_id": sequence_id,
        "status": status.value,
        "is_partial": status == TaskStatus.PENDING
    }, recommendation, True
```

**SSE stream update**:
```python
# sse_stream_service.py
await enqueue_event(
    "message_complete",
    {
        "message": "Stream completed",
        "full_response": normalized_response,
        "sequence_id": response_payload.get("sequence_id"),  # ← Add this
        "is_partial": response_payload.get("is_partial", False),
        "dialogue_id": dialogue_id,
    },
)
```

**Kafka consumer update**:
```python
# task_status_handler.py
task_result = await personal_task_service.handle_task_result(task=task, query=query)
task_result["sequence_id"] = query.sequence_id  # ← Propagate sequence
task_result["is_final"] = True

await publish_message(
    kafka_enum.KafkaTopic.PUSH_MESSAGE.value,
    kafka_enum.KafkaCommand.GENERATE_TASK_RESULT.value,
    task_result,
)
```

**Client-side handling**:
```typescript
// client_gui/src/services/messageHandler.ts
class MessageSequenceManager {
    private pendingMessages = new Map<string, {
        partial: Message | null,
        final: Message | null,
        timer: NodeJS.Timeout | null
    }>();
    
    handleMessage(message: Message) {
        const { sequence_id, is_partial, is_final } = message;
        
        if (!sequence_id) {
            // Legacy message, render immediately
            this.renderMessage(message);
            return;
        }
        
        if (!this.pendingMessages.has(sequence_id)) {
            this.pendingMessages.set(sequence_id, {
                partial: null,
                final: null,
                timer: null
            });
        }
        
        const pending = this.pendingMessages.get(sequence_id)!;
        
        if (is_partial) {
            pending.partial = message;
            // Set timeout to render partial if final doesn't arrive
            pending.timer = setTimeout(() => {
                if (pending.partial && !pending.final) {
                    this.renderMessage(pending.partial);
                }
                this.pendingMessages.delete(sequence_id);
            }, 3000); // 3 seconds grace period
        }
        
        if (is_final) {
            // Clear timeout
            if (pending.timer) {
                clearTimeout(pending.timer);
            }
            pending.final = message;
            
            // Render final message immediately
            this.renderMessage(message);
            this.pendingMessages.delete(sequence_id);
        }
    }
    
    renderMessage(message: Message) {
        // Render to UI
        console.log("Rendering message:", message);
    }
}
```

**Benefits**:
- ✅ Client có control về rendering order
- ✅ Backend không cần block/wait
- ✅ Graceful degradation (timeout render partial)
- ✅ Đơn giản, ít thay đổi backend

**Drawbacks**:
- ⚠️ Client phức tạp hơn
- ⚠️ Có thể vẫn thấy "flash" nếu timing không tốt
- ⚠️ Mỗi client phải implement logic này

---

#### ✅ Solution 3: Delay WebSocket Push (Quick Fix)

**Concept**: Add artificial delay vào notify_agent để đảm bảo SSE close trước

**Notify Agent changes**:
```go
// notify_agent/ui/kafka/task_result_handler.go
func (h *TaskResultHandler) HandleMessage(topic string, key, value []byte) {
    var payload map[string]interface{}
    json.Unmarshal(value, &payload)
    
    cmd := payload["cmd"].(string)
    if cmd == "generateTaskResult" {
        data := payload["data"].(map[string]interface{})
        
        // Add delay to let SSE connection close
        time.Sleep(2 * time.Second)  // ← Delay 2 giây
        
        // Push notification
        h.websocketUsecase.SendToUser(userId, messageBytes)
    }
}
```

**Benefits**:
- ✅ Cực kỳ đơn giản, chỉ 1 dòng code
- ✅ Không cần thay đổi architecture
- ✅ Fix được vấn đề ngay lập tức

**Drawbacks**:
- ⚠️ Hack không đẹp, hard-coded delay
- ⚠️ Nếu SSE chậm hơn 2s vẫn có thể race
- ⚠️ Làm chậm notification không cần thiết
- ⚠️ Không scale khi có nhiều loại tasks với timing khác nhau

---

#### ✅ Solution 4: Unified Message Queue (Architecture Change)

**Concept**: Tất cả responses (SSE + Kafka) đều qua một message queue có ordering

**Architecture mới**:
```
User Request
    ↓
ChatUsecase → ThinkingUsecase → OrchestratorService
    ↓
Execute Task
    ↓
Publish to "response_queue" với sequence
    ├─ Message 1: "Đang tạo task..." (sequence=1, partial=true)
    └─ Background: dispatch Kafka
            ↓
        Task created
            ↓
        Publish to "response_queue" (sequence=2, final=true)
    ↓
Response Queue Processor (ordered delivery)
    ↓
    ├─ Via SSE (if connection active)
    └─ Via WebSocket (if SSE closed)
```

**Benefits**:
- ✅ Đảm bảo ordering hoàn toàn
- ✅ Có thể switch giữa SSE/WebSocket seamlessly
- ✅ Scalable, professional architecture

**Drawbacks**:
- ⚠️ Cần refactor lớn toàn bộ hệ thống
- ⚠️ Thêm complexity và latency
- ⚠️ Tốn nhiều thời gian implement và test

---

### 8.4. So sánh giải pháp

| Giải pháp | Complexity | Effort | Reliability | Performance | Recommended |
|-----------|------------|--------|-------------|-------------|-------------|
| **1. Sync with Execution ID** | Medium | Medium | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ **Best** |
| **2. Sequence + Debounce** | Medium | Low-Medium | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Good |
| **3. Delay WebSocket** | Low | Very Low | ⭐⭐ | ⭐⭐⭐ | ⚠️ Quick fix only |
| **4. Unified Queue** | High | High | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⏭️ Future |

### 8.5. Recommendation Implementation Plan

**Phase 1 (Ngay lập tức)**: Solution 3 - Delay WebSocket
- Add 2s delay vào notify_agent
- Deploy và monitor
- Goal: Fix vấn đề tạm thời cho users

**Phase 2 (1-2 tuần)**: Solution 1 - Sync with Execution ID
- Implement execution_id tracking
- Add wait mechanism với timeout
- Update Kafka consumers
- Goal: Solution ổn định, scalable

**Phase 3 (Optional, sau 1 tháng)**: Solution 2 - Client-side Debounce
- Implement cho mobile app
- Fallback cho các trường hợp edge
- Goal: Better UX, handle network issues

**Phase 4 (Long-term)**: Consider Solution 4
- Nếu hệ thống scale lên nhiều
- Khi có nhiều loại async tasks
- Goal: Enterprise-grade architecture

---

## 9. Kết luận

**Luồng tổng thể là hợp lý** với:
- Clear separation of concerns
- Flexible tool selection
- Rich memory system
- Proper tracking và error handling

**Các điểm cần cải thiện**:
1. Uncomment hoặc xóa code bị comment
2. Thống nhất naming convention
3. Document rõ return types và contracts
4. Hoàn thiện graph memory flow
5. Review lại recommendation logic khi có error
6. Enable lại agent execution tracking cho parallel tasks