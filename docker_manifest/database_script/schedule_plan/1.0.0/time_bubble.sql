CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.time_bubbles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time  TIME WITHOUT TIME ZONE NOT NULL,
    end_time    TIME WITHOUT TIME ZONE NOT NULL,
    tag         VARCHAR(50) NULL,
    status      VARCHAR(50) NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at  TIMESTAMP WITHOUT TIME ZONE NULL
);

CREATE INDEX idx_time_bubbles_user_id ON public.time_bubbles (user_id);
CREATE INDEX idx_time_bubbles_day_of_week ON public.time_bubbles (day_of_week); 
