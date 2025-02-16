import Repository from "../database/repository";

export class CommitRepository extends Repository {
    private static instance: CommitRepository;

    public static getInstance(): CommitRepository {
        if (!CommitRepository.instance) {
            CommitRepository.instance = new CommitRepository();
        }
        return CommitRepository.instance;
    }

    constructor() {
        super('commit');
    }
}