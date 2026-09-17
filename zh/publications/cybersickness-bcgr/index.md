# 基于脑连接图表示的晕动症识别多模态对比学习

Peike Wang, Ming Li, Ziteng Wang, Yong-Jin Liu, Lili Wang

IEEE Transactions on Visualization and Computer Graphics, 2025-11. DOI: https://doi.org/10.1109/tvcg.2025.3616797

Ziteng Wang: 第三作者

## 摘要（中文翻译）

晕动症会显著降低用户在 VR 中的舒适度与沉浸感。利用生理、视觉和运动数据有效识别晕动症，是缓解其影响的重要前提。然而，现有方法主要直接融合各模态特征，对模态间关系的建模不足，限制了识别准确率。本文提出用于晕动症识别的多模态对比学习方法。首先，提出脑连接图表示（BCGR），以图结构刻画不同模态中与晕动症相关的连接模式，并构建三种实例：由 EEG 信号构建的 E-BCGR，由视频和运动数据构建的 MV-BCGR，以及通过标准化分解算法获得的 S-BCGR。随后，提出连接约束对比融合模块，通过图对比学习将 E-BCGR 和 MV-BCGR 对齐至共同潜在空间，并使用 S-BCGR 作为连接约束，提升表示质量。此外，我们构建了在 VR 环境中同步采集 EEG、视频和运动数据的多模态晕动症数据集。实验表明，该方法在准确率、敏感度、特异度和曲线下面积四项指标上均优于现有先进方法。源代码：https://github.com/PEKEW/cybersickness-bcgr。

## 方法讲解

把 EEG、视频与运动数据表示为脑连接图，再用带连接约束的对比学习融合信息，识别 VR 晕动症。

EEG、视觉与运动数据都含有晕动症线索，但简单拼接特征不一定能建立模态间的关系。该方法让不同模态先进入可比较的连接图表示，再学习一致的表示。

### 同步采集三个模态

在 VR 中记录 EEG、第一人称视频与运动数据，为同一时间片建立对齐的样本。

### 构建 BCGR

从 EEG 构建 E-BCGR；用标准化分解得到 S-BCGR；从视频和运动构建 MV-BCGR。

### 用连接约束做对比融合

Connectivity-Constrained Contrastive Fusion（CCCF）将表示对齐到共同潜在空间，并以 S-BCGR 约束连接结构，完成晕动症识别。

## 实验与证据

准确率 · 84.17% · 作者稿中的三模态完整模型。
敏感度 / 特异度 · 85.09% / 84.18% · 分别衡量对阳性和阴性样本的识别。
AUC · 92.22% · 在论文数据与评测协议下的结果。

书目信息来自 Crossref；方法与指标来自本地作者稿图 1、表 1–3 和结论。

## 适用边界

数据使用是否出现晕动症的二分类标签，不能直接预测症状严重程度。实验识别性能不等于临床诊断能力，也不代表对所有用户、设备和 VR 内容都有同样表现。

## 我的贡献

参与搭建同步 EEG、视频与运动数据的 VR 晕动症多模态数据集。

## BibTeX

```bibtex
@article{cybersicknessbcgr2025,
  title = {{Multimodal Contrastive Learning for Cybersickness Recognition Using Brain Connectivity Graph Representation}},
  author = {Peike Wang and Ming Li and Ziteng Wang and Yong-Jin Liu and Lili Wang},
  journal = {IEEE Transactions on Visualization and Computer Graphics},
  year = {2025},
  volume = {31},
  number = {11},
  pages = {10080--10089},
  doi = {10.1109/tvcg.2025.3616797},
  url = {https://doi.org/10.1109/tvcg.2025.3616797}
}
```
