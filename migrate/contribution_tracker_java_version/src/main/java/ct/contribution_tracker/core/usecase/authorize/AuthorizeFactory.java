package ct.contribution_tracker.core.usecase.authorize;

public interface AuthorizeFactory {
    AuthorizeConnector get(String platform); 
}
