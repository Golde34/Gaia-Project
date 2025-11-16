package wo.work_optimization.core.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "task_registration")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private Long userId;
    private String name;
    private Double maxWorkTime;

    @JsonIgnore
    private double constant1;
    @JsonIgnore
    private double constant2;
    @JsonIgnore
    private double constant3;

    private double sleepDuration;
    private String startSleepTime;
    private String endSleepTime;
    private double relaxTime;
    private double travelTime;
    private double eatTime;
    private double workTime;
    private int status;
}
