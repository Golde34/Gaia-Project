import { CTServiceConfigurationEntity } from "../../core/domain/entities/ct-service-configuration.entity";
import Repository from "../database/repository";

export class CTServiceConfigRepository extends Repository {
    private static instance: CTServiceConfigRepository;

    public static getInstance(): CTServiceConfigRepository {
        if (!CTServiceConfigRepository.instance) {
            CTServiceConfigRepository.instance = new CTServiceConfigRepository();
        }
        return CTServiceConfigRepository.instance;
    }

    constructor() {
        super('ct_service_configuration');
    }

    async findActiveConfigByParamType(paramType: string): Promise<CTServiceConfigurationEntity[]> {
        return await this.findByCondition('param_type = ? and status = ?', [paramType, true]);
    }

    async findConfigByParamType(paramType: string): Promise<CTServiceConfigurationEntity[]> {
        return await this.findByCondition('param_type = ?', [paramType]);
    }
}