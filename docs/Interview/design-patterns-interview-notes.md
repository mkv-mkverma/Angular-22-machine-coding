# Angular Design Patterns — Cheat Note

### Smart & Dumb Components
- **Smart:** Handles business logic, API/state, data.
- **Dumb:** Mainly handles UI/presentation.
- Smart → passes data → Dumb
- Dumb → emits events → Smart

**Remember:**  
> Smart = Logic | Dumb = UI

---

### Singleton
- **Single shared instance** of a service.
- Angular services with `providedIn: 'root'` are commonly singleton services.

**Remember:**  
> Singleton = One instance shared across the application.

---

### Dependency Injection (DI)
- Inject dependencies instead of creating them yourself.

```ts
constructor(private userService: UserService) {}
```

Instead of:

```ts
const service = new UserService();
```

**Remember:**  
> DI = Receive dependency, don't create it yourself.

---

### Observer Pattern
- One object **publishes/emits** changes.
- Subscribers **listen/react** to those changes.
- Angular uses this heavily through **RxJS Observables**.

```text
Observable → emit → Subscribers
```

**Remember:**  
> Observer = Subscribe and react to changes.

---

### NgRx — State Management
- Centralized management of application state.
- Useful when state is **shared and complex**.

```text
Component
   ↓
 Action
   ↓
 Store
   ↓
 Reducer
   ↓
 State
   ↓
 Selector
   ↓
 Component
```

**Remember:**  
> NgRx = Centralized application state.

---

### Strategy Pattern
- Define different strategies/behaviors and choose one at runtime.

Example:

```text
Payment
 ├── UPI Strategy
 ├── Card Strategy
 └── PayPal Strategy
```

**Remember:**  
> Strategy = Choose different behavior.

---

### Facade Pattern
- **Hide complex logic** behind a simple interface.
- Often used to hide complex service/NgRx logic from components.

```text
Component
    ↓
 Facade
    ↓
Service / NgRx / API
```

**Remember:**  
> Facade = Hide complexity.

---

### Adapter Pattern
- **Convert one interface into another** expected by the application.

Backend response:

```ts
{
  first_name: "John",
  last_name: "Doe"
}
```

Application expects:

```ts
{
  firstName: "John",
  lastName: "Doe"
}
```

**Remember:**  
> Adapter = Convert one interface → another.

---

## ⚡ One-Line Revision

| Need | Pattern |
|---|---|
| Separate UI & business logic | **Smart/Dumb** |
| One shared instance | **Singleton** |
| Inject dependency | **Dependency Injection** |
| React to changes | **Observer** |
| Manage shared application state | **NgRx** |
| Choose different behavior | **Strategy** |
| Hide complex logic | **Facade** |
| Convert one interface → another | **Adapter** |
| Create different objects | **Factory** |
| Add metadata/behavior | **Decorator** |

## 🧠 Easy Memory Trick

**DI → Singleton → Observer → State → Strategy → Facade → Adapter**

> **"Inject, Share, Observe, Manage, Choose, Hide, Convert."**