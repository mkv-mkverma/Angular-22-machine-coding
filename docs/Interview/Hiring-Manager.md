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

6. Project is delayed what will you do

If I realize that the project is getting delayed, my first step would be to understand the root cause rather than immediately asking the team to work extra hours.

I would look at the remaining scope, dependencies, current progress, resource availability, and identify exactly what is causing the delay.

Then I would work with the team to prioritize the critical deliverables and separate **must-have items from nice-to-have items**. If there are dependencies on another team, I would proactively coordinate with them and escalate if required.

Once I understand the situation, I would communicate the impact to the manager and stakeholders early, along with a recovery plan. For example, I might propose reducing scope, changing priorities, adding resources, or adjusting the timeline depending on the situation.

I would then track the recovery plan closely and provide regular updates until we're back on track.

My approach would be: **identify the problem → assess the impact → prioritize → create a recovery plan → communicate early → execute and monitor.**

Most importantly, I would avoid hiding the delay until the deadline. I believe early communication gives the team and stakeholders more options to recover.

7. Can you own entire platform and products

Yes, absolutely. I am comfortable taking end-to-end ownership of a platform or product.

For me, ownership means understanding the business requirements, working with product and business teams, defining the technical approach, breaking the work into deliverables, coordinating with different teams, and making sure the feature is delivered with the expected quality.

I would also take responsibility for areas like architecture, code quality, performance, security considerations, testing, production issues, and technical debt.

I don't mean that I would do everything myself. I would involve the right engineers and teams, delegate effectively, and make sure everyone has clear ownership while I remain accountable for the overall outcome.

If there are risks or delays, I would identify them early, communicate them to stakeholders, and drive the team toward a solution.

So yes, I can own the platform end-to-end, while building a team structure where ownership is distributed but accountability remains clear.

8. Client changed the requirement during the sprint

If a client changes the requirement during the sprint, I would first understand why the requirement changed and how critical it is.

I would assess the impact on the current sprint — including development effort, testing, dependencies, and the existing commitments.

If the change is business-critical, I would discuss the trade-off with the Product Owner and stakeholders. For example, we could remove or move a lower-priority item from the current sprint and bring the new requirement in.

If the change is not urgent, I would recommend putting it into the backlog and prioritizing it for the next sprint rather than continuously disrupting the team's committed work.

I would also make sure the new requirement is clearly documented and that the team understands the updated acceptance criteria.

My goal would be to **accommodate genuine business changes while protecting the team's focus and sprint commitment**.

I would never simply tell the client "no," but I would make the impact and trade-offs transparent before committing to the change.

9. junior developer writes poor code quality

If I notice that a junior developer is consistently writing poor-quality code, I would first understand whether the problem is due to lack of knowledge, unclear requirements, or lack of familiarity with our coding standards.

I would use code reviews as a learning opportunity. Instead of simply saying "this code is wrong," I would explain why the approach can cause problems and show them a better approach.

I would also make sure the team has clear coding standards, examples, linting, unit tests, and a well-defined review process so that quality doesn't depend only on individual knowledge.

If the same issues continue, I would pair with the developer on a few tasks and provide more hands-on guidance. I would gradually give them more responsibility as their code quality improves.

At the same time, I would not compromise production quality. Critical issues would need to be fixed before merging, regardless of whether the developer is junior or senior.

My goal would be to **maintain the quality bar while helping the junior developer become independent rather than creating a dependency on senior developers.**

10. How do you reduce technical debt?

Technical debt is the future cost created when we choose a quick or temporary technical solution instead of a better long-term solution.

Need feature urgently

       ↓

Developer writes quick/duplicated code

       ↓

Feature delivered ✅

       ↓

Later changes become difficult

       ↓

More bugs + more maintenance effort

       ↓

Technical Debt

Duplicate code

Poor architecture

Outdated dependencies

Missing unit tests

Hardcoded values

Complex/unmaintainable code

Temporary workarounds that were never cleaned up

Suppose we have a large Angular application where the same API logic is duplicated across several components. Initially it may have been done to deliver features quickly. But later, changing the API requires changes in multiple places and increases the chance of bugs. I would identify this as technical debt, add appropriate tests, move the common logic into a service or appropriate abstraction, and gradually migrate the components.

11. producets want a shortcut which increase technival debt

If the product team asks for a shortcut that will increase technical debt, I would first understand the business urgency.

If the shortcut is necessary to meet an important deadline, I would support it, but I would clearly explain the technical impact and document the debt.

I would then create a technical-debt task in the backlog and plan the proper solution for a future sprint.

If the shortcut creates a serious risk, such as security, performance, or stability issues, I would explain the risk and recommend a safer alternative.

My approach is **business priority + technical responsibility**.

12. two senior developer disagree agrchitaterure

If two senior developers disagree on architecture, I would first ask both of them to explain their approach and the reasons behind it.

I would compare the options based on factors like scalability, performance, maintainability, complexity, and business requirements.

If we still cannot reach an agreement, I would involve the architect or another technical leader and make the decision based on facts rather than personal opinions.

Once the decision is made, I would document the architecture decision and make sure both developers are aligned.

My goal is not to decide who is right, but to choose the solution that is best for the product.

13. one developer resign before release

If a developer resigns just before a release, I would first understand what work and knowledge is currently dependent on that person.

I would make sure the knowledge is transferred to another developer, review the pending work, and identify any release risks.

I would redistribute the critical tasks among the team and focus on the must-have items for the release.

I would also inform the manager and stakeholders early if the resignation creates any risk to the timeline.

My priority would be **knowledge transfer, risk management, and making sure the release is not dependent on one person.**

14. QA finds more bug before release

If QA finds many bugs just before release, I would first understand the severity and impact of the bugs.

I would separate them into critical, high, and low priority. Critical issues affecting functionality, security, or data would need to be fixed before release.

For lower-priority bugs, I would discuss with Product and QA whether they can be moved to a future release.

I would work with the developers and QA to create a focused plan to fix and retest the critical issues. I would also communicate the release risk clearly to the stakeholders.

After the release, I would identify why so many bugs reached QA and improve the process, such as better unit tests, earlier QA involvement, or better regression testing.

My priority is **release quality first, followed by understanding why the defects happened and preventing them in the future.**

15. team miss the sprint what will you do

If the team misses a sprint, I would first understand why we missed it instead of blaming the team.

I would look at whether the reason was unclear requirements, unexpected technical issues, dependency on another team, underestimation, or too much work committed.

Then I would identify what is still pending, prioritize it, and make a realistic plan for the next sprint.

I would also discuss the issue in the sprint retrospective and identify what we can improve — for example, better estimation, smaller tasks, or identifying dependencies earlier.

If there is an impact on the release or business commitment, I would communicate it to the stakeholders early.

My focus would be **understand the reason, recover the work, and prevent the same problem from happening again.**

16. How do you guide developer technically

I guide developers technically by first understanding their problem and then helping them find the right solution rather than simply giving them the answer.

I provide guidance through code reviews, architecture discussions, pair programming, and technical discussions.

For junior developers, I give more hands-on guidance and explain the reasoning behind the approach. For senior developers, I give them more freedom and discuss trade-offs with them.

I also encourage coding standards, unit testing, documentation, and knowledge-sharing sessions within the team.

My goal is not to solve every problem for the developer, but to help them become more confident and independent.

17. API response suddenly become slow

If an API suddenly becomes slow, I would first understand the impact and check whether the issue is happening for all users or only for specific APIs or requests.

I would compare the current response time with the normal baseline and check monitoring, logs, and recent deployments.

Then I would identify where the delay is happening — frontend, network, API server, database, or a downstream service.

For example, I would check:

- API response time and server logs
- Recent code or configuration changes
- Database query performance
- CPU and memory usage
- Traffic/load increase
- Downstream API dependencies

If it is a production issue, I would prioritize restoring performance. If a recent deployment caused it, I would consider rollback while the team investigates the root cause.

After identifying the root cause, I would implement the permanent fix and add monitoring/alerts so we can detect the problem earlier in the future.

My approach is **identify the bottleneck → mitigate the impact → find the root cause → fix → prevent recurrence.**

18. App crash only in safari

First I reproduce it in Safari and check the stack trace. Then I compare Safari with Chrome to identify the browser-specific API, library, CSS, or JavaScript issue. I fix it, test across supported browsers, and add regression coverage.

If they ask "What if you cannot reproduce it?", say:

I would collect the user's Safari version, OS, steps to reproduce, console errors and crash information, and use monitoring or session logs to identify the pattern.

19. Login Works for some uses but not for others

If login works for some users but not others, I would first identify what is different between the working and failing users.

I would check the browser, environment, user role, account status, authentication method, and whether the issue is happening consistently.

Then I would check the frontend console, network request, API response, authentication logs, and backend logs to identify where the failure is happening.

For example, if the API returns `401`, I would investigate authentication or token-related issues. If it returns `403`, I would check authorization or user permissions. If the API succeeds but the UI fails, I would investigate the frontend.

I would also check whether there was any recent deployment or configuration change.

Once I identify the root cause, I would fix the issue, test with both affected and working user types, and add appropriate test coverage.

My approach is **compare → isolate the difference → identify the failing layer → fix → test.**

20. App is slow after deployment

If the application becomes slow immediately after a deployment, I would first check whether the slowdown started exactly after the release and compare the new version with the previous version.

I would check browser performance, API response times, network requests, bundle size, memory usage, and any recent frontend changes.

If the impact is high and the previous version was working correctly, I would consider rolling back to restore performance while the team investigates.

Then I would identify the root cause, fix it, test the fix, and monitor the application after redeployment.

21. Release fails

If a release fails, I would first identify where the failure happened — build, deployment, infrastructure, configuration, or application startup.

I would check the CI/CD pipeline logs and the exact error message instead of immediately making changes.

If it is a production release and the previous version is stable, I would rollback to the last known good version to minimize the impact.

Then I would fix the root cause, run the required tests, and redeploy.

After the release is successful, I would document the issue and improve the release process so the same failure is caught earlier, for example through better automated checks or deployment validation.

My approach is **identify → stabilize → fix → validate → improve the process.**

22. How would design reusable comp lib

I would first identify the common UI patterns used across the application, such as buttons, inputs, dropdowns, tables, modals, and form controls.

Then I would create a separate Angular component library with reusable, configurable components. I would keep the components generic and expose clear `@Input()` or signal-based inputs and outputs/events instead of putting business logic inside the components.

For example, a reusable button should handle things like label, disabled state, loading state, and variant, while the business logic remains in the consuming application.

I would also define consistent theming, accessibility, documentation, unit tests, and versioning for the library.

Before creating a new component, I would check whether an existing component can be extended or configured instead of creating duplicate components.

I would publish the library through our internal package repository and follow semantic versioning so consuming applications can upgrade safely.

My goal would be **reusable UI + consistent design + good developer experience without coupling the library to business-specific logic.**

23. when would you use MFE over liburary

I would use a **component library** when multiple applications need to share common UI components, utilities, or design patterns, and they can follow the same release and deployment process.

I would choose **Micro Frontends (MFE)** when different teams or business domains need to develop and deploy their parts of the application independently.

For example, if we have an e-commerce platform:

- **Component library:** Common Button, Input, Modal, Table, Header, and design system shared across applications.
- **MFE:** Separate teams independently owning Checkout, Orders, and Product Catalog, with their own development and deployment lifecycle.

So my decision would be:

**Need code reuse → Library**

**Need independent team ownership and deployment → MFE**

I would not introduce MFE just because the application is large. It also adds complexity around routing, communication, shared dependencies, authentication, versioning, and deployment.
