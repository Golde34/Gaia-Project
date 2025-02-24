import RedisClient from "../../infrastructure/cache/redis-cache";
import { ContributionCalendarRepository } from "../../infrastructure/repository/contribution-calendar.repository";

class ContributionCalendarService {
    private valkeyCache: any;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        this.valkeyCache = await RedisClient.getInstance();
    }

    async getFromValkey(key: string) {
        return this.valkeyCache.get(key);
    }
}