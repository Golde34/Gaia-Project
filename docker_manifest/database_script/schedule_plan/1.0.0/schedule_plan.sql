CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.schedule_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL,
    start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_date TIMESTAMP WITHOUT TIME ZONE NULL,
    active_status VARCHAR(255) NOT NULL DEFAULT 'active',
    active_task_batch INTEGER NULL,
    is_task_batch_active BOOLEAN NULL,
    user_tag_time VARCHAR(255) NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at  TIMESTAMP WITHOUT TIME ZONE NULL,
);

CREATE INDEX idx_schedule_plans_user_id
    ON public.schedule_plans(user_id);
