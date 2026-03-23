---
title: "Escaping Local Minima Deterministically and Provably in Matrix Sensing: Power of Simulated Over-Parameterization"
date: 2026-03-07
tags: ["k1"]
weight: 5
params:
  speaker: "马梓业"
  affiliation: "香港城市大学"
  time: "TBD"
  location: "TBD"
---

<h3 class="session-section-title">Abstract</h3>
<p class="session-text">
Low-rank matrix sensing is a fundamental yet challenging nonconvex problem whose optimization landscape typically contains numerous spurious local minima, making it difficult for gradient-based optimizers to converge to the global optimum. Recent work has shown that tensor over-parameterization can, in principle, convert such local minima into strict saddle points; which also serves as a theoretical footnote to why scaling can improve generalization and performance in modern machine learning models like LLMs. Motivated by this observation, we propose a new escape mechanism that simulates the landscape and escape direction of the tensor-lifted space, without resorting to actually lifting the problem, since that would be computationally intractable. In essence, we designed a mathematical framework to project over-parametrized escape directions onto the original parameter space that could guarantee a strict decrease of objective value from existing local minima. To the best of our knowledge, this represents the first deterministic framework that could escape spurious local minima with guarantee, especially without using random perturbations or heuristic estimates.
</p>

<h3 class="session-section-title">Biography</h3>
<p class="session-text">
马梓业现为香港城市大学计算机系助理教授（presidential assistant professor），博士毕业于加州大学伯克利分校（UC Berkeley）电子工程与计算机科学系。他的主要研究方向是AI基础算法，机器学习理论，以及数学优化（非凸优化）。他的论文主要发表在主流人工智能会议及期刊上（NeurIPS, ICML, JMLR, AISTATS, AAAI等），也曾多次获得口头报告（oral）荣誉，以及2023年的AISTATS Notable Paper。他曾获批香港研究资助局（rgc）的 "杰出青年学者计划（ecs）" 以及国自然青年科学基金（C类）。
</p>
