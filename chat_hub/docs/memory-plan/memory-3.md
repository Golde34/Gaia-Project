# Graph Activation & Neural Resonance Engine

## Phase 1: Flash Activation (Physical Edges)
When $M_{new}$ arrives, we instantly activate the "Hard-wired" neighbors using Redis $O(1)$ lookups.

*   **Temporal Link:** $E(N_{prev}) \leftarrow E(N_{prev}) + \beta$
*   **Topic Link:** $E(N_{last\_topic}) \leftarrow E(N_{last\_topic}) + \beta$

> Where $\beta$ is a fixed **Structural Boost** (e.g., $0.2$).

---

## Phase 2: Neural Resonance (Vector Matching)

We simulate neuron connectivity through embedding similarity. To scale and maintain performance, we only calculate similarity for nodes already indexed within the **Topic Index**.

### Activation Formula
The new energy $E_{i}$ for a candidate node $i$ is calculated as follows:

$$E_{i}(t+1) = \sigma \left( E_{i}(t) \cdot \gamma + \text{sim}(\vec{V}_{new}, \vec{V}_{i}) \cdot \alpha \right)$$

### Parameters Detail:
*   **$\text{sim}(\vec{V}_{new}, \vec{V}_{i})$**: Cosine Similarity between the new node and candidate node, calculated via **Milvus**.
*   **$\gamma$**: Decay factor ($0 < \gamma < 1$), representing the loss of energy over time.
*   **$\alpha$**: Learning/Activation rate, controlling the impact of new semantic matches.
*   **$\sigma$**: Activation function (e.g., **ReLU** or **Sigmoid**) used to normalize energy levels, typically keeping $E \in [0, 1]$.

## Phase 3: WBOS Pathing (Hindsight Logic)

This phase acts as a **Conditional Router** for the electrical pulse within the graph. Instead of stochastic spreading, the pulse follows specific logical gates based on the node's semantic type.

### The Logic Gate
The system evaluates the "bit type" of $M_{new}$. For example, if $M_{new}$ contains **bit S** (Observation), the system propagates energy specifically to neighbors $j$ where the **bit O** (Opinion) is high.

**Propagation Formula:**
$$E_{j} = E_{j} + (E_{i} \times \omega_{WBOS})$$

### Parameters Detail:
*   **$\omega_{WBOS}$**: A weight matrix defining the strength of logical jumps. 
    *   Example: $S \rightarrow O$ (Observation to Opinion) is assigned a **strong** weight.
    *   Example: $W \rightarrow B$ (Will to Belief) is assigned a **moderate** weight.

### Hindsight Benefit
This mechanism ensures an intuitive "contextual recall". When a user mentions a specific fact ($S$), the AI automatically traverses the logical gate to recall how the user felt ($O$) or what they believed ($B$) about that fact in past interactions, simulating a human-like hindsight memory.

## 3. Data Structure per Node (Redis Hash)

To support this high-speed flow at scale, each **STAG (Spatio-Temporal Activation Graph)** node is stored as a Redis Hash. This structure allows for $O(1)$ property access and minimal memory overhead.

| Field | Key | Type | Description |
| :--- | :--- | :--- | :--- |
| **Topic ID** | `t` | `int` | Primary filter used in **Phase 1** for context isolation. |
| **WBOS** | `w` | `int` | 4-bit mask for logical routing ($W:8, B:4, O:2, S:1$). |
| **Energy** | `e` | `float` | Current "Potentiation" level ($E_i$), updated in **Phase 2 & 3**. |
| **Edges** | `ed` | `json` | Structural links: `{p: ID, n: ID, lt: ID}` (Prev, Next, Last Topic). |
| **Vector ID** | `vid` | `uuid` | Reference pointer for **Milvus** vector lookups. |

### Bitmask Reference (WBOS)
The `w` field uses bitwise logic to define node characteristics, enabling the **Phase 3** logical gates:
*   `0001` (1): **S** - Observation (Fact)
*   `0010` (2): **O** - Opinion (Feeling)
*   `0100` (4): **B** - Belief (Deep Conviction)
*   `1000` (8): **W** - Will (Intent/Desire)

---

### Implementation Note
By using short keys (`t`, `w`, `e`, `ed`, `vid`), we significantly reduce the RAM footprint in Redis while maintaining high throughput for the **Flash Activation** phase.

## Phase 4: Graph Maintenance (Homeostasis & Pruning)

To prevent memory explosion in Redis and maintain a high signal-to-noise ratio, the system implements a **Homeostasis Loop**. This ensures that frequently activated "core memories" persist while irrelevant noise is pruned.

### 1. Global Energy Decay (Entropy)
At regular intervals, a background worker applies a global decay function to all nodes. This simulates forgetting:
$$E_{i}(t_{next}) = E_{i}(t) \cdot \delta$$
*Where $\delta$ is the Decay Constant (e.g., $0.95$).*

### 2. Selective Pruning Logic
A node is candidates for removal from the **Active Buffer (Redis)** only if it meets these criteria:
*   **Low Energy:** $E_{i} < E_{threshold}$ (e.g., $0.1$).
*   **Maturity:** The node has existed for more than $X$ hours (avoiding pruning new nodes).
*   **Protection Bit:** If a node is part of a "Permanent Belief" (WBOS bit $B$ is high), the threshold for pruning is significantly higher.

### 3. Cold Storage Migration (PostgreSQL)
Instead of hard-deleting, the system performs a **Tiered Storage** move:
1.  **Hot (Redis):** High energy nodes ($E > 0.1$) for instant $O(1)$ activation.
2.  **Cold (PostgreSQL):** Pruned nodes are archived. They lose their "Active" status but remain searchable via **Milvus** for long-term Hindsight.
3.  **Re-activation:** If a cold node is hit via **Phase 2 (Vector Matching)** with a high similarity score, it is "re-hydrated" back into Redis with a fresh energy boost.

### 4. Edge Integrity & Deep Repair
When a node is pruned from the Hot Layer (Redis), the system must bridge the gap to prevent "Graph Fragmentation":

*   **Temporal Repair:** Standard doubly-linked list repair:
    *   $N_{prev}.next \leftarrow N.next$
    *   $N_{next}.prev \leftarrow N.prev$
*   **Topic Chain Repair (Crucial):** If the pruned node $N$ is the `lt` (Last Topic) reference for a subsequent node $M$, we must maintain the lineage:
    *   $M.lt \leftarrow N.lt$
    *   This ensures that even if intermediate "chatter" nodes are pruned, the **Topic Backbone** remains intact for Phase 1 lookups.

---

## Phase 5: Re-hydration (LTM to STM)

To prevent RAM explosion while maintaining "Long-term Memory" (LTM) accessibility, we implement a **Top-K Competitive Re-hydration** mechanism.

### 1. Resonance Trigger
A node is pulled from **PostgreSQL** back into **Redis** only if:
*   It is identified via **Phase 2 (Milvus)** with a high similarity score: $\text{sim}(\vec{V}_{new}, \vec{V}_{i}) > 0.9$.
*   It belongs to the current **Topic ID** or a globally significant context.

### 2. Competitive Admission (LRU-E)
Instead of simply adding to Redis, the system uses an **LRU-Energy (Least Recently Used based on Energy)** replacement policy:
*   **Capacity Guard:** If Redis reaches its node limit (e.g., 1 million nodes), the incoming re-hydrated node must "compete" for a slot.
*   **Swap Logic:** The node with the **lowest Energy** and **oldest timestamp** is evicted to PostgreSQL to make room for the high-resonance re-hydrated node.
*   **Initial Energy:** Re-hydrated nodes are initialized with $E = 0.8$ to ensure they survive the immediate next decay cycle.

---

## 6. Storage Strategy (Hybrid Stack)

| Layer | Technology | Role | Persistence |
| :--- | :--- | :--- | :--- |
| **STM (Short-Term)** | **Redis** | Fast Activation (Phase 1, 3) | Volatile/Hot |
| **Subconscious** | **Milvus** | Semantic Resonance (Phase 2) | Permanent (Vector) |
| **LTM (Long-Term)** | **PostgreSQL** | Cold Archive & Edge Backups | Permanent (Relational) |
| **Deep Graph** | **Neo4j** | Complex Pathfinding & Global Topology | Strategic |

Mermaid flow
```graph TD
    subgraph WMG [Working Memory - Redis RAM]
        M_new[New Message Node]
        M_new -->|Extract| T_id[Topic ID]
        M_new -->|Extract| V_new[Embedding Vector]
        M_new -->|Extract| W_bits[WBOS Bitmask]
    end

    subgraph STAG_Controller [STAG Control Layer - Redis RAM]
        subgraph Topic_Index [Topic Indexing]
            T_idx{{Topic ID Hash Map}}
        end
        
        subgraph Active_Graph [3-Edge Physical Graph]
            N_prev((Prev Node)) <--> N_curr((Current))
            N_topic((Last Topic Node)) --- N_curr
        end
    end

    subgraph Neuron_Resonance [Neural Resonance Layer - Milvus/Disk]
        V_store[(Vector Store)]
        V_new -.->|Cosine Similarity| V_store
    end

    subgraph Flow_Logic [The Pulse Flow]
        T_id -->|O 1 Filter| T_idx
        T_idx -->|Identify Candidates| N_curr
        N_curr -->|Fetch Vectors| V_store
        V_store -->|Calculate E| E_boost[Energy Potentiation]
        E_boost -->|WBOS Pathing| N_next((Next Logical Node))
    end

    subgraph LTM [Long Term Memory]
        Neo4j[(Semantic Graph)]
        Milvus_Deep[(Deep Vector Search)]
    end

    N_curr -->|Energy < Threshold| LTM
```

