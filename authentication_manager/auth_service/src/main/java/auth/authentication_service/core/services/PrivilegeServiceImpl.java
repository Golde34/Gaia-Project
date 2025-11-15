package auth.authentication_service.core.services;

import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.domain.dto.PrivilegeDto;
import auth.authentication_service.core.domain.dto.response.ListPrivilegeResponse;
import auth.authentication_service.core.domain.entities.Privilege;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.port.mapper.PrivilegeMapper;
import auth.authentication_service.core.port.store.PrivilegeStore;
import auth.authentication_service.core.services.interfaces.PrivilegeService;
import auth.authentication_service.kernel.utils.GenericResponse;
import auth.authentication_service.kernel.utils.ModelMapperConfig;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrivilegeServiceImpl implements PrivilegeService {

    private final GenericResponse<?> genericResponse;
    private final PrivilegeStore privilegeStore;
    private final ModelMapperConfig modelMapperConfig;
    private final PrivilegeMapper privilegeMapper;

    @Override
    @CacheEvict(value = "privileges", allEntries = true)
    public ResponseEntity<?> createPrivilege(String privilegeName) {
        if (checkExistPrivilegeName(privilegeName)) {
            log.error("Create privilege failed: {}", privilegeName);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(Constants.ResponseMessage.PRIVILEGE_EXISTED, ResponseEnum.msg400));
        } else {
            Privilege newPrivilege = Privilege.builder()
                    .name(privilegeName)
                    .build();
            privilegeStore.save(newPrivilege);
            log.info("Create privilege: {} - {}", privilegeName, newPrivilege);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(newPrivilege, ResponseEnum.msg200));
        }
    }

    private boolean checkExistPrivilegeName(String privilegeName) {
        return privilegeStore.findByName(privilegeName) != null;
    }

    @Override
    @CacheEvict(value = "privileges", allEntries = true)
    public ResponseEntity<?> updatePrivilege(PrivilegeDto privilegeDto) {
        try {
            Privilege privilege = modelMapperConfig._mapperDtoToEntity(privilegeDto);
            if (checkExistPrivilege(privilege)) {
                if (!checkExistPrivilegeName(privilege.getName())) {
                    privilegeStore.save(privilege);
                    log.info("Update privilege: {} - {}", privilege.getName(), privilege);
                    return genericResponse
                            .matchingResponseMessage(new GenericResponse<>(privilege, ResponseEnum.msg200));
                }
            }
            log.error("Update privilege failed: {} - {}", privilege.getName(), privilege);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(Constants.ResponseMessage.UPDATE_PRIVILEGE, ResponseEnum.msg400));
        } catch (Exception e) {
            log.error("Update privilege failed", e);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(Constants.ResponseMessage.UPDATE_PRIVILEGE, ResponseEnum.msg400));
        }
    }

    private boolean checkExistPrivilege(Privilege privilege) {
        return privilegeStore.findPrivilegeById(privilege.getId()) != null;
    }

    @Override
    @CacheEvict(value = "privileges", allEntries = true)
    public ResponseEntity<?> deletePrivilege(PrivilegeDto privilegeDto) {
        try {
            Privilege privilege = modelMapperConfig._mapperDtoToEntity(privilegeDto);
            if (checkExistPrivilege(privilege)) {
                privilegeStore.delete(privilege);
                log.info("Delete privilege: {} - {}", privilege.getName(), privilege);
                return genericResponse.matchingResponseMessage(new GenericResponse<>(
                        "Privilege: %s delete!".formatted(privilege), ResponseEnum.msg200));
            }
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(Constants.ResponseMessage.DELETE_PRIVILEGE, ResponseEnum.msg400));
        } catch (Exception e) {
            log.error("Delete privilege failed", e);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(Constants.ResponseMessage.DELETE_PRIVILEGE, ResponseEnum.msg400));
        }
    }

    @Override
    @Cacheable(value = "privileges")
    public ResponseEntity<?> getAllPrivileges() {
        log.info("Get all privileges");
        List<Privilege> privileges = privilegeStore.findAll();
        List<ListPrivilegeResponse> privilegeResponses = privileges.stream()
                .map(privilegeMapper::mapPrivilegeResponse)
                .collect(Collectors.toList());
        return genericResponse.matchingResponseMessage(
                new GenericResponse<>(privilegeResponses, ResponseEnum.msg200));
    }

    @Override
    public ResponseEntity<?> getPrivilegeByName(PrivilegeDto privilegeDto) {
        Privilege privilege = privilegeStore.findByName(privilegeDto.getName());
        return genericResponse.matchingResponseMessage(
                new GenericResponse<>(privilege, ResponseEnum.msg200));
    }
}
