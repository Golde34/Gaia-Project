package ct.contribution_tracker.infrastructure.client.adapter;

import java.io.IOException;
import java.util.Map;

import ct.contribution_tracker.infrastructure.client.ClientTemplate;
import ct.contribution_tracker.kernel.utils.ClientUtils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import ct.contribution_tracker.core.port.client.GithubClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GithubAdapter implements GithubClient {

    @Value("${github.url.github-repo}")
    private String githubRepoUrl;

    @Value("${github.url.github-token}")
    private String githubTokenUrl;

    @Value("${github.url.github-user}")
    private String githubUserUrl;

    private final ClientTemplate clientTemplate;
    private final ClientUtils clientUtils;

    @Override
    public Object getGithubUserInfo(String accessToken) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getGithubUserInfo'");
    }

    @Override
    public Object getGithubRepositories(String accessToken) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getGithubRepositories'");
    }

    @Override
    public Object getAllCommitsRepo(String githubLoginName, String githubAccessToken) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getAllCommitsRepo'");
    }

    @Override
    public Object getLatestCommitsRepo(String githubLoginName, String githubAccessToken, String githubRepo,
            String lastTimeSynced) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getLatestCommitsRepo'");
    }

    @Override
    public Object getGithubAccessToken(Map<String, String> githubSystemConfigs, String code) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getGithubAccessToken'");
    }
}
