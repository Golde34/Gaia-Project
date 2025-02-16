package ct.contribution_tracker.kernel.utils;

import org.springframework.stereotype.Component;

import ct.contribution_tracker.core.domain.dto.response.base.GeneralResponse;
import ct.contribution_tracker.core.domain.dto.response.base.ResponseMessage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Component
@NoArgsConstructor
@AllArgsConstructor
public class GenericResponse<T> {
    private T message;
    private ResponseMessage responseMessage;

    public GeneralResponse<?> matchingResponseMessage(GenericResponse<?> validation) {
        switch (validation.getResponseMessage()) {
            case msg200 -> { 
                return GeneralResponse.builder()
                        .status("success")
                        .statusMessage("success")
                        .errorCode(200)
                        .errorMessage("OK")
                        .data(validation.message)
                        .build();
            }
            case msg400 -> {
                return GeneralResponse.builder()
                        .status("error")
                        .statusMessage("error")
                        .errorCode(400)
                        .errorMessage("Bad Request")
                        .data(validation.message)
                        .build();
            }
            case msg401 -> {
                return GeneralResponse.builder()
                        .status("error")
                        .statusMessage("error")
                        .errorCode(401)
                        .errorMessage("Unauthorized")
                        .data(validation.message)
                        .build();
            }
            case msg403 -> {
                return GeneralResponse.builder()
                        .status("error")
                        .statusMessage("error")
                        .errorCode(403)
                        .errorMessage("Forbidden")
                        .data(validation.message)
                        .build();
            }
            case msg404 -> {
                return GeneralResponse.builder()
                        .status("error")
                        .statusMessage("error")
                        .errorCode(404)
                        .errorMessage("Not Found")
                        .data(validation.message)
                        .build();
            }
            case msg500 -> {
                return GeneralResponse.builder()
                        .status("error")
                        .statusMessage("error")
                        .errorCode(500)
                        .errorMessage("Internal Server Error")
                        .data(validation.message)
                        .build();
            }
            default -> {
                return GeneralResponse.builder()
                        .status("error")
                        .statusMessage("error")
                        .errorCode(400)
                        .errorMessage("Bad Request")
                        .data(validation.message)
                        .build();
            }
        }
    }
}