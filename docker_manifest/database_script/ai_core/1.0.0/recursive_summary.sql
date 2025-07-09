CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE recursive_summary (
    id UUID DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    dialogue_id VARCHAR NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NULL,
    PRIMARY KEY (id, created_at)
);

CREATE INDEX idx_recursive_summary_user_id ON recursive_summary(user_id);
CREATE INDEX idx_recursive_summary_dialogue_id ON recursive_summary(dialogue_id);

SELECT create_hypertable('recursive_summary', 'created_at');

