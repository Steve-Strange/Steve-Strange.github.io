# MOA：高效的场景感知 VR 多物体布局方法

Xuehuai Shi, Yuhan Duan, Ziteng Wang, Jian Wu, Zhiwen Shao, Jieming Yin, Lili Wang

IEEE Transactions on Visualization and Computer Graphics, 2026-02. DOI: https://doi.org/10.1109/tvcg.2025.3636062

Ziteng Wang: 通讯作者（署名第三）

## 摘要（中文翻译）

三维多物体布局是 VR 中的基础任务，其效率依赖准确自然的初始选择，以及快速便捷的后续操纵。然而，在候选物体密集且遮挡严重的场景中，现有方法难以通过无手柄自然交互高效完成多物体布局。本文提出场景感知的多物体布局方法 MOA，以实现快速、准确且便捷的物体整理。首先，MOA 提出重要性驱动的多物体初始选择算法，赋予目标物体更高的时空相关物体重要性（IMP），并建立自然的初始选择方式，使用户能够快速准确地选取高重要性物体。随后，提出辅助结构引导的多物体操纵算法，为后续操纵构建辅助结构，并结合多模态交互实现快速自然的操作。在包含数百个高遮挡物体的复杂布局场景中，相比先进的无手柄和有手柄方法，MOA 显著提升了任务表现，降低了任务负担，并提高了操作便利性。

## 方法讲解

在大量物体互相遮挡的 VR 场景中，结合眼动、裸手和场景线索，先选中目标，再成组调整布局。

整理一组家具或密集物体时，选对对象和移动对象同样重要。只优化某一次抓取，无法解决连续选择、遮挡和成组布局带来的操作负担。

### 借助场景线索确定重要性

以时空相关的 object importance（IMP）帮助区分目标和干扰对象，支持自然的多物体初始选择。

### 构建辅助操作结构

为已选物体构建辅助结构，让后续调整有可操作的参照，降低逐一处理物体的负担。

### 组合多模态交互

结合眼动与裸手等输入完成选择和操纵，使初始选取与后续布局成为连续流程。

## 实验与证据

场景 · 包含数百个、高度遮挡物体的复杂布局任务 · 关注多物体整理，不是孤立的单物体选择。
对比 · 与无手柄和有手柄方法比较 · 出版摘要报告任务表现、负担与便利性改善；本页不补造缺失的量化结果。

出版卷期：IEEE TVCG 32(2), 2183–2199, 2026；摘要来自 Semantic Scholar 对该 DOI 的记录，PubMed 记录 PMID 41284398 交叉核对书目信息。

## 适用边界

当前说明依据出版摘要和作者材料。具体性能取决于场景组织、输入追踪质量和任务设计；没有完整终稿的评测表，不能据此承诺固定的效率提升。

## 我的贡献

负责方法提出、设计与实现，以及对比方法、用户实验和演示系统。通讯作者角色沿用个人简历记录。

## BibTeX

```bibtex
@article{moa2026,
  title = {{MOA: Efficient Scene-Aware Multi-Object Arrangement in VR}},
  author = {Xuehuai Shi and Yuhan Duan and Ziteng Wang and Jian Wu and Zhiwen Shao and Jieming Yin and Lili Wang},
  journal = {IEEE Transactions on Visualization and Computer Graphics},
  year = {2026},
  volume = {32},
  number = {2},
  pages = {2183--2199},
  doi = {10.1109/tvcg.2025.3636062},
  url = {https://doi.org/10.1109/tvcg.2025.3636062}
}
```
