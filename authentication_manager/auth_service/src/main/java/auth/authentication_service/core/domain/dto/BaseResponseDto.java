package auth.authentication_service.core.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BaseResponseDto {

    private String status;
    private String statusMessage;
    private Integer errorCode;
    private String errorMessage;
    private Object data;

}
