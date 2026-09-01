1. Tell me about a difficult production issue.

**One difficult production issue I worked on was related to an AG Grid becoming blank intermittently.**

We had a grid where, based on the selected record, we first retrieved an ID and then triggered around **7–8 API calls** to fetch additional data required by the grid.

The issue was that these API calls were being triggered in parallel using **RxJS `mergeMap`**. Under production load, the backend was sometimes unable to handle all those requests together, and some APIs were returning **Gateway Timeout errors**. Since the stream didn't have proper error handling at that point, the error terminated the observable flow and the grid ended up appearing blank to the user.

We already had a global Angular `ErrorHandler` that captured the error details, API URL, and non-sensitive user information and sent them to our telemetry system. I used that telemetry to identify the affected API calls and then tried to reproduce the issue by pointing my local application to the **STG environment**.

After reproducing it, I found that the parallel API calls were contributing to the backend load.

I discussed the findings with the backend team, and we decided that these particular calls didn't need to be executed in parallel. We changed the implementation to use **`concatMap`**, so the APIs were called sequentially.

We also changed the UI behavior so that the grid **progressively populated with the data returned from each API**, rather than waiting for all 7–8 calls to complete before displaying anything.

This reduced the load on the backend and, more importantly, prevented the user from seeing a completely blank grid while the remaining data was being loaded.

So the key things I did were: **used telemetry to identify the production failure, reproduced it in STG, identified the RxJS concurrency issue, collaborated with the backend team, and changed the implementation to sequential processing with progressive UI updates.**

2. How do you mentor developers?

I usually mentor developers through code reviews, technical discussions and pairing on complex problems. I try not to simply give them the solution. First I understand how they approached the problem, then I explain the trade-offs and guide them toward a better solution.

For example, if a developer is using an RxJS operator incorrectly, instead of just changing mergeMap to switchMap, I explain why each operator behaves differently and which one fits the use case.

I also encourage developers to take ownership of their changes, write tests and explain their design decisions during reviews. My goal is not just to solve the current problem but to help them make better technical decisions independently."

3. How do you handle code reviews?
   correctness, maintainability, performance and consistency with our architecture.

If I suggest a change, I explain the reason rather than simply saying that something is wrong.

4. Tell me about a time you improved code quality

In one of my assignments, I was responsible for improving the quality of an Angular core library. We had gaps in unit test coverage and SonarQube was reporting issues around code complexity and maintainability.

Instead of only increasing coverage numbers, I first identified the areas with the highest complexity and business impact. I added meaningful unit tests around those scenarios, refactored some complex logic into smaller functions, and improved the overall maintainability of the code.

I also worked with the team to make sure the improvements were sustainable rather than treating SonarQube as just a metric.

This helped improve our code quality and gave the team better confidence when making changes to the library.

5.

There was a problem → I investigated it → I collaborated → I made a decision → I implemented it → here's what improved.
