# Static Analysis and Security Findings Register

This register supports the Role 3 static-analysis and final security-review
submission. SonarCloud dashboard values must be copied from the real project;
do not replace unavailable results with estimated numbers.

## Remediation completed in this review

| ID | Finding | Risk | Resolution | Verification |
| --- | --- | --- | --- | --- |
| R3-01 | Sonar test files overlapped the source scope and only API coverage was imported. | Inaccurate code and coverage analysis. | Excluded frontend tests from source analysis, declared test inclusions, and imported API plus frontend LCOV reports. | `sonar-project.properties` and the `sonarcloud` GitHub Actions job. |
| R3-02 | JWT signing and verification relied on library defaults. | Algorithm configuration could drift or be weakened later. | Restricted both token signing and verification to HS256. | `securityControls.test.js` rejects an HS512 token and accepts HS256. |
| R3-03 | Registration used a hard-coded bcrypt cost of 10 despite the documented configuration. | Password hashing strength could not be controlled by the deployment. | Added `SALT_ROUNDS`, defaulting to 12. | Controller review and `.env.example`. |
| R3-04 | CORS omitted `PATCH` even though the API exposes a PATCH booking route. | Legitimate browser requests could fail and encourage insecure workarounds. | Added `PATCH` to the explicit CORS method allow-list. | API configuration review. |
| R3-05 | The client container did not return browser security headers. | Increased impact of content injection and framing attacks. | Added CSP, `nosniff`, referrer, and permissions headers in Nginx. | `client/nginx.conf`; verify response headers on the containerised client. |
| R3-06 | Authentication, role, and booking-ownership controls lacked focused regression tests. | Authorization regressions could go unnoticed. | Added tests for token validity, algorithm enforcement, RBAC, input sanitisation, and unrelated-user booking access. | Backend suite: 40 tests passing locally during this review. |

## Risks requiring release-owner review

| ID | Risk | Decision / next action | Owner | Status |
| --- | --- | --- | --- | --- |
| R3-07 | Browser authentication tokens are stored in `localStorage` and could be stolen if XSS occurs. | Accept for this assessment with CSP and React escaping; migrate to Secure, HttpOnly, SameSite cookies for production. | Application team | Accepted for assessment |
| R3-08 | JWTs cannot be revoked before expiry. | Keep expiry short and introduce refresh-token rotation/revocation for production. | Backend lead | Accepted for assessment |
| R3-09 | SonarCloud authentication depends on a repository secret not available to ordinary collaborators. | Repository owner must configure `SONAR_TOKEN`, run the workflow, and share dashboard/evidence access. | Repository owner | Open until CI evidence is captured |
| R3-10 | The API development tree reports 39 advisories (1 critical, 11 high, 24 moderate, 3 low), primarily through Newman and Jest tooling. `npm audit --force` proposes breaking downgrades rather than a safe upgrade. | Production audits for both API and client report 0 vulnerabilities, and the complete client audit reports 0. Do not use `--force`; keep development tools out of the production image, monitor upstream fixes, and rerun the audits before submission. | Role 3 lead | Accepted development-only risk; recheck before submission |
| R3-11 | Frontend lint reports six non-failing React design warnings: one Fast Refresh module-boundary warning and data-loading effect warnings. | Unused-code and authentication-hook warnings found during this review were fixed. Refactor the remaining dashboard effects in a separate behaviour-tested change; they are code-quality findings, not identified security vulnerabilities. | Frontend lead | Backlog |

## Final SonarCloud result

Complete this table from the successful workflow and SonarCloud dashboard. The
screenshots saved under `docs/evidence/static-analysis/` are the source of
truth.

| Result | Verified value |
| --- | --- |
| Workflow run URL | Pending successful authenticated run |
| Quality gate | Pending successful authenticated run |
| Bugs | Pending dashboard access |
| Vulnerabilities | Pending dashboard access |
| Security hotspots reviewed | Pending dashboard access |
| Code smells | Pending dashboard access |
| Coverage | Pending dashboard access |
| Duplications | Pending dashboard access |
| Reviewer and date | Pending |

For each non-zero vulnerability, hotspot, or security-relevant issue, add its
Sonar key, severity, affected file, remediation/acceptance decision, owner, and
status to this register.

## Local verification baseline

The following results were recorded on 3 November 2026 before the authenticated
SonarCloud run:

- API: 5 suites and 40 tests passed; 60.08% line coverage.
- Client: 5 files and 15 tests passed; 55.36% line coverage.
- Client production build completed successfully.
- API production dependency audit: 0 vulnerabilities.
- Client production and complete dependency audits: 0 vulnerabilities.

These local coverage values confirm that both LCOV files are generated. The
SonarCloud dashboard remains the authoritative submission result because its
scope, exclusions, and combined coverage calculation may differ.
