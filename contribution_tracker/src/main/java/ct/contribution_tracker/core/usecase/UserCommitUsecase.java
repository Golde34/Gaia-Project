package ct.contribution_tracker.core.usecase;

import org.springframework.stereotype.Service;

import ct.contribution_tracker.core.domain.dto.response.base.GeneralResponse;
import ct.contribution_tracker.core.domain.dto.response.base.ResponseMessage;
import ct.contribution_tracker.kernel.utils.GenericResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserCommitUsecase {

    private final GenericResponse<?> genericResponse;
    
    public GeneralResponse<?> getUserGithubInfo(String userId) {
        try {
            return null;
        } catch (Exception e) {
            log.error("Error while getting user github info", e);
            return genericResponse.matchingResponseMessage(
                new GenericResponse<>(e.getMessage(), ResponseMessage.msg400));
        }
    }
}
