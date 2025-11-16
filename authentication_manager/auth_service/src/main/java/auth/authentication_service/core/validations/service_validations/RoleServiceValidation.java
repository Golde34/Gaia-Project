package auth.authentication_service.core.validations.service_validations;

import java.util.Optional;

import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.domain.entities.Role;
import auth.authentication_service.core.port.store.RoleStore;
import auth.authentication_service.kernel.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleServiceValidation {

    private final RoleStore roleStore;
    private final ObjectUtils objectUtils;

    public Pair<String, Boolean> canUpdateRole(Role role, String newName) {
        try {
            if (objectUtils.isNullOrEmpty(role)) {
                return Pair.of(Constants.ResponseMessage.OBJECT_NULL.formatted("Role"), false);
            }

            Optional<Role> existingRole = roleStore.findAll().stream()
                    .filter(r -> r.getId().equals(role.getId()))
                    .findFirst();

            if (existingRole.isEmpty()) {
                return Pair.of(Constants.ResponseMessage.ROLE_NOT_FOUND, false);
            }

            if (existingRole.get().getName().equals(newName)) {
                return Pair.of(Constants.ResponseMessage.ROLE_EXISTED, false);
            }

            return Pair.of(Constants.ResponseMessage.VALIDATE_SUCCESS, true);
        } catch (Exception e) {
            log.error("Check if can update role failed: ", e);
            return Pair.of(Constants.ResponseMessage.VALIDATE_FAILED, false);
        }
    }

    public boolean checkExistRole(Role role) {
        if (objectUtils.isNullOrEmpty(role)) {
            return false;
        }

        return roleStore.findRoleById(role.getId()) != null;
    }

    public boolean checkExistRoleName(String roleName) {
        return roleStore.findByName(roleName) != null;
    }
}
