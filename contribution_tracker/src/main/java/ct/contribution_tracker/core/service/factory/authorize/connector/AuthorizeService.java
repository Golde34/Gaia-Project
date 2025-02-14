package ct.contribution_tracker.core.service.factory.authorize.connector;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public abstract class AuthorizeService implements AuthorizeConnector {
    @Override
    public boolean handleAuthorize(String userId, String platform) {
        try {
            log.info("Handling platform: " + platform);
            return doPlatform(userId, platform);
        } catch (Exception e) {
            log.error("Error handling platform: " + platform);
            return false;
        }
    }
    
    protected abstract boolean doPlatform(String userId, String platform);
}
