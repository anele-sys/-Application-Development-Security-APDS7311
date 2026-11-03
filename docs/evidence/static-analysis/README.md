# Static Analysis Evidence Checklist

The PoE requires evidence of the analysis result and an explanation of what it
means. After the repository owner adds `SONAR_TOKEN`, trigger **Node.js CI** on
the final commit and capture the following evidence from that same run:

1. GitHub Actions summary showing backend tests, frontend tests, builds, and
   **SonarCloud analysis** completed successfully.
2. The SonarCloud project **Overview** showing the project name, branch/commit,
   analysis date, and Quality Gate result.
3. SonarCloud **Issues** filtered to Bugs and Vulnerabilities.
4. SonarCloud **Security Hotspots** showing that every hotspot is reviewed.
5. The Measures view showing coverage and duplicated-lines percentages.

Use filenames such as:

- `01-github-actions-success.png`
- `02-sonar-quality-gate.png`
- `03-sonar-issues.png`
- `04-security-hotspots.png`
- `05-coverage-duplication.png`

Do not include the token, repository secrets, environment values, or user
credentials in screenshots. Copy the verified metrics and workflow URL into
`docs/static-analysis-findings.md`, then explain whether the gate passed and
how each open security finding was resolved or accepted.

If the scan reports **Not authorized or organization not found**, the code is
not the remaining blocker: the repository owner must confirm the SonarCloud
organization/project binding and replace the GitHub `SONAR_TOKEN` secret with a
valid token that has execute-analysis permission.
