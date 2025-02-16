package ct.contribution_tracker.kernel.utils;

import ct.contribution_tracker.core.domain.constant.StringConstants;
import ct.contribution_tracker.infrastructure.security.SecurityEncryption;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientUtils {

    private final SecurityEncryption securityEncrypt;

    public HttpHeaders buildDefaultHeaders() {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(HttpHeaders.ACCEPT, "*/*");
        httpHeaders.add(HttpHeaders.CONTENT_TYPE, "application/json");
        return httpHeaders;
    }

    public HttpHeaders buildAuthorizationHeader(String service, Long userId) throws Exception {
        HttpHeaders httpHeaders = buildDefaultHeaders();
        httpHeaders.add(StringConstants.CustomHeader.SERVICE_TOKEN_HEADER, securityEncrypt.encrypt(String.valueOf(userId)));
        httpHeaders.add(StringConstants.CustomHeader.SERVICE_HEADER, service);
        return httpHeaders;
    }
}