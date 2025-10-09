UNWIND [
 {provider:'TaskStatsProvider',       label:'list task',          priority:0},
 {provider:'TaskStatsProvider',       label:'show backlog',       priority:0},
 {provider:'CalendarDayProvider',     label:'daily calendar',     priority:0},
 {provider:'CalendarDayProvider',     label:'review conflicts',   priority:0},
 {provider:'FreeSlotFinderProvider',  label:'attach to calendar', priority:0},
 {provider:'FreeSlotFinderProvider',  label:'reschedule suggest', priority:0},
 {provider:'ConflictScanProvider',    label:'review conflicts',   priority:0},
 {provider:'BacklogAggProvider',      label:'show backlog',       priority:0},
 {provider:'DecomposeTemplateProvider', label:'decompose task',   priority:0},
 {provider:'HealthSummaryProvider',   label:'user health',        priority:0}
] AS M
MATCH (p:Provider {name:M.provider}), (l:Label {name:M.label})
MERGE (p)-[r:HANDLES]->(l)
SET r.priority=coalesce(M.priority,0);
