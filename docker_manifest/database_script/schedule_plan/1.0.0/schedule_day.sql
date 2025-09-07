CREATE EXTENSION IF NOT EXISTS "pgcrypto";

create table schedule_day_bubbles
(
    id                 uuid default gen_random_uuid() not null primary key,
    user_id            bigint                         not null,
    start_time         time,
    end_time           time,
    created_at         timestamp,
    updated_at         timestamp,
    primary_task_id    varchar(50),
    backup_task_id     varchar(50),
    primary_task_title varchar,
    backup_task_title  varchar,
    tag                varchar,
    week_day           integer,
    time_bubble_id     varchar
);

alter table schedule_day_bubbles
    owner to postgres;

create index idx_schedule_day_bubbles_user_id
    on schedule_day_bubbles (user_id);