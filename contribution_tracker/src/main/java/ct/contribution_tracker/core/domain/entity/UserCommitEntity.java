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

@Table(name = "user_commit")
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserCommitEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private Integer userId;
    private String githubUrl;
    private String githubSha;
    private String githubAccessToken;
    private String githubLoginName;
    private Boolean userConsent;
    private String userState;
    private String platform;
}
