package ct.contribution_tracker.core.domain.enums;

import lombok.Getter;

import java.util.Arrays;

@Getter
public enum ServiceEnum {
    AS("authentication_service"),
    GC("gaia_connector"),
    CLG("client_gui"),
    ML("middleware_loader"),
    TM("task_manager"),
    SP("schedule_plan"),
    GAIA("GAIA"),
    CMC("camera_cv");

    private final String serviceName;

    ServiceEnum(String serviceName) {
        this.serviceName = serviceName;
    }

    public static ServiceEnum of(String serviceName) {
        return Arrays.stream(ServiceEnum.values())
                .filter(service -> service.getServiceName().equals(serviceName))
                .findFirst().get();
    }
}
