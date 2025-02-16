import { ulid } from "ulid";
import { UserCommitEntity } from "../../core/domain/entities/user-commit.entity";
import Repository from "../database/repository";

export class UserCommitRepository extends Repository {
    private static instance: UserCommitRepository;

    public static getInstance(): UserCommitRepository {
        if (!UserCommitRepository.instance) {
            UserCommitRepository.instance = new UserCommitRepository();
        }
        return UserCommitRepository.instance;
    }

    constructor() {
        super('user_commit');
    }

    async findByUserId(userId: number): Promise<UserCommitEntity> {
        const users = await this.findByCondition('user_id = ?', [userId]);
        let user = users[0];
        const state = ulid();

        if (!user) {
            user = {
                id: ulid(),
                userId: Number(userId),
                githubUrl: '',
                githubSha: '',
                userConsent: 0,
                userState: state,
            };
            await this.insert(user);
        } else {
            await this.update(user.id, { userState: state });
            user.userState = state;
        }

        const { githubSha, ...result } = user;
        return result;
    }

    async verifyGithubAuthorization(state: string): Promise<UserCommitEntity | undefined> {
        const users = await this.findByCondition('user_state = ?', [state]);
        const user = users[0];
        if (!user) {
            console.error('User not found');
            return undefined;
        }
        return user;
    }

    async updateUserConsent(user: UserCommitEntity, code: string, accessToken: string): Promise<UserCommitEntity | null> {
        if (user.id === undefined) return null; 
        await this.update(user.id, { userConsent: true, githubSha: code, githubAccessToken: accessToken });
        return user;
    }

    async updateUser(user: UserCommitEntity): Promise<UserCommitEntity | null> {
        if (user.id === undefined) return null;
        await this.update(user.id, user);
        return user;
    }
}

export default UserCommitRepository;