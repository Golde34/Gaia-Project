package auth.authentication_service.core.services.interfaces;

import java.time.Duration;
import java.util.Date;

import org.springframework.security.core.userdetails.UserDetails;

import auth.authentication_service.core.domain.dto.response.CheckTokenDtoResponse;

public interface TokenService {
    String generateAccessToken(UserDetails userDetails);
    String generateRefreshToken(UserDetails userDetails);
    String getUsernameFromToken(String accessToken);
    Date getExpirationDateFromToken(String token);
    CheckTokenDtoResponse checkToken(String token);
    Boolean validateToken(String token);
    String generateServiceToken(String userId, String service, Duration duration);   
    String validateServiceToken(String token, String service);
}
