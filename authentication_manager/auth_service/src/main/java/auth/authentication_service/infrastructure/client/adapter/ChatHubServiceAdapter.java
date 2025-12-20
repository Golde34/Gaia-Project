package auth.authentication_service.infrastructure.client.adapter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import auth.authentication_service.core.domain.enums.ServiceEnum;
import auth.authentication_service.core.port.client.ChatHubServiceClient;
import auth.authentication_service.infrastructure.client.ClientTemplate;
import auth.authentication_service.kernel.utils.ClientUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatHubServiceAdapter implements ChatHubServiceClient {

    @Value("${app.service.chathub.api.clear-llm-model-cache}")
    private String clearLlmModelCacheApi;

    private final ClientTemplate clientTemplate;
    private final ClientUtils clientUtils;

    @Override
    public void clearUserLLMModelCache(long userId) {
        try {
            HttpHeaders requestHeaders = clientUtils.buildAuthorizationHeader(
                    ServiceEnum.CH.getServiceName(), userId);
            String url = String.format("%s/%s", clearLlmModelCacheApi, userId);
            log.info("Calling ChatHub API to clear LLM model cache for user: {}", userId);
            ResponseEntity<String> response = clientTemplate.post(
                    url, requestHeaders, null, String.class);
            log.info("Successfully called ChatHub API to clear LLM model cache for user: {}, response: {}", userId,
                    response);
        } catch (Exception e) {
            log.error("Error when calling ChatHub API to clear LLM model cache for user {}: {}", userId,
                    e.getMessage());
        }
    }
}
