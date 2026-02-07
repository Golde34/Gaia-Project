Architecture: 
Hybrid Spreading-Activation Memory (HSAM)
The core principle is to use Topic Indexing for coarse-grained filtering and Vector-WBOS Potentiation for fine-grained recall, simulating a "pulse" of electricity through neurons.

1. Memory Layer 
Definitions
Working Memory Graph (WMG): A sliding window of the last 10 messages (Redis RAM). Acts as the "Current Consciousness."
Short-Term Activation Graph (STAG): A 10–50 node buffer of "Active Concepts." Nodes stay here as long as they have "Energy."
Long-Term Memory (LTM): Cold storage for Semantic and Episodic data.

2. Node Schema (The "Neuron")
To minimize latency, each node in STAG is a lightweight object:
id: Unique identifier.
vector: \(d\)-dimensional embedding.
topic_id: Integer hash of the topic.
wbos_type: Enum [World, Experience, Opinion, Observation].
energy: A float value \([0,1]\) representing the current activation level.

3. The Retrieval Flow: 
"The Electrical Pulse"
Phase A: Selective Excitation (Topic Filtering)
When a new message enters WMG, we don't scan the whole STAG.
Extract: Current \(Topic_{WMG}\) and \(Embedding_{WMG}\).
Filter: Select nodes in STAG where \(Topic_{STAG}==Topic_{WMG}\) (or related topics).
Result: Reduces the search space from \(N\) to a small cluster of candidate neurons.
Phase B: Synaptic Firing (Vector Matching)
We simulate the "flow of electricity" by calculating the similarity between the current thought and the filtered nodes.
Calculate Similarity: 
Compute Cosine Similarity (\(S\)) between \(Embedding_{WMG}\) and \(Embedding_{STAG\_candidates}\).
Excite: For nodes where \(S>Threshold\), increase their energy:\(E_{new}=E_{old}+(S\cdot \alpha )\)(where \(\alpha \) is the conduction coefficient).
Phase C: Pattern Association (WBOS Pathing)
This is where the "recall" connects different types of information without heavy math.
The Jump: If an Observation (S) node is highly excited, the "current" automatically flows to connected Opinion (O) nodes of the same topic.
Context Enrichment: This retrieves not just what happened, but how the user felt about it, mimicking human hindsight.

4. Memory Maintenance (The Decay & Consolidation)
To keep the system fast and prevent resource bloat, we implement a Biological Decay cycle:
Energy Decay: 
After every interaction, all nodes in STAG lose energy: \(E_{t+1}=E_{t}\cdot \gamma \) (where \(\gamma <1\)).
Long-Term Potentiation (LTP): 
If a node is hit by "electricity" (recalled) multiple times, its decay rate slows down.
Pruning: 
When \(E<Threshold_{min}\):
Move the node to LTM (Semantic/Episodic).Delete the node from Redis (STAG).
