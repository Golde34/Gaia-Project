package auth.authentication_service.kernel.configs.config_models;

import lombok.Data;

import java.util.List;

@Data
public class ActivateUserStore {

    private List<String> users;

}