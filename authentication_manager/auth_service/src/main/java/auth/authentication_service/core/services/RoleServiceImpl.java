package auth.authentication_service.core.services;

import java.util.Collection;
import java.util.List;

import auth.authentication_service.core.exceptions.BusinessException;
import auth.authentication_service.core.port.mapper.RoleMapper;
import jakarta.transaction.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.util.Pair;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.domain.dto.PrivilegeDto;
import auth.authentication_service.core.domain.dto.RoleDto;
import auth.authentication_service.core.domain.entities.Privilege;
import auth.authentication_service.core.domain.entities.Role;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.port.store.RoleStore;
import auth.authentication_service.core.services.interfaces.RoleService;
import auth.authentication_service.core.validations.service_validations.RoleServiceValidation;
import auth.authentication_service.kernel.utils.GenericResponse;
import auth.authentication_service.kernel.utils.ModelMapperConfig;
import auth.authentication_service.kernel.utils.ResponseUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleServiceImpl implements RoleService {

    private final ModelMapperConfig modelMapperConfig;
    private final GenericResponse<?> genericResponse;
    private final ResponseUtils responseUtils;

    private final RoleStore roleStore;
    private final RoleServiceValidation roleServiceValidation;
    private final RoleMapper roleMapper;
    private final GlobalConfigService globalConfigService;

    @Override
    @Transactional(rollbackOn = Exception.class)
    @CacheEvict(value = "roles", allEntries = true)
    public ResponseEntity<?> createRole(RoleDto roleDto) {
        try {
            if (roleServiceValidation.checkExistRoleName(roleDto.getName())) {
                log.info("Create role failed: {}", roleDto.getName());
                return genericResponse.matchingResponseMessage(
                        new GenericResponse<>(Constants.ResponseMessage.ROLE_EXISTED, ResponseEnum.msg400));
            }
            Role newRole = roleMapper.map(roleDto);
            saveRole(newRole);
            updateRoleHierarchy();
            log.info("End create role process");
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(newRole, ResponseEnum.msg200));
        } catch (BusinessException e) {
            log.error("Create role failed", e);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(Constants.ResponseMessage.EXECUTION_FAILED, ResponseEnum.msg500));
        }
    }

    @Transactional(rollbackOn = Exception.class)
    public synchronized void saveRole(Role role) {
        roleStore.save(role);
        log.info("Save role {}", role);
    }

    @Transactional(rollbackOn = Exception.class)
    public void updateRoleHierarchy() {
        StringBuilder roleHierarchy = new StringBuilder();
        List<Role> roles = roleStore.findAllOrderByGrantedRank().stream().toList();

        roles.stream()
                .limit(roles.size() - 1) // Exclude the last role
                .forEach(role -> roleHierarchy.append(role.getName()).append(" > ")
                        .append(roles.get(roles.indexOf(role) + 1).getName()).append(" \n "));

        log.info("Role hierarchy: {}", roleHierarchy);
        globalConfigService.setAuthServiceConfig(Constants.AuthConfiguration.ROLE_HIERARCHY, roleHierarchy.toString());
    }

    @Override
    @CacheEvict(value = "roles", allEntries = true)
    public ResponseEntity<?> updateRole(RoleDto roleDto) {
        try {
            Role role = modelMapperConfig._mapperDtoToEntity(roleDto);
            Pair<String, Boolean> canUpdateRole = roleServiceValidation.canUpdateRole(role, role.getName());
            if (!canUpdateRole.getSecond()) {
                return genericResponse.matchingResponseMessage(
                        new GenericResponse<>(canUpdateRole.getFirst(), ResponseEnum.msg400));
            }
            roleStore.save(role);
            return genericResponse.matchingResponseMessage(new GenericResponse<>(role, ResponseEnum.msg200));
        } catch (Exception e) {
            GenericResponse<String> response = responseUtils.returnMessage(
                    "Update Role failed: %s ".formatted(e.getMessage()), Constants.ResponseMessage.UPDATE_ROLE,
                    ResponseEnum.msg400);
            return genericResponse.matchingResponseMessage(response);
        }
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    @CacheEvict(value = "roles", allEntries = true)
    public ResponseEntity<?> deleteRole(RoleDto roleDto) {
        try {
            Role role = modelMapperConfig._mapperDtoToEntity(roleDto);
            if (roleServiceValidation.checkExistRole(role)) {
                roleStore.delete(role);
                updateRoleHierarchy();
                return genericResponse.matchingResponseMessage(
                        new GenericResponse<>("Role " + role.getName() + " deleted!", ResponseEnum.msg200));
            }
            throw new BusinessException(Constants.ResponseMessage.ROLE_NOT_FOUND);
        } catch (BusinessException e) {
            log.error("Role not found", e);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(e.getMessage(), ResponseEnum.msg400));
        } catch (Exception e) {
            log.error("Delete role failed", e);
            String message = String.format(Constants.ResponseMessage.DELETE_ROLE, roleDto.getName());
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(message, ResponseEnum.msg400));
        }
    }

    @Override
    @Cacheable(value = "roles")
    public ResponseEntity<?> getAllRoles() {
        log.info("Get all roles");
        var roles = roleStore.findAllOrderByGrantedRank();
        var listRoles = roleMapper.mapToNumberRoleUsers(roles);
        return genericResponse.matchingResponseMessage(
                new GenericResponse<>(listRoles, ResponseEnum.msg200));
    }

    @Override
    public ResponseEntity<?> getRoleByName(String name) {
        Role role = roleStore.findByName(name);
        return genericResponse.matchingResponseMessage(
                new GenericResponse<>(role, ResponseEnum.msg200));
    }

    @Override
    public ResponseEntity<?> addPrivilegeToRole(RoleDto roleDto, List<PrivilegeDto> privilegesDto) {
        try {
            Role role = modelMapperConfig._mapperDtoToEntity(roleDto);
            List<Privilege> privileges = _mapperListPrivilegesDto(privilegesDto);
            if (roleServiceValidation.checkExistRole(role)) {
                role.setPrivileges(privileges);
                roleStore.save(role);
                log.info("Add privilege to role: {} - {}", role.getName(), privileges);
                return genericResponse.matchingResponseMessage(
                        new GenericResponse<>(role, ResponseEnum.msg200));
            }
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(Constants.ResponseMessage.ROLE_NOT_FOUND, ResponseEnum.msg400));
        } catch (Exception e) {
            log.error("Add privilege to role failed", e);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(Constants.ResponseMessage.ADD_PRIVILEGE_TO_ROLE, ResponseEnum.msg400));
        }
    }

    @Override
    public Role getBiggestRole(Collection<Role> roles) {
        return roles.stream().max((role1, role2) -> role1.getId().compareTo(role2.getId())).get();
    }

    private List<Privilege> _mapperListPrivilegesDto(List<PrivilegeDto> privilegeDtos) {
        return privilegeDtos.stream().map(p -> modelMapperConfig._mapperDtoToEntity(p)).toList();
    }
}
