package ct.contribution_tracker.ui.rest.router;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import ct.contribution_tracker.core.domain.dto.request.github.GithubAuthorizationRequest;
import ct.contribution_tracker.core.domain.dto.response.base.GeneralResponse;

@RequestMapping("/${spring.application.url-name}/user-commit")
public interface UserCommitRouter {

    @GetMapping("/get-user-github-info/:userId")
    ResponseEntity<GeneralResponse<?>> getUserCommit(@RequestParam String userId);

    @PostMapping("/authorize")
    ResponseEntity<GeneralResponse<?>> authorize(@RequestBody GithubAuthorizationRequest request);

    @GetMapping("/synchronize/:userId")
    ResponseEntity<GeneralResponse<?>> synchronize(@RequestParam String userId);
}
