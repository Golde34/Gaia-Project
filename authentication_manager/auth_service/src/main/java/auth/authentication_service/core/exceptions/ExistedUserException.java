package auth.authentication_service.core.exceptions;

public class ExistedUserException extends RuntimeException {

    private static final long serialVersionUID = 5861310537366287163L;

    public ExistedUserException() {
        super();
    }

    public ExistedUserException(final String message, final Throwable cause) {
        super(message, cause);
    }

    public ExistedUserException(final String message) {
        super(message);
    }

    public ExistedUserException(final Throwable cause) {
        super(cause);
    }

}