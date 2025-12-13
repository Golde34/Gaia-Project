package auth.authentication_service.core.port.client;

public interface ChatHubServiceClient {
    void clearUserLLMModelCache(long userId);
}
