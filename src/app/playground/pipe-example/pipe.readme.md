A pipe transforms data in the Angular template without changing the original data.

Pure pipes are executed only when Angular detects a change in the pipe's input value or reference. They are the default and are preferred for performance.

Impure pipes run during every change-detection cycle, so they should be used carefully because they can negatively affect performance.

pipe vs method
For reusable presentation transformations, a pure pipe is generally preferable to repeatedly calling a template method.

Pipes transform values for presentation, while directives modify the behavior or appearance of DOM elements/components.
