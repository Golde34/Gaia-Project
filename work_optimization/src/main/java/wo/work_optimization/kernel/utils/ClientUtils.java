package wo.work_optimization.kernel.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import wo.work_optimization.core.domain.constant.Constants;
import wo.work_optimization.core.domain.dto.AuthServiceResponse;
import wo.work_optimization.core.domain.dto.response.UserResponseDTO;
import wo.work_optimization.core.domain.dto.response.UserSettingResponseDTO;
import wo.work_optimization.core.domain.dto.response.base.GeneralResponse;
import wo.work_optimization.infrastructure.security.SecurityEncryption;

@Service
@RequiredArgsConstructor
public class ClientUtils {

    private final ObjectMapper objectMapper;
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
        return httpHeaders;
    }

    public UserResponseDTO buildUserResponse(ResponseEntity<GeneralResponse<Object>> responseClient) {
        GeneralResponse<AuthServiceResponse<UserResponseDTO>> userResponse = objectMapper.convertValue(responseClient.getBody(),
                new TypeReference<GeneralResponse<AuthServiceResponse<UserResponseDTO>>>() {});
        return objectMapper.convertValue(userResponse.getData().getMessage(), UserResponseDTO.class);
    }

    public UserSettingResponseDTO buildUserSettingResponse(ResponseEntity<GeneralResponse<Object>> responseClient) {
        GeneralResponse<AuthServiceResponse<UserSettingResponseDTO>> userResponse = objectMapper.convertValue(responseClient.getBody(),
                new TypeReference<GeneralResponse<AuthServiceResponse<UserSettingResponseDTO>>>() {});
        return objectMapper.convertValue(userResponse.getData().getMessage(), UserSettingResponseDTO.class);
    }
}
