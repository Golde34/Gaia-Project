User Input -> Switching Engine / LLM 
                            |
                            v
Concept memory          Working memory      Episodic snapshots
(semantic nodes)        (task graph)        milestones / anchor points
                            |
                            v
                    META GRAPH
                    node = memory objects                             -> Recursive Summary -> Long term memory
                    edge = semantic / task / milestone links                                          |
                                                                                                      v
                                                                                                Context Builder / 
                                                                                                Retrieval layer

1. Switching engine
+ Sử dụng semantic router và một lần LLM để xác định tool gì và layer cần đi đến là gì:
+ Khi đi qua semantic, có thể thu được một list các tool liên quan -> Có thể check graph các relationship các tool cần dùng là gì -> thu được một list các tool người dùng có thể muốn thực hiện 
+-> Đưa graph này sang cho proactive recommendation để thực hiện suggestion hoặc thực hiện trước một số hành động 
+-> đi qua LLM để chọn ra được một tool và layer cần thiết

2. Concept Layer -> Giữ nguyên

3. Working memory
+ Thực hiện call LLM api để extract step và tạo ra JSON structure các step để build graph, có thể dùng small LLM
+ Insert/Update node + edge vào graph
+ Traverse graph và lấy các node liên quan
+ Build prompt context cho task
+ Call LLM api để tạo output
* Lưu ý cần check lại thuật toán build graph và traversel hiệu quả, có thể có pruning ở khu vực này

4. Episodic snapshots
+ Vẫn được trigger từ switching engine, chúng ta sẽ tóm tắt lại được thông tin toàn bộ cuộc hội thoại
+ Prompt mẫu:
You are episodic memory generator. Your task is to create a concise summary of the following conversation that captures key milestones and anchor points. The summary should be brief yet informative, highlighting significant events, decisions, and changes in context.
Given the conversation adn the current task context, identify if this moment is a milestone, decision or important insight that should be saved.
If yes:
 - Generate a clean JSON snapshot with:
   - milestone_title: A brief title for the milestone
   - 3-5 sentence summary: A concise summary of the milestone
   - link to relevant task steps
   - important score
Only output the JSON object.

5. Meta Graph
+ Khi tổng hợp lại các memory của các engine trên, ta có thể define như sau:
  - Node: memory object (concept node, working memory step, episodic snapshot)
  - Edge: concept -> working node, working node -> episodic, concept -> episodic, episodic -> episodic (theo timeline) semantic embeding edge để link các node có embedding gần nhau
+ Ví dụ về một node:
{
      "id": "node_12345",
      "type": "working_memory",
      "name": "Extracted Steps for Project X",
      "embedding": [0.123, 0.456, ...],  // Vector representation
      "metadata": {
            "created_at": "2024-10-01T12:34:56Z",
            "source": "LLM Extraction",
            "related_concept_ids": ["concept_67890", ...],
            "related_episodic_ids": ["episodic_54321", ...]
      }, ...
      "content": {
            // Depending on type, this could be:
            // - For concept nodes: detailed description, definitions
            // - For working memory: JSON structure of steps
            // - For episodic snapshots: summary text and links
      }
}
+ Meta graph sẽ trông như sau:
c13:cool_climate_preference
s1:define_switching_engine
e5:milestone_switching_eingine_defined
s2:build_working_memory_graph

=> c13 -> s1 (concept support task)
=> s1 -> e5 (task leads to milestone)
=> e5 -> s2 (next part of task)
=> s2 -> c13 (task references concept)
Các node này sau đó được liên kết lại bởi semantic edges để tạo ra meta graph
Các quan hệ giữa các node lúc này là semantic / milestone / dependency / summarization

6. Recursive Summary & Long term memory
+ Thu được RS và LTM, sau đó tạo thành các node
+ RS node: các summary nodes có embedding , metadata, task preferences, episodic references, timestamp
+ LTM node: Các knowledge / generalization nodes, patterns, rules, prreference info
+ Các node này được liên kết với meta graph thông qua các semantic edge

SUMMARY:
1. User input -> Switching engine -> xác định tool và layer
2. Layer process:
  - Concept memory: giữ nguyên
  - Working memory: extract step, build graph, traverse graph, build context, call LLM
  - Episodic snapshots: tóm tắt milestone, tạo JSON snapshot
3. Context Builder / Retrieval layer:
  - Tạo meta graph từ các node và edge
  - Thêm các node từ RS và LTM vào meta graph
  - Sử dụng meta graph để xây dựng context cho các tương tác trong tương lai
4. Retrieval lại thông tin từ Meta Graph để đưa ra câu trả lời phù hợp cho user

