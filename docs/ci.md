# CI Labels, Reviewers, and Schedules

This document explains the labels, reviewers, and schedule used in the OpenAPI SDK consistency workflow.

## Labels

- `openapi`: Changes related to the OpenAPI specification
- `sdk`: Updates to the generated SDK
- `chore`: Non-functional chores such as syncs or refactors
- (recommended) `spec-change`: Structural changes in the API specification
- (recommended) `breaking`: Backwards incompatible changes
- (recommended) `observability`: Tracing/metrics/logging changes

## Reviewers and Assignees

- Default reviewer/assignee: repository owner (auto-populated by workflow)
- Team expansion: use CODEOWNERS for directory-based ownership and automatic reviewers
- You can extend the workflow to add additional reviewers by specifying GitHub usernames or teams (e.g., `org/team-name`).

## Schedule

- Weekly run at `0 3 * * 1` (Mondays 03:00 UTC) to re-generate SDK and detect drift.
- For protected branches or different release cadences, adjust the schedule or add additional branches if required.

## Optimizations

- Concurrency is enabled to prevent overlapping runs per ref.
- If no SDK drift is detected, the job avoids raising a PR and exits quickly.
