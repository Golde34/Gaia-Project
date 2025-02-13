package ct.contribution_tracker.core.domain.entity;

import java.util.Date;

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

@Table(name = "project_commit")
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ProjectCommitEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String projectId;
    private String projectName;
    private String githubRepo;
    private String githubRepoUrl;
    private Integer userCommitId;
    private Boolean userSynced;
    private Integer userNumberSynced;
    private Date firstTimeSynced;
    private Date githublastTimeSynced;
    private Date createdAt;
    private Date updatedAt; 
}
