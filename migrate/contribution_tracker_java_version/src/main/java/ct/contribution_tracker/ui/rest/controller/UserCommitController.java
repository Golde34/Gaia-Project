package ct.contribution_tracker.ui.rest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import ct.contribution_tracker.core.domain.dto.request.AuthorizationRequest;
import ct.contribution_tracker.core.domain.dto.request.GetUserCommitInfoRequest;
import ct.contribution_tracker.core.domain.dto.response.base.GeneralResponse;
import ct.contribution_tracker.core.usecase.authorize.AuthorizeFactory;
import ct.contribution_tracker.ui.rest.router.UserCommitRouter;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserCommitController implements UserCommitRouter {

    private final AuthorizeFactory authorizeFactory;

    @Override
    public ResponseEntity<GeneralResponse<?>> getUserCommit(GetUserCommitInfoRequest request) {
        return null;
    } 

    @Override
    public ResponseEntity<GeneralResponse<?>> authorize(AuthorizationRequest request) {
        return authorizeFactory.get(request.getPlatform()).authorize(request);    
    }

    @Override
    public ResponseEntity<GeneralResponse<?>> synchronize(String userId) {
        return null;
    }
}
