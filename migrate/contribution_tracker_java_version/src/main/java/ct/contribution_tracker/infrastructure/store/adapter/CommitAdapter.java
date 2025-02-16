package ct.contribution_tracker.infrastructure.store.adapter;

import java.util.Date;

import org.springframework.stereotype.Service;

import ct.contribution_tracker.core.domain.dto.request.CreateCommitRequest;
import ct.contribution_tracker.core.domain.entity.CommitEntity;
import ct.contribution_tracker.core.port.mapper.CommitMapper;
import ct.contribution_tracker.core.port.store.CommitStore;
import ct.contribution_tracker.infrastructure.store.repository.CommitRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommitAdapter implements CommitStore {
    
    private final CommitMapper commitMapper;
    private final CommitRepo commitRepo;

    @Override
    public CommitEntity createCommit(CreateCommitRequest request) {
        CommitEntity commit = commitMapper.toEntity(request);
        commit.setCommitTime(new Date());
        return commitRepo.save(commit); 
    }
}
