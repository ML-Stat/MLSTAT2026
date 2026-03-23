---
title: "SpecTr-GBV: Multi-Draft Block Verification Accelerating Speculative Decoding"
date: 2026-03-07
tags: ["k1"]
weight: 10
params:
  speaker: "周峰"
  affiliation: "中国人民大学"
  time: "TBD"
  location: "TBD"
---

<h3 class="session-section-title">Abstract</h3>
<p class="session-text">
Autoregressive language models achieve state-of-the-art performance across a wide range of natural language processing tasks, but suffer from high inference latency due to their sequential decoding nature. Speculative decoding (SD) mitigates this by employing a lightweight draft model to propose candidate tokens, which are selectively verified by a larger target model. While existing methods either adopt multi-draft strategies to increase acceptance rates or block verification techniques to jointly verify multiple tokens, they remain limited by treating these improvements in isolation. In this work, we propose SpecTr-GBV, a novel SD method that unifies multi-draft and greedy block verification (GBV) into a single framework. By formulating the verification step as an optimal transport problem over draft and target token blocks, SpecTr-GBV improves both theoretical efficiency and empirical performance. We theoretically prove that SpecTr-GBV achieves the optimal expected number of accepted tokens for any fixed number of draft sequences, and this bound improves as the number of drafts increases. Empirically, we evaluate SpecTr-GBV across five datasets and four baselines. Our method achieves superior speedup and significantly higher block efficiency while preserving output quality. In addition, we perform comprehensive ablation studies to evaluate the impact of various hyperparameters in the model.
</p>

<h3 class="session-section-title">Biography</h3>
<p class="session-text">
周峰，中国人民大学统计学院副教授，中国人民大学"杰出青年学者"，主要研究领域包括统计机器学习、贝叶斯方法、随机过程、大模型推理加速等，主持国家自然科学基金青年项目、面上项目，在JMLR、STCO、ICML、NeurIPS、ICLR、AAAI、KDD等国际期刊和会议上发表论文40余篇，担任NeurIPS、ICLR、AISTATS等国际会议领域主席，国际期刊《Statistics and Computing》副主编，《Transactions on Machine Learning Research》执行编辑，《Journal of Machine Learning Research》编委，中国商业统计学会人工智能分会副秘书长、全国工业统计学教学研究会青年统计学家协会第二届理事会理事、IEEE高级会员。
</p>
