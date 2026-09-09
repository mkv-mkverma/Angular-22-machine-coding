# Angular View Encapsulation

View Encapsulation defines how Angular scopes a component's styles — whether they stay local to that component or leak out (and whether outside styles can leak in). Angular supports three modes: `Emulated`, `None`, and `ShadowDom`.

```ts
@Component({
  encapsulation: ViewEncapsulation.Emulated, // default
})
```

## 1. `Emulated` — default

Angular emulates style scoping without using the real Shadow DOM. It rewrites the component's HTML and CSS, adding a unique generated attribute (e.g. `_ngcontent-ng-c123`) to every element the component renders and to every selector in its stylesheet.

```ts
@Component({
  encapsulation: ViewEncapsulation.Emulated,
})
```

```html
<div _ngcontent-ng-c123>...</div>
```

```css
div[_ngcontent-ng-c123] {
  color: red;
}
```

So the component's styles are **scoped to that component** — they won't bleed into other components, and other components' styles won't bleed in.

## 2. `None`

Angular does **not** encapsulate the styles at all.

```ts
@Component({
  encapsulation: ViewEncapsulation.None,
})
```

The CSS becomes **global CSS** and can affect other components. Useful for intentionally global styles (e.g. a theme or reset defined in one component), but risky otherwise since it has no isolation.

## 3. `ShadowDom`

Angular uses the browser's **native Shadow DOM**.

```ts
@Component({
  encapsulation: ViewEncapsulation.ShadowDom,
})
```

The component gets a real Shadow Root:

```
Component
  └── Shadow Root
        ├── HTML
        └── CSS
```

Styles inside the Shadow DOM are **isolated from the outside** by the browser itself, not by Angular's attribute-rewriting trick. This also means global styles (e.g. from `styles.css`) won't reach inside the component unless explicitly pierced (e.g. via CSS custom properties).

## Summary

| Mode | Isolation mechanism | Styles leak out? | Global styles leak in? |
|---|---|---|---|
| `Emulated` (default) | Generated attributes on elements + CSS selectors | No | Yes |
| `None` | None | Yes | Yes |
| `ShadowDom` | Native browser Shadow DOM | No | No |
