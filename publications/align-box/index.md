# Align-Box: Enable Fast Bare-Hand Multi-Object Alignment in VR

Jian Wu, Ziteng Wang, Runze Fan, Qixiang Ma, Lizhi Zhao, Xuehuai Shi, Lili Wang

International Journal of Human–Computer Interaction, 2026-02-06. DOI: https://doi.org/10.1080/10447318.2026.2621281

Ziteng Wang: First student author (second in the author list)

## Abstract

In virtual reality (VR) environments, aligning multiple objects can significantly enhance the efficiency of multi-object manipulation. This is especially true for tasks involving the layout of multiple objects in indoor spaces, where the objects often have geometric constraints. Multi-object alignment methods can enhance interaction efficiency for such applications, and immersive visualization effects can improve users’ perception of the scene, thereby optimizing layout design. In this paper, we propose an interactive multi-object alignment metaphor, the Align-Box. It consists of two hexahedral boxes, utilizing the mapping between the object enclosing box and the proxy box, along with a user-friendly and straightforward hand gesture system. This allows for efficient group-based and object-based multi-object alignment. We evaluated the method’s performance through an empirical user study, and the results indicate that Align-Box significantly improves multi-object alignment efficiency, usability, and task load.

## Method

A two-box interaction metaphor maps an object enclosing box to a proxy box for bare-hand group-based and object-based alignment in VR.

Aligning a row of objects is more than moving the whole group. Objects may need to align with one another or with an external reference such as a wall. Align-Box expresses both relationships through a shared proxy structure.

### Represent the object group with a box

An enclosing hexahedral box turns a complex object set into edges, faces and spatial extents that are easier to manipulate.

### Map input through a proxy box

Users manipulate a second hexahedral box. The system maps that input to alignment relationships among the target objects.

### Choose the alignment reference

The same bare-hand interaction supports group-based alignment and object-based alignment, addressing internal relationships and alignment to external objects.

## Evidence

Participants and device · 36 participants; Oculus Quest 2 hand tracking · Section 4 of the authors' September 26, 2025 manuscript.
Group-based alignment (P1) · 12.94 s; AlignPin with ray selection: 28.42 s; WIM: 57.06 s · Manuscript Table 3: reductions of 54.4% and 77.3%, respectively.
Object-based alignment (P2) · 67.78 s; WIM: 166.47 s · Manuscript Table 4: a 59.3% reduction. AlignPin with ray selection did not support these tasks and was not compared here.
Workload and usability · Improvements in several dimensions, but not every comparison is significant · Physical and Temporal workload subscales did not differ significantly from AlignPin.

Publication metadata: Crossref. Methods, abstract and measurements: Section 4 and Tables 3–4 of the authors' September 26, 2025 manuscript. Published online February 6, 2026; numerical results have not been checked individually against the publisher full text.

## Limitations

Targets and reference relationships must be clear, and results depend on hand-tracking quality and occlusion. Spatial alignment does not establish physical stability, collision avoidance or real assembly tolerances.

## My contribution

Implemented the method and some comparison methods, conducted user studies, and contributed to paper writing.

## BibTeX

```bibtex
@article{alignbox2026,
  title = {{Align-Box: Enable Fast Bare-Hand Multi-Object Alignment in VR}},
  author = {Jian Wu and Ziteng Wang and Runze Fan and Qixiang Ma and Lizhi Zhao and Xuehuai Shi and Lili Wang},
  journal = {International Journal of Human–Computer Interaction},
  year = {2026},
  pages = {1--23},
  doi = {10.1080/10447318.2026.2621281},
  url = {https://doi.org/10.1080/10447318.2026.2621281}
}
```
