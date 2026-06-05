---
title: "A Statistical Framework for Alignment with Biased AI Feedback"
date: 2026-03-07
tags: ["k1"]
weight: 1
params:
  speaker: "蔡占锐"
  affiliation: "香港大学"
  time: "7月16日 9:00-9:40"
  location: "西南财经大学柳林校区弘远楼105会议室"
---

<h3 class="session-section-title">Abstract</h3>
<p class="session-text">
Modern alignment pipelines are increasingly replacing expensive human preference labels with evaluations from large language models (LLM-as-Judge). However, AI labels can be systematically biased compared to high-quality human feedback datasets. In this paper, we develop two debiased alignment methods within a general framework that accommodates heterogeneous prompt-response distributions and external human feedback sources. Debiased Direct Preference Optimization (DDPO) augments standard DPO with a residual-based correction and density-ratio reweighting to mitigate systematic bias, while retaining DPO's computational efficiency. Debiased Identity Preference Optimization (DIPO) directly estimates human preference probabilities without imposing a parametric reward model. We provide theoretical guarantees for both methods: DDPO offers a practical and computationally efficient solution for large-scale alignment, whereas DIPO serves as a robust, statistically optimal alternative that attains the semiparametric efficiency bound. Empirical studies on sentiment generation, summarization, and single-turn dialogue demonstrate that the proposed methods substantially improve alignment efficiency and recover performance close to that of an oracle trained on fully human-labeled data.
</p>

<h3 class="session-section-title">Biography</h3>
<p class="session-text">
蔡占锐现任香港大学经管学院创新与信息管理系助理教授。于2021年于宾夕法尼亚州立大学获得统计学博士学位，并于之后在卡内基梅隆大学进行博士后研究，以及在爱荷华州立大学统计系担任助理教授。研究兴趣包括统计在大模型中的应用，差分隐私中的统计推断，以及机器学习在统计方法中的应用等。
</p>
