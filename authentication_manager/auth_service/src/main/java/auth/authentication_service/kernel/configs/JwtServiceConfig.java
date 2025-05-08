package auth.authentication_service.kernel.configs;

import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

import lombok.Getter;
import lombok.Setter;

@ConfigurationPropertiesScan
@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
public class JwtServiceConfig {
    private Map<String, JwtServiceProperties> services;

    @Getter
    @Setter
    public static class JwtServiceProperties {
        private String name;
        private String duration; 
    }
}
