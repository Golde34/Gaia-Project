import { format } from 'date-fns';
import * as dotenv from 'dotenv';

dotenv.config({ path: './src/.env' })

class GithubClientAdapter {
    private githubTokenUrl: string;
    private githubUserInfoUrl: string;
    private githubRepositoriesUrl: string;

    constructor() {
        this.githubTokenUrl = process.env.GITHUB_TOKEN_URL ?? "https://github.com/login/oauth/access_token",
            this.githubUserInfoUrl = process.env.GITHUB_USER_INFO_URL ?? "https://api.github.com/user",
            this.githubRepositoriesUrl = process.env.GITHUB_REPOSITORIES_URL ?? "https://api.github.com/user/repos"
    }

    private async getDataGithubApi(url: string, method: string, body: any, accessToken: string | null): Promise<any> {
        try {
            const response = await this.callGithubApi(url, method, body, accessToken);
            return response.data;
        } catch (error: any) {
            console.error("Exception when calling Github API", error);
            return null;
        }
    }

    private async callGithubApi(url: string, method: string, body: any, accessToken: string | null): Promise<any> {
        try {
            const headers: Record<string, string> = accessToken ? {
                Authorization: `token ${accessToken}`,
                Accept: "*/*",
                "Content-Type": "application/json",
            } : {
                Accept: "*/*",
                "Content-Type": "application/json",
            }

            const response = await fetch(url, {
                headers: headers,
                method: method,
                body: body ? JSON.stringify(body) : undefined
            });
            if (response.status !== 200) {
                console.error(`Github API returned status: ${response.status}`);
                return null;
            }

            const responseHeaders = response.headers;
            const data = await response.json();
            if (data.error) {
                console.error(`Error from Github API: ${data.error}`);
                return null;
            }
            return {
                data: data,
                headers: responseHeaders
            }
        } catch (error: any) {
            console.error("Exception when calling Github API", error);
            return null;
        }
    }

    async getGithubAccessToken(body: any): Promise<string | null> {
        try {
            console.log('Github token url: ', this.githubTokenUrl);
            const response = await fetch(this.githubTokenUrl, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            });
            if (response.status !== 200) {
                console.error(`Github API returned status: ${response.status}`);
                return null;
            }

            const data = await response.json();
            if (data.error) {
                console.error(`Error from Github API: ${data.error}`);
                return null;
            }
            return data.access_token;
        } catch (error: any) {
            console.error("Exception when calling Github API", error);
            return null;
        }
    }

    async getGithubUserInfo(accessToken: string): Promise<any> {
        try {
            return await this.getDataGithubApi(this.githubUserInfoUrl, 'GET', null, accessToken);
        } catch (error: any) {
            console.error("Exception when calling Github API", error);
            return null;
        }
    }

    async getGithubRepositories(accessToken: string): Promise<any> {
        try {
            return await this.getDataGithubApi(this.githubRepositoriesUrl, 'GET', null, accessToken);
        } catch (error: any) {
            console.error("Exception when calling Github API", error);
            return null;
        }
    }

    async getAllCommitsRepo(githubLoginName: string, githubAccessToken: string, githubRepo: string
    ): Promise<any[]> {
        let allCommits: any[] = [];
        let nextPageUrl = `https://api.github.com/repos/${githubLoginName}/${githubRepo}/commits?per_page=100`;

        try {
            while (nextPageUrl) {
                const response = await this.callGithubApi(nextPageUrl, 'GET', null, githubAccessToken);
                if (!response || !response.data) {
                    console.warn(`No valid response for URL: ${nextPageUrl}`);
                    break;
                }

                const commits = response.data;
                if (commits.length === 0) {
                    break;
                }

                allCommits = allCommits.concat(commits);

                const linkHeader = response.headers.get('link') || '';
                const links = this.parseLinkHeader(linkHeader);
                if (links['next']) {
                    nextPageUrl = links['next'];
                } else {
                    nextPageUrl = '';
                }
                console.log('Next page URL: ', nextPageUrl);
            }
        } catch (error) {
            console.error(`Error fetching all commits from repo ${githubRepo}:`, error);
        }

        console.log('All commits: ', allCommits.length);
        return allCommits;
    }

    private parseLinkHeader(header: string): Record<string, string> {
        const links: Record<string, string> = {};

        const parts = header.split(',');
        for (const part of parts) {
            const section = part.split(';');
            if (section.length !== 2) continue;

            const url = section[0].trim().replace(/<(.*)>/, '$1');
            const rel = section[1].trim().replace(/rel="(.*)"/, '$1');
            links[rel] = url;
        }
        return links;
    }

    async getLatestCommitsRepo(githubLoginName: string, githubAccessToken: string, githubRepo: string, lastTimeSynced: string): Promise<any[]> {

        const allCommits: any[] = [];
        const now = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');

        let nextPageUrl = `https://api.github.com/repos/${githubLoginName}/${githubRepo}/commits?per_page=100&since=${lastTimeSynced}&until=${now}`;

        try {
            while (nextPageUrl) {
                const response = await this.callGithubApi(nextPageUrl, 'GET', null, githubAccessToken);
                if (!response || !response.data) {
                    console.warn(`No valid response for URL: ${nextPageUrl}`);
                    break;
                }

                const commits = response.data;
                if (!Array.isArray(commits) || commits.length === 0) {
                    break;
                }

                allCommits.push(...commits);

                const linkHeader = response.headers?.link || '';
                const links = this.parseLinkHeader(linkHeader);

                if (links['next']) {
                    nextPageUrl = links['next'];
                } else {
                    nextPageUrl = '';
                }
            }
        } catch (error) {
            console.error(`Error fetching latest commits from ${githubRepo}:`, error);
        }

        return allCommits;
    }
}

export const githubClientAdapter = new GithubClientAdapter();