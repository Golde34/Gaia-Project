package ct.contribution_tracker.core.port.store;

import ct.contribution_tracker.core.domain.entity.UserCommitEntity;

public interface UserCommitStore {
    UserCommitEntity findByUserId(Integer userId, String platform);
    UserCommitEntity verifyUserAuthorization(String state, Integer userId, String platform);
    UserCommitEntity updateUserConsent(UserCommitEntity userCommit, String code, String accessToken);
}
