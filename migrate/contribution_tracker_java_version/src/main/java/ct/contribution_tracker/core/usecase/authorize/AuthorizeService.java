package ct.contribution_tracker.core.usecase.authorize;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import ct.contribution_tracker.core.domain.dto.request.AuthorizationRequest;
import ct.contribution_tracker.core.domain.dto.response.base.GeneralResponse;
import ct.contribution_tracker.core.domain.dto.response.base.ResponseFactory;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public abstract class AuthorizeService<R, P> implements AuthorizeConnector {

    @Autowired
    private ResponseFactory responseFactory;

    @Override
    public ResponseEntity<GeneralResponse<?>> authorize(AuthorizationRequest rawRequest) {
        try {
            log.info("User id {} is trying to authorize", rawRequest.getUserId());
            R req = createRequest(rawRequest);
            P resp = doAuthorize(req);
            return responseFactory.success(mapResponse(resp));
        } catch (Exception e) {
            log.error("Error handling platform: {}", e.getMessage(), e);
            return responseFactory.generalResponse(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    protected abstract R createRequest(AuthorizationRequest request);
    protected abstract P doAuthorize(R request);
    protected abstract GeneralResponse<?> mapResponse(P response); 

    @Override
    public ResponseEntity<GeneralResponse<?>> syncUser(Integer userId) {
        try {
            log.info("User id {} is trying to sync", userId);
            P resp = doSyncUser(userId);
            return responseFactory.success(mapResponse(resp));
        } catch (Exception e) {
            log.error("Error handling platform: {}", e.getMessage(), e);
            return responseFactory.generalResponse(null, HttpStatus.BAD_REQUEST);
        }
    }

    protected abstract P doSyncUser(Integer userId);
}
