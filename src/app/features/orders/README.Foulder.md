# Orders Feature — Folder Structure

## `orders/`

```
orders/
├── pages/
│   ├── order-list/
│   ├── order-details/
│   └── create-order/
│
├── components/
│   ├── order-table/
│   └── order-filter/
│
├── services/
│   └── order.service.ts
│
├── models/
│   └── order.model.ts
│
├── state/
│   ├── order.actions.ts
│   ├── order.reducer.ts
│   └── order.selectors.ts
│
└── routes.ts
```

## `shared/`

```
shared/
├── components/
├── directives/
│   └── tooltip.directive.ts
├── pipes/
│   └── date-format.pipe.ts
└── ...
```

## `create-order/` (detail)

Expanded view of `orders/pages/create-order/`:

```
create-order/
├── create-order.component.ts
├── create-order.component.html
├── create-order.component.scss
│
├── components/
│   ├── customer-section/
│   │   ├── customer-section.component.ts
│   │   ├── customer-section.component.html
│   │   └── customer-section.component.scss
│   │
│   ├── order-items/
│   │   ├── order-items.component.ts
│   │   ├── order-items.component.html
│   │   └── order-items.component.scss
│   │
│   └── shipping-address/
│       ├── shipping-address.component.ts
│       └── shipping-address.component.html
│
└── create-order.component.spec.ts
```
