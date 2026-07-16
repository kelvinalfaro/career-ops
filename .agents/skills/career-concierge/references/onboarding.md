# Onboarding

Run `career-ops setup --workspace <private-folder>`. Setup saves the workspace, installs this skill, copies neutral profile and portal templates, and initializes tracker directories without placing private data in the system checkout.

Then complete the missing files reported by `career-ops doctor --json`, especially `cv.md`. Ask the user for source material and keep unknowns explicit. Review `config/profile.yml`, `modes/_profile.md`, and `portals.yml`; never infer salary, location, experience, or target roles without confirmation.

For portable discovery use `--agent portable`; use `--agent all` for additional Codex, Gemini CLI, and Claude Code user-scope copies.
