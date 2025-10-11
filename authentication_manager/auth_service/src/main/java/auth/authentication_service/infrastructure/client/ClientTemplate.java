package auth.authentication_service.infrastructure.client;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

public interface ClientTemplate {

    /**
     * GET asynchronous
     *
     * @param uri           uri
     * @param headers       http headers
     * @param responseClass class của response
     * @param uriVariables  request param
     * @return responseDTO
     */
    <R> ResponseEntity<R> get(String uri, HttpHeaders headers, Class<R> responseClass, Object... uriVariables);

    <R> ResponseEntity<R> get(String uri, HttpHeaders headers, ParameterizedTypeReference<R> responseClass, Object... uriVariables);

    /**
     * POST asynchronous
     *
     * @param uri           uri
     * @param headers       http headers
     * @param body          class của body request
     * @param responseClass class của response
     * @return responseDTO
     */
    <R> ResponseEntity<R> post(String uri, HttpHeaders headers, Object body, Class<R> responseClass);

    <R> ResponseEntity<R> post(String uri, HttpHeaders headers, Object body, ParameterizedTypeReference<R> responseClass);

    <R> ResponseEntity<R> put(String uri, HttpHeaders headers, Object body, Class<R> responseClass);

    <R> ResponseEntity<R> put(String uri, HttpHeaders headers, Object body, ParameterizedTypeReference<R> responseClass);
}
