CREATE EXTENSION IF NOT EXISTS "pgcrypto";

create table schedule_tasks
(
    id                      uuid default gen_random_uuid() not null
        primary key,
    task_id                 varchar(255)                   not null,
    title                   varchar(255),
    priority                varchar(255)[],
    status                  varchar(255),
    start_date              date,
    deadline                date,
    duration                integer,
    active_status           varchar(255),
    preference_level        integer,
    is_synchronized_with_wo boolean,
    task_order              integer,
    weight                  double precision,
    stop_time               double precision,
    task_batch              integer,
    schedule_plan_id        varchar(255)                   not null,
    is_notify               boolean,
    created_at              timestamp,
    schedule_group_id       varchar(255),
    updated_at              timestamp,
    repeat                  varchar,
    tag                     varchar(50)
);

alter table schedule_tasks
    owner to postgres;

create index idx_schedule_tasks_schedule_plan_id
    on schedule_tasks (schedule_plan_id);

