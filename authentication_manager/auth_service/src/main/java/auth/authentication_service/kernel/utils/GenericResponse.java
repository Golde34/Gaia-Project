package auth.authentication_service.kernel.utils;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.domain.dto.BaseResponseDto;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import lombok.Data;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Data
@Component
public class GenericResponse<T> {
    private T message;
    private ResponseEnum responseMessage;

    public GenericResponse(T message, ResponseEnum responseMessage) {
        this.message = message;
        this.responseMessage = responseMessage;
    }

    public GenericResponse() {
    }

    public ResponseEntity<?> matchingResponseMessage(GenericResponse<?> validation) {
        switch (validation.getResponseMessage()) {
            case msg200 -> {
                return ResponseEntity.ok().body(BaseResponseDto.builder()
                        .status(Constants.HttpStatus.SUCCESS)
                        .statusMessage(Constants.HttpStatus.SUCCESS)
                        .errorCode(200)
                        .errorMessage(Constants.ErrorMessage.OK)
                        .data(validation)
                        .build());
            }
            case msg400 -> {
                return ResponseEntity.badRequest().body(BaseResponseDto.builder()
                        .status(Constants.HttpStatus.ERROR)
                        .statusMessage(Constants.HttpStatus.ERROR)
                        .errorCode(400)
                        .errorMessage(Constants.ErrorMessage.BAD_REQUEST)
                        .data(validation.message)
                        .build());
            }
            case msg401 -> {
                return ResponseEntity.status(401).body(BaseResponseDto.builder()
                        .status(Constants.HttpStatus.ERROR)
                        .statusMessage(Constants.HttpStatus.ERROR)
                        .errorCode(401)
                        .errorMessage(Constants.ErrorMessage.UNAUTHORIZED)
                        .data(validation.message)
                        .build());
            }
            case msg403 -> {
                return ResponseEntity.status(403).body(BaseResponseDto.builder()
                        .status(Constants.HttpStatus.ERROR)
                        .statusMessage(Constants.HttpStatus.ERROR)
                        .errorCode(403)
                        .errorMessage(Constants.ErrorMessage.FORBIDDEN)
                        .data(validation.message)
                        .build());
            }
            case msg404 -> {
                return ResponseEntity.status(404).body(BaseResponseDto.builder()
                        .status(Constants.HttpStatus.ERROR)
                        .statusMessage(Constants.HttpStatus.ERROR)
                        .errorCode(404)
                        .errorMessage(Constants.ErrorMessage.NOT_FOUND)
                        .data(validation.message)
                        .build());
            }
            case msg500 -> {
                return ResponseEntity.status(500).body(BaseResponseDto.builder()
                        .status(Constants.HttpStatus.ERROR)
                        .statusMessage(Constants.HttpStatus.ERROR)
                        .errorCode(500)
                        .errorMessage(Constants.ErrorMessage.INTERNAL_SERVER_ERROR)
                        .data(validation.message)
                        .build());
            }
            case status -> {
                return ResponseEntity.ok().body(BaseResponseDto.builder()
                        .status(Constants.HttpStatus.SUCCESS)
                        .statusMessage(Constants.HttpStatus.SUCCESS)
                        .errorCode(200)
                        .errorMessage(Constants.ErrorMessage.OK)
                        .data(validation.getMessage())
                        .build());
            }
            default -> {
                return ResponseEntity.badRequest().body(BaseResponseDto.builder()
                        .status(Constants.HttpStatus.ERROR)
                        .statusMessage(Constants.HttpStatus.ERROR)
                        .errorCode(400)
                        .errorMessage(Constants.ErrorMessage.BAD_REQUEST)
                        .data(validation.message)
                        .build());
            }
        }
    }

    public ResponseEntity<?> matchingResponseWithHeader(GenericResponse<?> data, int errorCode, HttpHeaders headers) {
        return ResponseEntity.ok().headers(headers).body(BaseResponseDto.builder()
                .status(Constants.HttpStatus.SUCCESS)
                .statusMessage(Constants.HttpStatus.SUCCESS)
                .errorCode(errorCode)
                .errorMessage(Constants.ErrorMessage.OK)
                .data(data)
                .build());
    }
}
