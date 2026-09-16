# Collaborative Disassembly for Multiple Users in Virtual Reality

Ziteng Wang, Jian Wu, Sichun Huang, Peike Wang, Peng Zhang, Min Zhang, Lili Wang

IEEE Transactions on Visualization and Computer Graphics, 2026. DOI: https://doi.org/10.1109/tvcg.2026.3732564

Ziteng Wang: 第一作者 / First author

## Abstract

Disassembly Sequence Planning (DSP) is critical in product lifecycle management but computationally demanding, with traditional and machine learning approaches facing challenges in scalability and lacking the real-time responsiveness required for interactive collaboration in virtual reality (VR). We present Dynamic Parallel Disassembly and Tasking (DPDT), a novel framework tailored for immersive collaboration. DPDT integrates a spatial-temporal feature-based heuristic to accelerate search prioritization and employs a dynamic reactivation strategy to resolve inter-part dependencies during parallel execution. Furthermore, a proximity-aware task assignment algorithm optimizes the translation of these plans into efficient multi-user instructions. We conduct extensive evaluations on a large-scale dataset against multiple baselines, showing that DPDT significantly outperforms state-of-the-art baselines. Specifically, for complex assemblies, our method achieves a computational speedup of up to 4.7 times while improving planning reliability by approximately 9.3 percentage points. These algorithmic gains translate directly into operational efficiency: a 24-participant user study in VR confirms that DPDT significantly reduces task completion time, physical-effort proxies, and NASA-TLX workload, validating its potential for effective collaborative maintenance training.

## 方法讲解

把可行拆卸顺序、并行任务和就近分工连接起来，让多人在 VR 中协同完成复杂装配体拆卸。

Dynamic Parallel Disassembly and Tasking connects simulation-validated planning, parallel task sets, and proximity-aware allocation for collaborative VR.

多人参与，并不意味着拆卸自然变快：零件有先后依赖，用户还会等待任务、绕行或争抢目标。DPDT 同时考虑“下一步能拆什么”和“交给谁来拆”。

### 给候选零件排序

结合几何可见性、中心距离和历史尝试等时空特征，优先验证更有希望移除的零件。候选排序仍需要物理仿真检查。

### 维护可并行的任务集合

根据当前装配状态验证拆卸动作。一次移除改变阻塞关系后，动态重新激活之前暂时不可行的候选，推进下一轮规划。

### 把任务分给附近用户

在已验证的候选中，根据用户与目标的距离进行分配，并在 VR 中显示目标和移动指引。规划并行度可以大于在线用户数，为分配提供更多选择。

## 实验与证据

算法评测 · 3,671 个装配体；另报告 382 个复杂装配体子集 · 采用论文的几何、仿真和时间限制。
复杂子集规划时间 · DPDT Pₙ=5：8.66 s；ATA 串行：41.37 s · 约 4.7× 针对这一比较；ATA Pₙ=5 为 18.40 s，不是所有设置均有 4.7×。
复杂子集成功率 · 串行设置比 ATA 高 9.28 个百分点 · 百分点差值，不是相对增长率。
VR 用户实验 · 24 名参与者，1/2/3 人协作条件，四种方法 · 修订稿报告任务时间、头部移动和 NASA-TLX 改善；部分头部旋转比较经校正后不显著。

出版信息：IEEE 向 Crossref 登记的记录。方法与数值：作者 R2 clean 修订稿，§4–7；与出版版本的逐页一致性尚未核对。

## 适用边界

这是面向 VR 训练的仿真验证框架。当前主要处理刚性零件的平移拆卸，不等于验证了真实维修中的工具可达性、螺纹旋出、柔性部件或完整 6-DOF 操作。用户实验的运动量是体力负担的代理指标；协作中的等待也计入任务时间。

## 我的贡献

负责方法提出、系统实现、对比方法、用户实验、演示与论文写作。

## BibTeX

```bibtex
@article{collaborativedisassembly2026,
  title = {{Collaborative Disassembly for Multiple Users in Virtual Reality}},
  author = {Ziteng Wang and Jian Wu and Sichun Huang and Peike Wang and Peng Zhang and Min Zhang and Lili Wang},
  journal = {IEEE Transactions on Visualization and Computer Graphics},
  year = {2026},
  pages = {1--14},
  doi = {10.1109/tvcg.2026.3732564},
  url = {https://doi.org/10.1109/tvcg.2026.3732564}
}
```
