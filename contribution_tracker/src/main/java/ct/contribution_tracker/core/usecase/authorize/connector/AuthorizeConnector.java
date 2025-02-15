package ct.contribution_tracker.core.usecase.authorize.connector;

import org.springframework.http.ResponseEntity;

import ct.contribution_tracker.core.domain.dto.response.base.GeneralResponse;

public interface AuthorizeConnector {
    String platform();
    ResponseEntity<GeneralResponse<?>> authorize(Integer userId); 
}
