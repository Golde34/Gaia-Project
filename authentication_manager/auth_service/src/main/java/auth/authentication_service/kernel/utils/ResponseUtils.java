package auth.authentication_service.kernel.utils;

import org.springframework.stereotype.Component;

import auth.authentication_service.core.domain.enums.ResponseEnum;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class ResponseUtils {
    
    public GenericResponse<String> returnMessage(String functionMessage, String message, ResponseEnum responseMessage) {
        traceLog(functionMessage, message, responseMessage);    
        return new GenericResponse<>(message, responseMessage);
    }
    private void traceLog(String functionMessage, String message, ResponseEnum responseMessage) {
        if (responseMessage == ResponseEnum.msg200) {
            log.info("{} {}", functionMessage, message);
        } else {
            log.error("{} {}", functionMessage, message);
        }    
    }
}
