CREATE TABLE public.schedule_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_plan_id VARCHAR(255) NOT NULL,
    project_id       VARCHAR(255) NOT NULL,
    group_task_id    VARCHAR(255) NOT NULL,
    title            VARCHAR(255) NOT NULL,
    priority         VARCHAR(255)[] NOT NULL,
    status           VARCHAR(255) NOT NULL,
    start_hour       INTEGER        NOT NULL,
    start_minute     INTEGER        NOT NULL,
    end_hour         INTEGER        NOT NULL,
    end_minute       INTEGER        NOT NULL,
    duration         INTEGER        NOT NULL,
    preference_level INTEGER        NOT NULL,
    repeat           VARCHAR(255)[] NULL,
    is_notify        BOOLEAN        NOT NULL,
    active_status    VARCHAR(255)   NOT NULL,
    is_failed        BOOLEAN        NOT NULL,
    create_date      DATE           NOT NULL,
    update_date      DATE           NULL
);

CREATE INDEX idx_schedule_groups_schedule_plan_id
    ON public.schedule_groups (schedule_plan_id);

CREATE INDEX idx_schedule_groups_project_id
    ON public.schedule_groups (project_id);

CREATE INDEX idx_schedule_groups_group_task_id
    ON public.schedule_groups (group_task_id);