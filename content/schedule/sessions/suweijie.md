---
title: "Some Recent Progress on Matrix-Gradient Optimizers"
date: 2026-03-07
draft: true
tags: ["k1"]
weight: 10
params:
  speaker: "苏炜杰"
  affiliation: "University of Pennsylvania"
  time: "TBD"
  location: "TBD"
---

<h3 class="session-section-title">Abstract</h3>
<p class="session-text">
Introduced in December 2024, Muon is an optimization method for training language models that updates the weight along the direction of an orthogonalized gradient. The superiority of Muon has been quickly recognized, as demonstrated on industry-scale models; for example, it has been successfully used to train a trillion-parameter frontier language model. In this talk, we offer two perspectives to shed light on this matrix-gradient method. First, we introduce a unifying framework that precisely distinguishes between preconditioning for curvature anisotropy (like Adam) and gradient anisotropy (like Muon). This perspective not only offers new insights into Adam's instabilities and Muon's accelerated convergence but also leads to a new extension, such as PolarGrad. Next, we introduce a second perspective based on an isotropic curvature model. We derive this model by assuming isotropy of curvature (including Hessian and higher-order terms) across all perturbation directions. We show that under a general growth condition, the optimal update is one that makes the gradient's spectrum more homogeneous; that is, making its singular values closer in ratio. We then show that the orthogonalized gradient becomes optimal for this model when the curvature exhibits a phase transition in growth. Taken together, these results suggest that the gradient orthogonalization employed in Muon is directionally correct but may not be strictly optimal, and we will discuss how to leverage this model for designing new optimization methods. This talk is based on arXiv:2505.21799 and 2511.00674.
</p>

<h3 class="session-section-title">Biography</h3>
<p class="session-text">
苏炜杰现任宾夕法尼亚大学沃顿商学院、数学系和计算机系副教授，兼任宾大机器学习研究中心联席主任。2011年获得北京大学数学科学学院基础数学学士学位，2016年获得斯坦福大学博士学位。研究兴趣涵盖生成式人工智能的数学和统计基础、隐私保护机器学习、高维统计以及优化理论。
</p>
