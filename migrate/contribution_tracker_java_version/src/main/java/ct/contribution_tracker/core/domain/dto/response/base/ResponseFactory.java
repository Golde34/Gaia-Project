package ct.contribution_tracker.core.domain.dto.response.base;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.NonNull;

@Service
public class ResponseFactory {
    public <T> ResponseEntity<T> generalResponse(T data, @NonNull HttpStatus status) {
        return new ResponseEntity<>(data, status);
    }

    public <T> ResponseEntity<T> success(T data) {
        return generalResponse(data, HttpStatus.OK);
    }

    public <T> ResponseEntity<T> returnErrorResponse(T data, HttpStatus status) {
        return new ResponseEntity<>(data, status);
    }
}
