package auth.authentication_service.core.domain.dto;

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
