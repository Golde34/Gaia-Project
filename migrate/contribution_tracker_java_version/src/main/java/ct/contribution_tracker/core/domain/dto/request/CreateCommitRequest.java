package ct.contribution_tracker.core.domain.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CreateCommitRequest {
    private String content;
    private Integer userId;
    private String type;
    private String projectId;
    private String taskId;
    private String subTaskId;
    private String scheduleTaskId;
    private String githubCommitId;
    private String commitAuthor;
    private String committerName;
    private String committerEmail;
    private String githubCommitDate;
    private String commitMessage;
    private String commitUrl;
}
