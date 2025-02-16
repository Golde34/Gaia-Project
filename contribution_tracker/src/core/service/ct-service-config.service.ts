import { CTServiceConfigRepository } from "../../infrastructure/repository/ct-service-config.repository";
import CTServiceConfigurationEntity from "../domain/entities/ct-service-configuration.entity";

class CTConfigurationService {
    constructor(
        private ctServiceConfigurationRepository = new CTServiceConfigRepository(),
    ) { }

    async getConfigByParamType(paramType: string): Promise<any> {
        try {
            console.log("Getting config by param type: " + paramType);
            const config: CTServiceConfigurationEntity[] = await this.ctServiceConfigurationRepository.findActiveConfigByParamType(paramType);
            const result: { [key: string]: any } = {}
            for (const conf of config) {
                result[conf.paramName] = conf.paramValue;
            }
            return result;
        } catch (error) {
            console.error("Error on getConfigByParamType: ", error);
            return null;
        }
    }
}

export const ctConfigurationService = new CTConfigurationService();