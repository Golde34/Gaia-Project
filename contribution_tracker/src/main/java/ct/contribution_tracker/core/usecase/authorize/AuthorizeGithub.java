package ct.contribution_tracker.core.usecase.authorize;

import org.springframework.stereotype.Service;

import ct.contribution_tracker.core.domain.dto.response.base.GeneralResponse;
import ct.contribution_tracker.core.usecase.authorize.connector.AuthorizeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthorizeGithub extends AuthorizeService {

    @Override
    public String platform() {
        return "github"; 
    }

    @Override
    public GeneralResponse<?> doAuthorize(Integer userId) {
        return null;
    }
}
