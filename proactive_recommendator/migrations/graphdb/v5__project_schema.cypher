CREATE CONSTRAINT project_id_unique IF NOT EXISTS
FOR (p:Project) REQUIRE p.id IS UNIQUE;

CREATE CONSTRAINT group_task_id_unique IF NOT EXISTS
FOR (gt:GroupTask) REQUIRE gt.id IS UNIQUE;

CREATE INDEX project_user_idx IF NOT EXISTS
FOR (p:Project) ON (p.user_id);

CREATE INDEX project_active_status_idx IF NOT EXISTS
FOR (p:Project) ON (p.active_status);

CREATE INDEX group_task_active_status_idx IF NOT EXISTS
FOR (gt:GroupTask) ON (gt.active_status);

CREATE VECTOR INDEX project_description_vector_idx IF NOT EXISTS
FOR (p:Project) ON (p.description_vector)
OPTIONS {
    indexConfig: {
        `vector.dimensions`: 384,
        `vector.similarity_function`: 'cosine'
    }
};

CREATE VECTOR INDEX group_task_description_vector_idx IF NOT EXISTS
FOR (gt:GroupTask) ON (gt.description_vector)
OPTIONS {
    indexConfig: {
        `vector.dimensions`: 384,
        `vector.similarity_function`: 'cosine'
    }
};
