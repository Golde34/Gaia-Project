// Labels
UNWIND [
 {name:'create task',    type:'intent',  aliases:['add task','new task'], description:'Create a new task'},
 {name:'list task',      type:'intent',  aliases:['show tasks','task list']},
 {name:'daily calendar', type:'context', aliases:['schedule','calendar']},
 {name:'attach to calendar', type:'action', aliases:['attach calendar','add to calendar']},
 {name:'reschedule suggest', type:'action', aliases:['suggest time','move to slot']},
 {name:'show backlog',   type:'action',  aliases:['review backlog','check backlog']},
 {name:'decompose task', type:'action',  aliases:['split task','subtasks suggest']},
 {name:'review conflicts', type:'action', aliases:['check conflicts']},
 {name:'reminder policy', type:'feature', aliases:['auto reminders']},
 {name:'user health',    type:'context', aliases:['health','wellness']}
] AS L
MERGE (x:Label {name:L.name})
SET x.type=L.type, x.aliases=coalesce(L.aliases,[]), x.description=coalesce(L.description,''), x.version=1, x.active=true;

// Providers
UNWIND [
 {name:'TaskStatsProvider',      description:'Fetch task stats'},
 {name:'CalendarDayProvider',    description:'Fetch day busy/free'},
 {name:'HealthSummaryProvider',  description:'Fetch health snapshot'},
 {name:'ConflictScanProvider',   description:'Scan conflicts'},
 {name:'FreeSlotFinderProvider', description:'Find free slots'},
 {name:'BacklogAggProvider',     description:'Aggregate backlog'},
 {name:'DecomposeTemplateProvider', description:'Suggest subtasks'}
] AS P
MERGE (p:Provider {name:P.name})
SET p.description=coalesce(P.description,''), p.active=true;

// (Optional) Flow groups
UNWIND [
 {name:'tasking', description:'Task workflow'},
 {name:'calendar', description:'Calendar workflow'}
] AS F
MERGE (f:Flow {name:F.name})
SET f.description=F.description, f.active=true;

// Map labels to flows (optional)
MATCH (l:Label {name:'create task'}), (f:Flow {name:'tasking'}) MERGE (l)-[:BELONGS_TO_FLOW {role:'core'}]->(f);
MATCH (l:Label {name:'list task'}),   (f:Flow {name:'tasking'}) MERGE (l)-[:BELONGS_TO_FLOW]->(f);
MATCH (l:Label {name:'daily calendar'}), (f:Flow {name:'calendar'}) MERGE (l)-[:BELONGS_TO_FLOW]->(f);
