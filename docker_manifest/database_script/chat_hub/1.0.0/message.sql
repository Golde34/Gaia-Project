CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    dialogue_id UUID NOT NULL,
    user_message_id VARCHAR(50) NULL,
    message_type VARCHAR(50) NOT NULL,
    sender_type varchar(10) NULL,
    content TEXT NOT NULL,
    metadata TEXT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NULL, 
    PRIMARY KEY (id, created_at)
)

CREATE INDEX idx_messages_user_id
    ON public.messages (user_id);

CREATE INDEX idx_messages_dialogue_id
    ON public.messages (dialogue_id);

SELECT create_hypertable('messages', 'created_at', if_not_exists => TRUE);
