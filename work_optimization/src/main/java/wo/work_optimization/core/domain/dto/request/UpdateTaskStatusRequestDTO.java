package wo.work_optimization.core.domain.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTaskStatusRequestDTO {
    private long userId;
    private String taskId;
    private String status;
}
