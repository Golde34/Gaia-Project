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

@Table(name = "commit")
@Entity
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class CommitEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID) 
    private String id;
    private String content;
    private Date commitTime;
    private Integer userId;
    private String projectId;
    private String type;
    private String taskId;
    private String subTaskId;
    private String scheduleTaskId;
    private String githubCommitId;
    private String commitAuthor;
    private String committerName;
    private String committerEmail;
    private Date githubCommitDate;
    private String commitMessage;
    private String commitUrl; 
}
