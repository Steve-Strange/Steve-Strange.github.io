# Multimodal Contrastive Learning for Cybersickness Recognition Using Brain Connectivity Graph Representation

Peike Wang, Ming Li, Ziteng Wang, Yong-Jin Liu, Lili Wang

IEEE Transactions on Visualization and Computer Graphics, 2025-11. DOI: https://doi.org/10.1109/tvcg.2025.3616797

Ziteng Wang: Third author

## Abstract

Cybersickness significantly impairs user comfort and immersion in virtual reality (VR). Effective identification of cybersickness leveraging physiological, visual, and motion data is a critical prerequisite for its mitigation. However, current methods primarily employ direct feature fusion across modalities, which often leads to limited accuracy due to inadequate modeling of inter-modal relationships. In this paper, we propose a multimodal contrastive learning method for cybersickness recognition. First, we introduce Brain Connectivity Graph Representation (BCGR), an innovative graph-based representation that captures cybersickness-related connectivity patterns across modalities. We further develop three BCGR instances: E-BCGR, constructed based on EEG signals; MV-BCGR, constructed based on video and motion data; and S-BCGR, obtained through our proposed standardized decomposition algorithm. Then, we propose a connectivity-constrained contrastive fusion module, which aligns E-BCGR and MV-BCGR into a shared latent space via graph contrastive learning while utilizing S-BCGR as a connectivity constraint to enhance representation quality. Moreover, we construct a multimodal cybersickness dataset comprising synchronized EEG, video, and motion data collected in VR environments to promote further research in this domain. Experimental results demonstrate that our method outperforms existing state-of-the-art methods across four critical evaluation metrics: accuracy, sensitivity, specificity, and the area under the curve. Source code: https://github.com/PEKEW/cybersickness-bcgr.

## Method

Brain connectivity graph representations align EEG, video, and motion for multimodal cybersickness recognition.

EEG, visual and motion data each contain clues about cybersickness. Concatenating their features may not capture relationships across modalities. This method first forms comparable connectivity graphs, then learns aligned representations.

### Synchronize three modalities

Record EEG, first-person video and motion in VR, aligning samples from the same time interval.

### Construct BCGR instances

Build E-BCGR from EEG, obtain S-BCGR through standardized decomposition, and construct MV-BCGR from video and motion.

### Fuse with connectivity constraints

Connectivity-Constrained Contrastive Fusion (CCCF) aligns representations in a shared latent space. S-BCGR constrains connectivity to support cybersickness recognition.

## Evidence

Accuracy · 84.17% · The full three-modality model in the authors' manuscript.
Sensitivity / specificity · 85.09% / 84.18% · Recognition of positive and negative samples, respectively.
AUC · 92.22% · Under the paper's dataset and evaluation protocol.

Bibliographic metadata: Crossref. Methods and metrics: Figure 1, Tables 1–3 and the conclusion of the local author manuscript.

## Limitations

The dataset labels the presence or absence of cybersickness, not symptom severity. Recognition performance in these experiments does not establish clinical diagnostic capability or equal performance across all users, devices and VR content.

## My contribution

Helped build the VR cybersickness dataset with synchronized EEG, video and motion recordings.

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
