CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.schedule_day_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(50) NOT NULL,
    schedule_snapshot JSONB NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT NOW()
);

CREATE INDEX idx_schedule_day_history_user_id ON public.schedule_day_history (user_id);