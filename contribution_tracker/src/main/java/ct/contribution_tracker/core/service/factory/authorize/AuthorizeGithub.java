package ct.contribution_tracker.core.service.factory.authorize;

import org.springframework.stereotype.Service;

import ct.contribution_tracker.core.service.factory.authorize.connector.AuthorizeService;
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
    public boolean doPlatform(String userId, String platform) {
        log.info("Handling github platform");
        return true;
    }
    
}
