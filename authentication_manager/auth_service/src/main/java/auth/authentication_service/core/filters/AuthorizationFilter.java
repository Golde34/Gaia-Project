package auth.authentication_service.core.filters;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.services.UserDetailsServices;
import auth.authentication_service.kernel.utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
public class AuthorizationFilter extends OncePerRequestFilter {

    private final UserDetailsServices userDetailsServices;
    private final JwtUtil jwtUtil;

    public AuthorizationFilter(UserDetailsServices userDetailsServices, JwtUtil jwtUtil) {
        this.userDetailsServices = userDetailsServices;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        boolean headerTokenValidation = validateHeaderToken(request);
        if (headerTokenValidation) {
            filterChain.doFilter(request, response);
            return;
        }

        boolean jwtTokenValidation = validateJwtToken(request);
        if (jwtTokenValidation) {
            filterChain.doFilter(request, response);
            return;
        }

        log.info("Security Filter Chain");
        filterChain.doFilter(request, response);
    }

    private static final String SERVICE_TOKEN_HEADER = Constants.CustomHeader.SERVICE_HEADER;
    private static final String SERVICE_TOKEN_VALUE = Constants.SERVICE_NAME;

    private static final String PRIVATE_TOKEN_HEADER = Constants.CustomHeader.SERVICE_TOKEN_HEADER;
    private static final String PRIVATE_TOKEN_VALUE = "Golde34";

    private boolean validateHeaderToken(HttpServletRequest request) {
        final String serviceTokenHeader = request.getHeader(SERVICE_TOKEN_HEADER);
        final String privateTokenHeader = request.getHeader(PRIVATE_TOKEN_HEADER);
        if (serviceTokenHeader != null && privateTokenHeader != null
                && serviceTokenHeader.equals(SERVICE_TOKEN_VALUE)
                && request.getHeader(PRIVATE_TOKEN_HEADER).equals(PRIVATE_TOKEN_VALUE)) {
            log.info("Header token is valid, no need to filter jwt token");
            UserDetails serviceUser = userDetailsServices.loadPostConstructServiceUser();
            securityUsernamePassword(request, serviceUser);
            return true;
        }
        return false;
    }

    private boolean validateJwtToken(HttpServletRequest request) {
        final String authorizationHeader = request.getHeader(Constants.CustomHeader.AUTHORIZATION_HEADER);
        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            username = jwtUtil.exactUsername(jwt);
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsServices.loadUserByUsername(username);
            if (jwtUtil.validateToken(jwt, userDetails)) {
                securityUsernamePassword(request, userDetails);
                return true;
            }
        }

        return false;
    }

    private void securityUsernamePassword(HttpServletRequest request, UserDetails userDetails) {
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
    }
}