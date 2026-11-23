# Bugs found by this suite

Bugs in [ThoughtsBlink Studio](https://thoughtsblink.vercel.app) that the tests found.

Each open bug has a test that states the **correct** behaviour and is marked `test.fail()` with an `issue` annotation. The suite stays green while the bug exists. Once the app is fixed, the test starts passing, Playwright reports that as a failure, and that is the signal to remove the marker and close the bug here.

| ID                  | Summary                                                     | Severity | Status |
| ------------------- | ----------------------------------------------------------- | -------- | ------ |
| [BUG-001](#bug-001) | `/api/setup/status` answers anonymous visitors              | Low      | Open   |
| [BUG-002](#bug-002) | Visitors can read every user's email and payout details     | High     | Open   |
| [BUG-003](#bug-003) | Sellers can verify themselves and lift their own suspension | High     | Open   |
| [BUG-004](#bug-004) | Buyers can create orders marked as paid without paying      | Critical | Open   |

## BUG-001

**`/api/setup/status` answers anonymous visitors**

- **Severity:** Low (information disclosure and unauthenticated load)
- **Tests:** [tests/api/app/app-routes.spec.ts](tests/api/app/app-routes.spec.ts), "setup status is not available to visitors"; [tests/ui/auth/account-menu.spec.ts](tests/ui/auth/account-menu.spec.ts), "does not offer the setup page" (the account menu shows "Setup" to every signed-in user, not only admins)
- **Steps:** `curl https://thoughtsblink.vercel.app/api/setup/status` without signing in.
- **Expected:** 401 or 403. The app README describes the setup page as admin-only.
- **Actual:** 200 with the full configuration report: whether the service-role key and each payment and email secret are set, whether an admin account exists, and which tables are missing.
- **Impact:** Tells an attacker which integrations are unconfigured. Each call also runs a dozen service-role queries, so anyone can create database load without signing in.
- **Suggested fix:** Check the caller's session in the route handler and return 403 unless their profile has `role = 'admin'`.

## BUG-002

**Visitors can read every user's email and payout details**

- **Severity:** High (personal and financial data of every user is public)
- **Test:** [tests/api/profiles/profile-privacy.spec.ts](tests/api/profiles/profile-privacy.spec.ts), "a visitor cannot read an artist email address" and "... payout details"
- **Steps:** Without signing in, call `GET <supabase>/rest/v1/profiles?select=email,seller_profile` with the public anon key that every browser downloads.
- **Expected:** Visitors see only what public pages show (name, avatar, the artist's public profile).
- **Actual:** Every row with every column: the email of each buyer and artist, and `seller_profile.payoutMethod`, the artist's UPI or bank payout id.
- **Cause:** The policy `profiles read` is `using (true)` and Postgres row level security filters rows, not columns, so all columns are public.
- **Suggested fix:** Revoke column access for `anon` and `authenticated` on `email` and move private seller fields (`payoutMethod`) out of `seller_profile` into a table only the owner and admins can read. Alternatively, expose a `public_profiles` view with the safe columns.
- **Note:** The tests report only how many rows leaked, never the values, because CI publishes failure output.

## BUG-003

**Sellers can verify themselves and lift their own suspension**

- **Severity:** High (trust badge fraud; a suspended seller can return without an admin)
- **Test:** [tests/api/profiles/seller-badges.spec.ts](tests/api/profiles/seller-badges.spec.ts), "an artist cannot give themselves the verified badge"
- **Steps:** Signed in as an unverified artist, `PATCH <supabase>/rest/v1/profiles?id=eq.<own id>` with the current `seller_profile` and `"verified": true`.
- **Expected:** Refused, or the flag stays `false`. Only admins verify sellers (Admin, Users, Verify).
- **Actual:** The flag is saved and the "verified artist" badge appears on the artist's profile and artworks.
- **Cause:** The policy `profiles update own` lets users write any column of their own row. Only `role` is protected, by the `protect_admin_role` trigger. Admin-only fields inside `seller_profile` (`verified`, `suspended`, `status`) and the `is_seller` column are not.
- **Same cause, not automated:** `suspended: false` (a suspended seller lifting their own ban) and a buyer setting `is_seller: true` with `status: "approved"` (skipping the seller application). Not automated here because the suite's shared buyer account must stay a non-seller for parallel tests.
- **Suggested fix:** Extend the role trigger so non-admins cannot change `is_seller`, `seller_profile->verified`, `seller_profile->suspended` or `seller_profile->status`.

## BUG-004

**Buyers can create orders marked as paid without paying**

- **Severity:** Critical (free purchases; fake "verified purchase" reviews)
- **Test:** [tests/api/orders/order-payment.spec.ts](tests/api/orders/order-payment.spec.ts), "a buyer cannot record an order as paid without paying"
- **Steps:** Signed in as any user, `POST <supabase>/rest/v1/orders` with `{"buyer_id": "<own id>", "status": "paid", "total_inr": 0}`.
- **Expected:** Refused. Only the server, after verifying a payment, may mark an order paid.
- **Actual:** Accepted (201). The app's own checkout (`services/orders/supabase.ts`) inserts orders with `status: "paid"` from the browser, and the `orders insert` policy checks only `buyer_id`.
- **Impact:** Anyone can take digital artworks (download links unlock on paid orders) and, because `review_requires_purchase` trusts `orders.status`, publish purchase-verified reviews on any listing. Fake paid orders also inflate admin revenue.
- **Suggested fix:** Clients insert orders as `placed` only (policy `with check (status = 'placed')`), and the payment verify and webhook routes, using the service role, move them to `paid`.
- **Test data:** Orders cannot be deleted by clients, so the test cancels its order in teardown. Expect one cancelled order with `payment_provider = 'e2e'` per run.
