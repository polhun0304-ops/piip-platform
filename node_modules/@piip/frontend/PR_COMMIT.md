## Quick Git commands to commit & open PR

Run these in your local clone (root of repo: `C:\Projects\piip-platform`). This environment isn't a git repo, so run locally.

PowerShell example:

```powershell
# create branch
git checkout -b feat/ui/protected-routes

# stage changed frontend files
git add packages/frontend/src/components/ProtectedRoute.tsx \
  packages/frontend/src/App.tsx \
  packages/frontend/src/components/UnifiedLayout.tsx \
  packages/frontend/src/components/SecureChat.tsx

# commit
git commit -m "feat(frontend): add ProtectedRoute, role-based route guards, read role from Redux; fix lint warning"

# push
git push -u origin feat/ui/protected-routes
```

PR body is available in `packages/frontend/PR_BODY.md` — paste it when creating the PR on GitHub.

If you'd like, I can also generate a suggested PR title:

`feat(frontend): add ProtectedRoute + role-based route guards; unify role source`
