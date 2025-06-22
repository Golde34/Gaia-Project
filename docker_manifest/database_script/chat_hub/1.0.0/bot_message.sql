CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.bot_messages (
    id UUID DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    dialogue_id UUID NOT NULL,
    user_messages_id UUID NOT NULL,
    order_number INTEGER NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    metadata TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NULL,
    PRIMARY KEY (id, created_at)
)

CREATE INDEX idx_bot_messages_user_id
    ON public.bot_messages (user_id);

CREATE INDEX idx_bot_messages_dialogue_id
    ON public.bot_messages (dialogue_id);

CREATE INDEX idx_bot_messages_user_messages_id
    ON public.bot_messages (user_messages_id);

SELECT create_hypertable('bot_messages', 'created_at', if_not_exists => TRUE);
