package ct.contribution_tracker.core.service.github;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import ct.contribution_tracker.core.domain.constant.StringConstants;
import ct.contribution_tracker.core.domain.dto.request.AuthorizationRequest;
import ct.contribution_tracker.core.domain.dto.response.base.GeneralResponse;
import ct.contribution_tracker.core.domain.dto.response.base.ResponseMessage;
import ct.contribution_tracker.core.domain.entity.CTServiceConfiguration;
import ct.contribution_tracker.core.domain.entity.UserCommitEntity;
import ct.contribution_tracker.core.port.client.GithubClient;
import ct.contribution_tracker.core.usecase.authorize.AuthorizeService;
import ct.contribution_tracker.infrastructure.store.repository.CTServiceConfigRepo;
import ct.contribution_tracker.infrastructure.store.repository.UserCommitRepo;
import ct.contribution_tracker.kernel.utils.GenericResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class GithubAuthorize extends AuthorizeService<AuthorizationRequest, Object> {

    private final GenericResponse<?> genericResponse;

    private final UserCommitRepo userCommitRepo;
    private final CTServiceConfigRepo ctServiceConfigRepo;
    private final GithubClient githubClient;

    @Override
    public String platform() {
        return StringConstants.Platform.GITHUB;
    }

    @Override
    public Object doAuthorize(AuthorizationRequest request) {
        log.info("Verifying github authorization for user {}", request.getUserId());
        UserCommitEntity userCommitEntity = userCommitRepo.verifyUserAuthorization(request.getState(),
                request.getUserId(), request.getPlatform());
        if (userCommitEntity == null) {
            log.warn("User {} not found", request.getUserId());
            return null;
        }
    
        List<CTServiceConfiguration> config = ctServiceConfigRepo
                .findByParamType(StringConstants.ParamType.GITHUB_TYPE);
        Map<String, String> githubSystemConfigs = config.stream()
                .collect(Collectors.toMap(CTServiceConfiguration::getParamName, CTServiceConfiguration::getParamValue));
        Object githubResponse = githubClient.getGithubAccessToken(githubSystemConfigs, request.getCode()); 

        return null;
    }

    @Override
    protected AuthorizationRequest createRequest(AuthorizationRequest request) {
        return request;
    }

    @Override
    protected GeneralResponse<?> mapResponse(Object response) {
        return genericResponse.matchingResponseMessage(new GenericResponse<>(response, ResponseMessage.msg200));
    }

    @Override
    protected Object doSyncUser(Integer userId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'doSyncUser'");
    }
}
