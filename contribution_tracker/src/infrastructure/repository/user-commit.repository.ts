import { ulid } from "ulid";
import UserCommitEntity from "../../core/domain/entities/user-commit.entity";

export class UserCommitRepository {
    async findByUserId(userId: number): Promise<UserCommitEntity | undefined> {
        try {
            console.log("userId", userId)
            const result = await UserCommitEntity.findAll({ where: { userId: userId } });
            if (!result) {
                console.error("User not found")
                return undefined;
            }
            return result.at(0)
        } catch (error) {
            console.error(error)
            throw new Error("Failed to find user commit by userId");
        }
    }

    async initUser(userId: number): Promise<UserCommitEntity | undefined> {
        try {
            return await UserCommitEntity.create({
                id: ulid(),
                userId: userId,
                githubUrl: '',
                githubSha: '',
                userConsent: 0,
                userState: ulid(),
                totalUserCommits: 0
            });
        } catch (error) {
            console.error(error);
            throw new Error("Failed to init user");
        }
    }

    async updateUserState(userCommit: UserCommitEntity): Promise<UserCommitEntity> {
        try {
            const affectedRows = await UserCommitEntity.update(
                { userState: ulid(), },
                { where: { id: userCommit.id } })
            const updatedUser = affectedRows[0] > 0 ? await UserCommitEntity.findByPk(userCommit.id) : null;
            return updatedUser || userCommit;
        } catch (error) {
            throw new Error('Failed to update user state');
        }
    }

    async verifyGithubAuthorization(state: string): Promise<UserCommitEntity | undefined> {
        try {
            const result = await UserCommitEntity.findAll({ where: { userState: state } });
            if (!result) {
                console.error('User not found');
                return undefined;
            }
            return result.at(0);
        } catch (error) {
            throw new Error('Failed to verify github authorization');
        }
    }

    async updateUserConsent(
        user: UserCommitEntity,
        code: string,
        accessToken: string
    ): Promise<UserCommitEntity | null> {
        if (!user.id) return null;
        try {
            await UserCommitEntity.update(
                {
                    userConsent: 1,
                    githubSha: code,
                    githubAccessToken: accessToken,
                },
                { where: { id: user.id } }
            );
            const updatedUser = await UserCommitEntity.findByPk(user.id);
            return updatedUser || null;
        } catch (error) {
            console.log(error);
            throw new Error("Failed to update user consent");
        }
    }

    async synchronizeUserGithub(githubUrl: string, githubLoginName: string, id: string): Promise<UserCommitEntity | undefined> {
        try {
            await UserCommitEntity.update(
                {
                    githubUrl: githubUrl,
                    githubLoginName: githubLoginName,
                },
                { where: { id: id } }
            );

            const result = await UserCommitEntity.findAll({ where: { id: id } });
            if (!result) {
                console.error('User not found');
                return undefined;
            }
            return result.at(0);
        } catch (error) {
            throw new Error('Failed to synchronize user github');
        }
    }

    async findAll(): Promise<UserCommitEntity[]> {
        try {
            return await UserCommitEntity.findAll();
        } catch (error) {
            throw new Error("Failed to find all users");
        }
    }

    async updateTotalCommit(userId: number, totalCommit: number): Promise<UserCommitEntity | null> {
        try {
            const user = await UserCommitEntity.findOne({ where: { userId: userId } });
            if (!user) {
                throw new Error("User not found");
            }
            await user.increment('totalUserCommits', { by: totalCommit });
            await user.save();
            return user;
        } catch (error) {
            console.error("Error updating user total commit:", error);
            throw new Error("Failed to update user total commit");
        }
    }

    async decrementUserCommits(userId: number, totalCommit: number): Promise<UserCommitEntity | null> {
        try {
            const user = await UserCommitEntity.findOne({ where: { userId: userId } });
            if (!user) {
                throw new Error("User not found");
            }
            if (user.totalUserCommits === null || user.totalUserCommits === undefined) {
                user.totalUserCommits = 0;
            }
            await user.decrement('totalUserCommits', { by: totalCommit });
            await user.save();
            return user;
        } catch (error) {
            console.error("Error decrementing user commits:", error);
            return null;
        }
    }
}
