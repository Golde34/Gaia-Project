package ct.contribution_tracker.core.port.store;

import ct.contribution_tracker.core.domain.entity.ProjectCommitEntity;

public interface ProjectCommitStore {
    ProjectCommitEntity resetSyncedTime(); 
}
