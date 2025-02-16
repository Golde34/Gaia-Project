package ct.contribution_tracker.infrastructure.store.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ct.contribution_tracker.core.domain.entity.ContributionCalendar;

@Repository
public interface ContributionCalendarRepo extends JpaRepository<ContributionCalendar, String> { 
}
