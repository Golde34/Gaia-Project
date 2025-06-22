CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.user_messages (
    id UUID DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    dialogue_id UUID NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    order_number INTEGER NULL,
    content TEXT NOT NULL,
    metadata TEXT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NULL, 
    PRIMARY KEY (id, created_at)
)

CREATE INDEX idx_user_messages_user_id
    ON public.user_messages (user_id);

CREATE INDEX idx_user_messages_dialogue_id
    ON public.user_messages (dialogue_id);

SELECT create_hypertable('user_messages', 'created_at', if_not_exists => TRUE);
