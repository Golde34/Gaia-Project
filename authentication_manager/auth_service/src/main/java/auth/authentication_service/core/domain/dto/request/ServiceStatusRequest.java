package auth.authentication_service.core.domain.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceStatusRequest {
    private String microserviceName;
    private boolean status;
    private String port;
}
