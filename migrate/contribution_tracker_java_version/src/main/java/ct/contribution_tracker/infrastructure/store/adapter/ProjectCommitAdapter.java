package ct.contribution_tracker.infrastructure.store.adapter;

import java.util.Date;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ct.contribution_tracker.core.domain.entity.ProjectCommitEntity;
import ct.contribution_tracker.core.port.store.ProjectCommitStore;
import ct.contribution_tracker.infrastructure.store.repository.ProjectCommitRepo;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectCommitAdapter implements ProjectCommitStore {

    private final ProjectCommitRepo projectCommitRepo;

    @Override
    public ProjectCommitEntity resetSyncedTime() {
        return projectCommitRepo.updateSyncedTime(new Date(), new Date(), false, 0, new Date());
    }

}
