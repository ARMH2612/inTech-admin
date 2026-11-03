from pathlib import Path
import re

root = Path(__file__).parent
path = root / 'INTECH_TEST_PLAN_AND_UX_REVIEW.md'
text = path.read_text(encoding='utf-8')
routes = (root / 'static' / 'routes.txt').read_text(encoding='utf-8').splitlines()
routes = [r.strip() for r in routes if r.strip()]

def coverage(route):
    if '_layout.tsx' in route:
        return 'Layout wrapper; verify through child screens', 'T001, T005, T081'
    if route in ('./index.tsx', './onboarding.tsx'):
        return 'Entry/onboarding', 'T001–T005'
    if route.startswith('./auth/'):
        if 'magic/' in route or '/recover/' in route:
            return 'Authentication/recovery', 'T012, T081, T093'
        if 'otp' in route:
            return 'Phone/code verification', 'T006–T009, T012'
        if 'usertype' in route:
            return 'Role choice', 'T004, T010'
        return 'Sign-in/registration', 'T006–T014'
    if route.startswith('./notifications/'):
        return 'Notification inbox', 'T076–T077, T081'
    if route.startswith('./profile/'):
        if 'account-information' in route:
            return 'Account information', 'T013–T015'
        if 'availability' in route:
            return 'Professional availability', 'T039, T042'
        if 'identity-verification' in route:
            return 'Identity verification', 'T036–T041'
        if 'my-revenues/rewards' in route:
            return 'Rewards/credits', 'T042, T065–T068'
        if 'my-revenues' in route:
            return 'Revenue/reporting', 'T054, T065–T068'
        if 'promo-codes' in route:
            return 'Promotions', 'T030, T069'
        if 'support' in route:
            return 'Support', 'T018, T058'
        if 'vouchers-warranties' in route:
            return 'Warranty/voucher; verify actual purpose', 'T059–T060, T074'
        return 'Shared profile destination; establish actual purpose', 'T018, T005'
    if route.startswith('./(client)/'):
        if '/(tabs)/' in route:
            if '/shop.' in route:
                return 'Shop tab', 'T071–T074'
            if '/requests.' in route:
                return 'Client request list', 'T017'
            if '/profile.' in route:
                return 'Client profile', 'T013–T018, T069–T070, T080'
            return 'Client home', 'T016–T017, T021'
        if '/shop/' in route:
            if '/order/' in route:
                return 'Product order', 'T073–T074'
            return 'Catalog/search/product', 'T071–T074'
        if '/reparation/' in route:
            if '/workshop/' in route:
                return 'Workshop intake', 'T061–T063, T023–T028'
            if '/warranty/' in route:
                return 'Warranty intake', 'T059–T060, T026–T028'
            if '/ac-installation/' in route:
                return 'AC intake', 'T034, T024–T032'
            if any(k in route for k in ('location/', 'add-address/')):
                return 'Address/location intake', 'T026–T028'
            if '/select-date/' in route:
                return 'Appointment scheduling', 'T029'
            if '/confirm/' in route:
                return 'Request review/submission', 'T030–T032'
            if '/devicetype/' in route:
                return 'Appliance selection', 'T022'
            if '/deviceproblem/' in route:
                return 'Problem/media intake', 'T023–T025, T030'
            return 'Repair service selection/search', 'T021–T023, T033'
        if '/requests/' in route:
            if '/workshop/' in route:
                return 'Client workshop request/confirmation', 'T061–T063, T056–T058'
            if '/warranty/' in route:
                return 'Client warranty request', 'T059–T060'
            if '/track-technician/' in route:
                return 'Client tracking', 'T047, T092'
            if '/repair-location-confirmation/' in route:
                return 'Client location confirmation', 'T026–T028, T047'
            if '/confirmation/' in route or '/last-confirmation/' in route:
                return 'Client approval/confirmation; verify stage', 'T049–T053, T056'
            return 'Client job detail (repeat per service)', 'T017, T034–T035, T045–T060'
    if route.startswith('./(technician)/'):
        if '/registration/' in route:
            if any(k in route for k in ('pending/', 'rejected/')):
                return 'Verification outcome', 'T040–T041'
            if '/domain/' in route:
                return 'Professional skills/catalog', 'T038'
            if '/identity-verification/' in route:
                return 'Professional identity submission', 'T036'
            if '/status/' in route:
                return 'Business status', 'T037'
            return 'Professional type/work configuration', 'T036–T041, T061'
        if '/offers/' in route:
            return 'Credit offers', 'T065–T066'
        if '/requests/nearby/' in route:
            return 'Nearby work', 'T041–T046'
        if '/requests/' in route:
            if '/generate-warranty/' in route:
                return 'Warranty creation', 'T059–T060'
            if any(k in route for k in ('benefits-calculation/', 'profit-calculation/')):
                return 'Job financial calculation; verify meaning', 'T049, T054, T067'
            if any(k in route for k in ('diagnostic/', 'gaz/')):
                return 'Diagnosis/service detail', 'T048–T050'
            if '/request-overview/' in route:
                return 'Opportunity overview', 'T044–T046'
            if '/waiting-location-confirmation/' in route:
                return 'Awaiting location confirmation', 'T047'
            if any(k in route for k in ('client-accepted-last/', 'client-refused-last/', 'waiting-last-confirmation/')):
                return 'Final approval/refusal/waiting', 'T052–T054, T058'
            if '/client-rejected/' in route:
                return 'Client rejection; verify exact stage', 'T050, T052, T056'
            return 'Job execution', 'T047–T054, T056–T058'
        if '/community.' in route:
            return 'Technician community', 'T078–T079'
        if '/profile.' in route:
            return 'Technician profile', 'T018, T036–T043, T065–T070, T075'
        return 'Technician home', 'T041–T044'
    if route.startswith('./(ac)/'):
        if '/community.' in route:
            return 'AC community', 'T078–T079'
        if '/profile.' in route:
            return 'AC professional profile', 'T018, T036–T043'
        return 'AC professional workflow; repeat with AC fixture', 'T034, T042–T058'
    if route.startswith('./(workshop)/'):
        if '/community.' in route:
            return 'Workshop community', 'T078–T079'
        if '/profile.' in route:
            return 'Workshop professional profile', 'T018, T036–T043'
        return 'Workshop operation', 'T061–T063, T049–T060'
    if route.startswith('./(electronic)/'):
        if '/community.' in route:
            return 'Electronic-repair community', 'T078–T079'
        if '/profile.' in route:
            return 'Electronic-repair profile', 'T018, T036–T043, T064'
        return 'Electronic-repair workflow', 'T064, T049–T060'
    raise ValueError(f'Unmapped route: {route}')

intro = f'''The compiled APK contains **{len(routes)} route entries** below, including layout wrappers. Names are extracted strings, not available source files, and do not prove that the destinations are implemented, reachable, or enabled. Some screens are accessible only after specific account/job states. Extra dialogs, sheets, and server-controlled states may exist without a separate route.

For each non-layout row, record its actual visible title and how it is reached. Prepare the required job/profile fixture, open it through the supported UI or authorized test tooling, run the mapped tests and section 3 checklist, then mark **Seen** and **Verified** separately. Do not bypass permissions to reach an inaccessible screen. Investigate whether it is intentionally out of scope, missing a fixture, or a navigation defect.

The boxes below are blank for the next test run; they do not erase prior audit observations. **Seen** means visually opened. **Verified** means its intended behavior passed. For layout wrappers, record navigation/child-screen checks instead of pretending the wrapper is another screen. Shared screens must be checked for every entitled role even if they share one route.

| Packaged route | Purpose to verify | Relevant tests | Seen / verified / actual title or blocker |
| --- | --- | --- | --- |
'''
rows=[]
for route in routes:
    purpose, tests = coverage(route)
    rows.append(f'| `{route}` | {purpose} | {tests} | Seen: __ · Verified: __ · Notes: __ |')
tail='''

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
'''
assert '<!-- ROUTE_INVENTORY -->' in text
text=text.replace('<!-- ROUTE_INVENTORY -->',intro+'\n'.join(rows)+tail)
text=re.sub(r'(#### T\d{3}[^\n]*\n)',r'\1\n**Run record:** NOT RUN · Date/tester: ___ · Actual result/bug: ___ · Evidence: ___\n',text)
case_ids=re.findall(r'^#### (T\d{3})',text,re.M)
assert case_ids == [f'T{i:03}' for i in range(1,99)], case_ids
assert not re.search(r'<!-- [A-Z_]+ -->',text)
assert len(set(routes)) == len(routes)
referenced=set(re.findall(r'\bT\d{3}\b',text))
assert referenced.issubset(set(case_ids)), referenced-set(case_ids)
for filename in re.findall(r'\]\(<(C:/[^>]+)>\)',text):
    assert Path(filename).exists(), filename
assert text.count('```') % 2 == 0
assert text.count('**Run record:**') == 98
path.write_text(text,encoding='utf-8')
print(f'Created {path.name}: {len(text.split()):,} words; {len(case_ids)} test cases; {len(routes)} route entries; {sum("_layout.tsx" in r for r in routes)} layout wrappers.')
print('Validated sequential/unique test IDs, referenced test IDs, local evidence links, route coverage, run records, code fences, and absence of generation placeholders.')
