# FanPad: A Fan Layout Touchpad Keyboard for Text Entry in VR

Jian Wu, Ziteng Wang, Lili Wang, Yuhan Duan, Jiaheng Li

2024 IEEE Conference Virtual Reality and 3D User Interfaces (VR), 2024-03-16. DOI: https://doi.org/10.1109/vr58804.2024.00045

Ziteng Wang: Co-first author (second in the author list)

## Abstract

Text entry poses a significant challenge in the realm of virtual reality (VR). This paper introduces FanPad, a novel solution designed to facilitate dual-hand text input within head-mounted displays (HMDs). FanPad accomplishes this by ingeniously mapping and curving the 26 typing keys (T26) QWERTY keyboard onto the touchpads of both controllers. The curved key layout of FanPad is derived from the natural movement of the thumb when interacting with the touchpad, resembling an arc with a thumb-length fixed radius. To optimize the experience, we introduce a customization process for the FanPad curve to better cope with individual hand shapes and thumb movements. We also provide a version with more overlap area named FanPad-Ov for different users with different typing habits. Our first user study examined the effects of curving and different overlap areas by comparing four potential layouts. The results clearly favor the FanPad and FanPad-Ov layout compared to the nocurving version, SKPad(-Ov). Subsequently, the second user study was conducted to assess long-term performance and improvement on customized FanPads. Notably, novices achieved a typing speed of 19.73 words per minute (WPM), demonstrating a remarkable increase of 58.47% after a 60-phrase training in six days. The highest typing speed reached an impressive 24.19 WPM.

## Method

A curved, customizable QWERTY layout follows thumb movement on two VR controller touchpads.

Repeatedly raising a hand to point at a keyboard can be tiring in a headset. FanPad retains familiar QWERTY relationships while putting input on two controller touchpads, operated by the thumbs.

### Split QWERTY between two hands

Map the 26 letters to left and right touchpads while retaining familiar relative key positions.

### Curve rows along thumb movement

Adapt key rows to the thumb's natural arc, then calibrate the layout to the user's hand shape and grip.

### Choose overlap and enter text

FanPad-Ov provides a larger overlap region to accommodate different typing habits. Touch and release selects letters; the trigger confirms a candidate word.

## Evidence

Layout study · FanPad / FanPad-Ov compared with uncurved SKPad / SKPad-Ov · Separates the effects of curvature and the overlap region.
Learning study · 19.73 WPM after six days of training · A reported 58.47% improvement over initial performance, not a universal comparison against other VR keyboards.
Highest typing speed · 24.19 WPM · The highest observed value, not the participant mean.

Author order, equal-contribution footnote, methods and measurements: the IEEE VR 2024 published paper, pages 222–232.

## Limitations

Findings concern the paper's dual-touchpad hardware, layouts and short training period. Touchpad area, hand shape and practice affect performance; the results do not directly generalize to controllers without touchpads or long-term text editing.

## My contribution

Co-first author, listed second. The published first page explicitly credits equal contribution to Ziteng Wang. Worked on method design and refinement, parts of the implementation and writing, user studies and the demonstration system.

## BibTeX

```bibtex
@inproceedings{fanpad2024,
  title = {{FanPad: A Fan Layout Touchpad Keyboard for Text Entry in VR}},
  author = {Jian Wu and Ziteng Wang and Lili Wang and Yuhan Duan and Jiaheng Li},
  booktitle = {2024 IEEE Conference Virtual Reality and 3D User Interfaces (VR)},
  year = {2024},
  pages = {222--232},
  doi = {10.1109/vr58804.2024.00045},
  url = {https://doi.org/10.1109/vr58804.2024.00045}
}
```
