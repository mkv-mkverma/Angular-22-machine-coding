# Frontend System Design --- Security Interview Notes

## 1. Security Mindset ⭐⭐⭐

For most security questions, think:

**Validate → Sanitize → Authenticate → Authorize → Encrypt → Restrict →
Monitor**

At senior level, explain:

**Attack → Impact → Prevention → Real-world example**

------------------------------------------------------------------------

## 2. XSS --- Cross-Site Scripting ⭐⭐⭐

### What is XSS?

An attacker injects JavaScript into a webpage and that script executes
in another user's browser.

Example:

``` html
<img src="x" onerror="alert('Hacked')">
```

If we blindly use:

``` js
element.innerHTML = userInput;
```

malicious code may execute.

### Impact

-   Steal sensitive information
-   Perform actions as the user
-   Capture keystrokes
-   Modify the DOM
-   Steal tokens if accessible to JavaScript

### Prevention

1.  Prefer `textContent` instead of `innerHTML` when HTML is not
    required.
2.  Sanitize HTML when HTML is actually required, e.g. DOMPurify.
3.  Validate input: type, length, pattern, allowed fields.
4.  Use Angular/React framework protections.
5.  Use CSP as defense in depth.
6.  Never execute user input as JavaScript.

``` text
❌ eval(userInput)
❌ new Function(userInput)
❌ setTimeout(userInput)
```

### Interview answer

> XSS occurs when attacker-controlled JavaScript gets executed in the
> user's browser. I prevent it by avoiding unsafe DOM APIs, sanitizing
> HTML when required, validating input, relying on framework
> protections, and enforcing CSP.

------------------------------------------------------------------------

## 3. Input Validation vs Sanitization ⭐⭐⭐

These are different.

### Validation

**"Is this input allowed?"**

Examples:

-   Age → number
-   Phone → expected format
-   Name → maximum length
-   Payload → only expected fields
-   File → allowed type and size

### Sanitization

**"Make potentially dangerous input safe before using/rendering it."**

Example:

``` js
DOMPurify.sanitize(html);
```

### Remember

``` text
Validation → reject bad input
Sanitization → clean potentially dangerous input
```

### Important

Never rely only on frontend validation.

``` text
Frontend validation → UX
Backend validation → Security
```

------------------------------------------------------------------------

## 4. Authentication vs Authorization ⭐⭐⭐

### Authentication

**Who are you?**

Example:

``` text
Login → username/password → identity verified
```

### Authorization

**What are you allowed to do?**

Example:

``` text
Admin → delete users
User → view own profile
```

### Typical flow

``` text
Login
 ↓
Server issues token
 ↓
Client sends token
 ↓
Server validates token
 ↓
Server checks roles/permissions
 ↓
Allow / Deny
```

Remember:

``` text
401 → Not authenticated
403 → Authenticated but not authorized
```

------------------------------------------------------------------------

## 5. JWT + HttpOnly Cookie ⭐⭐⭐

Recommended pattern:

``` text
Access Token
    ↓
Memory
    ↓
Short expiry

Refresh Token
    ↓
HttpOnly + Secure Cookie
```

### Why HttpOnly?

JavaScript cannot access an HttpOnly cookie.

Therefore:

``` js
document.cookie
```

cannot read it.

### Authentication flow

``` text
User Login
    ↓
Server
    ↓
Access Token + Refresh Token
    ↓
Access token → memory
Refresh token → HttpOnly cookie
    ↓
API request
    ↓
Access token expires
    ↓
401
    ↓
/refresh-token
    ↓
Browser sends cookie
    ↓
Server validates refresh token
    ↓
New access token
    ↓
Retry original request
```

Example:

``` js
res.cookie("refreshToken", token, {
  httpOnly: true,
  secure: true,
  sameSite: "Strict"
});
```

### Important

Frontend cannot create an HttpOnly cookie. It must be set by the server.

------------------------------------------------------------------------

## 6. `withCredentials` ⭐⭐

When cross-origin requests need cookies:

### Angular

``` ts
this.http.get(url, {
  withCredentials: true
});
```

### Axios

``` js
axios.get(url, {
  withCredentials: true
});
```

### Fetch

``` js
fetch(url, {
  credentials: "include"
});
```

Think:

``` text
Frontend
withCredentials: true
        +
Backend
Allow credentials appropriately
```

------------------------------------------------------------------------

## 7. CSRF ⭐⭐⭐

### What is CSRF?

A malicious website tricks the browser into sending an authenticated
request to another website.

It is especially relevant when authentication uses automatically sent
cookies.

``` text
User logged into bank.com
        ↓
Visits evil.com
        ↓
evil.com causes request to bank.com
        ↓
Browser automatically sends bank cookie
        ↓
Unauthorized action
```

### Prevention

-   CSRF token
-   `SameSite` cookies
-   Verify `Origin` / `Referer` where appropriate
-   Never use GET for state-changing operations

### Important distinction

``` text
Cookie authentication
        ↓
CSRF protection required

Bearer token in Authorization header
        ↓
CSRF generally not the primary concern
```

Why? A browser does not automatically attach your bearer token as an
`Authorization` header to a malicious cross-site request.

However, XSS is still dangerous because malicious JavaScript running in
your application can make authenticated requests using an accessible
token.

------------------------------------------------------------------------

## 8. CORS ⭐⭐⭐

### What is CORS?

CORS controls whether a browser allows a frontend from one origin to
access resources from another origin.

Example:

``` text
Frontend
https://app.com

API
https://api.com
```

Different origins → CORS applies.

### Origin

``` text
protocol + host + port
```

### Preflight

For certain cross-origin requests, the browser first sends:

``` http
OPTIONS
```

The server responds with appropriate CORS headers.

Example:

``` http
Access-Control-Allow-Origin: https://app.com
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Authorization
Access-Control-Allow-Credentials: true
```

### Interview point

> CORS is primarily a browser enforcement mechanism, not authentication.
> The server still needs to authenticate and authorize requests.

------------------------------------------------------------------------

## 9. HTTPS / TLS ⭐⭐⭐

### HTTP

``` text
Data → plaintext
```

### HTTPS

``` text
Data → encrypted using TLS
```

Protects data in transit against:

-   Eavesdropping
-   Tampering
-   Man-in-the-middle attacks

Common ports:

``` text
HTTP  → 80
HTTPS → 443
```

### Important

HTTPS protects **data in transit**.

It does not prevent:

-   XSS
-   SQL Injection
-   Bad authorization
-   Vulnerable application logic

------------------------------------------------------------------------

## 10. CSP --- Content Security Policy ⭐⭐⭐

CSP tells the browser which resources/scripts are allowed to execute or
load.

Example:

``` http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://trusted.com;
```

### Helps against

-   XSS
-   Malicious scripts
-   Unauthorized third-party resources
-   Clickjacking using `frame-ancestors`

### Best practices

-   Avoid `unsafe-inline` where possible.
-   Use nonce/hash based validation when inline scripts are required.
-   Allow only trusted resource sources.
-   Regularly review CSP directives.

Example:

``` html
<script nonce="random-value">
```

### Interview answer

> CSP is a defense-in-depth mechanism. Even if an attacker manages to
> inject content, CSP can restrict which scripts and resources the
> browser is allowed to execute or load.

------------------------------------------------------------------------

## 11. SQL Injection ⭐⭐⭐

### Problem

Never construct SQL using raw user input.

``` js
// ❌
`SELECT * FROM users WHERE id = ${userId}`
```

### Prevention

Use:

-   Parameterized queries
-   Prepared statements
-   ORM

Example:

``` js
db.query(
  "SELECT * FROM users WHERE id = ?",
  [userId]
);
```

### Remember

``` text
XSS → attacks browser
SQL Injection → attacks database
```

------------------------------------------------------------------------

## 12. Server-Side JavaScript Injection / RCE ⭐⭐

### Problem

Server executes attacker-controlled JavaScript.

Dangerous:

``` js
eval(userInput);
new Function(userInput);
setTimeout(userInput);
```

### Prevention

``` text
Never execute user input as code
Avoid dynamic code execution
Validate input
Use safe APIs
```

Think:

``` text
User Input
   ↓
❌ eval
   ↓
RCE / server compromise
```

------------------------------------------------------------------------

## 13. SSRF --- Server-Side Request Forgery ⭐⭐⭐

### What is SSRF?

Attacker tricks **your server** into making a request to an unintended
destination.

Dangerous pattern:

``` js
fetch(req.query.url);
```

Attacker could try:

``` text
url=http://localhost:5000/admin
```

Now the backend makes the request.

### Risks

-   Internal APIs
-   localhost
-   Cloud metadata
-   DevOps tools
-   Private network services
-   Sensitive internal endpoints

### Prevention

-   Whitelist trusted destinations
-   Block private/internal IP ranges
-   Validate URLs and DNS resolution
-   Revalidate redirects
-   Use timeouts
-   Limit response size
-   Do not pass arbitrary user URLs directly to `fetch()`

### Easy distinction

``` text
XSS
Attacker → Browser

SQL Injection
Attacker → Database

SSRF
Attacker → Server → Internal service
```

------------------------------------------------------------------------

## 14. Iframe Security ⭐⭐

Common uses:

-   Payment
-   YouTube
-   Ads
-   Third-party widgets
-   Micro-frontends

### Risks

-   Clickjacking
-   Malicious scripts
-   Information leakage
-   Abuse of browser features

### Protection

#### Sandbox

``` html
<iframe
  src="https://example.com"
  sandbox="allow-scripts allow-forms">
</iframe>
```

Don't unnecessarily allow:

``` text
allow-same-origin
```

#### Referrer Policy

``` html
referrerpolicy="no-referrer"
```

#### CSP

``` http
Content-Security-Policy:
  frame-ancestors 'self';
```

#### Permissions Policy

``` http
Permissions-Policy:
  camera=(),
  microphone=(),
  geolocation=()
```

### Remember

``` text
sandbox → restrict iframe capabilities
referrerpolicy → control referrer information
CSP frame-ancestors → control who can embed your page
Permissions-Policy → restrict browser features
```

------------------------------------------------------------------------

## 15. Permissions Policy ⭐⭐

Controls browser capabilities available to your application or iframes.

Examples:

-   Camera
-   Microphone
-   Geolocation
-   Screen capture
-   Clipboard
-   Bluetooth
-   Payment
-   USB

Example:

``` http
Permissions-Policy:
camera=(),
microphone=(),
geolocation=(self)
```

Meaning:

``` text
Camera → nobody
Microphone → nobody
Geolocation → only this origin
```

------------------------------------------------------------------------

## 16. Subresource Integrity --- SRI ⭐⭐

Used when loading third-party resources such as CDN scripts.

Flow:

``` text
Expected hash
      ↓
Downloaded file
      ↓
Compare
      ↓
Match → load
Mismatch → block
```

Why?

If a CDN is compromised and its JavaScript is replaced with malicious
code, SRI can prevent the unexpected file from loading.

### Remember

``` text
CSP → Where can resources come from?

SRI → Has the external resource been modified?
```

------------------------------------------------------------------------

## 17. Client-Side Storage ⭐⭐⭐

Storage options:

``` text
localStorage
sessionStorage
IndexedDB
Cookies
Cache
```

### Security rule

Do not store highly sensitive data in JavaScript-accessible storage
unless there is a strong reason.

Why?

``` text
XSS
 ↓
JavaScript executes
 ↓
localStorage/sessionStorage accessible
```

### Recommended auth pattern

``` text
Access token → memory → short expiry

Refresh token → HttpOnly + Secure cookie
```

### Session security

-   Short expiry
-   Idle timeout
-   Absolute expiry
-   Clear client state on logout
-   Regenerate session after login/privilege change

------------------------------------------------------------------------

## 18. Security Headers ⭐⭐

Know these:

  Header                              Purpose
  ----------------------------------- -------------------------------
  `Content-Security-Policy`           Restrict scripts/resources
  `Strict-Transport-Security`         Force HTTPS
  `X-Content-Type-Options: nosniff`   Prevent MIME sniffing
  `Referrer-Policy`                   Control referrer information
  `X-Frame-Options`                   Control framing/clickjacking
  `Permissions-Policy`                Restrict browser capabilities

Also remove unnecessary technology-identifying headers such as:

``` http
X-Powered-By: Express
```

------------------------------------------------------------------------

## 19. Dependency Security ⭐⭐

Third-party libraries can contain vulnerabilities.

### Practices

``` text
npm audit
Dependency updates
Dependabot
Snyk
Package lock
Security scanning
```

### package-lock.json

Locks dependency versions so builds are reproducible and unexpected
dependency changes are reduced.

### Senior-level answer

> I keep dependencies minimal, use trusted packages, lock versions,
> regularly audit dependencies, and address critical vulnerabilities
> through CI/CD security checks.

------------------------------------------------------------------------

## 20. DoS vs DDoS ⭐

### DoS

``` text
One attacker
    ↓
Too many requests
    ↓
Service becomes slow/unavailable
```

### DDoS

``` text
Many distributed attackers/devices
             ↓
       Massive traffic
             ↓
       Service unavailable
```

### Typical defenses

-   Rate limiting
-   WAF
-   CDN
-   Caching
-   Traffic filtering
-   Autoscaling
-   Request size limits

------------------------------------------------------------------------

## 21. Prototype Pollution ⭐

JavaScript-specific vulnerability where attacker-controlled object
properties can alter object prototypes and cause unexpected behavior.

Watch for keys such as:

``` text
__proto__
constructor
prototype
```

### Prevention

-   Validate object keys
-   Don't blindly merge user-controlled objects
-   Use safe object handling
-   Keep dependencies updated

------------------------------------------------------------------------

## 22. Directory Traversal ⭐

Attacker manipulates a file path:

``` text
../../../etc/passwd
```

to access files outside the intended directory.

### Prevention

-   Validate paths
-   Normalize paths
-   Restrict allowed directories
-   Don't concatenate raw user input into filesystem paths

------------------------------------------------------------------------

## 23. Insecure Deserialization ⭐

Application deserializes untrusted data without validating it.

Potential results:

-   Unexpected application behavior
-   Logic manipulation
-   Potential code execution depending on the library/format

### Prevention

-   Don't deserialize untrusted data
-   Use safe serialization formats
-   Validate structure/schema

------------------------------------------------------------------------

## 24. Data Integrity ⭐

**Data integrity = data should not be unexpectedly modified.**

Remember the distinction:

``` text
Encryption → hides data

Hash/checksum → detects changes

HTTPS → protects data in transit

SRI → detects unexpected changes to external resources
```

------------------------------------------------------------------------

## 25. Compliance ⭐

Know the basic idea rather than memorizing regulations.

Security design depends on the type of data:

``` text
Healthcare → HIPAA
Financial → applicable financial/security requirements
Personal data → privacy requirements
Accessibility → A11y
```

Main principle:

> Protect sensitive data according to its classification and applicable
> regulations.

------------------------------------------------------------------------

# Final Security Cheat Sheet

If the interviewer asks:

## "How would you secure a frontend application?"

Answer:

``` text
1. Authentication
   → JWT/OAuth
   → short-lived access token
   → refresh token in HttpOnly Secure cookie

2. Authorization
   → roles/permissions checked on backend

3. XSS
   → framework sanitization
   → avoid innerHTML
   → DOMPurify when required
   → CSP

4. CSRF
   → SameSite cookies / CSRF token for cookie-based auth
   → never use GET for state-changing operations

5. Input
   → validate type, length, pattern, allowed fields
   → validate again on backend

6. SQL Injection
   → parameterized queries / ORM

7. HTTPS
   → TLS everywhere

8. CORS
   → whitelist trusted origins
   → restrict methods/headers
   → credentials only when required

9. Client storage
   → avoid sensitive data in localStorage
   → access token in memory
   → refresh token HttpOnly cookie

10. CSP
    → restrict scripts/resources
    → nonce for dynamic inline scripts

11. Iframes
    → sandbox
    → CSP frame-ancestors
    → Permissions-Policy
    → validate iframe URLs

12. SSRF
    → whitelist destinations
    → block private IPs
    → validate redirects

13. Dependencies
    → npm audit
    → lock versions
    → dependency scanning

14. Security headers
    → HSTS
    → CSP
    → nosniff
    → Referrer-Policy
    → Permissions-Policy

15. DoS
    → rate limiting
    → request size limits
    → WAF/CDN/caching
```

------------------------------------------------------------------------

# What to Study First

### 🔴 Must Know

``` text
XSS
Authentication vs Authorization
JWT + HttpOnly Cookie
CSRF
CORS
HTTPS
CSP
Input Validation / Sanitization
SQL Injection
SSRF
```

### 🟠 Know Well

``` text
Client Storage
Security Headers
Iframe Security
Dependency Security
SRI
Permissions Policy
DoS/DDoS
```

### 🟢 Quick Revision

``` text
Prototype Pollution
Directory Traversal
Insecure Deserialization
SSJI
Compliance
```

**Goal:** Don't memorize every page. For each topic remember:

**What is it → Impact → Prevention → One practical example → One
interview answer**
