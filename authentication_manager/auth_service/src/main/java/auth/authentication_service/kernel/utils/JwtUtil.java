package auth.authentication_service.kernel.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.core.userdetails.UserDetails;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {
    private static final String SECRET_KEY = "GAIA3401";

    public String exactUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = exactUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public String generateToken(UserDetails userDetails, Long expiration) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername(), expiration);
    }

    public String createToken(Map<String, Object> claims, String subject, Long expiration) {
        return Jwts.builder()
                .setClaims(claims) // claims
                .setSubject(subject) // subject
                .setIssuedAt(new Date(System.currentTimeMillis())) // issue date
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // expiration date
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY) // signature
                .compact();
    }

    public String generateServiceToken(String username, String service, Long expiration) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", username);
        claims.put("service", service);
        return createToken(claims, username, expiration);
    }

    public String validateServiceToken(String token, String service) {
        final String username = extractClaim(token, Claims::getSubject);
        final String tokenService = (String) extractAllClaims(token).get("service");
        if (tokenService.equals(service) && !isTokenExpired(token)) {
            return username;
        }
        return null;
    }
}
