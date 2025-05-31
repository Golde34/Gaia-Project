CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.schedule_calendars(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL,
    repeatable BOOLEAN NOT NULL DEFAULT FALSE,
    repeatable_days INTEGER[] NULL,
    urgent_date DATE NULL
);

CREATE INDEX idx_schedule_calendars_user_id 
    ON public.schedule_calendars(user_id);

