package ct.contribution_tracker.kernel.config;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan({"kafka.lib.java"})
@EnableAutoConfiguration(exclude = {
        KafkaAutoConfiguration.class
})
public class WorkOptimizationConfig {
}
