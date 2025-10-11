package auth.authentication_service.kernel.utils;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

@Service
public class ClientUtils {

    public HttpHeaders buildDefaultHeaders() {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(HttpHeaders.ACCEPT, "application/json");
        httpHeaders.add(HttpHeaders.CONTENT_TYPE, "application/json");
        return httpHeaders;
    }
}
