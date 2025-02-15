package ct.contribution_tracker.core.usecase.authorize.connector;

public interface AuthorizeFactory {
    AuthorizeConnector get(String platform); 
}
