package ct.contribution_tracker.infrastructure.store.repository;

import java.util.Date;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import ct.contribution_tracker.core.domain.entity.ProjectCommitEntity;

@Repository
public interface ProjectCommitRepo extends JpaRepository<ProjectCommitEntity, String> { 
    @Query("UPDATE ProjectCommitEntity p SET p.githubLastTimeSynced = :lastTimeSynced, updatedAt = :updatedAt, userSynced = :userSynced, userNumberSynced = :userNumberSynced where p.githubLastTimeSynced < :lastTimeSynced")
    ProjectCommitEntity updateSyncedTime(Date githubLastTimeSynced, Date updatedAt, Boolean userSynced, Integer userNumberSynced, Date lastTimeSynced);
}
