package ct.contribution_tracker.core.usecase.authorize;

import org.springframework.http.ResponseEntity;

import ct.contribution_tracker.core.domain.dto.request.AuthorizationRequest;
import ct.contribution_tracker.core.domain.dto.response.base.GeneralResponse;

public interface AuthorizeConnector {
    String platform();
    ResponseEntity<GeneralResponse<?>> authorize(AuthorizationRequest request); 
    ResponseEntity<GeneralResponse<?>> syncUser(Integer userId);
}
