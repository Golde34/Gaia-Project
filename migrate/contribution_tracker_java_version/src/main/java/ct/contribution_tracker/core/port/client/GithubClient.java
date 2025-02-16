package ct.contribution_tracker.core.port.client;

import java.util.Map;

public interface GithubClient {
    Object getGithubAccessToken(Map<String, String> githubSystemConfigs, String code);
    Object getGithubUserInfo(String accessToken);
    Object getGithubRepositories(String accessToken);
    Object getAllCommitsRepo(String githubLoginName, String githubAccessToken);
    Object getLatestCommitsRepo(String githubLoginName, String githubAccessToken, String githubRepo, String lastTimeSynced);
}
