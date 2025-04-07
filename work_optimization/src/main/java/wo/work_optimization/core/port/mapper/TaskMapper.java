package wo.work_optimization.core.port.mapper;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import wo.work_optimization.core.domain.dto.request.OptimizeTaskRequestDTO;
import wo.work_optimization.core.domain.dto.request.TaskObjRequestDTO;
import wo.work_optimization.core.domain.dto.response.OriginalTaskResponseDTO;
import wo.work_optimization.core.domain.entity.Task;
import wo.work_optimization.core.domain.enums.TaskPriorityEnum;
import wo.work_optimization.core.domain.dto.request.CreateScheduleTaskRequestDTO;
import wo.work_optimization.core.domain.dto.request.CreateTaskRequestDTO;
import wo.work_optimization.kernel.utils.DateTimeUtils;

import java.text.ParseException;
import java.util.Arrays;

@Configuration
public class TaskMapper {

    @Bean
    ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        return modelMapper;
    }

    public CreateTaskRequestDTO mapCreateTask(Object request) {
        return modelMapper().map(request, CreateTaskRequestDTO.class);
    }

    public Task toEntity(CreateTaskRequestDTO createTaskRequestDTO) throws ParseException {
        return Task.builder()
                .title(createTaskRequestDTO.getTask().getTitle())
                .status(createTaskRequestDTO.getTask().getStatus())
                .startDate(DateTimeUtils.convertStringDateTime(createTaskRequestDTO.getTask().getStartDate()))
                .duration(createTaskRequestDTO.getTask().getDuration())
                .endDate(DateTimeUtils.convertStringDateTime(createTaskRequestDTO.getTask().getDeadline()))
                .activeStatus(createTaskRequestDTO.getTask().getActiveStatus())
                .originalId(createTaskRequestDTO.getTask().getId())
                .priority(calculateTaskWeight(createTaskRequestDTO.getTask().getPriority()))
                .build();
    }

    private int calculateTaskWeight(String[] priorities) {
        return Arrays.stream(priorities)
                .mapToInt(this::convertTaskPriority)
                .sum();
    }

    private int convertTaskPriority(String priority) {
        TaskPriorityEnum taskPriorityEnum = TaskPriorityEnum.of(priority);
        return switch (taskPriorityEnum) {
            case HIGH -> taskPriorityEnum.getWeight();
            case MEDIUM -> taskPriorityEnum.getWeight();
            case LOW -> taskPriorityEnum.getWeight();
            case STAR -> taskPriorityEnum.getWeight();
            default -> 0;
        };
    }

    public CreateScheduleTaskRequestDTO toCreateScheduleTaskRequestDTO(Object request) throws ParseException {
        return modelMapper().map(request, CreateScheduleTaskRequestDTO.class);
    }

    public OptimizeTaskRequestDTO toOptimizeTaskRequestDTO(Object request) {
        return modelMapper().map(request, OptimizeTaskRequestDTO.class);
    }

    public Task toEntity(OriginalTaskResponseDTO originalTask) throws ParseException {
        modelMapper().typeMap(OriginalTaskResponseDTO.class, CreateTaskRequestDTO.class)
                .addMappings(mapper -> mapper.map(OriginalTaskResponseDTO::getTask, CreateTaskRequestDTO::setTask));
        CreateTaskRequestDTO createTaskRequestDTO = modelMapper().map(originalTask, CreateTaskRequestDTO.class);
        return toEntity(createTaskRequestDTO);
    }

    public String mapDeleteTask(Object request) {
        return modelMapper().map(request, String.class);
    }

    public TaskObjRequestDTO mapUpdateTask(Object kafkaObjectDTO) {
        return modelMapper().map(kafkaObjectDTO, TaskObjRequestDTO.class);
    }

    public Task toEntity(TaskObjRequestDTO request, Task task) throws ParseException {
        task.setActiveStatus(request.getActiveStatus());
        task.setDuration(request.getDuration());
        task.setEndDate(DateTimeUtils.convertStringDateTime(request.getDeadline()));
        task.setPriority(calculateTaskWeight(request.getPriority()));
        task.setStartDate(DateTimeUtils.convertStringDateTime(request.getStartDate()));
        task.setStatus(request.getStatus());
        task.setTitle(request.getTitle());
        task.setStopTime(request.getStopTime());
        task.setTaskOrder(request.getTaskOrder());
        return task;
    }
}
