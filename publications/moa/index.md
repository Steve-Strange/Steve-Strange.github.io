# MOA: Efficient Scene-Aware Multi-Object Arrangement in VR

Xuehuai Shi, Yuhan Duan, Ziteng Wang, Jian Wu, Zhiwen Shao, Jieming Yin, Lili Wang

IEEE Transactions on Visualization and Computer Graphics, 2026-02. DOI: https://doi.org/10.1109/tvcg.2025.3636062

Ziteng Wang: Corresponding author (third in the author list)

## Abstract

3D multi-object arrangement is a fundamental task in VR that relies on accurate and natural initial selection alongside rapid and convenient subsequent manipulation to ensure high efficiency. However, existing methods fail to support efficient multi-object arrangement in highly occluded scenes with densely packed candidate objects through controller-free natural interactions. In this article, we propose an efficient, scene-aware multi-object arrangement method (MOA) designed for fast, precise, and convenient object arrangement. First, MOA introduces an importance-driven multi-object initial selection algorithm that assigns higher spatiotemporally correlated object importance (IMP) to target objects, establishing a natural multi-object initial selection mode that enables quick and accurate selection of high-IMP objects. Subsequently, it presents an auxiliary-structure-guided multi-object manipulation algorithm that constructs an auxiliary manipulation structure to assist subsequent multi-object manipulation, alongside a multi-modal interaction mode that facilitates swift and natural manipulation. Compared to state-of-the-art controller-free and controller-based methods, MOA significantly improves task performance, reduces task load, and enhances convenience in complex multi-object arrangement scenes involving hundreds of highly occluded objects need to be arranged.

## Method

Scene-aware selection and auxiliary manipulation structures support controller-free arrangement of many occluded objects in VR.

When arranging furniture or densely packed objects, selecting the right objects matters as much as moving them. Improving one grab alone does not address repeated selection, occlusion and group arrangement.

### Use scene context to estimate importance

Spatiotemporally correlated object importance (IMP) separates targets from distractors and supports natural initial selection of multiple objects.

### Build an auxiliary manipulation structure

Give selected objects an actionable spatial reference, reducing the need to manipulate each object individually.

### Combine input modalities

Eye and bare-hand input connect initial selection and subsequent manipulation into a continuous arrangement workflow.

## Evidence

Task setting · Complex arrangement scenes with hundreds of highly occluded objects · Focuses on arranging groups, rather than isolated single-object selection.
Comparisons · Controller-free and controller-based methods · The published abstract reports better task performance, lower workload and improved convenience. Quantitative tables are not available in the reviewed materials.

Issue metadata: IEEE TVCG 32(2), 2183–2199, 2026. Abstract: Semantic Scholar's record for this DOI; bibliographic details cross-checked with PubMed, PMID 41284398.

## Limitations

This explanation uses the published abstract and author-provided material. Performance depends on scene organization, tracking quality and task design. Without the complete final evaluation tables, it cannot support a fixed numerical efficiency claim.

## My contribution

Worked on the method, design and implementation, comparison methods, user studies and demonstration system. The corresponding-author role follows the author's CV record.

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
