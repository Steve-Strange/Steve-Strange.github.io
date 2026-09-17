# Collaborative Disassembly for Multiple Users in Virtual Reality

Ziteng Wang, Jian Wu, Sichun Huang, Peike Wang, Peng Zhang, Min Zhang, Lili Wang

IEEE Transactions on Visualization and Computer Graphics, 2026. DOI: https://doi.org/10.1109/tvcg.2026.3732564

Ziteng Wang: First author

## Abstract

Disassembly Sequence Planning (DSP) is critical in product lifecycle management but computationally demanding, with traditional and machine learning approaches facing challenges in scalability and lacking the real-time responsiveness required for interactive collaboration in virtual reality (VR). We present Dynamic Parallel Disassembly and Tasking (DPDT), a novel framework tailored for immersive collaboration. DPDT integrates a spatial-temporal feature-based heuristic to accelerate search prioritization and employs a dynamic reactivation strategy to resolve inter-part dependencies during parallel execution. Furthermore, a proximity-aware task assignment algorithm optimizes the translation of these plans into efficient multi-user instructions. We conduct extensive evaluations on a large-scale dataset against multiple baselines, showing that DPDT significantly outperforms state-of-the-art baselines. Specifically, for complex assemblies, our method achieves a computational speedup of up to 4.7 times while improving planning reliability by approximately 9.3 percentage points. These algorithmic gains translate directly into operational efficiency: a 24-participant user study in VR confirms that DPDT significantly reduces task completion time, physical-effort proxies, and NASA-TLX workload, validating its potential for effective collaborative maintenance training.

## Method

Dynamic Parallel Disassembly and Tasking connects simulation-validated planning, parallel task sets, and proximity-aware allocation for collaborative VR.

Adding users does not automatically make disassembly faster. Parts have dependencies, while people may wait for tasks, take detours, or compete for the same target. DPDT considers both which parts can be removed next and who should remove them.

### Rank candidate parts

Spatiotemporal features, including geometric visibility, distance from the center, and previous attempts, prioritize promising candidates. Physical simulation still checks their feasibility.

### Maintain parallel task sets

Validate removal actions against the current assembly state. When a removal changes blocking relationships, dynamically reactivate previously infeasible candidates for the next planning round.

### Assign tasks to nearby users

Allocate validated candidates using the distance between users and targets, then show target and movement guidance in VR. Planning parallelism can exceed the number of active users to offer more assignment choices.

## Evidence

Algorithm evaluation · 3,671 assemblies, including a reported subset of 382 complex assemblies · Subject to the paper's geometry, simulation and time limits.
Planning time on the complex subset · DPDT Pₙ=5: 8.66 s; serial ATA: 41.37 s · About 4.7× for this comparison. ATA at Pₙ=5 takes 18.40 s; the 4.7× claim does not apply to every setting.
Success rate on the complex subset · 9.28 percentage points above ATA in the serial setting · An absolute percentage-point difference, not relative growth.
VR user study · 24 participants; teams of 1, 2 or 3; four methods · The revision reports improvements in task time, head movement and NASA-TLX. Some head-rotation comparisons are not significant after correction.

Publication metadata: IEEE's Crossref record. Methods and measurements: the authors' R2 clean revision, Sections 4–7; page-by-page equivalence to the publisher version has not been checked.

## Limitations

This simulation-validated framework targets VR training and primarily handles translational removal of rigid parts. It does not establish tool accessibility, screw removal, flexible-part handling or full 6-DOF operation in real maintenance. Movement measures are proxies for physical effort, and task time includes waiting during collaboration.

## My contribution

Led the method, system implementation, comparison methods, user studies, demonstrations and paper writing.

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
