package auth.authentication_service.core.services;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.domain.dto.PrivilegeDto;
import auth.authentication_service.core.domain.dto.response.ListPrivilegeResponse;
import auth.authentication_service.core.domain.entities.Privilege;
import auth.authentication_service.core.domain.enums.LoggerType;
import auth.authentication_service.core.domain.enums.ResponseEnum;
import auth.authentication_service.core.port.mapper.PrivilegeMapper;
import auth.authentication_service.core.port.store.PrivilegeStore;
import auth.authentication_service.core.services.interfaces.PrivilegeService;
import auth.authentication_service.kernel.utils.GenericResponse;
import auth.authentication_service.kernel.utils.LoggerUtils;
import auth.authentication_service.kernel.utils.ModelMapperConfig;

@Service
@Slf4j
public class PrivilegeServiceImpl implements PrivilegeService {

    @Autowired
    private LoggerUtils _logger;
    @Autowired
    private GenericResponse<?> genericResponse;

    private final PrivilegeStore privilegeStore;

    @Autowired
    private ModelMapperConfig modelMapperConfig;

    @Autowired
    private PrivilegeMapper privilegeMapper;

    public PrivilegeServiceImpl(PrivilegeStore privilegeStore) {
        this.privilegeStore = privilegeStore;
    }

    @Override
    @CacheEvict(value = "privileges", allEntries = true)
    public ResponseEntity<?> createPrivilege(String privilegeName) {
        if (_checkExistPrivilegeName(privilegeName)) {
            _logger.log("Create privilege failed", LoggerType.ERROR);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(Constants.ResponseMessage.PRIVILEGE_EXISTED, ResponseEnum.msg400));
        } else {
            Privilege newPrivilege = new Privilege();
            newPrivilege.setName(privilegeName);
            privilegeStore.save(newPrivilege);
            _logger.log("Create privilege: " + privilegeName, LoggerType.INFO);
            return genericResponse.matchingResponseMessage(new GenericResponse<>(newPrivilege, ResponseEnum.msg200));
        }
    }

    @Override
    @CacheEvict(value = "privileges", allEntries = true)
    public ResponseEntity<?> updatePrivilege(PrivilegeDto privilegeDto) {
        try {
            Privilege privilege = modelMapperConfig._mapperDtoToEntity(privilegeDto);
            if (_checkExistPrivilege(privilege)) {
                if (!_checkExistPrivilegeName(privilege.getName())) {
                    privilegeStore.save(privilege);
                    _logger.log("Update privilege: " + privilege.getName(), LoggerType.INFO);
                    return genericResponse
                            .matchingResponseMessage(new GenericResponse<>(privilege, ResponseEnum.msg200));
                }
            }
            _logger.log("Update privilege failed", LoggerType.ERROR);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(Constants.ResponseMessage.UPDATE_PRIVILEGE, ResponseEnum.msg400));
        } catch (Exception e) {
            _logger.log("Update privilege failed", LoggerType.ERROR);
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(Constants.ResponseMessage.UPDATE_PRIVILEGE, ResponseEnum.msg400));
        }
    }

    @Override
    @CacheEvict(value = "privileges", allEntries = true)
    public ResponseEntity<?> deletePrivilege(PrivilegeDto privilegeDto) {
        try {
            Privilege privilege = modelMapperConfig._mapperDtoToEntity(privilegeDto);
            if (_checkExistPrivilege(privilege)) {
                privilegeStore.delete(privilege);
                _logger.log("Delete privilege: " + privilege.getName(), LoggerType.INFO);
                return genericResponse.matchingResponseMessage(new GenericResponse<>(
                        "Privilege: %s delete!".formatted(privilege), ResponseEnum.msg200));
            }
            return genericResponse.matchingResponseMessage(
                    new GenericResponse<>(Constants.ResponseMessage.DELETE_PRIVILEGE, ResponseEnum.msg400));
        } catch (Exception e) {
            _logger.log("Delete privilege failed", LoggerType.ERROR);
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
        return genericResponse.matchingResponseMessage(new GenericResponse<>(privilegeResponses, ResponseEnum.msg200));
    }

    @Override
    public ResponseEntity<?> getPrivilegeByName(PrivilegeDto privilegeDto) {
        Privilege privilege = privilegeStore.findByName(privilegeDto.getName());
        return genericResponse.matchingResponseMessage(new GenericResponse<>(privilege, ResponseEnum.msg200));
    }

    private boolean _checkExistPrivilege(Privilege privilege) {
        try {
            for (Privilege item : privilegeStore.findAll()) {
                if (Objects.equals(item.getId(), privilege.getId())) {
                    return true;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            _logger.log("Check exist privilege failed", LoggerType.ERROR);
        }
        return false;
    }

    private boolean _checkExistPrivilegeName(String privilegeName) {
        try {
            for (Privilege item : privilegeStore.findAll()) {
                if (Objects.equals(item.getName(), privilegeName)) {
                    return true;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            _logger.log("Check exist privilege name failed", LoggerType.ERROR);
        }
        return false;
    }

}
