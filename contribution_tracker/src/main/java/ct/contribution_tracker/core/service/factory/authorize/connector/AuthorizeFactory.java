package ct.contribution_tracker.core.service.factory.authorize.connector;

public interface AuthorizeFactory {
    AuthorizeConnector get(String platform); 
}
