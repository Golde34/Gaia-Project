package ct.contribution_tracker.core.domain.dto.request.github;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Builder
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class GithubAuthorizationRequest {
    private String code;
    private String state;
}
