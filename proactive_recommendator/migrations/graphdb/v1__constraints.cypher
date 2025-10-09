// Uniqueness
CREATE CONSTRAINT label_name_unique IF NOT EXISTS
FOR (l:Label) REQUIRE l.name IS UNIQUE;

CREATE CONSTRAINT provider_name_unique IF NOT EXISTS
FOR (p:Provider) REQUIRE p.name IS UNIQUE;

CREATE CONSTRAINT flow_name_unique IF NOT EXISTS
FOR (f:Flow) REQUIRE f.name IS UNIQUE;

// Optional index cho aliases
CREATE INDEX label_aliases IF NOT EXISTS FOR (l:Label) ON (l.aliases);
