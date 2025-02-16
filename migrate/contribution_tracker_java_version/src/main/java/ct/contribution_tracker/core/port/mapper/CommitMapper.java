package ct.contribution_tracker.core.port.mapper;

import org.springframework.stereotype.Component;

import ct.contribution_tracker.core.domain.dto.request.CreateCommitRequest;
import ct.contribution_tracker.core.domain.entity.CommitEntity;

import org.modelmapper.ModelMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CommitMapper {

    private final ModelMapper modelMapper;

    public CommitEntity toEntity(CreateCommitRequest request) {
        return modelMapper.map(request, CommitEntity.class);
    } 
}
