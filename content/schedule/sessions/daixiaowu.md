---
title: "Multi-Agent Language Models: Games, Reasoning, and Alignment"
date: 2026-03-07
tags: ["k1"]
weight: 1
params:
  speaker: "戴晓武"
  affiliation: "University of California, Los Angeles"
  time: "TBD"
  location: "TBD"
---

<h3 class="session-section-title">Abstract</h3>
<p class="session-text">
Large Language Models (LLMs) could prone to inconsistencies and hallucinations. We introduce Peer Elicitation Games (PEG), a training-free, game-theoretic framework for aligning LLMs through a peer elicitation mechanism involving a generator and multiple discriminators instantiated from distinct base models. Discriminators interact in a peer evaluation setting, where rewards are computed using a determinant-based mutual information score that provably incentivizes truthful reporting without requiring ground-truth labels. We establish theoretical guarantees showing that each agent, via online learning, achieves sublinear regret in the sense their cumulative performance approaches that of the best fixed truthful strategy in hindsight. Moreover, we prove last-iterate convergence to a truthful Nash equilibrium, ensuring that the actual policies used by agents converge to stable and truthful behavior over time. I'll also discuss the extension of PEG to the multi-agent reasoning and inference-time alignment.
</p>

<h3 class="session-section-title">Biography</h3>
<p class="session-text">
Xiaowu Dai is an assistant professor in the Departments of Statistics and Data Science, and of Biostatistics at UCLA. Before joining UCLA, he did a postdoc at UC Berkeley working with Prof. Mike Jordan, and received a Ph.D. in Statistics at UW-Madison advised by Prof. Grace Wahba. His research focuses on statistical theory and methodology for real-world problems that blend computational, inferential, and economic considerations.
</p>
