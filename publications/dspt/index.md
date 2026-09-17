# DSPT: Disassembly Sequence Planning Transformer for Interaction Guidance in VR

Sichun Huang, Ziteng Wang, Sio Kei Im, Lili Wang

International Journal of Human–Computer Interaction, 2026-01-15. DOI: https://doi.org/10.1080/10447318.2025.2607559

Ziteng Wang: Second author

## Abstract

The application of virtual reality technology in complex equipment disassembly training is widely used, and planning the disassembly sequence and interactively guiding the disassembly is an issue that requires in-depth research. Traditional methods based on physical collision detection are very accurate, but the computational efficiency is too low to meet the requirement of interactivity. In recent years, deep learning-based disassembly sequence prediction methods have emerged, which are fast in reasoning but suffer from inaccurate prediction of parts to be disassembled. In this paper, we propose a novel Transformer-based network, the Disassembly Sequence Planning Transformer (DSPT), to optimize the disassembly sequence for guiding users to disassemble objects in VR environments. First, we define Disassembly Sequence Features and Part History Features, along with their construction methods. Then, we introduce the parts-to-be-disassembled probability predictor based on a temporal-spatial score and propose a new loss function leveraging the temporal-spatial score to enhance the predictor’s performance. Experimental results show that our method achieves higher sequence accuracy and stepwise accuracy, both outperforming the state-of-the-art method. The results of the user study demonstrate that our method significantly reduces the disassembly task completion time and improves the usability compared to comparison methods.

## Method

A Transformer uses disassembly-sequence and part-history features to predict removal candidates for interactive VR guidance.

Physical search is often accurate but slow, while learned predictions may suggest invalid candidates. DSPT uses sequence context and part history to improve candidate prediction for interactive disassembly guidance.

### Represent the disassembly process

Construct Disassembly Sequence Features and Part History Features so the model can use sequence context and previous part states.

### Predict the next candidate

A Transformer estimates the probability of each part being removed next. A temporal-spatial score and a corresponding loss improve the predictor.

### Guide interaction in VR

Turn candidate sequences into removal guidance. Evaluate sequence accuracy, stepwise accuracy and user task performance.

## Evidence

Sequence accuracy · DSPT: 60.29%; ASAP: 50.49% · Table 2: a 9.80-percentage-point difference on the test set.
Stepwise accuracy · DSPT: 87.68%; ASAP: 82.30% · Table 2. This is not a physical execution success rate for arbitrary assemblies.
VR user study · 16 participants with no prior VR experience · Participants compared DSPT and ASAP guidance in the study's common task setting.
Task completion time · DSPT: 1038.50 ± 55.67 s; ASAP: 1246.46 ± 62.42 s · Table 4: a 16.68% reduction in mean time for the studied tasks.

Title, authors and issue metadata: Crossref. Methods, Figure 1, Tables 2 and 4, the 16-person study and limitations were checked against recoverable pages of the local publisher PDF.

## Limitations

Evaluation mainly covers objects with relatively few parts. Generalization to complex or irregular assemblies needs further study. Visibility-feature extraction adds computational cost, and disassembly path planning is outside the scope. Sequence predictions do not replace trajectory, tool-constraint or robot-execution validation.

## My contribution

Ziteng Wang is the second author in the published author list.

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
