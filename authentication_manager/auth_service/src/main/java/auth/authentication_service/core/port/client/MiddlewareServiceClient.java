package auth.authentication_service.core.port.client;

import auth.authentication_service.core.domain.dto.request.ServiceStatusRequest;

public interface MiddlewareServiceClient {
    String insertStatus(ServiceStatusRequest request);
}
