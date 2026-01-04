package auth.authentication_service.core.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserModelResponse {

    private Long id;
    private Long userId;
    private String modelName;
    private String modelKey;
    private String memoryModel;
    private String organization;
}
