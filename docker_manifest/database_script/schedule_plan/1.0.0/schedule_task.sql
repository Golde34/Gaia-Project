CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.schedule_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(255)        NOT NULL,
    title   VARCHAR(255)        NOT NULL,
    priority VARCHAR(255)[]     NOT NULL,
    status  VARCHAR(255)        NOT NULL,
    start_date TIMESTAMP WITHOUT TIME ZONE             NOT NULL,
    deadline   TIMESTAMP WITHOUT TIME ZONE             NOT NULL,
    duration   INTEGER          NOT NULL,
    active_status VARCHAR(255)  NOT NULL,
    preference_level INTEGER     NOT NULL,
    is_synchronized_with_wo BOOLEAN NOT NULL,
    task_order   INTEGER         NULL,
    weight       FLOAT           NULL,
    stop_time    INTEGER         NULL,
    task_batch   INTEGER         NULL,
    schedule_plan_id VARCHAR(255) NOT NULL,
    is_notify       BOOLEAN       NOT NULL,
    schedule_group_id VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at  TIMESTAMP WITHOUT TIME ZONE NULL,
);

CREATE INDEX idx_schedule_tasks_schedule_plan_id
    ON public.schedule_tasks(schedule_plan_id);

CREATE INDEX idx_schedule_tasks_schedule_group_id
    ON public.schedule_tasks(schedule_group_id);
