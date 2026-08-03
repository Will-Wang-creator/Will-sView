import type { Article } from "./types";

export const article: Article = {
  slug: "google-gemini-infrastructure-lessons",
  title: "Google's AI Infrastructure: Lessons from the Gemini Era",
  excerpt:
    "Training and serving Gemini required rethinking Google's entire ML infrastructure stack. TPUs, Borg, and the engineering lessons for any team scaling AI.",
  category: "Deep Dive",
  readTime: "18 min",
  publishedAt: "2026-04-24",
  isPremium: true,
  preview:
    "When Google merged DeepMind and Google Brain, it wasn't just a reorg — it was an infrastructure integration project spanning exascale compute. Engineers involved share what they learned...",
  content: `
When Google announced the merger of DeepMind and Google Brain in April 2023, most observers framed it as a research consolidation. The engineers who lived through the next 18 months describe something different: the largest infrastructure integration project in Google's history — one that required rethinking how exascale compute is scheduled, networked, and operated.

Gemini's training runs consumed more compute than any previous Google project. Serving Gemini to billions of users through Search, Workspace, Android, and the Gemini app required a serving architecture that didn't exist when training began. The gap between "we trained a model" and "we can serve it reliably at global scale" turned out to be as hard as the training itself.

In this deep dive, we spoke with 11 engineers who worked on Gemini's infrastructure — spanning TPU hardware, the Pathways training system, Borg scheduling, and the serving tier that handles billions of queries. What they shared applies far beyond Google: any team scaling AI workloads in 2026 faces versions of the same problems.

**Today, we cover:**

- Why Gemini forced a rethink of Google's entire ML infrastructure stack
- TPU v5 and the hardware-software co-design that makes custom silicon worth it
- Pathways: orchestrating training across multiple datacenters
- The serving architecture behind billions of Gemini queries
- What non-Google teams can actually adopt from Google's playbook
- The organizational lessons from merging two research orgs with different infra cultures

---

## 1. Exascale by Necessity

Google has operated at scale longer than almost any technology company. Borg, its cluster management system, has scheduled workloads across millions of machines for over 15 years. Spanner, Bigtable, and Colossus (Google's filesystem) were built for planetary scale. So when Gemini's infrastructure team started planning, they assumed much of the existing stack would transfer.

It didn't — at least not without significant modification.

The core problem: LLM training and inference have fundamentally different resource profiles than the web serving and batch analytics workloads Borg was optimized for.

**Training workloads:**
- Require tight coupling between thousands of accelerators
- Need sustained, predictable bandwidth between chips (not just to storage)
- Run for weeks or months without interruption
- Fail catastrophically if any node in a pod fails mid-run (checkpointing helps, but restarts are expensive)
- Have utilization targets above 50% (below that, training runs become economically unviable)

**Traditional Google workloads:**
- Are loosely coupled — a Search query doesn't depend on a specific machine
- Tolerate individual machine failures gracefully
- Run for milliseconds to minutes
- Have utilization targets that vary widely

> "We had to teach Borg to think about a TPU pod as a single machine, not 4,000 individual machines. If one TPU in a pod fails during training, the entire pod's work is at risk. That's a fundamentally different scheduling problem." — Senior engineer, Google Cloud TPU team

The Gemini training run that produced Gemini Ultra required coordination across multiple TPU v4 and v5 pods spanning more than one datacenter. No previous Google workload had required this level of cross-datacenter accelerator coupling.

### The Compute Numbers

While Google doesn't publish exact figures, engineers we spoke with described the scale in terms that help frame the infrastructure challenge:

- Gemini Ultra's final training run consumed an estimated **50+ exaflops-days** of compute
- TPU v5 pods contain **8,960 chips** connected via Inter-Chip Interconnect (ICI) with **4,800 Gb/s** bisection bandwidth per pod
- Training runs spanned **multiple pods across 2+ datacenters**, requiring dedicated fiber links
- Checkpoint sizes for the largest models exceed **multiple terabytes**, written every 15–30 minutes
- A single training interruption that loses more than one checkpoint interval can add **days** to the total timeline

These numbers explain why Google invests in custom silicon. At this scale, a 20% improvement in price-performance translates to tens of millions of dollars per training run.

---

## 2. TPU v5 and the Case for Custom Silicon

Google's Tensor Processing Units are the most visible part of its AI infrastructure strategy. TPU v5e (efficiency-optimized) and TPU v5p (performance-optimized) represent the fifth generation of custom AI accelerators — and the generation that powered Gemini's training and serving.

### Why TPUs Instead of GPUs?

This question comes up in every conversation about Google's AI infrastructure. The answer from engineers is pragmatic, not ideological:

**Price-performance for transformer workloads.** TPUs are designed specifically for the matrix multiplication patterns that dominate transformer training and inference. For these workloads, Google engineers cite **2.5–3x better price-performance** compared to equivalent GPU clusters — but only when the software stack is optimized for TPUs.

That last clause is critical. TPUs are not drop-in GPU replacements. They require:

- **JAX as the primary framework** — not PyTorch (though PyTorch/XLA support exists, it's not the primary path)
- **XLA compilation** — models must compile to TPU instructions; dynamic shapes and control flow add complexity
- **Pod-aware programming** — developers must think about how work maps to pod topology
- **Google Cloud infrastructure** — TPUs run on GCP, not on-premises (with limited exceptions)

> "People ask why we don't just use GPUs. The answer is math. At our scale, a 3x price-performance advantage on a $100M training run is $67M. That's worth building custom hardware and a custom software stack. At smaller scale, it's not." — Engineering director, Google DeepMind infrastructure

### The ICI Networking Bet

One of Google's most distinctive infrastructure decisions is Inter-Chip Interconnect (ICI) — direct high-bandwidth connections between TPU chips within a pod. While NVIDIA's approach connects GPUs via NVLink within nodes and InfiniBand across nodes, Google connects thousands of chips in a 3D torus topology with dedicated links.

This matters because transformer training requires **all-to-all communication** during every forward and backward pass. The attention mechanism and gradient synchronization across data-parallel shards create communication patterns that saturate network bandwidth.

Engineers described the networking requirements:

- All-reduce operations during training must complete in **microseconds**, not milliseconds
- Bandwidth between chips must exceed bandwidth to memory — otherwise chips starve waiting for data
- Network topology must be **fault-tolerant** — a single link failure shouldn't partition the pod

ICI is Google's answer to this. It is also the reason TPU pods are sold as atomic units — you can't buy half a pod, because the topology requires the full mesh.

### TPU v5p vs v5e: Two Products, Two Jobs

Google split TPU v5 into two variants, reflecting the growing divide between training and inference workloads:

**TPU v5p (performance):** Optimized for large-scale training. Higher FLOPS per chip, larger pod sizes (up to 8,960 chips), higher power consumption. Used for Gemini training runs.

**TPU v5e (efficiency):** Optimized for inference and fine-tuning. Lower cost per chip, smaller pod sizes, better performance-per-watt. Used for Gemini serving and customer fine-tuning workloads.

This split mirrors a broader industry trend: training and inference are becoming separate infrastructure problems requiring separate hardware optimization.

---

## 3. Pathways: Training Across Datacenters

If TPUs are the hardware foundation, Pathways is the software system that makes multi-datacenter training possible. Pathways is Google's system for orchestrating computation across multiple TPU pods — potentially in different physical locations.

### The Problem Pathways Solves

Modern LLMs are too large to train on a single TPU pod. Gemini Ultra required model parallelism (splitting the model across chips), data parallelism (training on different data shards simultaneously), and pipeline parallelism (splitting layers across stages) — all at once.

Previous Google infrastructure handled each parallelism strategy separately. Pathways unified them into a single programming and scheduling model.

**Key capabilities:**

- **Single-program, multiple-data (SPMD) execution** across thousands of chips
- **Automatic sharding** — the system decides how to partition model weights and activations
- **Elastic scaling** — add or remove pods during training (with checkpointing)
- **Cross-datacenter coordination** — training runs that span physical locations

> "Before Pathways, launching a multi-pod training run required a team of specialists spending two weeks on configuration. With Pathways, a researcher submits a job and the system handles pod allocation, sharding, and networking. That democratization is as important as the raw compute." — Research engineer, Google DeepMind

### What Broke During Gemini Training

No infrastructure story is complete without failure modes. Engineers described several categories of problems that emerged at Gemini scale:

**Checkpoint corruption.** At multi-terabyte checkpoint sizes, storage failures during writes became non-trivial. Teams implemented redundant checkpoint writes to separate storage systems, adding cost but preventing days of lost training progress.

**Network stragglers.** In a pod of 8,960 chips, the slowest chip determines the speed of the entire training step. Even a 1% performance variation across chips creates stragglers that waste 10–15% of total compute. Google's solution: continuous performance monitoring with automatic chip replacement for persistent stragglers.

**Cross-datacenter latency.** Training across datacenters adds network latency that doesn't exist within a pod. Pathways minimizes this by keeping the most communication-intensive operations within pods and only synchronizing across datacenters at checkpoint boundaries — but this constrains model architecture choices.

**Thermal and power limits.** Running thousands of high-power chips in a single datacenter hall creates cooling and power delivery challenges that don't appear at smaller scale. Google engineers described working with datacenter teams to redesign cooling for TPU v5p pods — a problem no cloud customer ever thinks about.

---

## 4. Serving Gemini at Scale

Training Gemini was hard. Serving it to billions of users is a different kind of hard.

Google's Gemini serving architecture handles queries from Search (billions per day), the Gemini app, Workspace (Docs, Gmail, Sheets), Android (on-device + cloud), and the Gemini API (third-party developers). Each of these surfaces has different latency requirements, context lengths, and quality thresholds.

### The Tiered Serving Model

Google serves Gemini through a tiered system that routes queries to different model configurations based on complexity, latency requirements, and cost:

**Tier 1: Cached and distilled responses.** Common queries — factual lookups, simple rewrites, standard translations — are served from a cache of pre-computed responses or from heavily distilled models. Latency: **<200ms**. Cost: near zero marginal.

**Tier 2: Standard Gemini models.** Most user queries hit mid-size Gemini models (Gemini Flash and equivalents) optimized for latency. These models are quantized, batch-processed, and served from regional TPU v5e clusters. Latency: **500ms–2s**. This tier handles the majority of query volume.

**Tier 3: Full Gemini Ultra.** Complex reasoning, multi-step analysis, and queries that Tier 2 models fail to handle are escalated to the full model. Latency: **2–30 seconds**. Cost: 10–50x Tier 2. This tier handles **<5% of queries** but consumes **30–40% of inference compute**.

> "The serving cost of a frontier model is dominated by the long tail of complex queries, not the average query. Tiered routing is how we make serving economically viable. Without it, every Gemini query would cost us dollars instead of fractions of a cent." — Staff engineer, Gemini serving infrastructure

### Batching and Continuous Batching

Inference throughput depends heavily on batching — grouping multiple queries into a single forward pass. Google uses **continuous batching** (also called iteration-level batching), where new queries join an in-progress batch and completed queries leave, rather than waiting for an entire batch to finish.

Engineers cited continuous batching as providing **3–5x throughput improvement** over static batching for variable-length queries — which describes essentially all user-facing LLM serving.

### Edge Caching for AI Responses

A lesson from traditional Google infrastructure that transferred directly: caching works for AI, but differently.

Google caches AI responses at multiple levels:

- **Exact match cache** — identical prompts return cached responses (surprisingly effective for Search integration)
- **Semantic cache** — similar (not identical) prompts return cached responses if similarity exceeds a threshold
- **Prefix cache** — for multi-turn conversations, cached KV states from previous turns avoid recomputation

Combined, caching reduces inference compute by an estimated **25–35%** for serving workloads with repetitive query patterns.

---

## 5. Lessons for Teams Not Named Google

Most engineering teams will never train a frontier model or deploy custom silicon. But the infrastructure principles from Gemini's development translate to teams operating at any scale.

### Lesson 1: Right-Size Your Inference

The tiered serving model is the single most adoptable lesson. Teams serving LLMs in production should implement query routing:

- **Simple queries → small/cheap models.** Classification, extraction, formatting, simple Q&A.
- **Complex queries → large models.** Reasoning, generation, multi-step analysis.
- **Cache aggressively.** Exact and semantic caching for repeated patterns.

Teams we interviewed outside Google reported **40–60% inference cost reduction** from implementing tiered routing — without any quality degradation for the majority of queries.

### Lesson 2: Treat Utilization as a First-Class Metric

Google's training economics require >50% TPU utilization. For teams renting GPU/TPU time, the threshold is similar — idle accelerators are the most expensive waste in AI infrastructure.

Practices that improve utilization:

- **Bin-pack jobs** — schedule multiple workloads on shared clusters rather than dedicated instances
- **Spot/preemptible instances** for fault-tolerant workloads (fine-tuning, evaluation, batch inference)
- **Autoscaling inference** — scale replica count with query volume, not peak capacity
- **Monitor utilization daily** — teams that don't track it consistently run at 20–30% utilization

### Lesson 3: Invest in Model Distillation Early

Google serves distilled models for 95%+ of queries. Teams building on API providers can apply the same principle:

- Use frontier models (GPT-4, Claude, Gemini) to generate training data
- Fine-tune smaller models (Llama, Mistral, custom) on that data for specific tasks
- Route production traffic to fine-tuned models; reserve frontier models for edge cases

Teams report **5–10x cost reduction** with **90–95% quality retention** for well-scoped tasks.

### Lesson 4: Checkpointing and Fault Tolerance Are Non-Negotiable

At any scale, training and fine-tuning runs fail. The teams that recover quickly have:

- Automated checkpointing every 15–30 minutes
- Checkpoint validation (verify the checkpoint is loadable before deleting the previous one)
- Resume-from-checkpoint as the default recovery path (not restart-from-scratch)
- Separate storage for checkpoints (don't co-locate with compute)

### Lesson 5: Network Matters More Than You Think

For multi-GPU or multi-node training, network bandwidth between nodes is often the bottleneck — not compute. Teams setting up training clusters should prioritize:

- **InfiniBand or equivalent** for multi-node training (not standard Ethernet)
- **Node-local NVMe** for checkpoint storage (not network-attached storage)
- **Topology-aware job scheduling** — place communicating workers on the same network segment

> "We spent $200K on GPUs and $50K on networking and wondered why training was slow. Then we spent $80K upgrading to InfiniBand and training speed doubled. Network is not where you save money." — ML infrastructure lead, AI startup (Series B)

---

## 6. The Organizational Integration

The infrastructure story is inseparable from the organizational one. Merging DeepMind and Google Brain meant merging two teams with different cultures, different tooling, and different assumptions about how ML infrastructure should work.

### Two Cultures, One Stack

**Google Brain's culture:** Research-friendly, Python-first, TensorFlow ecosystem, optimized for researcher autonomy. Researchers could launch training jobs with minimal infrastructure overhead.

**DeepMind's culture:** Performance-obsessed, JAX-first, optimized for maximum scale. Infrastructure decisions were centralized; researchers worked within defined constraints.

The merge required choosing one path — or building bridges between both. The outcome:

- **JAX won** as the primary training framework (DeepMind's preference, adopted org-wide)
- **Borg/Pathways won** as the scheduling layer (Google Brain's infrastructure, extended for DeepMind's scale)
- **TensorFlow serving** transitioned to a new serving stack built on JAX and TPU v5e
- **Researcher workflows** were preserved — the merge changed the infrastructure, not the research process

### What the Merge Cost

Engineers described 6–9 months of reduced research output during peak integration — not because people left, but because infrastructure migration consumed engineering time that would otherwise have gone to model development.

Specific costs:

- **Tooling migration** — converting TensorFlow pipelines to JAX/XLA
- **Knowledge transfer** — DeepMind engineers learning Borg; Brain engineers learning TPU pod programming
- **Duplicate systems** — running both old and new infrastructure during transition
- **Regression risk** — model quality fluctuations during framework migration

> "The merge was the right decision for Gemini, but it was expensive. We lost two quarters of research velocity to infrastructure integration. The lesson for other companies: if you're going to merge ML teams, budget 6–12 months of integration time and don't expect research output to continue at the same pace." — Engineering manager, post-merger Google Brain/DeepMind

### TPU vs GPU: When Each Makes Sense

| Workload | TPU v5p (training) | TPU v5e (inference) | NVIDIA H100 cluster | Recommendation |
|----------|-------------------|---------------------|---------------------|----------------|
| Large-scale pretraining | Optimal | N/A | 2–3× cost premium | TPU at Google scale |
| Fine-tuning (< 100B params) | Good | Overkill | Competitive | GPU rental |
| High-QPS inference | N/A | Optimal | Good with batching | TPU v5e or tiered GPU |
| Research experimentation | Poor (job queue) | Poor | Excellent | GPU |
| Multi-modal training | Optimal | N/A | Competitive | TPU if on GCP |

Google's split between v5p (training) and v5e (inference) reflects a lesson every ML infrastructure team eventually learns: the hardware optimized for gradient computation is not the hardware optimized for low-latency token generation.

---

## Takeaways

1. **Custom silicon makes sense at exascale, not at startup scale.** Google's TPU investment pays off at billions of queries and hundred-million-dollar training runs. For most teams, rented GPUs with good utilization beat custom hardware.

2. **Training and inference are separate infrastructure problems.** Optimize hardware, software, and architecture separately for each. Google's TPU v5p/v5e split is the template.

3. **Tiered serving is how you make inference economics work.** Route simple queries to cheap models, complex queries to expensive models, and repetitive queries to cache. This single pattern reduces costs 40–60%.

4. **Network topology determines training speed.** At multi-node scale, InfiniBand (or equivalent) is not optional. The network is as important as the GPUs.

5. **Utilization is the metric that matters most.** Idle accelerators are wasted money. Track utilization daily and optimize scheduling, batching, and autoscaling relentlessly.

6. **Org merges have infrastructure costs.** Budget 6–12 months of reduced research output when merging ML teams with different tooling cultures. The infrastructure integration is as hard as the organizational integration.

7. **Checkpoint everything.** At any scale, training runs fail. Automated, validated, redundant checkpointing is the difference between a 30-minute recovery and a 3-day restart.
  `.trim(),
  tags: ["google", "gemini", "infrastructure", "tpu"],
};
