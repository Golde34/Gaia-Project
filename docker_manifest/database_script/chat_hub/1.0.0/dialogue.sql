CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.user_dialogues (
    id UUID DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    dialogue_name VARCHAR(500) NOT NULL,
    dialogue_type VARCHAR(50) NOT NULL,
    dialogue_status BOOLEAN NOT NULL,
    metadata TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NULL,
    PRIMARY KEY (id, created_at)
);

CREATE INDEX idx_user_dialogues_user_id
    ON public.user_dialogues (user_id);

SELECT create_hypertable('user_dialogues', 'created_at', if_not_exists => TRUE);
