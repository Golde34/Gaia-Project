import CTServiceConfigurationEntity from "../../core/domain/entities/ct-service-configuration.entity";

export class CTServiceConfigRepository {
    async findActiveConfigByParamType(paramType: string): Promise<CTServiceConfigurationEntity[]> {
        try {
            return await CTServiceConfigurationEntity.findAll({
                where: {
                    paramType: paramType,
                    status: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to find active config by param type');
        }
    }

    async findConfigByParamType(paramType: string): Promise<CTServiceConfigurationEntity[]> {
        try {
            return await CTServiceConfigurationEntity.findAll({
                where: {
                    paramType: paramType,
                },
            });
        } catch (error) {
            throw new Error('Failed to find config by param');
        }
    }
}