package ct.contribution_tracker.infrastructure.store.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ct.contribution_tracker.core.domain.entity.CommitEntity;

@Repository
public interface CommitRepo extends JpaRepository<CommitEntity, String> {
}
