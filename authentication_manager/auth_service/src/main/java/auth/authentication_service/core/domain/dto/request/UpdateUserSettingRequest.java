package auth.authentication_service.core.domain.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserSettingRequest {
    private long userId;
    private Integer optimizedTaskConfig;
	private Integer privateProfileConfig;
	private Integer taskSortingAlgorithm;
	private Integer autoOptimizeConfig;
}
