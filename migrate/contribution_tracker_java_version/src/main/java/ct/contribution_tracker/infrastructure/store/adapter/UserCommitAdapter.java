package ct.contribution_tracker.infrastructure.store.adapter;

import org.springframework.stereotype.Service;

import ct.contribution_tracker.core.domain.entity.UserCommitEntity;
import ct.contribution_tracker.core.port.store.UserCommitStore;
import ct.contribution_tracker.infrastructure.store.repository.UserCommitRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserCommitAdapter implements UserCommitStore {

    private final UserCommitRepo userCommitRepo;

    @Override
    public UserCommitEntity findByUserId(Integer userId, String platform) {
        return userCommitRepo.findByUserIdAndPlatform(userId, platform);
    }

    @Override
    public UserCommitEntity verifyUserAuthorization(String state, Integer userId, String platform) {
        return userCommitRepo.verifyUserAuthorization(state, userId, platform);
    }

    @Override
    public UserCommitEntity updateUserConsent(UserCommitEntity userCommit, String code, String accessToken) {
        userCommit.setUserConsent(true);
        userCommit.setGithubSha(code);
        userCommit.setGithubAccessToken(accessToken);
        return userCommitRepo.save(userCommit);
    }
}
