CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.schedule_calendar_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL,
    schedule_calendar_id VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date TIMESTAMP WITHOUT TIME ZONE,
    created_at  TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at  TIMESTAMP WITHOUT TIME ZONE NULL,
);

CREATE INDEX idx_schedule_calendar_histories_user_id
    ON public.schedule_calendar_histories (user_id);

CREATE INDEX idx_schedule_calendar_histories_schedule_calendar_id
    ON public.schedule_calendar_histories (schedule_calendar_id);
