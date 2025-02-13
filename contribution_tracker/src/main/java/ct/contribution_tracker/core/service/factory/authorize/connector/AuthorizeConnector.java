package ct.contribution_tracker.core.service.factory.authorize.connector;

public interface AuthorizeConnector {
    String platform();
    boolean handleAuthorize(String userId, String platform); 
}
