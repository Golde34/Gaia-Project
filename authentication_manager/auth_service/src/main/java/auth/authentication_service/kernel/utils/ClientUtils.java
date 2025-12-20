package auth.authentication_service.kernel.utils;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.infrastructure.security.SecurityEncryption;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClientUtils {

    private final SecurityEncryption securityEncrypt;

    public HttpHeaders buildDefaultHeaders() {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(HttpHeaders.ACCEPT, "application/json");
        httpHeaders.add(HttpHeaders.CONTENT_TYPE, "application/json");
        return httpHeaders;
    }

    public HttpHeaders buildAuthorizationHeader(String service, Long userId) throws Exception {
        HttpHeaders httpHeaders = buildDefaultHeaders();
        httpHeaders.add(Constants.CustomHeader.SERVICE_TOKEN_HEADER, 
            securityEncrypt.encrypt(String.valueOf(userId), service));
        httpHeaders.add(Constants.CustomHeader.SERVICE_HEADER, service);
        httpHeaders.add(Constants.CustomHeader.USER_ID_HEADER, String.valueOf(userId));
        return httpHeaders;
    }
}
