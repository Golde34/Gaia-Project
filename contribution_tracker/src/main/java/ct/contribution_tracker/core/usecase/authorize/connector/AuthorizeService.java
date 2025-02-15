package ct.contribution_tracker.core.usecase.authorize.connector;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import ct.contribution_tracker.core.domain.dto.response.base.GeneralResponse;
import ct.contribution_tracker.core.domain.dto.response.base.ResponseFactory;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public abstract class AuthorizeService implements AuthorizeConnector {

    @Autowired
    private ResponseFactory responseFactory;

    @Override
    public ResponseEntity<GeneralResponse<?>> authorize(Integer userId) {
        try {
            log.info("User id {} is trying to authorize", userId);
            return responseFactory.success(doAuthorize(userId)); 
        } catch (Exception e) {
            log.error("Error handling platform: {}", e.getMessage(), e);
            return responseFactory.generalResposne(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    protected abstract GeneralResponse<?> doAuthorize(Integer userId);
}
