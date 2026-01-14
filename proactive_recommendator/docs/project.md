1. Giai đoạn 1: Khởi tạo (Placeholder Summary)
Khi vừa đồng bộ từ RDBMS sang, bạn chưa có lịch sử hành vi.
Hành động: Sử dụng name và description gốc từ Task Service để làm summary tạm thời.
Kỹ thuật: Nếu description trống, dùng một LLM giá rẻ (GPT-4o-mini) tạo một câu mô tả dựa trên tên Project.
Lưu trữ: Insert vào Milvus (Vector) và Neo4j.
2. Giai đoạn 2: Cập nhật dựa trên sự kiện (Event-Driven Update)
Khi người dùng bắt đầu chat và tạo task, thông tin về Project sẽ "đậm đà" hơn.
Cơ chế: Dựa vào AgentExecution mà chúng ta đã bàn.
Trigger: Sau khoảng mỗi 10 - 20 task mới được tạo trong một Project.
Action (Worker chạy ngầm):
Lấy Top 10 task gần nhất của Project đó từ Neo4j/Task Service.
Gửi vào LLM với Prompt: "Dựa vào 10 task gần đây: [List tasks], hãy viết lại một bản tóm tắt (summary) phản ánh đúng mục đích hiện tại của dự án này."
Update Milvus: Thực hiện Upsert (Cập nhật) bản ghi đó với Vector mới (được embed từ summary mới) và Summary text mới.
Update Neo4j: Cập nhật trường updated_at và category nếu cần.
3. Giai đoạn 3: Cập nhật định kỳ theo phiên (Session-End Summary)
Cuối mỗi phiên làm việc dài hoặc định kỳ hàng tuần.
Mục đích: Tóm tắt ở cấp độ cao hơn.
Trigger: Khi hệ thống phát hiện user không tương tác trong 2 giờ.
Action: Tổng hợp lại recursive_summary trong SharedUserContext để làm giàu thêm trường metadata cho Project.