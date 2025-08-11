CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.schedule_day_bubbles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(50) NOT NULL,
    schedule_plan_id VARCHAR(50) NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    schedule_task_id UUID NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NULL
)

CREATE INDEX idx_schedule_day_bubbles_user_id ON public.schedule_day_bubbles (user_id);
CREATE INDEX idx_schedule_day_bubbles_schedule_plan_id ON public.schedule_day_bubbles (schedule_plan_id);
CREATE INDEX idx_schedule_day_bubbles_schedule_task_id ON public.schedule_day_bubbles (schedule_task_id);
