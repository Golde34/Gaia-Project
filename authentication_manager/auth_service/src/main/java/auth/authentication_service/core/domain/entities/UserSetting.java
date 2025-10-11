package auth.authentication_service.core.domain.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.*;

import java.util.Date;

@Entity
@Data
@Builder
@Table(name = "user_setting")
@AllArgsConstructor
@NoArgsConstructor
public class UserSetting {

	@Id
	@Column(unique = true, nullable = false)
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "optimized_task_config", columnDefinition = "INT(11) COMMENT '1: Optimized All Tasks, \n" +
			"2: Registered Tasks in Day, 3: Optimized Tasks by Type, 4: Disable Task Optimization'")
	private Integer optimizedTaskConfig;

	@Column(name = "private_profile_config", columnDefinition = "TINYINT(4) COMMENT '1: Private, 2: Public'")
	private Integer privateProfileConfig;

	@Column(name = "task_sorting_algorithm", columnDefinition = "INT(11) COMMENT '1: Priority, 2: Time, \n" +
			"3: Time and Priority, 4: Tabu Search'")
	private Integer taskSortingAlgorithm;

	@Column(name = "auto_optimize_config", columnDefinition = "TINYINT(4) COMMENT '1: Optimize when creating task, " + 
			"2: Optimize in fixed time, 3: Disable auto optimize'")
	private Integer autoOptimizeConfig;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "user_id", referencedColumnName = "id")
	@JsonIgnore
	private User user;

	private Date createdDate;
	private Date updatedDate;

}