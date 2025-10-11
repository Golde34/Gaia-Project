package auth.authentication_service.infrastructure.client;

import auth.authentication_service.core.domain.dto.request.ServiceStatusRequest;
import auth.authentication_service.core.domain.enums.ServiceEnum;
import auth.authentication_service.core.port.client.MiddlewareServiceClient;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
@Slf4j
public class HealthCheck {
    
    private final MiddlewareServiceClient middlewareServiceClient; 

    @Bean(name = "statusChecking")
    public void healthCheck() {
        try {
            ServiceStatusRequest request = ServiceStatusRequest.builder()
                .microserviceName(ServiceEnum.AS.getServiceName())
                .status(true)
                .port("4001")
                .build();
            String statusResponse = middlewareServiceClient.insertStatus(request);
            log.info("Health check response: {}", statusResponse);
        } catch (Exception e) {
            log.error("Error when calling health check: {}", e.getMessage());
        }
    }
}
