package auth.authentication_service.core.domain.enums;

public enum HttpStatusEnum {
    OK(200),
    CREATED(201),
    BAD_REQUEST(400),
    UNAUTHORIZED(401),
    FORBIDDEN(403),
    NOT_FOUND(404),
    INTERNAL_SERVER_ERROR(500);

    private final int value;

    HttpStatusEnum(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
