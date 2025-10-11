package auth.authentication_service.kernel.configs;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan({ "auth.authentication_service.core.services" })
public class ServiceConfig {
    
}