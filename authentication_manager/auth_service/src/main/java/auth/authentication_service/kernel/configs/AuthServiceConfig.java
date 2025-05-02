package auth.authentication_service.kernel.configs;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan({"kafka.lib.java"})
@EnableAutoConfiguration(exclude = {
        KafkaAutoConfiguration.class
})
public class AuthServiceConfig {
}
