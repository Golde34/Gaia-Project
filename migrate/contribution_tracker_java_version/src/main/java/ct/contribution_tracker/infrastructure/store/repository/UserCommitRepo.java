package ct.contribution_tracker.infrastructure.store.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import ct.contribution_tracker.core.domain.entity.UserCommitEntity;

@Repository
public interface UserCommitRepo extends JpaRepository<UserCommitEntity, String> {

    UserCommitEntity findByUserId(Integer userId);

    UserCommitEntity findByUserIdAndPlatform(Integer userId, String platform);
    
    @Query("SELECT u FROM UserCommitEntity u WHERE u.userState = :userState and userId = :userId and u.platform = :platform")
    UserCommitEntity verifyUserAuthorization(String userState, Integer userId, String platform);

    @SuppressWarnings("unchecked")
    UserCommitEntity save(UserCommitEntity userCommitEntity);
}
