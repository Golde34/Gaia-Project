package auth.authentication_service.core.domain.entities;

import java.util.Collection;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "llm_model")
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class LLMModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long modelId;

    private String modelName;
    
    private boolean activeStatus;

    private String organization;

    @JsonBackReference
    @ManyToMany(mappedBy = "llmModels")
    private Collection<User> users;
}
