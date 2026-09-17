# FanPad：用于 VR 文本输入的扇形触控板键盘

Jian Wu, Ziteng Wang, Lili Wang, Yuhan Duan, Jiaheng Li

2024 IEEE Conference Virtual Reality and 3D User Interfaces (VR), 2024-03-16. DOI: https://doi.org/10.1109/vr58804.2024.00045

Ziteng Wang: 共同第一作者（署名第二）

## 摘要（中文翻译）

文本输入是虚拟现实中的一项重要挑战。本文提出 FanPad，通过将包含 26 个字母键的 QWERTY 键盘映射并弯曲到两个控制器触控板上，实现头戴式显示设备中的双手文本输入。FanPad 的弯曲布局源于拇指在触控板上的自然运动，其轨迹近似以拇指长度为固定半径的圆弧。为适应不同手型和拇指运动，我们设计了曲线定制流程；同时提供左右手重叠区域更大的 FanPad-Ov，以适应不同输入习惯。第一项用户研究比较了四种候选布局，考察弯曲和重叠区域的作用。结果显示，FanPad 和 FanPad-Ov 优于不弯曲的 SKPad 及 SKPad-Ov。第二项研究评估了定制 FanPad 的持续使用表现与进步。经过六天、60 个短语的训练后，新手输入速度达到每分钟 19.73 个词，相比初始表现提高 58.47%；最高输入速度达到每分钟 24.19 个词。

## 方法讲解

让 VR 手柄上的键盘顺着拇指运动：把 QWERTY 拆分到双手触控板，再把按键行弯成适合拇指的扇形。

戴着头显输入文字时，反复抬手指向键盘容易疲劳。FanPad 保留熟悉的 QWERTY 关系，把操作范围缩到两个手柄触控板，让拇指完成输入。

### 把 QWERTY 分到双手

将 26 个字母映射到左右触控板，保留熟悉的按键相对关系。

### 顺着拇指轨迹弯曲

按拇指的自然运动弧线调整键盘行，并通过校准适应手型与持握方式。

### 选择重叠区与输入方式

FanPad-Ov 提供更大的左右手重叠区域，允许不同输入习惯；触摸与释放选择字母，扳机确认候选词。

## 实验与证据

布局研究 · 比较 FanPad / FanPad-Ov 与未弯曲的 SKPad / SKPad-Ov · 区分弯曲布局与重叠区的作用。
学习研究 · 六天训练后报告 19.73 WPM · 论文报告较初始表现提高 58.47%；不是与所有 VR 键盘的通用对比。
最高输入速度 · 24.19 WPM · 研究中的最高值，不是所有参与者的平均值。

作者顺序、共同贡献脚注、方法与数值来自 IEEE VR 2024 出版全文，pp. 222–232。

## 适用边界

结论对应论文中的双手触控板、布局与短期训练。硬件触控范围、个人手型和练习经验会影响表现，不能直接推到无触控板控制器或长期文本编辑场景。

## 我的贡献

共同第一作者（署名第二）。论文首页明确注明 Ziteng Wang contributed equally to this paper。负责方法设计优化、部分系统实现和论文撰写、用户实验与演示系统制作。

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
