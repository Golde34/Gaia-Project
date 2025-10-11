package auth.authentication_service.kernel.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import auth.authentication_service.infrastructure.client.feign.RestExceptionHandler;

import java.nio.charset.StandardCharsets;

@Configuration
public class RestConfig {
    @Value("${rest.default.connection.connect-timeout}")
    private int connectionTimeout;

    @Bean(name = "asRestTemplate")
    public RestTemplate createDefaultRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
        restTemplate.getMessageConverters().add(1, new FormHttpMessageConverter());
        restTemplate.setErrorHandler(new RestExceptionHandler());
        return restTemplate;
    }
}
