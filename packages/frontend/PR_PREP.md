Branch & PR preparation notes

Branch name suggestion:

- feat/ui-hooks-socket

Commit message (single commit, squashable):

feat(frontend): add useMessages/useCase/useSocket hooks, typed DTOs, refactor SecureChat

Changes included:

- src/types/api.ts (MessageDTO, CaseDTO)
- src/hooks/useMessages.ts
- src/hooks/useCase.ts
- src/hooks/useSocket.ts
- src/components/SecureChat.tsx (refactored to use useMessages and useSocket)
- src/services/api.ts (added typed helpers: getCase, getMessages)
- packages/frontend/DETAILED-UI-AUDIT.md (UI/data-flow audit)

Suggested PR description template:

## Summary

This PR introduces small foundational pieces for standardizing frontend data flow:

- Typed API DTOs for Case and Message.
- React Query hooks: `useMessages` and `useCase` to centralize fetching and caching.
- A lightweight `useSocket` hook to abstract Socket.IO subscriptions.
- Refactor `SecureChat` to use the above hooks (reduces direct api.get and local message state).

## Why

These changes make the chat code easier to test and maintain, and prepare the app for further
refactors (centralized hooks, batching/socket abstractions, optimistic updates).

## How to test locally

1. Ensure your Node is v20 (project requires Node >=20 <21). Use nvm or asdf to switch if needed.
2. From repo root run (powershell):

   git checkout -b feat/ui-hooks-socket
   git add packages/frontend/src/types/api.ts \
    packages/frontend/src/hooks/useMessages.ts \
    packages/frontend/src/hooks/useCase.ts \
    packages/frontend/src/hooks/useSocket.ts \
    packages/frontend/src/components/SecureChat.tsx \
    packages/frontend/src/services/api.ts \
    packages/frontend/packages/frontend/DETAILED-UI-AUDIT.md
   git commit -m "feat(frontend): add useMessages/useCase/useSocket hooks, typed DTOs, refactor SecureChat"
   git push -u origin feat/ui-hooks-socket

3. Create a PR with the template above. CI will run the frontend build and the headless E2E tests.

## Notes

- I could not create a branch or commit from this environment (no .git). Run the above commands locally.
- The next step is to push and observe CI (Node 20). If CI passes, we can proceed to migrate other pages gradually.
