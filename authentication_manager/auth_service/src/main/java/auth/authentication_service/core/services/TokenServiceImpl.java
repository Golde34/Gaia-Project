package auth.authentication_service.core.services;

import auth.authentication_service.core.domain.dto.response.CheckTokenDtoResponse;
import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.port.store.UserCRUDStore;
import auth.authentication_service.core.services.interfaces.TokenService;
import auth.authentication_service.kernel.utils.JwtUtil;
import auth.authentication_service.kernel.utils.ModelMapperConfig;

import java.time.Duration;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class TokenServiceImpl implements TokenService {

    @Autowired
    ModelMapperConfig modelMapper;

    private final JwtUtil jwtUtil;
    private final UserDetailsServices userDetailsServices;
    private final UserCRUDStore userStore;
    // private final TokenStore tokenStore;

    public TokenServiceImpl(JwtUtil jwtUtil, UserDetailsServices userDetailsServices, UserCRUDStore userStore) {
        this.jwtUtil = jwtUtil;
        this.userDetailsServices = userDetailsServices;
        this.userStore = userStore;
    }

    @Override
    public String generateAccessToken(UserDetails user) {
        Long expiration = 1000L * 60 * 60 * 2; // 2h
        return jwtUtil.generateToken(user, expiration);
    }

    @Override
    public String generateRefreshToken(UserDetails user) {
        Long expiration = 1000L * 60 * 60 * 24; // 1d
        return jwtUtil.generateToken(user, expiration);
    }

    @Override
    public String getUsernameFromToken(String accessToken) {
        return jwtUtil.exactUsername(accessToken);
    }

    @Override
    public Date getExpirationDateFromToken(String token) {
        return jwtUtil.extractExpiration(token);
    }

    @Override
    public CheckTokenDtoResponse checkToken(String token) {
        String username = jwtUtil.exactUsername(token);
        UserDetails userDetails = userDetailsServices.loadUserByUsername(username);
        if (jwtUtil.validateToken(token, userDetails)) {
            Date expiryDate = jwtUtil.extractExpiration(token);
            // AuthToken authToken = tokenRepository.findByToken(token);
            // Date expiryDate = authToken.getExpiryDate();
            User user = userStore.findByUsername(username);
            CheckTokenDtoResponse tokenResponse = new CheckTokenDtoResponse(user.getId(), user.getUsername(), token,
                    expiryDate);
            return tokenResponse;
        } else {
            return null;
        }
    }

    @Override
    public Boolean validateToken(String token) {
        String username = jwtUtil.exactUsername(token);
        UserDetails userDetails = userDetailsServices.loadUserByUsername(username);
        return jwtUtil.validateToken(token, userDetails);
    }

    @Override
    public String generateServiceToken(UserDetails user, Duration serviceDuration) {
        return jwtUtil.generateToken(user, serviceDuration.getSeconds() * 1000L);
    }
}
