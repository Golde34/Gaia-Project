package ct.contribution_tracker.core.domain.dto.response.base;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GeneralResponse<T> {
    private String status;
    private String statusMessage;
    private Integer errorCode;
    private String errorMessage;
    private T data;
}
