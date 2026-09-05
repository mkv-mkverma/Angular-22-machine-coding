# S — Single Responsibility Principle

A class/component should have one reason to change.

# O — Open/Closed Principle

I should be able to add new behavior without repeatedly modifying stable existing code.

# L — Liskov Substitution Principle

Can I replace one implementation with another without breaking the code?

interface Payment {

pay(amount: number): void;

}

class CardPayment implements Payment {

pay(amount: number) {

    // card payment

}

}

class UpiPayment implements Payment {

pay(amount: number) {

    // UPI payment

}

}

# I — Interface Segregation Principle

We should not force others to use if it's not required. Take Interface example

# D — Dependency Inversion Principle

Don't depend directly on how something is implemented; depend on what you need.

❌ Component → REST implementation

✅ Component → Service/contract → REST implementation

You write:

constructor(private productService: ProductService) {}

You don't do:

this.productService = new ProductService();

Angular creates/provides the dependency.
