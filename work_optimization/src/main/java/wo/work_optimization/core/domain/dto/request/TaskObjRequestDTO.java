package wo.work_optimization.core.domain.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskObjRequestDTO {
    private String title;
    private String description;
    private String[] priority;
    private String status;
    private String startDate;
    private String deadline;
    private int duration;
    private String createdAt;
    private String updatedAt;
    private String activeStatus;
    private String id;
    private String taskId;
    private int taskOrder;
    private double stopTime;
    // schedule group create task
    private String createDate;
}
