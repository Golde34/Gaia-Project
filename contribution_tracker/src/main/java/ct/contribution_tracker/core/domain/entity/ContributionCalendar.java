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

@Table(name = "contribution_calendar")
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ContributionCalendar {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID) 
    private String id;
    private Integer userId;
    private String projectId;
    private Integer level;
    private String metadata;
}
