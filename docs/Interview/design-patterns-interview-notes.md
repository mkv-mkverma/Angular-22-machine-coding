# Design Patterns

## Dependency Injection

Dependency Injection means a class receives its dependencies from outside rather than creating them itself.

## Singleton

Only one shared instance.

## Observer

One object publishes changes, and multiple subscribers react to those changes.

## Factory

Centralize object creation. Instead of spreading object creation everywhere, the Factory encapsulates object creation and returns the appropriate implementation based on some input.

```ts
class ComponentFactory {
  create(type: string) {
    if (type === 'chart') {
      return new ChartComponent();
    }

    if (type === 'table') {
      return new TableComponent();
    }
  }
}
```

Instead of:

```ts
new ChartComponent();
new TableComponent();
```

## Decorator

`@Component`, `@Service`, `@Directive`, `@Pipe`

The decorator adds metadata/behavior to a class.

## Facade

Hide complicated logic behind a simple interface.

## Which pattern do I need?

| "I need to..."                    | Pattern              |
| ---------------------------------- | --------------------- |
| React to changes                   | Observer               |
| Choose different behavior          | Strategy               |
| Create different objects           | Factory                |
| Hide complex logic                 | Facade                 |
| Convert one interface → another    | Adapter                |
| Share one instance                 | Singleton              |
| Provide dependencies               | Dependency Injection   |
| Add metadata/behavior              | Decorator              |
