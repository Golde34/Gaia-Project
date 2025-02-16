package ct.contribution_tracker.core.port.store;

import ct.contribution_tracker.core.domain.dto.request.CreateCommitRequest;
import ct.contribution_tracker.core.domain.entity.CommitEntity;

public interface CommitStore {
    CommitEntity createCommit(CreateCommitRequest request);
}
