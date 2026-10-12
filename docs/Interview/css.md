# CSS Position — Your final notes

1. Static → Normal flow. Offsets (top, left, right, bottom) do not work.

2. Relative → Moves from its original position. Offsets x(top, left, right, bottom) work, and its original space remains reserved.

3. Absolute → Removed from normal flow and positioned relative to its nearest qualifying ancestor. If none exists, it uses the initial containing block. Offsets (top, left, right, bottom) work.

4. Fixed → Usually positioned relative to the viewport and stays in place when scrolling. Offsets (top, left, right, bottom) work.

5. Sticky → Scrolls normally, then sticks when it reaches a specified position. At least one inset value, such as top: 0, is needed on the relevant axis.

# Flex & Grid

- Flex: 1D , either row or column, navigation bars and aligning items

- Grid: 2D row and col , card and page layout

# Box Model

Memory trick: Content → Padding(inside) → Border → Margin(out).

# SCSS

```
// Reusable CSS styles and variables
@mixin btnMix($colour) {
  background-color: $colour;
}

// function return a value

@function calculate($value) {
  @return $value * 2;
}

// reusabel css styles
%placeholder {
  color: white;
}

.btn {
  &:hover {
    @include btnMix(aqua);
  }
  &:active {
    @include btnMix(rebeccapurple);
  }
  &-primary {
    @include btnMix(red);
    font-size: calculate(14px);
    @extend %placeholder;
  }
  &-secondary {
    @include btnMix(blue);
    font-size: calculate(18px);
    @extend %placeholder;
  }
}

```
