# Workflow routing

- Workspace/system status: `career-ops status --json`
- Setup health: `career-ops doctor --json`
- Find jobs: load `<system>/modes/scan.md`, then run `career-ops scan`
- Review tracker: `career-ops tracker query --limit 50 --json`
- Validate pipeline: `career-ops verify`
- Evaluate a job: load `<system>/modes/_shared.md`, `<system>/modes/auto-pipeline.md`, and workspace profile sources; preserve the JD and follow the mode
- Tailor CV/PDF: load `<system>/modes/pdf.md`; use `career-ops pdf` only with the inputs required by that mode
- Prepare application: load `<system>/modes/apply.md`; stop before final submission
- Interview preparation: load the applicable `<system>/modes/interview*.md` instructions and workspace story bank
- Follow-up: `career-ops followup`; draft only, never send
- Patterns and skill gaps: `career-ops patterns` and `career-ops upskill`
- System updates: `career-ops update check`

For any mode, combine system instructions with workspace profile/custom rules. Workspace truth sources override neither evidence requirements nor safety gates.
