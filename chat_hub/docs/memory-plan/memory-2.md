Tối ưu file memory.md, tạo ra một living memory graph

User Request -> Switching Engine
                    |
                    v
STAG            Memory Engines(SLTG + EMG)     Context Builder / Retrieval Layer -> LLM Response
                    |                                 |
                    v                                 v
             Consolidation Layer    <------->  Context Assembly Graph (CAG)
                                                Semantic Layer (Interpretation, Knowledge Graph Analysis)
                    |                                 |
                    v                                 v
              Long Term Memory                   Recursive Summary

1. Input router / switching engine
+ Rule -> High precision
+ Embedding semantic match -> Fallback
+ LLM routing -> Khi mơ hồ 

- Định tuyến sang các module:
Command Interpreter
Intent/Task Extractor
Memory Interaction Engine

-  Layer 1: Shorterm

2. Short term activation graph
Graph tạm thời được tạo ra liên kết trực tiếp với:
+ Long term knowledge graph
+ Episodic memory graph
+ Recursive summary
Sau đó các activation hoặc node mới sẽ: 
+ PRUNE - nếu chỉ dùng tạm thời
+ REFINE - nếu mang thông tin
+ MERGE - nếu trùng semantic
+ ADD - nếu concept/episodic mới
--> Chỉ lưu vào main graph những gì meaningful giống như consolidation của hippocampus
Mục tiêu là tái tạo neural activation pattern giống như con người
* Biến: confidence score dùng để xác định mức độ quan trọng của conepts với tasks

* Biến: confidence score dùng để xác định mức độ quan trọng của conepts với tasks

3. Memory Engines
Semantic Long-Term Graph (SLTG)
+ Enduring concepts (user preferences, facts)
+ Stable tasks or milestones
+ Ontological relations
Trong đó các edge type:
+ Concept supports task
+ task leads to milestone
+ Milestone enables next task
+ Concept refines concept
+ Is_a, part_of, related_to, summary_of (link to recursive summary nodes)

Episodic Memory Graph (EMG)
Mỗi phiên tạo ra 1 hoặc nhiều episodic snapshot nodes -> checkpoint-based
+ Semantic summary
+ Milestone
+ Noteworthy events
+ Decision points

* Biến: decay mechanism tránh lưu trữ quá nhiều episodic nodes không cần thiết
        semantic layer để liên kết các episodic nodes với nhau và với SLTG

4. Consolidation Layer
Khi STAG được tạo ra, chạy một vòng consolidation:
+ STAG -> SLTG
Nếu activation liên quan đến existing node -> update edges / merge embeddings
Nếu là concept mới tạo node mới
Nếu là milestone -> tạo node milestone mới, link các task liên quan
+ STAG -> EMG
Nếu vượt ngưỡng significance -> tạo episodic snapshot node mới
Nếu không bỏ qua
+ EMG -> SLTG (Recursive summary)
Khi episodic nodes đủ nhiều, tạo một node r***(e98 -> e101) (kiểu vậy)
Node r*** sẽ trỏ vào concept nodes để giữ semantic alignment
-> Để kết nối long term memory và recursive summary

5. Context Builder / Retrieval Layer
Node Retrieval = semantic neighbors + activate task chain + active concept trees + relevant episodic summaries
-> Tạo thành Context Assembly Graph (CAG) để feed vào LLM
+ CAG sẽ bao gồm:
- Concept nodes từ SLTG
- Task / Milestone nodes từ SLTG
- Episodic snapshot nodes từ EMG
- Recursive summary nodes

Các bước cần xem xét nâng cấp:
- STAG có thể dùng một model llm nhẹ hơn chứ không phải gọi api để giảm chi phí tính toán xuống
- Di chuyển consolidation layer thành một process chạy nền định kỳ thay vì mỗi lần interaction: Input -> Router -> STAG creation -> Context Builder -> LLM response
Toàn bộ quá trình consolidation sẽ chạy nền để giảm latency
- Chỉ kích hoạt quy trình hợp nhất đầy đủ khi đạt đến một milestone nhất định
- Chỉ add các node/edge thô vào khu vực tạm thời, để quá trình MERGE / REFINE chạy định kì
- Giảm tần suất Recursive Summary generation, chỉ khi có nhiều episodic nodes mới hoặc theo lịch định kì
- Trong context bulider không query toàn bộ graph mà chỉ lấy 2-3 bước nhảy sâu nhất
- Nếu LLM vượt budget thì ưu tiên các node từ active task chains và relevant episodic summaries trước các semantic neighbó ít liên quan hơn
- NodeRAG dùng để retrieval document, có thể apply với SLTG + EMG để retrieval knowledge graph nodes

Các pattern có thể ứng dụng:
- Event-Centric Pattern (Mô hình lấy sự kiện làm trung tâm): xây dựng dựa trên các sự kiện và mối quan hệ thời gian, reasoning về sự kiện cho phép hệ thống trả lời các câu hỏi liên quan đến thời gian và mối quan hệ nhân quả.
- Contexttual Boundary Pattern: cái này là Context Builder luôn rồi
- Multi-Perspective Pattern: hai action cung cấp thông tin khác nhau về một sự kiên có thể sử dụng confidence score để quyết định tư duy hay phản hồi tiếp theo

Các kĩ thuật tối ưu hoá:
- Context Aware Indexing: Tích hợp vào ContextBuilder và Memory Engines để tối ưu hoá quá trình tìm kiếm thực thể và sự kiện trong bộ nhớ
- Materialized Path Pattern: Xử lý các mối quan hệ và chuỗi sự kiện phức tạp như hierarchical relationships hoặc temporal sequences trong Episodic Memory Graph
- Sleep-time Knowledge Access Optimization: Áp dụng vào hệ thống khi không có truy vấn người dùng để tự động tối ưu hoá bộ nhớ
- Sử dụng dependent type đảm bảo tính nhất quán dữ liệu và RAKG để trích xuất & tích hợp dữ liệu từ văn bản không cấu trúc vào knowledge graph

Nâng cấp hạ tầng (Mục đích tương lai):
AI Fabric: Knowledge Graph Foundation (SLTG + EMG), Data Integration Layer, Semantic Layer (ontologies + taxonomies), AI Service Mesh (connect LLM), Interaction Layer

CHỐT
1. Phạm vi Living Memory v1 (prod-able)

Giữ lại các layer:
	1.	Switching Engine / Input Router
	2.	STAG (Short Term Activation Graph) – phiên hiện tại
	3.	Memory Store (Long-term Graph) – gộp SLTG + EMG vào 1 graph
	4.	(Mini) Consolidation – chỉ những gì cần thiết để không rác
	5.	Context Builder / Retrieval Layer → Context Assembly Graph (CAG)

Bỏ / simplify trong v1:
	•	Chưa cần recursive summary quá phức tạp → chỉ cần periodic session summary.
	•	Chưa cần decay hàm mũ fancy → importance++ mỗi lần dùng, soft cap là đủ.
	•	Chưa cần phân tách SLTG/EMG thành 2 store khác nhau → dùng 1 graph với type/tags.
	•	Chưa cần Semantic Layer riêng → encode bằng type, tags, relations, embedding.
