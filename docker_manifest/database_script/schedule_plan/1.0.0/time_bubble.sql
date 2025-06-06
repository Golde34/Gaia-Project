CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.time_bubbles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_calendar_id VARCHAR(255) NULL,
    start_hour  INTEGER NULL,
    start_minute INTEGER NULL,
    end_hour    INTEGER NULL,
    end_minute  INTEGER NULL,
    tag         VARCHAR(255) NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at  TIMESTAMP WITHOUT TIME ZONE NULL,
);

CREATE INDEX idx_time_bubbles_schedule_calendar_id
    ON public.time_bubbles(schedule_calendar_id);
