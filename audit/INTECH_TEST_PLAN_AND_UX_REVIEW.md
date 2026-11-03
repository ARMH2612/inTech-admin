# InTech — Complete testing guide and design/functionality review

Prepared: 28 September 2026. Reference build: Android APK 1.0.0 (1), package `com.oualidsahnoun.intech`.

This document is both a practical test manual and a product improvement proposal. It covers the observed client/technician experience, additional workflows suggested by the packaged routes, and release checks that require developer or administrator support.

**It is not a claim that every screen has been seen or every test has already passed.** Earlier testing covered many accessible screens but did not complete a real repair, payment, verification submission, or workshop transaction. The owner confirmed that OTP is deliberately unfinished and all numbers currently pass. Treat OTP tests as blocked until implemented, then run them before public release.

## Contents

1. [How to use this guide](#1-how-to-use-this-guide)
2. [Test environment, accounts, and data](#2-test-environment-accounts-and-data)
3. [Checks to repeat on every screen](#3-checks-to-repeat-on-every-screen)
4. [Detailed functional test cases](#4-detailed-functional-test-cases)
5. [Coverage, bug recording, and release decision](#5-coverage-bug-recording-and-release-decision)
6. [My assessment of the design and UX](#6-my-assessment-of-the-design-and-ux)
7. [What to fix, change, add, improve, and remove](#7-what-to-fix-change-add-improve-and-remove)
8. [Recommended implementation order](#8-recommended-implementation-order)
9. [Packaged route inventory and coverage worksheet](#9-packaged-route-inventory-and-coverage-worksheet)

## 1. How to use this guide

Use a new copy for each candidate build. Each test includes steps and an expected result. Record the actual result and attach evidence; merely opening a screen is not a pass for its underlying workflow.

Use these result values:

| Result | Meaning |
| --- | --- |
| NOT RUN | No execution on this candidate build yet. |
| PASS | All stated checks passed, with evidence where appropriate. |
| FAIL | Actual behavior differs from the agreed expected behavior. Create a bug. |
| BLOCKED | Cannot execute because an account, fixture, implementation, or environment is missing. Record the dependency. |
| OUT OF SCOPE | Product owner deliberately excludes the feature from this release; record why and confirm it is hidden from users. |

If one variant fails, do not mark the entire case PASS. Record each variant separately. For example, location permission allowed may pass while permission denied fails.

**Priorities:** P0 = identity, unauthorized access, or financial/data-integrity release blocker; P1 = core journey/reliability blocker; P2 = important usability or secondary feature; P3 = optimization. These are delivery priorities, not vulnerability scores.

**Who performs each test:** QA = someone using the app; DEV = a developer with logs, controlled API responses, and test tools; OPS = an administrator operating test accounts and requests. Some cases require more than one person. Do not assume an administration screen exists just because this guide needs an administrative action; developers may prepare equivalent staging fixtures.

**Proposed requirements versus existing behavior:** expected results below describe a recommended release contract. Where fees, deadlines, eligibility, or refunds are not yet defined, agree them first and put their exact values into the test record. An undefined policy is a product decision to resolve, not a reason to invent a passing result. Routes for optional features are candidates to verify, not proof of implemented functionality.

### Fastest useful execution order

1. Prepare fixtures and agree the rules in section 2.
2. Run T001–T004, T006–T010, T019, T020, and T093: establish installation, authentication, session, connectivity, and role isolation.
3. Run the complete paired-device journey T035 and T045–T055 before spending time on secondary modules.
4. Run technician verification, credits, cancellation, and warranty cases.
5. Cover all other in-scope modules, every route in section 9, and the visual/accessibility checks.
6. Retest every known issue listed in section 5, then apply the release gates.

## 2. Test environment, accounts, and data

### 2.1 Prepare the environment

- Use a staging backend with test-only technicians, notifications, orders, and payments. Prevent test jobs from reaching real workers. Use provider sandbox transactions or an approved staging cash-payment simulation.
- Install the exact candidate APK on at least two devices/emulators so client and technician can act independently. Include at least one physical Android phone for camera, GPS, microphone, notifications, and real keyboard behavior.
- Record build version/code, APK hash, backend version, date/time, Android version, device model, screen size, language, account role, and connection type.
- Include the minimum supported Android version (this APK declares API 24), a representative commonly used version chosen from your audience, and the newest version you claim to support. Add a small-screen/lower-memory phone and a large-screen phone. Test tablets if you intend to support them.
- Test French and Arabic, ordinary and increased text/display sizes, gesture and button navigation, Wi-Fi and mobile connectivity, slow connection, and offline mode. Test light/dark system settings even if the release deliberately supports only one app theme.
- Ask DEV to provide redacted app/server logs and controlled error responses. Clear logs between reproducible tests. Do not put passwords, OTPs, identity documents, or full customer contact details in bug screenshots.
- Reset only designated test accounts. Preserve evidence before clearing data. Use a fresh request/order for destructive branches such as cancellation and refund.

### 2.2 Account fixtures

The supplied number was enough for initial exploration; it is not enough to prove authorization or concurrent behavior. Prepare independent identities below.

| Fixture | Required setup | Why it is needed |
| --- | --- | --- |
| C1 | New client, no requests, promotions, or warranties | First-use and empty states. |
| C2 | Different client with known past/current requests | Ownership and data-isolation checks. |
| C3 | Client with completed paid repair and valid/expired warranties | Warranty, history, and review cases. |
| T1 | Verified home technician, relevant skills/service area, positive credits | Successful matching and repair. |
| T2 | Second verified technician eligible for the same job | Assignment races and competition. |
| T3 | Draft/pending/rejected/suspended variants, zero-credit variant | Verification and eligibility enforcement. |
| AC1 | Approved AC specialist | Installation/cleaning flow. |
| W1 | Approved workshop account with real staging address | Workshop drop-off, diagnosis, collection. |
| E1 | Electronic-repair role if supported in this release | Separate incoming/ongoing/ready workflow. |
| D1 | Account entitled to both Client and Technician roles | Switching, caches, and notification routing. |
| OPS | Administrator or equivalent fixture tooling | Approvals, disputes, support, credit corrections, audit trails. |

### 2.3 Data fixtures

- Create appliance fixtures including a two-door refrigerator that is also NoFrost and Inverter, an unknown model, and each supported service domain.
- Create one valid supported address, one outside service coverage, and one valid address difficult to locate automatically. Mark staging addresses clearly.
- Create slots in the future, a full slot, a recently expired slot, and a request scheduled yesterday that is still unresolved.
- Create requests at every agreed state: draft, submitted, matching, assigned, diagnosis, quote awaiting approval, approved, in progress, completed, cancelled, disputed, and warranty follow-up. Include rejected/revised quotes and unavailable technicians.
- Create one small valid photo/audio/document, one large file, one unsupported type, and one damaged file. Use synthetic identity documents, not real ID scans.
- Create valid, expired, exhausted, ineligible, and already-used promo codes. Create a real staging referral code for each account.
- Create products with stock, no stock, different variants, known brands, an image failure, and a price change between viewing and ordering.
- Create financial fixtures with known ledger entries. Example arithmetic fixture only: labor 2,000 DA + parts 3,000 DA − fixed discount 500 DA = 4,500 DA before any explicitly configured additional fee/tax. This is not a claim about InTech's real pricing. Define rounding, commissions, and discount allocation before using it.

### 2.4 Decisions to settle before interpreting test results

| Decision | Write down the agreed rule |
| --- | --- |
| Service promises | What exactly differs between Garanti and Flexible? Who provides the guarantee? |
| Fees | Diagnostic/callout, labor, travel, parts, platform fee, taxes if applicable, and who pays each. |
| Matching | Eligibility, service radius, skill matching, timeout, and reassignment. |
| Availability | Relationship between verification, hours, online state, credits, and existing jobs. |
| Credits | When reserved/spent/refunded, expiry, failed leads, and whether rewards are a separate balance. |
| Cancellation | Allowed states, fees, no-show handling, refunds, and cancellation authority. |
| Quotes | Who can revise, expiry, approval rules, and handling of price changes. |
| Completion/payment | Who confirms work, supported payment methods, and what happens if parties disagree. |
| Warranty | Eligible work/parts, start/end dates, exclusions, repeated claims, and who resolves them. |
| Verification | Required documents per professional type and actions allowed while pending. |
| Data lifecycle | What users can edit/delete and how uploaded documents and account data are retained. |
| Optional modules | Shop, community, AI, workshop, electronic repair, referrals: enabled for this release or hidden? |

## 3. Checks to repeat on every screen

For every distinct screen and important state, run this checklist in addition to its functional tests. Copy it into the screen's result record. Include dialogs, bottom sheets, keyboard-open states, and incoming notification entry points.

- [ ] The title describes the current task and role; no copied heading from another feature.
- [ ] Initial loading finishes or becomes an actionable error; no indefinite unexplained spinner.
- [ ] Empty, populated, loading, failed, and stale-data states are visually distinguishable.
- [ ] Every visible button, icon, row, tab, link, and card does what its appearance promises.
- [ ] There is one clear primary next action, and its label describes the outcome.
- [ ] Required/optional fields are clear; validation identifies the exact field and preserves other input.
- [ ] System Back, in-app Back, cancel, outside-tap, and swipe-dismiss behave consistently.
- [ ] Going back/forward does not duplicate work or discard a draft without an intentional rule.
- [ ] Header/footer/CTA avoid status bars, cutouts, gesture areas, and keyboard overlap.
- [ ] Long names, addresses, prices, translated strings, and large text remain readable.
- [ ] French and Arabic are complete, with correct reading order, text alignment, icons, dates, and numbers.
- [ ] Screen-reader focus follows the task; icons have meaningful names, roles, selected/disabled states.
- [ ] Important states are conveyed with text/icons as well as color; text contrast is measured when uncertain.
- [ ] Content belongs to the signed-in user and current role; no previous-account flashes or cached data leaks.
- [ ] Pull-to-refresh, refresh on return, and incoming updates preserve scroll/input where sensible.
- [ ] Backgrounding, locking the phone, process restart, and connection loss do not produce contradictory state.
- [ ] Rapid taps and repeated retry do not duplicate requests, transactions, messages, or uploads.
- [ ] All displayed dates, balances, counts, statuses, and totals agree with the approved fixture/backend.
- [ ] No sample names, fake metrics, placeholder URLs, unexplained zero values, or misleading availability claims.
- [ ] Screenshot/video, account fixture, app build, request/order ID, and result are recorded.

## 4. Detailed functional test cases

Use the IDs below to find a case quickly. All run records start as NOT RUN for the next candidate-build test session.

| Test IDs | Area |
| --- | --- |
| T001–T005 | Installation, startup, onboarding, navigation |
| T006–T015 | Phone/email authentication, sessions, account management |
| T016–T018 | Home, requests, profile, support links |
| T019–T020 | API failures and interrupted writes |
| T021–T035 | Client intake, location, scheduling, AC, complete repair |
| T036–T044 | Professional registration, verification, availability |
| T045–T055 | Assignment, tracking, diagnosis, quote, repair, payment, review |
| T056–T060 | Cancellation, disputes, warranty |
| T061–T064 | Workshop and electronic repair |
| T065–T070 | Credits, earnings, promotions, referrals |
| T071–T075 | Shop, orders, spare parts |
| T076–T081 | Notifications, community, AI, deep links |
| T082–T089 | Responsive UI, accessibility, localization, usability |
| T090–T098 | Reliability, performance, security, operations, final artifact |
| T099–T100 | Google sign-in and multiple login methods/account linking |

### A. Installation, startup, onboarding, and navigation

#### T001 — Fresh install and first launch · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

**Setup:** clean staging device; correct candidate APK.

1. Install, open from launcher, and record any install/launch error.
2. Observe splash, language selection, onboarding, and role choice.
3. Close and reopen after finishing onboarding; restart the device and reopen again.

**Expected:** install succeeds on supported devices; screens appear in the intended order; no blank screen or indefinite splash; completed onboarding and selected language persist. No unrelated permission is demanded before the user invokes its feature.

#### T002 — Upgrade and preserved data · P1 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

**Setup:** previous supported build with C1 signed in, a draft, and a known server-side request.

1. Install the new build as an update, without uninstalling or clearing data.
2. Open the account, draft, existing request, language, and notification destination.
3. Ask DEV to check any local database/config migration errors.

**Expected:** intended upgrade path works with the correct signing identity; account/history remain consistent; settings and drafts follow documented migration behavior. Any required reauthentication is explicit. Existing server data must not disappear.

#### T003 — First launch with slow or absent connectivity · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Clear only the designated test app's data; disable connectivity and launch.
2. Restore connectivity without reinstalling; use Retry if present.
3. Repeat with a slow connection and a backend unavailable fixture.

**Expected:** the app explains the condition and allows recovery. It does not mistake a failed fetch for a completed empty account, repeatedly restart onboarding, or require clearing storage to proceed.

#### T004 — Onboarding and role choice · P2 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Read every onboarding page in French and Arabic; use next/back/skip where available.
2. Choose Client, go back, and choose Technician.
3. Reopen after completing onboarding; inspect how an existing user changes role.

**Expected:** copy explains the service and next step; controls are discoverable; each choice opens the appropriate entry flow. Viewing a role must not automatically grant professional approval or duplicate the person/account.

#### T005 — Navigation and draft preservation · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Open each tab; drill down two or more screens, then use in-app and system Back.
2. Open/close every bottom sheet by its supported dismissal methods.
3. Enter a partial repair/profile draft, navigate away, return, then terminate/reopen the app.

**Expected:** predictable back stack; no navigation trap or duplicated screen stack; unsaved work is preserved or its loss is clearly confirmed. Submission/completion screens cannot accidentally repeat an irreversible action via Back.

### B. Authentication, identity, and account

#### T006 — Phone input and account normalization · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Submit blank, too short, too long, alphabetic, and whitespace-only input.
2. Enter the same authorized test number in local and supported international formats, with pasted spaces.
3. Sign in through each supported format and compare account identity.

**Expected:** invalid input is blocked with phone-specific guidance; supported equivalent formats resolve to the same account. Leading-zero handling does not create duplicates. Keyboard and country-code behavior are understandable.

#### T007 — OTP happy path · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

**Setup:** OTP implemented in staging, delivery to a test inbox/number; fresh unauthenticated session.

1. Request a code; confirm the masked destination, countdown, and edit-number option.
2. Enter the correct code and complete sign-in.
3. Revisit the verification URL/screen or replay the same code in a fresh session.

**Expected:** private data is inaccessible before verification; successful code verifies only its intended identity/session; a consumed code cannot authorize a new login. The current all-numbers-pass development behavior does not count as PASS.

#### T008 — OTP errors, resend, and limits · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Try incorrect, incomplete, expired, and previous codes after a resend.
2. Repeatedly request codes and submit wrong codes within the approved test limit.
3. Change the number during verification; interrupt connectivity and retry.

**Expected:** clear recoverable messages, server-enforced expiry/attempt/resend rules, no code accepted for a different number, and no unintended session. Countdown reflects server rules; changing device time cannot bypass them.

#### T009 — Session persistence and expiry · P1 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Log in, background, force-stop, restart, and reopen with good connectivity.
2. Repeat offline; restore connectivity.
3. Have DEV expire/revoke the staging session and reopen a protected screen.

**Expected:** valid session restores the correct identity/role; a network outage does not masquerade as logout or a blank new profile. Expired/revoked sessions request authentication without exposing private content. Previously observed return-to-onboarding/empty-shell behavior must be retested.

#### T010 — Role switching and cached data · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Use D1: switch Client → Technician → Client during normal navigation and after restart.
2. Open role-specific notifications and deep links in each state.
3. Use a client-only account to request a professional-only action through DEV's authorized API test.

**Expected:** correct menus/data after each switch; no mixed balances or requests; professional actions require server entitlement/verification. A role selector is navigation, not an authorization boundary.

#### T011 — Email sign-in and registration, if offered · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Register a new test email; try missing fields, malformed email, duplicate email, and passwords at configured limits.
2. Sign in with valid and invalid credentials; toggle password visibility.
3. Cancel and resume registration; inspect whether email verification is required by the agreed rule.

**Expected:** actionable field-specific validation, stable keyboard layout, correct account creation, no duplicate account on retry, and consistent verified/unverified access. If email auth is not supported, hide its entry point rather than leave a broken route.

#### T012 — Password recovery and magic links · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Request recovery for a test account; use its valid recovery code/link to set a new password.
2. Try expired, used, malformed, and wrong-account links/codes; open links while signed in as C2.
3. Verify old-password/session behavior against the agreed revocation policy.

**Expected:** one-time, identity-bound recovery; no silent account mix-up; invalid links recover gracefully. Recovery response should not unnecessarily reveal whether another email exists. Test the packaged magic-link route only if supported.

#### T013 — Account editing and persistence · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Edit name/photo/email or other fields that are actually enabled; test French accents and Arabic text.
2. Save, navigate away, restart, and check another signed-in device.
3. Try whitespace-only names, long input, upload failure, and cancellation before Save.

**Expected:** validation is clear; saved data persists and stays account-specific; failed save never claims success. Disabled fields explain how to change them. Default images do not imply another person's identity.

#### T014 — Phone change, password change, and logout · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. If phone change exists, change to another authorized test number using the required verification and retry a duplicate number.
2. For password accounts, test wrong/current password; for phone-only accounts inspect the available security actions.
3. Log out, use system Back, reopen from history, and open a private notification.

**Expected:** changes require appropriate reauthentication; account linking is intentional; phone-only users are not stranded by an old-password requirement. Logout removes protected access and cached private views; wording matches the actual login method.

#### T015 — Account deletion and data lifecycle · P1 · QA + DEV + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

**Setup:** disposable account with known test uploads/history; agreed retention rules.

1. Locate deletion/help instructions and inspect consequences before confirming.
2. Delete the disposable account; test duplicate taps and interruption.
3. Verify sign-in/session behavior, stored uploads, backend records, and explicitly retained records with DEV/OPS.

**Expected:** understandable process and confirmation; no false success; old sessions lose access; data handling matches the documented policy. If no user path exists, record the missing feature rather than assuming backend deletion support.

### C. Home, request lists, profile, and shared content

#### T016 — Home: new, active, and returning account · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Compare C1 empty home with C2 containing active/completed requests.
2. Tap every shortcut, notification icon, request card, and primary action.
3. Simulate a failed home fetch, then refresh successfully.

**Expected:** useful first action for a new user; correct next appointment/action for a returning user; failures do not become zero counts or empty success states. Name, address, and role are coherent.

#### T017 — Request tabs, details, and overdue jobs · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Seed upcoming/completed/cancelled requests and a missed appointment dated yesterday.
2. Compare each list card with its detail: service, quantity, address, floor, slot, status, and price.
3. Change one status through OPS; refresh and reopen; test longer lists and pagination if present.

**Expected:** complete consistent values, correct tab membership, status-specific empty messages, and an explicit rule/action for overdue unresolved work. No duplicates or lost rows between pages.

#### T018 — All profile rows and support/policy links · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Tap every profile row for every role, including terms, service policy, support, spare parts, language, AI, referral, and warranty entries.
2. Open email/phone/WhatsApp/support links with the destination app present and absent; stop before sending a message or call unless using a test endpoint.
3. Return to InTech; repeat offline for remotely loaded content.

**Expected:** every active-looking row responds; correct company/contact content; useful error or fallback if an external app is absent. Required policies are readable before a user commits to service.

### D. Network failures and consistency — apply across all modules

#### T019 — Controlled API failure responses · P1 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. In staging, return JSON 401/403/404/422/429/500, HTML 500, empty body, malformed JSON, and timeout for a selected screen endpoint.
2. Open home, account, brands, request detail, and balance views with these responses.
3. Restore valid responses and retry; inspect redacted logs.

**Expected:** correct screen-specific error and recovery; no raw JSON parse exception shown to users, endless request loop, or failure represented as a valid zero balance. Authentication expiry is distinguished from permissions, validation, throttling, and server failure.

#### T020 — Connection lost during a write · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Start a staging booking/save/payment/credit purchase; interrupt connectivity just before and just after the server commits, using DEV-controlled timing.
2. Restore the connection and tap Retry; restart the app and inspect history.
3. Compare server records, external transaction references, and UI.

**Expected:** exactly one logical operation/charge; uncertain outcomes are reconciled before replay; no false failure followed by an unnoticed duplicate. Repeat for every financially or operationally significant write.

### E. Client repair intake and appointment creation

#### T021 — Service selection and promises · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Open new request and inspect Garanti, Flexible, AC, warranty, and any workshop entry points.
2. Select each option, go forward/back, and confirm the selected option remains clear.
3. Compare described fees, timing, support, and warranty with approved product rules.

**Expected:** one clear selection; next screen matches the choice; no unsupported guarantee or unconditional immediate availability. Options outside the release scope are hidden or clearly explained.

#### T022 — Appliance/category selection · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Select every supported appliance family and inspect its available types.
2. Describe the two-door + NoFrost + Inverter fixture; also try unknown brand/model.
3. Change category after selecting a type; test catalog loading failure and empty catalog.

**Expected:** compatible attributes can coexist, or the app deliberately requests only one clearly defined attribute; stale incompatible selections are removed. Unknown models have a useful path. Failed catalogs cannot silently yield a valid blank choice.

#### T023 — Symptoms, description, and input limits · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Continue with no symptom/description, then with whitespace and very long text.
2. Select/deselect multiple symptoms where allowed; enter French and Arabic text.
3. Return to the appliance step, change appliance, and revisit symptoms.

**Expected:** minimum useful diagnosis data is enforced, or an explicit “I don't know / diagnostic visit” path exists. Relevant input persists; incompatible symptom choices clear intentionally; text limits are stated without losing typed content.

#### T024 — Photos from camera and gallery · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Add a new photo and an existing image; deny camera/gallery access and retry after granting it.
2. Preview, remove, replace, and add multiple images up to the declared limit.
3. Test large/damaged/unsupported files, interrupted upload, and background/resume.

**Expected:** optional media does not block a text-only request; limits/errors are clear; preview matches uploaded content; removed photos are not submitted; retry does not duplicate attachments. Camera/gallery permissions are requested in context.

#### T025 — Audio recording · P2 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Deny microphone permission, then allow it and record a short description.
2. Stop, play, delete, and rerecord; test zero-length and maximum-duration recordings.
3. Lock/background the device while recording and interrupt the upload.

**Expected:** recording state/duration are visible; no unnoticed recording continues; audio plays correctly; cancellation removes the attachment; failure is recoverable. If audio is unavailable, the user can still describe the problem in text.

#### T026 — GPS allowed and address accuracy · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. At a known test location, allow location permission and detect position.
2. Compare map pin, displayed address, and saved latitude/longitude; move the pin if supported.
3. Confirm, reopen the saved address, and inspect the technician's destination after submission.

**Expected:** location/address refer to the same place; accuracy/loading are handled visibly; the user can correct an inaccurate result; exactly the confirmed destination reaches the assigned technician.

#### T027 — GPS denied, unavailable, or approximate · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Deny permission, deny permanently, disable GPS, and test approximate location separately where supported.
2. Continue through the offered fallback; enable permission through settings and return.
3. Try confirmation while no valid location exists.

**Expected:** clear explanation and usable manual address path; no blank map trap or misleading enabled confirmation. Returning from settings resumes the task and preserves earlier input.

#### T028 — Manual address, search, and saved addresses · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Search a supported address; enter building, floor/unit, landmark, and contact instructions where relevant.
2. Save home/work/other, edit it, switch addresses, and reopen after restart.
3. Test no search result, ambiguous result, long Arabic address, and outside-service-area address.

**Expected:** search/pin/form agree; selected address is unambiguous and editable; no default city is accepted silently; coverage limitations are disclosed before confirmation. Labels and precise address details persist to request detail.

#### T029 — Appointment scheduling and timezone · P1 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Choose a valid future slot; try past dates, a full slot, and a slot expiring while the screen is open.
2. Change device timezone/date and language, then compare client, technician, server, and confirmation values.
3. Try two requests competing for the last available capacity.

**Expected:** server validates actual slot availability and time; full/stale slots require reselection; all parties see the same appointment instant and clear local timezone. Avoid mixing a 24-hour time with AM/PM.

#### T030 — Promotions during booking · P1 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Apply valid, expired, ineligible, exhausted, malformed, and already-used codes.
2. Change service, total, and account eligibility after applying a valid code; remove and reapply it.
3. Submit twice/with reconnect and check the discount usage record.

**Expected:** server revalidates eligibility; the exact discount and final total are visible before commitment; invalid codes explain why; usage is counted once. A code valid on one service cannot silently remain valid after an incompatible change.

#### T031 — Review screen and editing before confirmation · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Reach the final review with known appliance, issue, media, location, date, and promo data.
2. Compare every value and fee with prior steps; edit each major section from review.
3. Inspect what is fixed versus estimated, who will approve additional costs, and cancellation terms.

**Expected:** no missing or stale values; editing returns to review coherently; total/estimate and possible diagnostic fee are explicit; the final action clearly states that it creates a request.

#### T032 — Request submission and duplicate taps · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Submit a complete staging request; rapidly tap confirmation and repeat under slow connection.
2. Record the request ID and compare client history, server, and dispatch records.
3. Restart after submission and use system Back from the success page.

**Expected:** one request and dispatch event; responsive submitting state; definitive confirmation with the same ID; no accidental resubmission. Failure preserves the draft and explains how to recover.

#### T033 — Flexible service with no supply · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Request Flexible in an area with one eligible technician; repeat with none and with all busy/offline.
2. Let the matching deadline expire; make a technician available during the wait.
3. Test the offered cancel, retry, schedule, or support action.

**Expected:** truthful availability, visible matching state/deadline, and a useful fallback. No fake assigned technician, unsupported ETA, unexplained endless wait, or unearned charge.

#### T034 — AC installation/cleaning and customer type · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Create separate installation and cleaning drafts for individual and business customers.
2. Test quantity minimum/maximum, floor/access details, required AC specifications, address, and date; verify how each changes the estimate.
3. Submit staging jobs and compare details received by AC1, including any business invoice fields required by the agreed rules.

**Expected:** correct service-specific fields, limits, totals, and appointment; all supplied details survive submission. AC completion and rejection branches must also be run using T045–T055 with AC1.

#### T035 — Complete home repair, paired-device acceptance test · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

**Setup:** C1 and verified T1 on separate devices; approved pricing fixture; positive credits; staging payment method.

1. C1 submits a valid request; T1 receives and accepts it.
2. T1 starts travel/arrival as supported; C1 confirms location if required; T1 records diagnosis and quote.
3. C1 approves the correct quote version; T1 performs the simulated work and requests completion.
4. Complete the agreed client confirmation/payment sequence, then open receipt, warranty if eligible, review, technician earnings, and credit ledger.
5. Restart both apps and compare final history against server records.

**Expected:** one traceable job through every transition; both sides agree on state, amount, location, and next actor; no bypassed approval, duplicate charge, unexplained balance, or stranded request. Record screenshots from both roles at each transition. This is the most important overall release test.

### F. Technician registration, verification, and availability

#### T036 — Identity documents and requiredness · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Open a new professional profile; inspect requirements and privacy/purpose explanation.
2. Continue without files, then upload valid/invalid synthetic ID/passport/diploma files as applicable; remove and replace them.
3. Save draft, restart, and attempt final submission with required evidence missing.

**Expected:** requiredness is explicit; draft navigation can be flexible, but final verification submission enforces the actual professional rules. Upload errors are visible; previews are correct and private; missing evidence cannot silently produce a verified professional.

#### T037 — Business status choices · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Select each offered status, including commercial registration and “none for the moment.”
2. Test required file presence/absence for each; switch after attaching a document.
3. Submit fixtures to OPS and inspect the resulting verification requirement/status.

**Expected:** each path has a documented rule; optional status does not secretly bypass mandatory professional checks; irrelevant files/fields are not incorrectly retained as required. The previous commercial-registry validation should remain working.

#### T038 — Domain, appliance skills, and empty catalog · P1 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Select each supported domain and its appliance specialties; change domain after making selections.
2. Return/restart and compare saved selections.
3. Have DEV return an empty catalog and a catalog error, then attempt Continue and final submission.

**Expected:** valid compatible skills persist; previous-domain skills do not leak; a required empty selector cannot silently pass. No-data and failed-load states have distinct recovery behavior. Retest the previously observed blank appliance screen.

#### T039 — Work configuration and service area · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Configure transport type, vehicle count/plate if applicable, hours, working days, and service area.
2. Test no vehicle, zero/negative/excessive values, overnight hours if supported, unavailable days, and missing location.
3. Change wilaya and inspect commune choices; save/reopen and examine matching eligibility.

**Expected:** conditional fields follow the selected transport/work type; dependent geography updates; no silent default region becomes an unintended work area. Saved schedule/coverage actually constrains job eligibility.

#### T040 — Final submission, pending, rejection, and resubmission · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Submit a complete synthetic profile and retry rapidly; inspect pending state and review-time wording.
2. OPS rejects with a specific reason; technician opens notification and edits requested fields.
3. Resubmit; OPS approves; restart and switch roles.

**Expected:** one review submission/version; clear pending/rejected/verified state; useful rejection reason; safe editable resubmission; permissions update only after server approval. Status survives restart and is consistent across profile/home.

#### T041 — Unverified and suspended professional restrictions · P0 · QA + DEV + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. For draft, pending, rejected, and suspended T3, attempt nearby jobs, job detail, acceptance, and professional-only writes.
2. Repeat using DEV's direct authorized API checks rather than only the UI.
3. Suspend a verified technician while they hold an active job and inspect the documented reassignment/support behavior.

**Expected:** server enforces each allowed action; forbidden access does not depend on hidden buttons. Active customers are not abandoned by a silent suspension; operations can resolve the job according to policy.

#### T042 — Availability, hours, and credits agree · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Compare available/offline, inside/outside work hours, zero/positive/reserved credits, and fully booked states.
2. Inspect home, availability settings, rewards, matching, and server eligibility for each combination.
3. Change a balance/status externally and refresh or receive the update.

**Expected:** one coherent availability rule and explanation. Zero credits must not show “available” when the same page says zero prevents work. A top-up or reservation updates all affected views correctly.

#### T043 — Technician home, reports, and empty states · P2 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Inspect a new technician and one with assigned/completed/cancelled jobs and reviews.
2. Compare name, location, rating, tasks, credits, and profile-completion prompt to fixtures.
3. Open every card/tab and test data-load failure.

**Expected:** the next operational action is obvious; no-review state differs from a zero-star rating; profile completion is actionable; counts agree with lists; failures do not appear as poor performance or zero earnings.

#### T044 — Nearby opportunities and filtering · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Seed jobs inside/outside coverage, matching/nonmatching skills, expired/already-assigned jobs, and different service types.
2. Open nearby opportunities with T1 and an ineligible account; move/change permitted work area in staging.
3. Refresh, paginate, and open a job that becomes unavailable while visible.

**Expected:** only eligible current opportunities are actionable; location/skill filters are correct; stale cards fail gracefully at acceptance. Customer details shown before assignment follow the intended privacy rules.

### G. Assignment, diagnosis, quotes, repair, and completion

#### T045 — Job notification and request overview · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Submit a matching job; observe foreground/background delivery to T1.
2. Open the overview from the list and notification; compare appliance, symptoms, address disclosure, media, slot, and fee information.
3. Open a withdrawn or expired job notification.

**Expected:** correct job and actor, enough information to accept responsibly, and no private data beyond entitlement. Stale notifications explain the current state rather than display obsolete actions.

#### T046 — Accept, reject, expire, and simultaneous acceptance · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Accept a job with T1; reject another; let a third expire.
2. Have T1 and T2 accept the same job as close together as possible; repeat with delayed network responses.
3. Inspect assignments, customer state, credit reservations, and notifications.

**Expected:** exactly one technician wins; loser receives a clear unavailable response; no double reservation/charge. Rejected/expired jobs follow reassignment rules and leave no contradictory state.

#### T047 — Travel, live tracking, arrival, and location confirmation · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Start the accepted job and open client tracking; move the physical test device along a safe test route or use controlled emulator locations.
2. Disable technician location/connectivity, background the app, and resume.
3. Trigger arrival/location confirmation; try confirming out of sequence.

**Expected:** identity and destination are correct; last-updated/stale tracking is understandable; ETA is not presented as certain when unavailable. Tracking access is limited to the authorized job and ends according to policy; arrival actions obey the state model.

#### T048 — Diagnosis, parts, and service-specific inputs · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. On an assigned job, enter diagnosis, labor, parts, and any gas/refrigerant fields actually supported.
2. Test missing explanation, invalid/negative values, fractional quantities, limits, and edit/back behavior.
3. Save and compare the client-visible description and proposed charges.

**Expected:** required diagnosis and valid amounts/units; no hidden charge; edits persist; server validates calculations. The packaged gas route needs a verified product purpose before it is declared covered.

#### T049 — Quote calculation and approval · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Build the agreed arithmetic fixture; independently calculate each line, discount, fee, and final amount.
2. Compare technician quote, client approval, server record, and receipt preview.
3. Approve once; repeat tapping approval and reopening the link.

**Expected:** exact agreed arithmetic/rounding, visible breakdown, one approved quote version, and no duplicate charge/transition. Technician cannot mark chargeable work approved without the required client action.

#### T050 — Quote rejection, revision, and stale approval · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. C1 rejects a quote; inspect both roles and any allowed diagnostic fee.
2. T1 revises an unapproved quote; attempt to approve the old version from a second client device.
3. Let the quote expire if expiry is supported; inspect client-refused/client-rejected waiting branches.

**Expected:** rejection has a clear next step; old/expired versions cannot be approved; changed amounts require fresh informed acceptance. No hidden post-approval increase or unexplained fee.

#### T051 — Repair in progress and interruption · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Start work after required approval; attempt starting before approval on another fixture.
2. Background/restart both apps; pause or mark awaiting parts if supported.
3. Simulate technician disconnect or inability to finish; follow the offered support/reassignment path.

**Expected:** correct allowed transitions; durable progress and next action; no automatic completion from mere navigation. A stalled repair has an operational resolution path rather than remaining indefinitely “in progress.”

#### T052 — Final confirmation and disagreement · P0 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. T1 requests completion; C1 confirms satisfactory completion under the agreed process.
2. On a separate job C1 refuses final confirmation and gives a reason; test no client response and repeated taps.
3. Inspect waiting-last-confirmation, accepted/refused screens, support escalation, and balances.

**Expected:** correct actor controls each transition; disagreement is recorded and handled; no automatic undisclosed settlement; timeouts follow a visible policy. Work status and payment status remain distinguishable.

#### T053 — Payment success, failure, cancellation, and reconciliation · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Use each supported staging payment method: successful, declined, cancelled, and pending provider outcomes; if cash is supported, test acknowledgement by the required parties.
2. Interrupt app return/callback; deliver duplicate/out-of-order callbacks in staging through DEV.
3. Reopen history and compare provider/server/client/technician transaction references.

**Expected:** one logical charge, accurate pending/paid/failed state, verified payment before treating it as settled, and recoverable interrupted flows. A successful-looking app return alone cannot prove payment. Receipt and amount match the approved quote.

#### T054 — Earnings, commission, credits, and receipt after completion · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Record opening balances and the approved fee/commission/credit rules before completion.
2. Complete the job and reconcile all ledger entries, earnings, deductions, receipt, and reports.
3. Reopen/retry completion; apply a controlled refund/adjustment and compare all views.

**Expected:** traceable arithmetic with no double posting; separate meanings for gross revenue, technician net earnings, credit balance, and cash received. Adjustments preserve history and reconcile to final balances.

#### T055 — Rating and review integrity · P1 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Review a completed eligible job; try empty/out-of-range input and edit if supported.
2. Try reviewing twice, reviewing an incomplete job, and reviewing C2's job as C1.
3. Compare technician count/average and permitted moderation behavior.

**Expected:** only eligible participants can review; aggregation is accurate; duplicates are prevented or treated as edits. No-review users are not represented as zero-rated. If reviews are outside scope, do not advertise unavailable review-based trust claims.

### H. Exceptions, cancellations, warranty, and support

#### T056 — Client cancellation at each stage · P0 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Use separate fixtures to cancel before assignment, after assignment, after travel/diagnosis, and after approval where allowed.
2. Read the fee/refund preview before confirming; cancel the dialog once.
3. Check both roles, slot release, credit reservations, payment/refund ledger, and notifications.

**Expected:** eligibility/fees follow the agreed state-specific policy; the user sees consequences before commitment; exactly one cancellation; all dependent reservations and money reconcile.

#### T057 — Technician cancellation, no-show, and rescheduling · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. T1 cancels with a reason; C1 reports a technician no-show; test client unavailable separately.
2. Try a reschedule accepted/rejected by the other required party and a new slot becoming full.
3. Inspect reassignment, notification, fees/credits, and history.

**Expected:** clear ownership of the next action, preserved event history, valid new slot, correct financial treatment, and no abandoned job. Rescheduling changes all displays without erasing the original commitment history.

#### T058 — Dispute and support resolution · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Open support from a specific test request; attach a reason/evidence through supported channels.
2. OPS acknowledges and resolves in favor of each side on separate fixtures, including a partial refund if supported.
3. Reopen after app restart; inspect notification, request state, and financial history.

**Expected:** case/reference ties to the correct job; status and response expectations are clear; attachments remain private; resolution and adjustments are auditable. If only external support is supported, it must still preserve sufficient job context.

#### T059 — Warranty generation and viewing · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Complete eligible and ineligible services; generate warranty only through allowed actors.
2. Compare appliance, covered work/parts, issuer, dates, exclusions, job reference, and contacts.
3. Open from request, profile, shop warranty if applicable, and another account via DEV ownership checks.

**Expected:** correct eligibility and precise terms; no warranty silently generated for excluded work; date calculations agree across languages/timezones; only entitled users can view documents. An empty warranty page clearly explains the absence.

#### T060 — Warranty claim: valid, expired, duplicate, and rejected · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Select a valid warranty, describe an issue, confirm location, and submit a staging claim.
2. Try expired/not-started/ineligible coverage and a second open claim for the same issue.
3. Process acceptance and rejection with reasons; complete a simulated follow-up repair.

**Expected:** server checks coverage and ownership, prevents accidental duplicate claims, explains exclusions, and shows whether any charge applies before commitment. Original repair and follow-up remain linked in history.

### I. Workshop and electronic-repair branches

Routes exist for these branches, but they were not fully opened in the earlier audit. Use OPS-prepared accounts and jobs. If intentionally excluded, hide the entry points and mark OUT OF SCOPE with the release decision.

#### T061 — Workshop selection and request · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. C1 chooses workshop repair, provides appliance/problem, selects a suitable workshop, and submits.
2. Inspect address, opening hours, service capabilities, estimated fees, drop-off instructions, and cancellation.
3. Repeat with closed/unavailable/out-of-area workshop and missing location data.

**Expected:** customer knows where and when to take the appliance and what is agreed; incompatible workshops are not offered; one request reaches W1 with complete details.

#### T062 — Workshop intake and diagnosis · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. W1 receives the request and records physical intake using the supported flow.
2. Record appliance identity/serial if used, accessories, existing condition, and diagnostic findings; prepare the quote.
3. C1 accepts/rejects; restart both apps and inspect pending/diagnostic/ongoing lists.

**Expected:** traceable custody/receipt and correct status; device/accessories cannot be confused with another customer's property; customer consent precedes chargeable work under the agreed rules.

#### T063 — Workshop ready, collection, and payment · P0 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Finish the simulated repair, mark ready, and notify C1.
2. Attempt collection confirmation twice and with the wrong customer/reference.
3. Complete authorized handover/payment, then inspect receipt, warranty, and workshop earnings.

**Expected:** only the correct job/customer is handed over; ready does not prematurely mean collected/paid; one settlement and full custody/status history. Uncollected work follows an explicit operational policy.

#### T064 — Electronic-repair role and branch isolation · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Use E1 to open incoming, ongoing, and ready jobs; run an end-to-end job with the supported electronic-service fixture.
2. Exercise rejection/cancellation, diagnosis/quote where applicable, completion, and handover/payment.
3. Compare role-specific data with W1 and T1; try unsupported actions through DEV checks.

**Expected:** the intended workflow works independently; no role gets another provider's jobs or unsupported actions. Similar-looking screens must not be treated as covered merely because home-technician tests passed.

### J. Credits, revenues, promotions, and referrals

#### T065 — Credit offer clarity and purchase · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Open each plan; compare points, price, advertised client yield, expiry, and refund rules with configuration.
2. Purchase through a sandbox method; cancel/fail another purchase.
3. Record order/provider reference, opening balance, new balance, and receipt.

**Expected:** understandable conversion/charging rules; only successful purchases add the correct credits once. Failed/cancelled purchase does not appear paid or available. Any “up to clients” or savings claim has a defensible, visible basis.

#### T066 — Credit reservation, spend, refund, and concurrent jobs · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Start with a known balance; accept and complete/reject/cancel jobs at each charge-relevant stage.
2. Have two devices accept jobs against a balance sufficient for only one reservation.
3. Release/refund a reservation and repeat a provider/admin callback.

**Expected:** atomic eligibility and ledger updates; no unintended negative spendable balance, double deduction, or double refund. Available/reserved/spent amounts reconcile and availability changes immediately according to the agreed rule.

#### T067 — Revenue/report correctness · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Seed jobs across date boundaries with completed, pending, cancelled, refunded, and partially refunded payments.
2. Compare revenue/report totals and counts with an independent calculation; test date filters and pagination.
3. Inspect no-data and failed-fetch variants separately.

**Expected:** labels clarify gross/net/paid/pending amounts; correct inclusion rules, currency, rounding, and timezone boundaries; totals equal their transactions. A failed request must not show a legitimate-looking zero report.

#### T068 — Payout or admin balance adjustment, if supported · P0 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Request a payout with adequate/inadequate funds or apply an authorized staging adjustment.
2. Process pending/success/failure/reversal and duplicate callback/action variants.
3. Check actor permissions, audit reason, available balance, transaction history, and technician notice.

**Expected:** authorized, traceable, exactly-once movement; no withdrawal of unavailable funds or silent edits to historical earnings. If payouts are handled externally, verify reconciliation and user-facing explanation rather than inventing an in-app screen.

#### T069 — Promo list and redemption lifecycle · P2 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. View active/future/expired/used offers on two accounts with different eligibility.
2. Open each offer and compare terms, dates, remaining uses, and permitted services.
3. Redeem through T030; return to the list after use and after expiry.

**Expected:** no expired offer appears normally redeemable; accurate personalized eligibility; terms match server enforcement. Specifically retest the previously visible Simou2026 offer dated March 2024.

#### T070 — Referral links and rewards · P1 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Generate/open C1's staging referral link with the app installed, absent, and signed in as C2; cancel share before sending unless using a designated test destination.
2. Create a qualifying referred test user and complete the configured reward trigger.
3. Try self-referral, duplicate qualifying action, and ineligible existing user.

**Expected:** real working link, correct account attribution, no sample people, and one reward only after the defined event. Copy/share output contains the correct code and destination; rewards reconcile with the intended balance type.

### K. Shop and spare parts

#### T071 — Catalog, categories, brands, and search · P2 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Open known populated/empty categories and brands; verify titles and image/name pairs.
2. Search exact, partial, French/Arabic, nonexistent, and cleared queries; paginate and return from a detail.
3. Simulate slow/failed catalog loads and rapid changes between queries.

**Expected:** relevant results for the latest query, explicit no-results/error states, preserved navigation, and correct brand/product terminology. No Category1, repair heading on product search, or unrelated person/storefront pairing.

#### T072 — Filters and product details · P2 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Apply/remove each supported filter and sort; combine filters giving zero results; reset all.
2. Open products with different stock/variants, missing images, long descriptions, and changed prices.
3. Compare search, detail, and order price, stock, brand, warranty, seller, and delivery information.

**Expected:** controls visibly affect data; result count and selected filters are clear; detail values are consistent. Unavailable items cannot appear purchasable without explicit backorder rules.

#### T073 — Product order and stock race · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Order a staging product; edit quantity/address and review full amount/fulfilment terms.
2. Let C2 buy the last unit before C1 confirms; change price while C1's review is open.
3. Double-tap order and interrupt connectivity at commit.

**Expected:** server revalidates price/stock; material changes require informed reconfirmation; no overselling or duplicate order/charge. Order history and fulfilment reference are durable. If ordering is outside scope, hide the actionable purchase path.

#### T074 — Order payment, fulfilment, cancellation, and return · P0 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Run payment success/failure/pending and cancellation on separate staging orders.
2. Move an order through its supported delivery/pickup states; process a permitted return/refund.
3. Compare customer history, inventory, receipt, warranty, and refund/provider records.

**Expected:** coherent order/payment/fulfilment states; correct inventory adjustments and exactly-once refunds; customer knows how to get help. The APK route list alone does not prove these backend operations exist.

#### T075 — Technician spare parts · P2 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Tap the technician spare-parts entry and identify its intended purpose: catalog, request, stock, or ordering.
2. Run that complete supported flow with a test part, unavailable part, and relevant job reference.
3. Inspect price/quantity, permission, failure recovery, and any effect on a client quote.

**Expected:** a responsive, understandable feature with no hidden charge or unsupported promise. If unfinished, remove/hide the entry for the release. Retest the previously nonresponsive row.

### L. Notifications, community, AI, and external entry points

#### T076 — Notification permission and delivery states · P1 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Allow notifications on one device and deny on another; change permission through settings.
2. Send staging assignment, quote, cancellation, completion, and support updates while foregrounded/backgrounded and after process termination.
3. Restore permission/connectivity and compare system notifications with the in-app inbox.

**Expected:** permission prompts have context; supported delivery behavior is reliable and documented; denial does not block the underlying job. Inbox holds authoritative updates even when push is missed; no duplicate or wrong-account notification.

#### T077 — Notification routing, unread counts, and stale events · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Open notifications for active/completed/deleted/inaccessible jobs and different roles.
2. Mark read on one device, refresh another, then logout/login as a different test account.
3. Receive a status change while viewing an older notification.

**Expected:** correct authorized destination and current state; accurate unread count; useful handling of stale links; no old-account content after logout. Background count failures do not cause continuous parse-error polling.

#### T078 — Community posting and recovery · P2 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. With designated test members, send short/long/empty/French/Arabic messages and supported attachments.
2. Submit with poor connection, retry, restart, and compare both devices.
3. Inspect message order, time, sender identity, online count, and pagination.

**Expected:** clear pending/sent/failed states, no duplicate messages, accurate authorship, and sensible history ordering. Empty community has an introduction and purpose; online counts are real or omitted.

#### T079 — Community permissions and moderation · P1 · QA + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Test draft/pending/approved/suspended roles against the agreed community access rules.
2. Use neutral synthetic content to test report/block/delete/moderation and configured rate/attachment limits.
3. Confirm blocked/restricted users cannot continue prohibited actions through DEV API checks.

**Expected:** intentional access policy, meaningful report/block outcome, protected private information, and auditable moderation. Do not assume community access before verification is a bug until the policy is decided.

#### T080 — AI assistant, if retained · P1 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Open AI from profile; ask a supported repair/service question in French and Arabic.
2. Test unavailable service, timeout, unrelated requests, and a question requiring information it cannot verify.
3. Ask it to book/cancel/change a quote or disclose another test account's information; inspect any tool permissions and confirmation flow.

**Expected:** clear scope and uncertainty; no invented appointments, prices, technician availability, or completed actions. Private data stays isolated, and state-changing actions follow the same authorization/confirmation rules as the app. Hide the row if the assistant is not implemented.

#### T081 — Deep links and invalid destinations · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Open supported referral, magic-login, request, and notification links when signed out, signed in correctly, and signed in as C2.
2. Test malformed IDs, missing/deleted objects, expired tokens, unsupported paths, and repeated link opens.
3. Complete required sign-in and inspect the resumed destination and back stack.

**Expected:** safe, clear recovery; correct authorized object; no wrong-account data, repeated token action, crash, or navigation loop. Presence of the `intech` scheme alone does not prove every route is publicly linkable.

### M. UI, accessibility, localization, and usability

#### T082 — Screen sizes, safe areas, and keyboard · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Run critical flows on the smallest supported screen, a large phone, and each claimed orientation/form factor.
2. Open every input with keyboard visible; scroll to the last field/button; use gesture/button navigation.
3. Inspect cutouts/status bars/bottom sheets and retest shop search specifically.

**Expected:** no header under system icons, hidden CTA, unreachable field, clipping, or unintended horizontal scroll. Keyboard avoidance preserves labels/errors and visible task context.

#### T083 — Large text and display scaling · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Increase system font and display size to supported larger settings; relaunch.
2. Test onboarding, login, service cards, address, quote/payment, professional registration, and dialogs.
3. Inspect long names, prices, dates, and Arabic copy in the largest relevant settings.

**Expected:** content reflows or scrolls; no essential text/button is cut off; price/consent content stays readable. Scaling must not hide the only way to continue or cancel.

#### T084 — TalkBack and accessible interaction · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Enable TalkBack; complete login, create a request, approve a quote, and switch role without relying on sight.
2. Inspect names/roles/state for back, add, bell, password toggle, tabs, quantity controls, and selectable cards.
3. Trigger errors and open/close dialogs; follow focus after navigation.

**Expected:** meaningful localized labels, logical focus order, selected/disabled state, announced errors and headings, accessible map alternatives, and focus contained/restored correctly for dialogs. No generic English backdrop label in a French/Arabic flow.

#### T085 — Visual contrast, touch areas, and states · P2 · QA + DESIGN

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Measure actual rendered text/icon contrast and touch bounds using the team's accessibility criteria; do not judge solely by screenshots.
2. Test small edit/“Voir tout” icons, adjacent controls, pressed/selected/disabled/loading states, and outdoor-like brightness conditions.
3. Inspect success/error/status meaning with colors muted or unavailable.

**Expected:** readable information, reliably tappable controls without wrong-neighbor activation, and status conveyed through text/icon as well as color. Do not record a numerical contrast violation without measurement.

#### T086 — French, Arabic, RTL, dates, and mixed text · P1 · QA + bilingual reviewer

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Run complete client and technician journeys in both languages, including errors, notification text, policies, and provider return screens.
2. Enter Arabic names/addresses mixed with Latin brands, phone numbers, DA prices, and dates.
3. Switch language mid-draft and after restart; inspect arrow direction, number order, alignment, truncation, and appointment timezone.

**Expected:** complete natural translation; correct RTL behavior without reversing phone/price meaning; selected language persists; no lost draft or mixed-language error. Human language review is required beyond checking that text exists.

#### T087 — Theme and visual consistency · P2 · QA + DESIGN

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Compare all screen families in light/dark system settings and after theme changes while open.
2. Inspect shared headers, buttons, cards, lists, tabs, errors, and modals side by side.
3. Check loading placeholders and external/provider screens for unreadable theme transitions.

**Expected:** coherent supported theme behavior and reusable component styling; no dark text on dark backgrounds, flashing unreadable screen, inconsistent back placement, or different semantics for identical controls.

#### T088 — First-time customer usability session · P2 · DESIGN/PM

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

**Setup:** recruit several representative users unfamiliar with the app; do not coach their taps.

1. Ask each to request a refrigerator repair, explain the service options, identify expected cost, and find cancellation/support.
2. Ask what happens next and what “guaranteed” means; observe wrong turns and questions.
3. Record completion, time, hesitation, errors, and confidence; compare after redesign.

**Expected:** users can explain the commitment and next step accurately. Use predefined research goals, not an invented universal time limit. A technically working flow still needs improvement if users misunderstand price or guarantee.

#### T089 — First-time technician usability session · P2 · DESIGN/PM

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Ask a technician to complete their profile, understand verification status, set service area, and explain availability.
2. Ask them to compare credit plans and calculate the cost of an accepted/cancelled job using displayed rules.
3. Ask them to find the next action on an assigned job and explain gross versus net earnings.

**Expected:** the professional can predict eligibility, costs, and next actions without staff explaining hidden rules. Record misunderstandings about points, “clients,” review time, and zero ratings as design findings.

### N. Reliability, performance, security configuration, and release

#### T090 — Process death, interruptions, and multitasking · P1 · QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. At login, upload, address, quote, payment, and active-job screens, background/lock, receive a call, and terminate the app through test controls.
2. Relaunch and resume; open a new incoming job notification during a draft.
3. Repeat after the underlying server state changes while the app is closed.

**Expected:** restored or intentionally recoverable state, reconciled pending operations, no duplicate action, and no stale approval for a changed object. Private content is handled according to the app's agreed lock-screen policy.

#### T091 — Measured startup and interaction performance · P2 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. On a named representative physical device, measure cold/warm launch and time until the main action is usable across repeated comparable runs.
2. Measure request-list scrolling, image loading, search, and large histories; record network conditions and dataset size.
3. Repeat a fixed navigation/upload cycle and compare memory/battery/background traffic; investigate sustained growth rather than one reading.

**Expected:** meets performance budgets agreed for the target audience, without sustained leaks, frozen input, or aggressive idle polling. The previous emulator readings are context only, not a performance pass or fail.

#### T092 — Connectivity changes, retry storms, and stale data · P1 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Switch Wi-Fi/mobile/offline repeatedly while on home, requests, tracking, and balances.
2. Change a request on the other device; restore connection and inspect update ordering.
3. Watch request rates and redacted logs during a prolonged backend outage and recovery.

**Expected:** bounded retries/backoff, no flooding or repeated HTML-to-JSON parse loop, clear stale state, and eventual convergence to the server's latest version without overwriting newer data.

#### T093 — Object ownership and role authorization · P0 · DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

**Setup:** only owned staging accounts and fixtures; authorized API test client.

1. Capture valid C1/T1 requests, then attempt the same read/update operations using C2/unassigned T2 tokens against those staging object IDs.
2. Cover request details, quotes, invoices, documents, warranties, messages, balances, orders, and professional approvals.
3. Repeat without credentials and with revoked credentials; inspect returned fields as well as status codes.

**Expected:** server denies unauthorized reads/writes and sensitive fields; changing an ID/role in the client cannot bypass access. No real customer accounts should be used for this test.

#### T094 — TLS, production endpoints, and release signing · P0 · DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Inspect the exact final APK's manifest, endpoint configuration, signing identity, and runtime debug flag.
2. Exercise all API/media/realtime/auth paths in staging matching production transport settings; test blocked cleartext and invalid certificates using controlled tooling.
3. Check CI rejects debug-signed artifacts, development auth bypasses, and accidental staging/test settings in production outputs.

**Expected:** intended production signing identity, secure transport with proper certificate validation, no usable production OTP bypass, and no unintended development endpoint. Prior evidence found cleartext allowed, an HTTP API string, and an Android Debug certificate; runtime debuggable was not set.

#### T095 — Sensitive storage, logs, backups, and permissions · P1 · DEV + QA

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Inventory local tokens/cache/documents and redacted logs using approved developer tools; inspect backup/data-extraction settings.
2. Review each manifest permission against an actual retained feature; deny/revoke each relevant permission during use.
3. Verify logout/deletion cleanup and synthetic upload access controls, including expiry/revocation of document links if used.

**Expected:** sensitive information is protected and not exposed by logs, cross-account caches, or unintended backups; only necessary permissions remain; denial produces a usable fallback. Configuration inspection alone is not proof that data has leaked.

#### T096 — Input validation, amounts, and upload enforcement · P0 · DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Through authorized staging requests, bypass UI limits with negative/excessive quantities, altered prices/discounts, invalid dates/states, and unsupported upload metadata.
2. Test modest configured length/size limits and unexpected text characters without disrupting shared environments.
3. Verify server totals, upload type/size checks, and safe error responses.

**Expected:** authoritative server validation; client-supplied totals/roles/statuses are not trusted blindly; no unauthorized transition or accepted invalid charge. Errors reveal no private data or internal secrets.

#### T097 — Monitoring and operations readiness · P1 · DEV + OPS

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Trigger a known staging API failure, stuck assignment, failed upload, and payment awaiting reconciliation.
2. Find each event in monitoring using request/job/transaction IDs without needing private credentials in logs.
3. Have OPS resolve/retry/reassign using the documented process and inspect the audit trail.

**Expected:** failures are detectable, diagnosable, and recoverable by a named owner; users receive meaningful status; operational corrections are authorized and traceable. A screen showing Retry is insufficient if no one can resolve the underlying stuck transaction.

#### T098 — Package size, supported devices, and final smoke test · P1 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

1. Measure actual delivered download/install size for each distribution method and supported ABI/device.
2. Install the final signed artifact on the compatibility matrix; compare declared hardware requirements with optional features.
3. On that exact build run login, one complete repair, one exception, role switching, and a financial reconciliation again.

**Expected:** correct distribution/install compatibility, justified permissions/hardware requirements, size within the team's budget, and no release-only regression. Do not sign off a different APK from the one actually tested.

### O. Alternative sign-in and account linking

#### T099 — Google sign-in and external authentication, if exposed · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

**Setup:** provider test accounts, correctly configured staging provider application, and the intended signed APK. A packaged provider library does not establish that social sign-in is offered.

1. Use the visible Google sign-in entry with a new provider identity, then an existing linked identity; cancel the account chooser on a separate attempt.
2. Test denied consent where applicable, connectivity loss, provider failure, and app restart while returning from the provider.
3. Repeat on the release-signing configuration, with multiple provider accounts on the device and without required provider services if supported.

**Expected:** correct account/role, durable session, clear cancellation/error handling, and no unintended login after the user cancels. Provider credentials/tokens are validated by the backend. Signing/provider configuration works for the actual release. If the feature is not in scope, hide its entry; do not count library presence as implementation.

#### T100 — Multiple login methods, duplicate identity, and session isolation · P0 · QA + DEV

**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___

**Setup:** only controlled identities with documented linking rules for phone, email, and provider sign-in.

1. Create one identity through phone, then use another offered method associated with the same controlled person/contact details. Attempt any supported link/unlink operation with and without required reauthentication.
2. Log in on two devices; change credentials, revoke a session, or log out of all devices if supported. On one device, switch to another test account and inspect caches/push destinations.
3. Try linking an identity already owned by a different fixture; cancel an incomplete linking flow and restart.

**Expected:** intentional, verified linking or a clear duplicate-account resolution path; matching email/phone text alone does not grant another account's data. Unlinking preserves an available login/recovery method according to policy. Session revocation follows the stated scope; caches and push registrations remain attached to the correct identity. If linking is unsupported, explain that limitation rather than silently creating inconsistent histories.

## 5. Coverage, bug recording, and release decision

### 5.1 Retest the problems already observed

These are prior findings, not fresh results on a future build. Link each retest to its bug ID and evidence.

| Prior observation | Tests that should verify the fix |
| --- | --- |
| OTP intentionally bypassed | T007–T008, T093–T094 |
| HTTP API configuration and debug-named signing certificate | T094, T098 |
| Repeated non-JSON parsing/network failures | T019–T020, T092, T097 |
| Return to onboarding/blank account after restart/network trouble | T009, T013, T090 |
| Missing request details and past appointment still upcoming | T017, T029, T057 |
| Empty symptom entry advances | T023, T031–T032, T096 |
| Weak denied/unavailable-location recovery | T027–T028 |
| Identity completeness and empty professional appliance selector | T036–T041 |
| Zero credits conflicts with available status | T042, T066 |
| Inactive policy/support/AI/spare-parts/filter actions | T018, T072, T075, T080 |
| Shop placeholder/wrong titles and ambiguous search | T071–T072, T082 |
| Placeholder referral, unrelated support details, expired promotion | T018, T069–T070 |
| Incorrect completed-tab and phone-auth copy | T006, T014, T017, T086 |
| Safe-area overlap and unlabeled icons | T082–T086 |
| Appliance type/technology mixed in single-choice list | T022 |
| Unclear credit plan value | T065–T066, T089 |
| Broad permissions and backup configuration | T095, T098 |
| Large universal APK | T091, T098 |

### 5.2 Bug report template

```text
Bug ID / title:
Priority / customer impact:
Build + backend version:
Test case + variant:
Device / Android / language / connection:
Account fixture / role / verification state:
Preconditions / request or order reference:
Steps to reproduce:
1.
2.
3.
Expected result:
Actual result:
Reproduction frequency (for example 3/3):
Screenshot/video and redacted log reference:
Workaround, if any:
Developer owner / fix version:
Retest result / date / tester:
```

For visual defects, include the full screen and the failing interaction, not only a tight crop. For financial defects, include opening balance, each expected ledger movement, actual movements, and transaction references. For intermittent behavior, keep timing and network state; do not mark an unreproduced bug fixed solely because one retry passed.

### 5.3 Test run summary

```text
Candidate APK / hash:
Backend/config version:
Run date / testers:
Agreed release scope and business rules:
Device/language matrix completed:
Case variants: total __ / pass __ / fail __ / blocked __ / not run __ / out of scope __
Route destinations: discovered __ / visually inspected __ / behavior verified __
Open P0 __ / P1 __ / P2 __ / P3 __
Complete client-technician transaction evidence:
Financial reconciliation evidence:
Remaining gaps / named owner / release decision:
```

Count test variants separately and do not inflate coverage with repeated screenshots. A route is visually inspected only when its real screen/state was opened. A route is behavior-verified only after its intended action and persistence/authorization checks have passed. Layout wrappers are not standalone screens.

### 5.4 Proposed release gates

- [ ] No unresolved identity/authorization, duplicate charge, or data-integrity P0 issue.
- [ ] No P1 issue that blocks booking, professional eligibility, job completion, money reconciliation, or recovery.
- [ ] Full home-repair journey and each enabled service branch pass with independent roles.
- [ ] At least one cancellation, quote rejection, failed payment/retry, and warranty scenario pass where in scope.
- [ ] OTP, production transport, signing, permissions, and sensitive-data checks pass on the release artifact.
- [ ] Every visible feature works or is deliberately hidden; policies and support are reachable.
- [ ] French/Arabic and agreed accessibility/device coverage are complete for core flows.
- [ ] No placeholder data, misleading availability, unexplained credit rule, or expired offer presented as valid.
- [ ] Monitoring, support ownership, rollback/recovery process, and staging/production separation are ready.
- [ ] All remaining blocked/untested items are named explicitly in the release decision; no implied blanket approval.

## 6. My assessment of the design and UX

### 6.1 Overall judgment

**The app has a coherent visual starting point, but the experience currently promises more than the tested behavior can deliver.** I would keep the brand foundation and redesign the hierarchy, state handling, and transaction journey before adding more visual decoration or more modules.

The biggest UX issue is uncertainty: whether a page is empty or failed, whether a technician is available, what points buy, whether a button does anything, whether a request was saved, and what the user should do next. Good UX here means predictable outcomes and truthful information as much as attractive screens.

This critique is based on inspected client/technician screens and captured states. Workshop, electronic repair, active-job tracking, paid transaction, and other unreached screens need the tests above before receiving a specific visual judgment. Recommendations for those areas are proposed design directions, not observations of their current appearance.

### 6.2 What I would keep

- **Purple brand identity:** recognizable enough to build a consistent system around. Retain it for primary actions, active navigation, and selected states.
- **Large primary buttons:** a useful mobile pattern when the action remains visible above system/keyboard areas and the label tells the user what happens.
- **Appliance imagery:** aids recognition for users who do not know technical names. Ensure the category logic matches the imagery.
- **French and Arabic capability:** valuable for the intended context. Some inspected Arabic screens mirrored correctly; complete localization and accessibility testing rather than replace this foundation.
- **Repair history and warranty concept:** sensible extensions of the core repair relationship. Make them traceable to completed work.
- **Role-based experiences:** clients and professionals need different priorities. Keep the distinction, while making role switching discoverable and server permissions explicit.
- **Explicit empty warranty message:** a better model than a blank screen. Extend that approach to jobs, earnings, community, and catalog screens.

### 6.3 Visual system: specific changes

| Element | Current concern from inspected screens | Recommended change | How to judge improvement |
| --- | --- | --- | --- |
| Headers | Large decorative purple areas consume useful vertical space; some titles overlap system bars. | Use a compact shared header for task screens; reserve larger branded treatment for home/onboarding. Respect safe areas consistently. | On a small phone, title and useful first content are visible; no system-bar overlap. |
| Primary actions | Repeated generic “Suivant”/“Continue”; prominent plus icon relies on interpretation. | Use outcome labels at meaningful transitions: “Choisir un créneau,” “Vérifier ma demande,” “Confirmer la demande.” Label the main request action. | A new user can predict what a tap will do, especially when it submits or pays. |
| Service cards | Garanti/Flexible cards are text-heavy; the AC option starts below the fold. | Short comparable rows/cards; show service differences in the same order: timing, fee basis, guarantee, support. Make all choices discoverable before commitment. | Users can compare options without remembering long paragraphs or missing a third choice. |
| Colors | Purple, orange, and blue communicate categories, but meaning is not always explicit. | Keep brand purple; define separate semantic success/warning/error colors and pair them with text/icons. Avoid giving every secondary item a competing accent. | Selected, disabled, unavailable, error, and successful states are unambiguous. |
| Typography | Strong headings coexist with low-emphasis gray copy and dense service descriptions. | Define heading/body/helper/metadata styles; improve hierarchy and test actual contrast. Keep required information out of tiny helper text. | Fees, status, and errors remain readable with enlarged text and in Arabic. |
| Cards and whitespace | Large summary/header blocks can push the next action down; sparse screens can look unfinished. | Spend space on the user's next task; use compact summaries, clear empty states, and progress information. | Users see what to do next without scrolling through decoration or unexplained emptiness. |
| Icons | Some important icon-only controls lack useful accessibility labels; icon styles vary. | Use a consistent icon family, meaningful labels, and visible text where meaning is uncertain. Verify actual hit bounds. | Controls are understandable visually and through TalkBack. |
| Forms | Requiredness and incomplete fields are unclear; blank selection steps can advance. | Mark required/optional fields, explain why sensitive information is needed, show inline errors, and allow explicit draft saving. | Users understand what blocks final submission and can recover without retyping. |
| Feedback | Several taps show no visible outcome; loading/error/empty states are easy to confuse. | Shared loading, empty, error, offline, success, and retry components. Lock duplicate submission while explaining progress. | Every action produces an observable outcome; failure never impersonates valid empty data. |
| Localization | Mixed wording, inappropriate email/password errors in phone flows, and date formatting issues. | Centralize translated text by state and action; have a bilingual reviewer check real task flows and error messages. | Users do not need to infer what an unrelated message means. |

### 6.4 Screen-by-screen critique and redesign direction

**Onboarding and role selection.** “Tout-en-un dans une seule app” is broad and does not explain the repair service. Replace generic benefit claims with the real task: describe the problem, receive a clear proposal, and follow the intervention. Mention actual supported areas rather than imply universal coverage. Explain what “Technician” access entails, including verification. Keep onboarding short and allow returning users to sign in immediately.

**Phone login and verification.** Keep phone entry simple, with clear country-code handling. Show the destination, edit-number action, resend timing, and recovery when delivery fails. Use phone-specific errors. Do not dress up an authentication bypass as a completed user journey; it must remain a staging-only implementation state.

**Client home.** Lead with “Request a repair” and the next active appointment/request. Secondary history, warranties, and support should support that action. If profile/location is incomplete, explain what is needed rather than show an empty greeting or blank account shell. Avoid stock identity imagery that might imply a real person is already associated with a new account.

**Bottom navigation and the central plus button.** A large unlabeled plus demands learning. A clear “Demander une réparation” action is more helpful for the main task. A proposed pilot structure is Home, Requests, Help, Profile, with a clearly named request action on Home. Keep Shop as a top-level destination only if commerce is a complete, maintained product in the launch scope; validate final navigation with users before changing it.

**Service selection.** Separate the task—repair, installation, cleaning—from the level/timing of service. “Garanti” and “Flexible” describe assurance and fulfillment conditions; AC describes an appliance/service category. Mixing them makes comparison harder. Show available options after enough location/service information exists, and explain actual differences without unsupported “available now” claims.

**Appliance selection.** A two-door refrigerator can also be NoFrost and Inverter. These should not be competing exclusive types. Ask for appliance family and essential form factor; add optional technology/model information if it helps dispatch. Include “Je ne sais pas.” Do not make customers diagnose the device technically before they can request help.

**Problem description and media.** Start with a few clear symptoms, then optional details/photo/audio. State whether a diagnostic visit is an acceptable fallback. Explain recording/upload progress, allow preview/delete, and keep optional media from becoming a barrier. Preserve input when users go back to correct the appliance.

**Address/map.** The map should confirm a location, not become the only way to describe one. Provide street/building/unit/landmark fields and an explicit permission-denied path. Show the selected address and service coverage before Continue. Do not silently accept a default neighborhood or city. Manual entry is essential when GPS or geocoding is inaccurate.

**Date and final review.** These need further complete-flow inspection. Proposed design: show a clear slot/timezone, summary sections with Edit actions, fee/estimate breakdown, and the distinction between a request and a confirmed appointment. Explain when the final repair price will be quoted and who approves changes. Do not present estimated repair cost as fixed if diagnosis can change it.

**Request history/detail.** Use a visible status timeline and a next-action card, with appointment, technician when assigned, issue, address, and financial summary. Every list/detail value must agree. Overdue unresolved work should explicitly say what happens next. Completed empty states should say no completed requests, not infer that the user's appliance is healthy.

**Tracking, quote, and completion screens.** These were not fully visually tested. Proposed design: show technician identity, reliable last update, and contact/support context during tracking; line-item costs and Accept/Decline on quotes; distinct work-completed and payment-settled states at closure. A rejected quote or completion dispute deserves its own explanatory state rather than a dead end.

**Technician home.** The inspected view gave substantial space to zero rating/tasks/points while the professional profile was incomplete. Prioritize an actionable verification checklist, work area, availability reason, and next job. Show “Pas encore évalué” for no reviews. Once active, prioritize urgent decisions and today's schedule over decorative metrics.

**Professional onboarding.** Break it into understandable sections: identity, professional/business status, skills, work area/hours, final review. Show progress and save/resume. Explain which documents are required for the chosen profile and who can view them. Draft navigation may allow incomplete steps, but submission must show a complete list of unresolved requirements. Rejection should explain what to correct.

**Rewards/credits and offers.** The zero-credit/available contradiction is a logic issue made visible through design. Separate “work credits” from any loyalty rewards if they are different concepts. Explain balance, reserved amount, transaction history, when a job costs credits, and refund rules. Replace vague “up to clients” and savings claims with a clear, verifiable comparison. Do not push purchase before explaining its value.

**Earnings/reporting.** Zero-state screens should explain when earnings appear. Active accounts need a transaction list, date range, gross/net distinction, fees/refunds, and reconciliation references. Charts are optional; trustworthy numbers and clear definitions are the priority. A failed fetch must never look like a real zero balance.

**Shop/search.** Correct titles and data identity first: a product search cannot be titled repair request, and a brand card should not pair an unrelated person's name with a storefront. Then implement predictable brand/category/product navigation, search/filter state, prices/stock, and a complete order process. If that scope is not ready, hide commerce in the pilot.

**Support/policies.** Use the actual company identity and verified channels. Explain response hours and let users include a request reference easily. Terms and service policy must open reliably. Unrelated branding and nonresponsive support undermine confidence exactly when a customer needs reassurance.

**Referral/promotions.** An empty authentic account state is preferable to fake social proof. Use real per-account links and earned/pending reward status. Show eligibility and expiration prominently. Remove expired offers from active promotions or label them clearly in history.

**Community and AI.** Each needs a clear customer/professional purpose. Empty community should explain membership and conduct; real posting requires moderation ownership. An AI assistant should have a bounded useful role, such as collecting symptoms or explaining service policies, without pretending to confirm availability, price, or completed bookings. Hide unfinished entry points.

**Account/profile.** Make security actions fit the login method; a phone-only user should not be told to supply an unknown old password. Clearly separate account information, professional verification, preferences, support, and data/privacy actions. Role switching should be easy to find without suggesting that choosing a role grants verification.

### 6.5 Example copy improvements

These are suggested French drafts; validate them against actual product behavior and have a bilingual reviewer produce equivalent Arabic copy.

| Situation | Suggested copy | Why |
| --- | --- | --- |
| Empty completed history | “Aucune intervention terminée pour le moment.” | Describes the tab without claiming appliance health. |
| No reviews | “Pas encore évalué” | Avoids representing lack of reviews as a bad score. |
| Location denied | “Vous pouvez saisir votre adresse sans activer la localisation.” + “Saisir mon adresse” | Gives an immediate alternative. |
| Connection problem | “Impossible de charger vos demandes. Vérifiez votre connexion et réessayez.” | Identifies failed loading instead of pretending there are no requests. |
| Matching, no provider yet | “Nous recherchons un technicien disponible dans votre zone.” | Does not invent an assignment or guarantee immediate availability. |
| Pending verification | “Votre dossier est en cours d'examen.” + actual next step/response expectation | Explains state without an unsupported fixed-time promise. |
| Zero credits when policy blocks work | “Vous ne pouvez pas accepter de nouvelles missions avec ce solde.” | Matches eligibility; add the exact recharge/refund rules nearby. |
| Missing required specialty | “Sélectionnez au moins une spécialité pour continuer.” | Precise corrective action, only if at least one is actually required. |
| Missing specialty catalog | “Impossible de charger les spécialités.” + “Réessayer” | Different from a valid empty selection. |
| Quote approval | “Accepter le devis de [montant] DA” | Makes the monetary commitment explicit. |

### 6.6 Proposed core flows

```text
CLIENT
Home → choose repair/installation/cleaning → describe appliance/problem
→ confirm address → choose eligible service/slot → review request and fee basis
→ submit → matching/assignment → diagnosis → review quote
→ approve or decline → repair → completion confirmation/payment as agreed
→ receipt + eligible warranty + review + support if needed

TECHNICIAN
Account → identity/business/skills/coverage → final review → verification
→ set availability → eligible opportunity → accept → travel/arrival
→ diagnosis/quote → wait for client approval → perform work
→ completion/disagreement handling → reconciled earnings/credits/history
```

This is a proposal to validate, not a claim that the APK follows this exact sequence. Payment timing and warranty eligibility must follow the product decisions in section 2.4.

## 7. What to fix, change, add, improve, and remove

### 7.1 Fix before public use

| Priority | Fix | User/business impact | Done when |
| --- | --- | --- | --- |
| P0 | Real verification and server-side authorization | Protects account ownership and professional actions. | T007–T010, T041, T093 pass; no production bypass. |
| P0 | Secure transport and production build configuration | Protects account/transaction exchanges and release integrity. | T094 passes on the exact release artifact. |
| P0 | Idempotent booking, assignment, approval, payments, credits | Prevents duplicate work/charges and contradictory balances. | T020, T032, T046, T049–T054, T066 pass. |
| P1 | API parsing/error states and session restoration | Prevents blank shells, loops, and unnecessary reauthentication. | T009, T019, T090, T092 pass with controlled failures. |
| P1 | Required intake/location/verification validation | Produces dispatchable requests and eligible professionals. | T023, T026–T028, T036–T041 pass. |
| P1 | Request status/detail consistency | Makes appointment and repair progress dependable. | T017, T035, T050–T060 reconcile across roles. |
| P1 | Availability/credit rule consistency | Prevents misleading job availability and purchase pressure. | T042, T065–T067 pass for each balance/status combination. |
| P1 | Nonresponsive controls and support/policies | Makes visible promises real and provides help during failures. | All retained entries respond and their complete tasks pass. |
| P2 | Placeholder content and incorrect copy | Restores product credibility. | No fake referrals, stale active promotions, wrong headings, or unrelated support identity. |
| P2 | Safe areas, accessible controls, and localization | Makes essential flows usable across devices/languages. | T082–T087 pass on the agreed matrix. |

### 7.2 Change the product structure

**Make repair the primary product.** Choose a small supported service area and limited appliance scope for the pilot. Build operational reliability around that scope before widening it. Having more tabs does not prove stronger product value.

**Separate task selection from service assurance.** Let users choose what they need, then present eligible timing/guarantee options. This reduces the current mixture of appliance category, urgency, and warranty promise.

**Make eligibility an explicit state.** A technician should always know whether they can take work and why: incomplete profile, pending verification, outside work hours, no credits, busy, or suspended. Avoid scattered rules independently computed on different screens.

**Separate job, quote, payment, and warranty states.** One overloaded “completed” status cannot explain whether work is accepted, money settled, and warranty issued. Give users one understandable summary while retaining these separate backend concepts.

**Use an auditable credit model.** If credits are a core business choice, clearly define the purchase unit and charging event. If that model cannot be explained simply to technicians, reconsider it before adding more plans. Do not call paid credits “rewards” unless that is truly what they are.

### 7.3 Add or verify these capabilities

These were missing from inspected areas or could not be verified. They are recommendations to check against source/backend/product scope, not claims that no implementation exists anywhere.

| Capability | Purpose | Minimum useful implementation | Priority |
| --- | --- | --- | --- |
| Final request summary | Prevents wrong location/service/fee commitments. | Editable sections, explicit fee basis, clear submit action. | P1 |
| Durable draft/save-resume | Protects time spent on forms and uploads. | Recover after back/restart; clear unsaved-change policy. | P1 |
| Manual address fallback | Keeps booking possible when GPS fails. | Search/text + building details + pin confirmation + coverage validation. | P1 |
| Status timeline and next action | Explains who must act and what happens next. | Actor/status/time, customer-friendly wording, overdue/escalation state. | P1 |
| Server-backed verification checklist | Stops incomplete professional profiles looking eligible. | Required items, pending/rejected reasons, correction/resubmission. | P1 |
| Quote versions and explicit consent | Protects both parties when costs change. | Line items, amount, version, approval timestamp, revised-quote handling. | P0 |
| Cancellation/no-show/dispute flow | Covers normal service failures. | Clear consequences, reason, notification, refund/credit treatment, support owner. | P1 |
| Receipt/warranty linked to original job | Supports trust and aftercare. | Correct issuer, coverage, dates, amount, request reference, claim path. | P1 |
| Credit and earnings ledger | Explains money movement. | Opening/closing balance, reason/reference, reservation/spend/refund entries. | P0 |
| Useful error/offline/retry states | Prevents failure from looking like empty data. | Screen-specific message, retained draft, safe retry, stale indicators. | P1 |
| Contextual support | Reduces repetitive explanation during disputes. | Request reference, support channel, case/status where supported. | P1 |
| Account/data lifecycle controls | Gives users a discoverable management path. | Edit/security/deletion process and clear document-use explanation. | P1 |
| Operations dashboard or equivalent tools | Lets the team resolve real service failures. | Verification, reassignment, stuck transaction handling, dispute decisions, audit trail. | P1 |
| Monitoring and release checks | Finds failures before users must explain them. | Redacted correlated logs, crash/error tracking, release signing/config checks. | P1 |
| Honest customer/technician feedback | Tests whether the service is useful, not just navigable. | Feedback tied to actual completed work; no sample social proof. | P2 |

### 7.4 Remove or hide until ready

- **AI chat:** hide the active-looking entry while it does not respond. Retain it later only if it reliably helps a real task.
- **Shop:** remove from primary pilot navigation if catalog, stock, orders, payment/fulfilment, returns, and support are not complete. A partial commerce promise creates a second business to operate.
- **Community:** defer if there is no clear audience benefit and moderation owner. An empty feed is not a reason to manufacture activity.
- **Fake referral people, placeholder URLs, sample support contacts, and expired active offers:** remove from production data immediately; use honest empty states.
- **Redundant decorative header space:** reduce on task screens where it pushes essential content below the fold.
- **Unconditional availability/savings/guarantee claims:** replace with verified conditions and specific terms.
- **Irrelevant password actions for phone-only accounts:** conditionally show the security actions the account can actually use.
- **Unused permissions, libraries, and hardware requirements:** remove after dependency/feature review, not by guessing from unvisited screens.
- **Duplicate or inaccessible routes:** confirm intended reachability; delete dead implementation only after source review and regression coverage. Route names alone are insufficient reason to remove code.

Do not remove working accessibility, Arabic support, warranty history, or support access to simplify scope. These strengthen the core service rather than distract from it.

### 7.5 Improve the implementation behind the screens

These recommendations follow the observed failure patterns; source code was not available, so they are not a diagnosis of specific implementation files.

1. **Central response handling:** check status/content type, normalize validation/auth/network/server errors, provide useful retries, and back off polling. Keep log identifiers without leaking secrets.
2. **Explicit session restoration:** distinguish checking credentials, offline recovery, expired credentials, and profile loading. Never clear identity merely because a network request failed.
3. **Server-controlled transitions:** validate current state, actor/ownership, quote version, and professional eligibility for every write. Record who changed what and why.
4. **Exactly-once business effects:** use idempotency and atomic reservations for assignments, submissions, payment callbacks, credits, refunds, and reviews. Transport requests may repeat; the business operation must not duplicate.
5. **Clear shared data models:** list, detail, notifications, reports, and both roles should agree on units, amounts, dates, and status definitions. Invalidate/refresh stale caches after mutations.
6. **Reusable presentation states/components:** headers, input validation, loading/empty/error states, bottom sheets, status chips, and translated text should behave consistently across roles.
7. **Permission and media lifecycle:** request access only for the invoked feature, give a fallback, validate uploads on the server, and manage cancellation/retry/deletion intentionally.
8. **Targeted regression automation:** automate server authorization/state/financial invariants and a small set of critical end-to-end journeys. Keep usability, language quality, and physical-device permission checks in human review. Avoid mistaking large test counts for useful coverage.

### 7.6 Questions the business must answer in the product

- Why should a customer trust this technician and this guarantee?
- What will the customer pay if the problem cannot be fixed, the quote is declined, or nobody arrives?
- Who buys parts, who owns replaced parts, and what happens when a part is unavailable?
- How long can a request wait, and who acts when matching or confirmation expires?
- What exactly does one technician credit buy, and when is it refundable?
- Who resolves disagreement about completion, payment, damage, or warranty coverage?
- How does a technician know the net income from a job before committing?
- Which areas/service categories actually have enough verified supply to support the promises shown?

These are operational decisions to encode in the UI, backend, and support process. Adding polished screens without these answers will not solve the underlying UX problems.

## 8. Recommended implementation order

### Phase 1 — Establish a safe, stable foundation

Complete authentication/authorization, production signing/transport, error handling, and session restoration. Create the independent test accounts, realistic fixtures, and basic monitoring. Replace known placeholder contacts/data. Exit only after the identity/security cases and startup/failure smoke tests pass.

### Phase 2 — Finish one complete repair transaction

Resolve intake, appliance taxonomy, address fallback, appointment rules, assignment, diagnosis, quote approval, completion, payment/receipt, and cancellation. Reconcile both sides and money. Run T035 repeatedly across the normal, rejected-quote, cancelled, and failed-payment variants. Do not split ownership so that each screen is “done” but the job cannot complete.

### Phase 3 — Make the professional side operational

Finish verification, eligibility, coverage/hours, credits, earnings, and support/reassignment. Prove that incomplete accounts cannot take jobs and that credits/availability agree. Document who handles a stalled job or disputed completion.

### Phase 4 — Polish the core experience

Fix safe areas, navigation labels, service comparison, forms, state-specific copy, French/Arabic, text scaling, and screen-reader behavior. Run uncoached client/technician usability sessions; address misunderstanding of price, guarantee, verification, or credits before cosmetic preferences.

### Phase 5 — Pilot, measure, then expand

Run a controlled pilot in the chosen service area. Track request completion, matching rate/time, arrival reliability, quote acceptance, repair resolution, cancellation/no-show rate, disputes/warranty callbacks, support cost, repeat customers, and technician net earnings. Decide thresholds from actual service expectations and pilot evidence. Expand workshop/AC/electronic coverage and secondary modules only when they have complete tested workflows and operational owners.

### Suggested ownership

| Work | Accountable role | Evidence of completion |
| --- | --- | --- |
| Business rules and release scope | Product owner/PM | Approved rules in section 2.4 and hidden out-of-scope features. |
| State, authorization, money, APIs | Backend lead | Contract/security/ledger tests and correlated staging records. |
| Navigation, forms, recovery, permissions | Mobile lead | Passing core journeys on final APK and device matrix. |
| Visual hierarchy, language, accessibility | Design + bilingual reviewer + QA | Before/after screens and successful usability/accessibility runs. |
| Verification, disputes, support, service supply | Operations | Tested processes, named owners, and traceable interventions. |
| Final test evidence and sign-off | QA + product/engineering leads | Filled run summary, known remaining gaps, release decision. |

No reliable duration estimate can be made from the APK alone. Break the phases into tickets with a test ID, owner, expected behavior, and evidence requirement; estimate after source/backend review. The order above prioritizes risk and dependency rather than a speculative calendar.

### Example engineering ticket

```text
Title: Recover booking after location permission denial
Problem: The denied/unavailable-location path can leave a blank address/map
         and no useful progress after confirmation.
Required behavior: Explain the missing permission; allow manual address
                   entry and confirm a validated supported destination.
Scope: Client home-repair flow; reuse for AC/warranty where applicable.
Acceptance: T027 and T028 pass in French/Arabic, with GPS denied,
            permanently denied, unavailable, and later restored.
Regression: Prior appliance/problem/media data remains intact;
            submitted address matches what the technician receives.
Evidence: Video + paired client/technician request data + test build ID.
```

## 9. Packaged route inventory and coverage worksheet

The compiled APK contains **126 route entries** below, including layout wrappers. Names are extracted strings, not available source files, and do not prove that the destinations are implemented, reachable, or enabled. Some screens are accessible only after specific account/job states. Extra dialogs, sheets, and server-controlled states may exist without a separate route.

For each non-layout row, record its actual visible title and how it is reached. Prepare the required job/profile fixture, open it through the supported UI or authorized test tooling, run the mapped tests and section 3 checklist, then mark **Seen** and **Verified** separately. Do not bypass permissions to reach an inaccessible screen. Investigate whether it is intentionally out of scope, missing a fixture, or a navigation defect.

The boxes below are blank for the next test run; they do not erase prior audit observations. **Seen** means visually opened. **Verified** means its intended behavior passed. For layout wrappers, record navigation/child-screen checks instead of pretending the wrapper is another screen. Shared screens must be checked for every entitled role even if they share one route.

| Packaged route | Purpose to verify | Relevant tests | Seen / verified / actual title or blocker |
| --- | --- | --- | --- |
| `./(ac)/(tabs)/_layout.tsx` | Layout wrapper; verify through child screens | T001, T005, T081 | Seen: __ · Verified: __ · Notes: __ |
| `./(ac)/(tabs)/community.tsx` | AC community | T078–T079 | Seen: __ · Verified: __ · Notes: __ |
| `./(ac)/(tabs)/index.tsx` | AC professional workflow; repeat with AC fixture | T034, T042–T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(ac)/(tabs)/profile.tsx` | AC professional profile | T018, T036–T043 | Seen: __ · Verified: __ · Notes: __ |
| `./(ac)/requests/benefits-calculation/index.tsx` | AC professional workflow; repeat with AC fixture | T034, T042–T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(ac)/requests/client-refused-last/index.tsx` | AC professional workflow; repeat with AC fixture | T034, T042–T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(ac)/requests/client-rejected/index.tsx` | AC professional workflow; repeat with AC fixture | T034, T042–T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(ac)/requests/profit-calculation/index.tsx` | AC professional workflow; repeat with AC fixture | T034, T042–T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(ac)/requests/reparation-ongoing/index.tsx` | AC professional workflow; repeat with AC fixture | T034, T042–T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(ac)/requests/request-overview/index.tsx` | AC professional workflow; repeat with AC fixture | T034, T042–T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(ac)/requests/request-started/index.tsx` | AC professional workflow; repeat with AC fixture | T034, T042–T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(ac)/requests/waiting-confirmation/index.tsx` | AC professional workflow; repeat with AC fixture | T034, T042–T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/(tabs)/_layout.tsx` | Layout wrapper; verify through child screens | T001, T005, T081 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/(tabs)/index.tsx` | Client home | T016–T017, T021 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/(tabs)/profile.tsx` | Client profile | T013–T018, T069–T070, T080 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/(tabs)/requests.tsx` | Client request list | T017 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/(tabs)/shop.tsx` | Shop tab | T071–T074 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/ac-installation/confirm/index.tsx` | AC intake | T034, T024–T032 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/ac-installation/detect-location/index.tsx` | AC intake | T034, T024–T032 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/ac-installation/location/index.tsx` | AC intake | T034, T024–T032 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/ac-installation/request-details/index.tsx` | AC intake | T034, T024–T032 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/ac-installation/select-date/index.tsx` | AC intake | T034, T024–T032 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/ac-installation/service-ac/index.tsx` | AC intake | T034, T024–T032 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/confirm/index.tsx` | Request review/submission | T030–T032 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/detect-location/index.tsx` | Address/location intake | T026–T028 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/deviceproblem/index.tsx` | Problem/media intake | T023–T025, T030 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/devicetype/index.tsx` | Appliance selection | T022 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/location/index.tsx` | Address/location intake | T026–T028 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/search/index.tsx` | Repair service selection/search | T021–T023, T033 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/select-date/index.tsx` | Appointment scheduling | T029 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/domicile/servicetype/index.tsx` | Repair service selection/search | T021–T023, T033 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/shared/add-address/index.tsx` | Address/location intake | T026–T028 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/warranty/detect-location/index.tsx` | Warranty intake | T059–T060, T026–T028 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/warranty/location/index.tsx` | Warranty intake | T059–T060, T026–T028 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/warranty/select-problem/index.tsx` | Warranty intake | T059–T060, T026–T028 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/warranty/select-warranty/index.tsx` | Warranty intake | T059–T060, T026–T028 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/workshop/deviceproblem/index.tsx` | Workshop intake | T061–T063, T023–T028 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/reparation/workshop/workshop-location/index.tsx` | Workshop intake | T061–T063, T023–T028 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/requests/ac/requests/request-details/[id]/confirmation/index.tsx` | Client approval/confirmation; verify stage | T049–T053, T056 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/requests/ac/requests/request-details/[id]/index.tsx` | Client job detail (repeat per service) | T017, T034–T035, T045–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/requests/ac/requests/request-details/[id]/track-technician/index.tsx` | Client tracking | T047, T092 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/requests/domicile/request-details/[id]/confirmation/index.tsx` | Client approval/confirmation; verify stage | T049–T053, T056 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/requests/domicile/request-details/[id]/index.tsx` | Client job detail (repeat per service) | T017, T034–T035, T045–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/requests/domicile/request-details/[id]/last-confirmation/index.tsx` | Client approval/confirmation; verify stage | T049–T053, T056 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/requests/domicile/request-details/[id]/repair-location-confirmation/index.tsx` | Client location confirmation | T026–T028, T047 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/requests/domicile/request-details/[id]/track-technician/index.tsx` | Client tracking | T047, T092 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/requests/warranty/request-details/[id]/index.tsx` | Client warranty request | T059–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/requests/workshop/request-details/[id]/confirmation/index.tsx` | Client workshop request/confirmation | T061–T063, T056–T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/requests/workshop/request-details/[id]/index.tsx` | Client workshop request/confirmation | T061–T063, T056–T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/shop/brand/[id]/index.tsx` | Catalog/search/product | T071–T074 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/shop/brand/[id]/product/[productID]/index.tsx` | Catalog/search/product | T071–T074 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/shop/brand/[id]/product/[productID]/order/index.tsx` | Product order | T073–T074 | Seen: __ · Verified: __ · Notes: __ |
| `./(client)/shop/search/index.tsx` | Catalog/search/product | T071–T074 | Seen: __ · Verified: __ · Notes: __ |
| `./(electronic)/(tabs)/_layout.tsx` | Layout wrapper; verify through child screens | T001, T005, T081 | Seen: __ · Verified: __ · Notes: __ |
| `./(electronic)/(tabs)/community.tsx` | Electronic-repair community | T078–T079 | Seen: __ · Verified: __ · Notes: __ |
| `./(electronic)/(tabs)/index.tsx` | Electronic-repair workflow | T064, T049–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./(electronic)/(tabs)/profile.tsx` | Electronic-repair profile | T018, T036–T043, T064 | Seen: __ · Verified: __ · Notes: __ |
| `./(electronic)/request/incoming/index.tsx` | Electronic-repair workflow | T064, T049–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./(electronic)/request/ongoing/index.tsx` | Electronic-repair workflow | T064, T049–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./(electronic)/request/ready/index.tsx` | Electronic-repair workflow | T064, T049–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/(tabs)/_layout.tsx` | Layout wrapper; verify through child screens | T001, T005, T081 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/(tabs)/community.tsx` | Technician community | T078–T079 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/(tabs)/index.tsx` | Technician home | T041–T044 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/(tabs)/profile.tsx` | Technician profile | T018, T036–T043, T065–T070, T075 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/offers/index.tsx` | Credit offers | T065–T066 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/registration/detect-location-workshop/index.tsx` | Professional type/work configuration | T036–T041, T061 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/registration/detect-location/index.tsx` | Professional type/work configuration | T036–T041, T061 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/registration/domain/index.tsx` | Professional skills/catalog | T038 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/registration/domain/select-devices/index.tsx` | Professional skills/catalog | T038 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/registration/identity-verification/index.tsx` | Professional identity submission | T036 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/registration/pending/index.tsx` | Verification outcome | T040–T041 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/registration/rejected/index.tsx` | Verification outcome | T040–T041 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/registration/status/index.tsx` | Business status | T037 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/registration/techniciantype/index.tsx` | Professional type/work configuration | T036–T041, T061 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/registration/work-configuration-tech-only/index.tsx` | Professional type/work configuration | T036–T041, T061 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/registration/work-configuration-workshop-only/index.tsx` | Professional type/work configuration | T036–T041, T061 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/domicile/benefits-calculation/index.tsx` | Job financial calculation; verify meaning | T049, T054, T067 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/domicile/client-accepted-last/index.tsx` | Final approval/refusal/waiting | T052–T054, T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/domicile/client-refused-last/index.tsx` | Final approval/refusal/waiting | T052–T054, T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/domicile/client-rejected/index.tsx` | Client rejection; verify exact stage | T050, T052, T056 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/domicile/diagnostic/index.tsx` | Diagnosis/service detail | T048–T050 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/domicile/gaz/index.tsx` | Diagnosis/service detail | T048–T050 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/domicile/generate-warranty/index.tsx` | Warranty creation | T059–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/domicile/profit-calculation/index.tsx` | Job financial calculation; verify meaning | T049, T054, T067 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/domicile/reparation-ongoing/index.tsx` | Job execution | T047–T054, T056–T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/domicile/request-overview/index.tsx` | Opportunity overview | T044–T046 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/domicile/request-started/index.tsx` | Job execution | T047–T054, T056–T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/domicile/waiting-last-confirmation/index.tsx` | Final approval/refusal/waiting | T052–T054, T058 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/domicile/waiting-location-confirmation/index.tsx` | Awaiting location confirmation | T047 | Seen: __ · Verified: __ · Notes: __ |
| `./(technician)/requests/nearby/index.tsx` | Nearby work | T041–T046 | Seen: __ · Verified: __ · Notes: __ |
| `./(workshop)/(tabs)/_layout.tsx` | Layout wrapper; verify through child screens | T001, T005, T081 | Seen: __ · Verified: __ · Notes: __ |
| `./(workshop)/(tabs)/community.tsx` | Workshop community | T078–T079 | Seen: __ · Verified: __ · Notes: __ |
| `./(workshop)/(tabs)/index.tsx` | Workshop operation | T061–T063, T049–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./(workshop)/(tabs)/profile.tsx` | Workshop professional profile | T018, T036–T043 | Seen: __ · Verified: __ · Notes: __ |
| `./(workshop)/diagnostic/index.tsx` | Workshop operation | T061–T063, T049–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./(workshop)/diagnostic/make-diagnostic/index.tsx` | Workshop operation | T061–T063, T049–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./(workshop)/ongoing/index.tsx` | Workshop operation | T061–T063, T049–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./(workshop)/pending/index.tsx` | Workshop operation | T061–T063, T049–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./(workshop)/ready/index.tsx` | Workshop operation | T061–T063, T049–T060 | Seen: __ · Verified: __ · Notes: __ |
| `./_layout.tsx` | Layout wrapper; verify through child screens | T001, T005, T081 | Seen: __ · Verified: __ · Notes: __ |
| `./auth/confirmation_otp.tsx` | Phone/code verification | T006–T009, T012 | Seen: __ · Verified: __ · Notes: __ |
| `./auth/emailsignin.tsx` | Sign-in/registration | T006–T014 | Seen: __ · Verified: __ · Notes: __ |
| `./auth/magic/[token].tsx` | Authentication/recovery | T012, T081, T093 | Seen: __ · Verified: __ · Notes: __ |
| `./auth/phone-otp.tsx` | Phone/code verification | T006–T009, T012 | Seen: __ · Verified: __ · Notes: __ |
| `./auth/recover/forgotpassword.tsx` | Authentication/recovery | T012, T081, T093 | Seen: __ · Verified: __ · Notes: __ |
| `./auth/recover/newpassword.tsx` | Authentication/recovery | T012, T081, T093 | Seen: __ · Verified: __ · Notes: __ |
| `./auth/recover/otp.tsx` | Authentication/recovery | T012, T081, T093 | Seen: __ · Verified: __ · Notes: __ |
| `./auth/signin.tsx` | Sign-in/registration | T006–T014 | Seen: __ · Verified: __ · Notes: __ |
| `./auth/signup.tsx` | Sign-in/registration | T006–T014 | Seen: __ · Verified: __ · Notes: __ |
| `./auth/usertype.tsx` | Role choice | T004, T010 | Seen: __ · Verified: __ · Notes: __ |
| `./index.tsx` | Entry/onboarding | T001–T005 | Seen: __ · Verified: __ · Notes: __ |
| `./notifications/index.tsx` | Notification inbox | T076–T077, T081 | Seen: __ · Verified: __ · Notes: __ |
| `./onboarding.tsx` | Entry/onboarding | T001–T005 | Seen: __ · Verified: __ · Notes: __ |
| `./profile/account-information/index.tsx` | Account information | T013–T015 | Seen: __ · Verified: __ · Notes: __ |
| `./profile/availability/index.tsx` | Professional availability | T039, T042 | Seen: __ · Verified: __ · Notes: __ |
| `./profile/care/index.tsx` | Shared profile destination; establish actual purpose | T018, T005 | Seen: __ · Verified: __ · Notes: __ |
| `./profile/identity-verification/index.tsx` | Identity verification | T036–T041 | Seen: __ · Verified: __ · Notes: __ |
| `./profile/my-revenues/index.tsx` | Revenue/reporting | T054, T065–T068 | Seen: __ · Verified: __ · Notes: __ |
| `./profile/my-revenues/reports/index.tsx` | Revenue/reporting | T054, T065–T068 | Seen: __ · Verified: __ · Notes: __ |
| `./profile/my-revenues/revenues/index.tsx` | Revenue/reporting | T054, T065–T068 | Seen: __ · Verified: __ · Notes: __ |
| `./profile/my-revenues/rewards/index.tsx` | Rewards/credits | T042, T065–T068 | Seen: __ · Verified: __ · Notes: __ |
| `./profile/promo-codes/index.tsx` | Promotions | T030, T069 | Seen: __ · Verified: __ · Notes: __ |
| `./profile/support/index.tsx` | Support | T018, T058 | Seen: __ · Verified: __ · Notes: __ |
| `./profile/vouchers-warranties/[id]/index.tsx` | Warranty/voucher; verify actual purpose | T059–T060, T074 | Seen: __ · Verified: __ · Notes: __ |
| `./profile/vouchers-warranties/index.tsx` | Warranty/voucher; verify actual purpose | T059–T060, T074 | Seen: __ · Verified: __ · Notes: __ |
| `./profile/vouchers-warranties/shop/[id]/index.tsx` | Warranty/voucher; verify actual purpose | T059–T060, T074 | Seen: __ · Verified: __ · Notes: __ |

### Non-route states to inventory separately

- Permission dialogs and return-from-settings screens.
- Loading, offline, timeout, invalid-session, and non-JSON error states.
- Empty lists, no search results, no nearby supply, and no eligible warranty.
- Action sheets, date/time pickers, address pickers, photo/audio previews, and upload failures.
- Validation messages, unsaved-change confirmation, logout, cancellation, and payment confirmation dialogs.
- Pending/rejected/verified/suspended professional variants and zero/reserved/positive credit variants.
- Quote waiting/revised/rejected/expired and completion disputed/no-response variants.
- External payment/support/share destinations and return paths.
- Role-specific variants of shared profile, notification, account, and warranty screens.
- Any additional destination discovered during testing; append it to this inventory with a test ID.

### Supporting earlier evidence

The testing instructions and recommendations above are self-contained. These files supply background evidence from the earlier audit, not pass results for this plan:

- [Earlier full APK/product audit](<C:/Users/HP/Documents/New project/audit/REPORT.md>)
- [Shop search: wrong title and safe-area overlap](<C:/Users/HP/Documents/New project/audit/evidence/37-search-ready.png>)
- [Professional appliance selector: empty state](<C:/Users/HP/Documents/New project/audit/evidence/96-tech-devices-settled.png>)
- [Credits: contradictory availability](<C:/Users/HP/Documents/New project/audit/evidence/109-rewards.png>)
- [Credit offers: value and charging rules need explanation](<C:/Users/HP/Documents/New project/audit/evidence/110-credit-offers.png>)

Earlier captures include repeats and loading/error states. Some early screenshots can lag their paired UI hierarchy, as documented in the original audit. Keep raw evidence private and review/redact account details before sharing it outside the project team.

