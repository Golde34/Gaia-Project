package wo.work_optimization.infrastructure.client.adapter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import wo.work_optimization.core.domain.dto.response.UserResponseDTO;
import wo.work_optimization.core.domain.dto.response.UserSettingResponseDTO;
import wo.work_optimization.core.domain.dto.response.base.GeneralResponse;
import wo.work_optimization.core.domain.enums.ServiceEnum;
import wo.work_optimization.core.exception.BusinessException;
import wo.work_optimization.core.port.client.AuthServiceClient;
import wo.work_optimization.infrastructure.client.ClientTemplate;
import wo.work_optimization.kernel.utils.ClientUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceAdapter implements AuthServiceClient {

    @Value("${app.service.auth-service.api.get-user}")
    private String authServiceApiGetUser;

    @Value("${app.service.auth-service.api.get-user-setting}")
    private String authServiceApiGetUserSetting;

    private final ClientTemplate clientTemplate;
    private final ClientUtils clientUtils;

    public UserResponseDTO getExistedUser(Long userId) {
        try {
            HttpHeaders requestHeaders = clientUtils.buildAuthorizationHeader(ServiceEnum.AS.getServiceName(), userId);
            String uri = String.format(authServiceApiGetUser, userId);
            log.info("Calling api to auth service: {}", uri);
            ResponseEntity<GeneralResponse<Object>> response = clientTemplate.get(uri, requestHeaders, new ParameterizedTypeReference<GeneralResponse<Object>>() {});
            log.info("Response from auth service: {}", response);
            return clientUtils.buildUserResponse(response);
        } catch (Exception e) {
            throw new BusinessException(String.format("Error when call api to auth service: %s", e.getMessage()));
        }
    }

    public UserSettingResponseDTO getUserSetting(Long userId) {
        try {
            HttpHeaders requestHeaders = clientUtils.buildAuthorizationHeader(ServiceEnum.AS.getServiceName(), userId);
            String uri = String.format(authServiceApiGetUserSetting, userId);
            log.info("Calling api to auth service: {}", uri);
            ResponseEntity<GeneralResponse<Object>> response =
                clientTemplate.get(uri, requestHeaders, new ParameterizedTypeReference<GeneralResponse<Object>>() {});
            log.info("Response from auth service: {}", response);
            return clientUtils.buildUserSettingResponse(response);
        } catch (Exception e) {
            throw new BusinessException(String.format("Error when call api to auth service: %s", e.getMessage()));
        }
    }
}
