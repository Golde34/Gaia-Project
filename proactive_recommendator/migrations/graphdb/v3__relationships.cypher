// REQUIRES
UNWIND [
 {src:'attach_to_calendar', dst:'daily_calendar', w:1.0},
 {src:'reschedule_suggest', dst:'daily_calendar', w:1.0},
 {src:'review_conflicts',   dst:'daily_calendar', w:1.0}
] AS E
MATCH (a:Label {name:E.src}), (b:Label {name:E.dst})
MERGE (a)-[r:REQUIRES]->(b)
SET r.w=coalesce(E.w,1.0), r.version=1, r.source='seed';

// EXCLUDES
UNWIND [
 {a:'user_health', b:'review conflicts', w:1.0}
] AS E2
WITH CASE WHEN E2.a < E2.b THEN [E2.a,E2.b] ELSE [E2.b,E2.a] END AS pair, E2
MATCH (x:Label {name:pair[0]}), (y:Label {name:pair[1]})
MERGE (x)-[r:EXCLUDES]-(y)
SET r.w=coalesce(E2.w,1.0), r.version=1, r.source='seed';

// CO_OCCUR
UNWIND [
 {src:'create_task', dst:'list_task', pmi:0.9, w:0.75},
 {src:'create_task', dst:'daily_calendar', pmi:0.8, w:0.70},
 {src:'reschedule_suggest', dst:'show_backlog', pmi:0.7, w:0.6},
 {src:'attach_to_calendar', dst:'review_conflicts', pmi:0.6, w:0.55},
 {src:'decompose_task', dst:'create_task', pmi:0.65, w:0.58}
] AS C
MATCH (a:Label {name:C.src}), (b:Label {name:C.dst})
MERGE (a)-[r:CO_OCCUR]->(b)
SET r.pmi=coalesce(C.pmi,0.0), r.w=coalesce(C.w,C.pmi,0.0), r.source='seed';

// SIMILAR_TO
UNWIND [
 {src:'daily_calendar', dst:'schedule', sim:0.95},
 {src:'attach_to_calendar', dst:'reschedule_suggest', sim:0.75},
 {src:'show_backlog', dst:'list_task', sim:0.8}
] AS S
MATCH (a:Label {name:S.src}), (b:Label {name:S.dst})
MERGE (a)-[r:SIMILAR_TO]->(b)
SET r.sim=S.sim, r.w=coalesce(r.w,S.sim), r.source='seed';
