CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id         VARCHAR,
    type               VARCHAR,
    content            TEXT,
    receiver_id        VARCHAR,
    is_read            BOOLEAN DEFAULT FALSE,
    status             VARCHAR,
    error_status       VARCHAR,
    created_at         BIGINT NOT NULL,
    updated_at         BIGINT NOT NULL,
    user_id            VARCHAR,
    notification_flow_id VARCHAR
);
