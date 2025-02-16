package ct.contribution_tracker.core.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Table(name = "ct_service_configuration")
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CTServiceConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String paramType;
    private String paramName;
    private String paramValue;
    private String description;
    private String entity;
    private Boolean status;
}
