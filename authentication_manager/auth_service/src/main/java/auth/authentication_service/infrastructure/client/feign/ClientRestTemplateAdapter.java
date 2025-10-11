package auth.authentication_service.infrastructure.client.feign;

import lombok.extern.slf4j.Slf4j;
import auth.authentication_service.infrastructure.client.ClientTemplate;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class ClientRestTemplateAdapter implements ClientTemplate {
    private static final String REQUEST = "REST REQUEST: URL[{}], HTTP-METHOD[{}], HTTP-ENTITY[{}]";
    private static final String RESPONSE = "REST RESPONSE: STATUS[{}], MESSAGE[{}], BODY[{}]";

    private final RestTemplate restTemplate;

    public ClientRestTemplateAdapter(@Qualifier("asRestTemplate") RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public <R> ResponseEntity<R> get(String uri, HttpHeaders headers, Class<R> responseClass, Object... uriVariables) {
        return exchange(uri, HttpMethod.GET, new HttpEntity<>(headers), responseClass, uriVariables);
    }

    @Override
    public <R> ResponseEntity<R> get(String uri, HttpHeaders headers, ParameterizedTypeReference<R> responseClass, Object... uriVariables) {
        return exchangeParameterized(uri, HttpMethod.GET, new HttpEntity<>(headers), responseClass, uriVariables);
    }

    @Override
    public <R> ResponseEntity<R> post(String uri, HttpHeaders headers, Object body, Class<R> responseClass) {
        return exchange(uri, HttpMethod.POST, new HttpEntity<>(body, headers), responseClass);
    }

    @Override
    public <R> ResponseEntity<R> post(String uri, HttpHeaders headers, Object body, ParameterizedTypeReference<R> responseClass) {
        return exchangeParameterized(uri, HttpMethod.POST, new HttpEntity<>(body, headers), responseClass);
    }

    @Override
    public <R> ResponseEntity<R> put(String uri, HttpHeaders headers, Object body, Class<R> responseClass) {
        return exchange(uri, HttpMethod.PUT, new HttpEntity<>(body, headers), responseClass);
    }

    @Override
    public <R> ResponseEntity<R> put(String uri, HttpHeaders headers, Object body, ParameterizedTypeReference<R> responseClass) {
        return exchangeParameterized(uri, HttpMethod.PUT, new HttpEntity<>(body, headers), responseClass);
    }

    private <R> ResponseEntity<R> exchange(String url, HttpMethod httpMethod, HttpEntity<Object> entity, Class<R> responseClass, Object... uriVariables) {
        log.info(REQUEST, url, httpMethod, entity);
        ResponseEntity<R> responseEntity = restTemplate.exchange(url, httpMethod, entity, responseClass, uriVariables);
        HttpStatus httpStatus = HttpStatus.valueOf(responseEntity.getStatusCode().value());

        log.info(RESPONSE, httpStatus.value(), httpStatus.getReasonPhrase(), responseEntity.getBody());
        return responseEntity;
    }

    private <R> ResponseEntity<R> exchangeParameterized(String url, HttpMethod httpMethod, HttpEntity<Object> entity, ParameterizedTypeReference<R> responseClass, Object... uriVariables) {
        log.info(REQUEST, url, httpMethod, entity);
        ResponseEntity<R> responseEntityParameterized = restTemplate.exchange(url, httpMethod, entity, responseClass, uriVariables);
        HttpStatus httpStatus = HttpStatus.valueOf(responseEntityParameterized.getStatusCode().value());
        log.info(RESPONSE, httpStatus.value(), httpStatus.getReasonPhrase(), responseEntityParameterized.getBody());
        return responseEntityParameterized;
    }
}
