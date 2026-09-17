# DSPT：用于 VR 交互引导的拆卸序列规划 Transformer

Sichun Huang, Ziteng Wang, Sio Kei Im, Lili Wang

International Journal of Human–Computer Interaction, 2026-01-15. DOI: https://doi.org/10.1080/10447318.2025.2607559

Ziteng Wang: 第二作者

## 摘要（中文翻译）

虚拟现实已广泛用于复杂设备拆卸训练，而拆卸序列规划与交互式操作引导仍有待深入研究。基于物理碰撞检测的传统方法准确率高，但计算效率难以满足交互需求。近年来，基于深度学习的拆卸序列预测方法推理速度较快，却存在待拆零件预测不准确的问题。本文提出基于 Transformer 的拆卸序列规划网络 DSPT，用于优化拆卸序列并在 VR 环境中引导用户操作。首先，定义拆卸序列特征和零件历史特征及其构建方式。随后，提出基于时空评分的待拆零件概率预测器，并设计利用时空评分的新损失函数来提升预测性能。实验表明，该方法的序列准确率和逐步准确率均优于先进的比较方法。用户研究表明，该方法能显著缩短拆卸任务完成时间，并提高可用性。

## 方法讲解

用 Transformer 结合拆卸序列特征与零件历史，预测下一个拆卸目标，并把预测用于 VR 操作引导。

逐步物理搜索通常可靠却较慢，直接学习预测又可能给出无效候选。DSPT 研究如何用序列和历史信息提高候选预测质量，服务交互式拆卸引导。

### 描述当前拆卸过程

构建 Disassembly Sequence Features 和 Part History Features，让模型利用当前序列与零件历史，而不只看单个零件。

### 学习下一步的候选概率

用 Transformer 预测待拆零件概率，并引入时空评分及对应损失函数改善预测。

### 在 VR 中引导操作

将候选序列转为用户的拆卸引导，通过序列准确率、逐步准确率和用户任务表现进行评估。

## 实验与证据

序列准确率 · DSPT 60.29%；ASAP 50.49% · 论文表 2，测试集差值为 9.80 个百分点。
逐步准确率 · DSPT 87.68%；ASAP 82.30% · 论文表 2；不等于任意装配体的物理执行成功率。
VR 用户研究 · 16 名参与者，无 VR 使用经验 · 用户在相同实验场景下比较 DSPT 与 ASAP 引导。
拆卸完成时间 · DSPT 1038.50 ± 55.67 s；ASAP 1246.46 ± 62.42 s · 论文表 4：均值降低 16.68%，仅对应该研究任务。

题名、作者与卷期来自 Crossref；方法、图 1、表 2/4、16 人实验及限制均核对了本地出版 PDF 的可恢复正文页面。

## 适用边界

论文主要在零件较少的物体上评测，复杂或不规则装配体的泛化仍需验证。可见性特征提取带来额外计算开销；该工作没有覆盖拆卸路径规划。因此，候选顺序预测不能替代轨迹可行性、工具约束和真实机器人执行验证。

## 我的贡献

Ziteng Wang 为出版作者列表中的第二作者。

## BibTeX

```bibtex
@article{dspt2026,
  title = {{DSPT: Disassembly Sequence Planning Transformer for Interaction Guidance in VR}},
  author = {Sichun Huang and Ziteng Wang and Sio Kei Im and Lili Wang},
  journal = {International Journal of Human–Computer Interaction},
  year = {2026},
  volume = {42},
  number = {17},
  pages = {14171--14192},
  doi = {10.1080/10447318.2025.2607559},
  url = {https://doi.org/10.1080/10447318.2025.2607559}
}
```
