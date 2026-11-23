# Bugs found by this suite

Bugs in [ThoughtsBlink Studio](https://thoughtsblink.vercel.app) that the tests found.

Each open bug has a test that states the **correct** behaviour and is marked `test.fail()` with an `issue` annotation. The suite stays green while the bug exists. Once the app is fixed, the test starts passing, Playwright reports that as a failure, and that is the signal to remove the marker and close the bug here.

| ID                  | Summary                                        | Severity | Status |
| ------------------- | ---------------------------------------------- | -------- | ------ |
| [BUG-001](#bug-001) | `/api/setup/status` answers anonymous visitors | Low      | Open   |

## BUG-001

**`/api/setup/status` answers anonymous visitors**

- **Severity:** Low (information disclosure and unauthenticated load)
- **Test:** [tests/api/app/app-routes.spec.ts](tests/api/app/app-routes.spec.ts), "setup status is not available to visitors"
- **Steps:** `curl https://thoughtsblink.vercel.app/api/setup/status` without signing in.
- **Expected:** 401 or 403. The app README describes the setup page as admin-only.
- **Actual:** 200 with the full configuration report: whether the service-role key and each payment and email secret are set, whether an admin account exists, and which tables are missing.
- **Impact:** Tells an attacker which integrations are unconfigured. Each call also runs a dozen service-role queries, so anyone can create database load without signing in.
- **Suggested fix:** Check the caller's session in the route handler and return 403 unless their profile has `role = 'admin'`.
