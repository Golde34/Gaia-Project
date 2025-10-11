package auth.authentication_service.kernel.configs;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
@ComponentScan({ "auth.authentication_service.infrastructure.task"})
public class SpringTaskConfig {
    
}