package auth.authentication_service.kernel.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import auth.authentication_service.kernel.configs.config_models.ActivateUserStore;

@Configuration
public class AppConfig {

    @Bean
    public ActivateUserStore activateUserStore() {
        return new ActivateUserStore();
    }
}