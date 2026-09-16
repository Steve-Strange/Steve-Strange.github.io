# DSPT: Disassembly Sequence Planning Transformer for Interaction Guidance in VR

Sichun Huang, Ziteng Wang, Sio Kei Im, Lili Wang

International Journal of Human–Computer Interaction, 2026-01-15. DOI: https://doi.org/10.1080/10447318.2025.2607559

Ziteng Wang: 第二作者 / Second author

## Abstract

The application of virtual reality technology in complex equipment disassembly training is widely used, and planning the disassembly sequence and interactively guiding the disassembly is an issue that requires in-depth research. Traditional methods based on physical collision detection are very accurate, but the computational efficiency is too low to meet the requirement of interactivity. In recent years, deep learning-based disassembly sequence prediction methods have emerged, which are fast in reasoning but suffer from inaccurate prediction of parts to be disassembled. In this paper, we propose a novel Transformer-based network, the Disassembly Sequence Planning Transformer (DSPT), to optimize the disassembly sequence for guiding users to disassemble objects in VR environments. First, we define Disassembly Sequence Features and Part History Features, along with their construction methods. Then, we introduce the parts-to-be-disassembled probability predictor based on a temporal-spatial score and propose a new loss function leveraging the temporal-spatial score to enhance the predictor’s performance. Experimental results show that our method achieves higher sequence accuracy and stepwise accuracy, both outperforming the state-of-the-art method. The results of the user study demonstrate that our method significantly reduces the disassembly task completion time and improves the usability compared to comparison methods.

## 方法讲解

用 Transformer 结合拆卸序列特征与零件历史，预测下一个拆卸目标，并把预测用于 VR 操作引导。

A Transformer uses disassembly-sequence and part-history features to predict removal candidates for interactive VR guidance.

逐步物理搜索通常可靠却较慢，直接学习预测又可能给出无效候选。DSPT 研究如何用序列和历史信息提高候选预测质量，服务交互式拆卸引导。

### 描述当前拆卸过程

构建 Disassembly Sequence Features 和 Part History Features，让模型利用当前序列与零件历史，而不只看单个零件。

### 学习下一步的候选概率

用 Transformer 预测待拆零件概率，并引入时空评分及对应损失函数改善预测。

### 在 VR 中引导操作

将候选序列转为用户的拆卸引导，通过序列准确率、逐步准确率和用户任务表现进行评估。

## 实验与证据

序列预测 · 论文摘要报告序列准确率与逐步准确率优于所比较的先进方法 · 完整评测表尚未获得，不转述未经核实的百分比。
交互评测 · 摘要报告拆卸任务完成时间降低、可用性提高 · 需要结合全文中的任务、参与者与比较条件解释。

题名、作者、卷期页码来自 Crossref；完整摘要来自 OpenAlex 对该 DOI 的记录。

## 适用边界

预测正确率与物理可执行性是不同问题。摘要不足以确定模型在任意装配体、工具约束或真实机器人上的表现。本页依据出版摘要讲解方法，详细样本规模、超参数和数值待全文补齐。

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
