# Frontend UI & Data Flow Audit

This document maps the important frontend pages/components to the backend endpoints they use, the expected data shapes, and recommended next steps for standardization.

## Key components/pages

- `src/pages/HomePage.tsx`
  - Data: admin dashboard summary
  - Endpoints: `GET /api/dashboard/admin`
  - Notes: shows aggregated stats, should use a query hook (React Query)

- `src/pages/CaseList.tsx`
  - Data: list of cases
  - Endpoints: `GET /api/cases`

- `src/pages/CaseDetail.tsx`
  - Data: case details, messages
  - Endpoints: `GET /api/cases/{id}`
  - Integrates `SecureChat` component for real-time messaging

- `src/components/SecureChat.tsx`
  - Data: chat history and per-recipient encrypted payloads
  - Endpoints used in file:
    - `GET /api/chat/{caseId}` (load chat history)
    - `POST /api/e2ee/keys` (upload public key)
    - `GET /api/e2ee/keys?caseId={caseId}` (fetch participants' public keys)
    - `POST /api/chat/{caseId}` (send encrypted message)
  - Realtime: connects to Socket.IO endpoint and listens for `chat:message`
  - Notes: implement message batching / optimistic updates in a socket hook

- `src/pages/CaseCreateForm.tsx`
  - Data: create case payload
  - Endpoint: `POST /api/cases`
  - Notes: use react-hook-form + zod schema for validation

- `src/pages/DetectiveDashboard.tsx`, `ClientDashboard.tsx`
  - Data: lists of cases, actions (accept/reject)
  - Endpoints: `GET /api/cases`, `POST /api/cases/{id}/accept`, `POST /api/cases/{id}/reject`

- `src/components/AIAnalysis.tsx`
  - Endpoint: `POST /api/ai/analyze-evidence`

- Auth
  - `src/services/auth.ts` uses `POST /api/auth/login` and `POST /api/auth/register`

## Existing infrastructure

- Central axios instance: `src/services/api.ts` (baseURL, auth interceptor)
- React Query provider present in `src/main.tsx`

## Data flow recommendations

1. Centralize all endpoint calls behind typed hooks in `src/hooks/*` (useQuery/useMutation)
2. Standardize response shape: { data, error } or throw normalized error objects
3. Use container/presenter split for pages that fetch data
4. Abstract Socket.IO into `src/hooks/useSocket.ts` that exposes an event API and handles batching

## Next steps (implementation plan)

1. Add small `hooks/` utilities (useCase/useCases, useMessages) — (PR #1)
2. Create presentational `views/` for complex pages and move data logic to `containers/` — (PR #2)
3. Introduce react-hook-form + zod for forms (signup, case create) — (PR #3)
4. Add accessible patterns and performance checklist (lazy loading, code-splitting) — (PR #4)

---

This audit is a high-level map to guide the sequence of PRs that will standardize data flow and UI layout.
