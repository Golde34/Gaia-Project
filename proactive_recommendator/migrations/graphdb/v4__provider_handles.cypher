UNWIND [
 {provider:'TaskStatsProvider',       label:'list_task',          priority:0},
 {provider:'TaskStatsProvider',       label:'show_backlog',       priority:0},
 {provider:'CalendarDayProvider',     label:'daily_calendar',     priority:0},
 {provider:'CalendarDayProvider',     label:'review_conflicts',   priority:0},
 {provider:'FreeSlotFinderProvider',  label:'attach_to_calendar', priority:0},
 {provider:'FreeSlotFinderProvider',  label:'reschedule_suggest', priority:0},
 {provider:'ConflictScanProvider',    label:'review_conflicts',   priority:0},
 {provider:'BacklogAggProvider',      label:'show_backlog',       priority:0},
 {provider:'DecomposeTemplateProvider', label:'decompose_task',   priority:0},
 {provider:'HealthSummaryProvider',   label:'user_health',        priority:0}
] AS M
MATCH (p:Provider {name:M.provider}), (l:Label {name:M.label})
MERGE (p)-[r:HANDLES]->(l)
SET r.priority=coalesce(M.priority,0);
