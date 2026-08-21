# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->

**# This is NOT the Next.js you know**

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Overview

This project is the **Preproute Web** frontend application.

The application is a test management system where users can:

* Authenticate using user ID and password.
* Manage authentication/JWT state.
* View the dashboard.
* Create and manage tests.
* Add, edit, and delete questions.
* Publish tests.
* Integrate with backend APIs.
* Handle loading, validation, success, and error states.

## Technology Stack

Use the project's existing dependencies and versions.

Primary technologies:

* Next.js
* React
* TypeScript
* Ant Design
* REST API integration
* JWT authentication
* ESLint
* npm

Do not introduce another UI library when an existing Ant Design component can satisfy the requirement.

## Next.js Rules

Before implementing or modifying Next.js functionality:

1. Read the relevant documentation from:

   `node_modules/next/dist/docs/`

2. Check the installed Next.js version from `package.json`.

3. Follow the APIs and conventions supported by the installed version.

4. Do not rely on older Next.js patterns from memory when the installed version provides different APIs.

5. Pay attention to deprecation warnings.

6. Prefer the App Router conventions when this project uses the App Router.

7. Keep Server Components and Client Components clearly separated.

8. Add `"use client"` only when client-side functionality is actually required.

9. Avoid unnecessarily converting entire pages or layouts into Client Components.

10. Use Next.js-native features where appropriate instead of recreating framework functionality.

## TypeScript Rules

Use strict TypeScript throughout the project.

### Required

* Prefer explicit types for API responses, component props, forms, and application state.
* Reuse shared types instead of duplicating interfaces.
* Use `unknown` instead of `any` when the type is genuinely unknown.
* Avoid unnecessary type assertions.
* Do not use `@ts-ignore` unless there is a documented technical reason.
* Do not suppress TypeScript errors just to make the build pass.

Example:

```ts
interface Test {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published';
}
```

## Ant Design Rules

Use Ant Design as the primary UI component library.

Prefer existing Ant Design components such as:

* `Button`
* `Input`
* `InputNumber`
* `Select`
* `DatePicker`
* `Form`
* `Modal`
* `Table`
* `Card`
* `Typography`
* `Tag`
* `Alert`
* `Spin`
* `Empty`
* `Dropdown`
* `Pagination`
* `Drawer`
* `Layout`
* `Menu`

Do not recreate standard Ant Design components with custom HTML/CSS unless there is a clear design requirement.

Use Ant Design's `Form` and validation mechanisms for forms where practical.

Keep UI consistent throughout the application.

## Component Rules

Create reusable components when functionality is used in multiple places.

Prefer:

```text
components/
  common/
  layout/
  auth/
  tests/
  questions/
```

Avoid creating overly generic components that make simple functionality harder to understand.

Components should have a single clear responsibility.

Keep page-level components focused on composition rather than containing large amounts of business logic.

## API Integration

Keep API communication separate from UI components.

Prefer a structure such as:

```text
src/
  app/
  components/
  services/
  lib/
  types/
  hooks/
```

For example:

```text
services/
  auth.service.ts
  test.service.ts
  question.service.ts
```

Do not place large API calls directly inside JSX.

Centralize:

* API base URL
* HTTP configuration
* authentication headers
* error handling
* response parsing
* common request behavior

Use environment variables for configurable API URLs.

Never hard-code production API URLs in components.

## Authentication

Authentication must be handled consistently across the application.

Requirements:

* Store authentication state securely according to the project's authentication architecture.
* Attach JWT tokens to authenticated API requests through centralized request handling.
* Do not duplicate token-handling logic across components.
* Redirect unauthenticated users away from protected pages.
* Handle expired or invalid tokens gracefully.
* Never log JWT tokens, passwords, or sensitive authentication information.

For login:

```text
Login
  ↓
Validate form
  ↓
Call authentication API
  ↓
Store authentication state
  ↓
Redirect to dashboard
```

## Forms and Validation

Use Ant Design's `Form` where appropriate.

Every user-facing form should provide:

* Required-field validation.
* Appropriate input validation.
* Clear validation messages.
* Loading state during submission.
* API error handling.
* Prevention of accidental duplicate submissions.

Do not rely exclusively on frontend validation. Backend validation remains authoritative.

## Test Management

Tests should follow a predictable data flow.

Example:

```text
Test
├── id
├── title
├── description
├── duration
├── status
└── questions
```

Questions should be treated as separate domain data when the backend API provides separate question endpoints.

When editing tests or questions:

* Show the existing data.
* Allow modification.
* Validate user input.
* Display API errors.
* Refresh or update local state after successful mutations.

For destructive operations such as deleting questions, use an appropriate confirmation UI.

Publishing a test should require the necessary validation before making the publish request.

## Loading, Error, and Empty States

Every API-driven page should account for:

### Loading

Use appropriate Ant Design loading components such as:

* `Spin`
* `Skeleton`

### Error

Display a useful error message using components such as:

* `Alert`
* `message`
* `notification`

### Empty

Use:

* `Empty`

Do not leave users with a blank screen when an API returns no data.

## Tables

For data-heavy screens, prefer Ant Design's `Table`.

Tables should support appropriate:

* Loading states
* Empty states
* Pagination
* Sorting
* Actions
* Responsive behavior

Avoid unnecessary client-side processing when the backend supports pagination, filtering, or sorting.

## Responsive Design

The application must work on:

* Desktop
* Tablet
* Mobile

Do not design exclusively for desktop.

Use Ant Design's responsive capabilities and CSS media queries where required.

Avoid fixed widths that cause horizontal scrolling on small screens.

Forms and action buttons should remain usable on mobile devices.

## Styling

Prefer Ant Design components and project-level styling conventions.

Do not introduce Tailwind CSS, Bootstrap, Material UI, or another UI framework unless explicitly requested.

Avoid excessive inline styles.

Keep repeated styles reusable.

Do not use arbitrary CSS when an existing Ant Design component or token can solve the problem.

## State Management

Do not introduce a state-management library unless the application actually requires one.

Prefer:

* React state for local component state.
* URL/search parameters for shareable filters.
* Server-side data fetching where appropriate.
* Context only for genuinely shared application state.

Avoid putting every piece of state into global state.

## Data Fetching

API data fetching should have clear ownership.

For each API request:

```text
Request
  ↓
Loading
  ↓
Success → Update UI
  ↓
Error → Display error
```

Avoid duplicate API requests caused by unnecessary effects or re-renders.

Do not use `useEffect` for data fetching automatically when the installed Next.js version provides a better supported server-side or framework-native approach.

## Error Handling

Never silently ignore API errors.

Handle:

* Network failures
* HTTP errors
* Validation errors
* Unauthorized responses
* Forbidden responses
* Not found responses
* Server errors

Show users an understandable message while keeping technical details out of the UI.

Use logging only where useful for development/debugging.

Never expose secrets or sensitive data in error messages.

## Security

Never commit:

* API keys
* JWT secrets
* Database credentials
* Passwords
* Private tokens
* `.env` secrets

Use environment variables for sensitive configuration.

Do not expose server-only secrets to client-side code.

Validate authorization on the backend even if the frontend hides protected UI.

Frontend route protection is not a replacement for backend authorization.

## Accessibility

Follow accessible UI practices.

Use:

* Proper labels.
* Semantic HTML where appropriate.
* Keyboard-accessible controls.
* Meaningful button text.
* Appropriate ARIA attributes when necessary.
* Accessible error messages.

Do not use icons as the only indication of an important action when a text label or accessible label is needed.

## Performance

Prefer simple and maintainable optimizations.

Consider:

* Server Components where appropriate.
* Dynamic imports for genuinely heavy client components.
* Avoiding unnecessary re-renders.
* Avoiding unnecessary API requests.
* Pagination for large datasets.
* Optimized images.
* Memoization only when it provides measurable or clear benefit.

Do not prematurely optimize.

## File and Folder Naming

Use consistent naming.

Prefer:

```text
kebab-case
```

for files and directories where consistent with the existing project.

React components should use PascalCase:

```text
TestForm.tsx
QuestionList.tsx
DashboardCard.tsx
```

Services and utilities should use descriptive names:

```text
test.service.ts
auth.service.ts
api-client.ts
```

Do not rename existing files unnecessarily.

## Code Quality

Before considering a task complete:

1. Run TypeScript/build checks.
2. Run ESLint.
3. Fix warnings and errors introduced by the changes.
4. Check responsive behavior.
5. Check loading and error states.
6. Check API error handling.
7. Check authentication behavior when relevant.
8. Remove unused imports and variables.
9. Remove debugging statements such as `console.log`.
10. Verify that the implementation follows the installed Next.js version.

## Do Not

* Do not ignore the generated Next.js rules above.
* Do not assume APIs from an older Next.js version.
* Do not use deprecated APIs when a supported alternative exists.
* Do not introduce unnecessary dependencies.
* Do not mix multiple UI libraries.
* Do not put business logic directly into large JSX blocks.
* Do not duplicate API logic.
* Do not use `any` as a shortcut.
* Do not hard-code secrets.
* Do not commit `.env` files containing secrets.
* Do not disable ESLint or TypeScript checks to hide errors.
* Do not make unrelated changes while implementing a feature.
* Do not rewrite working code without a clear reason.

## Implementation Approach

For every feature:

1. Inspect the existing project structure.
2. Inspect the relevant API/service/types.
3. Check the installed Next.js version.
4. Read the relevant Next.js documentation from `node_modules/next/dist/docs/`.
5. Identify reusable existing components.
6. Define or reuse TypeScript types.
7. Implement API/service logic separately from UI.
8. Implement the UI using Ant Design.
9. Add validation and error handling.
10. Add loading and empty states.
11. Verify responsive behavior.
12. Run lint/type/build checks.
13. Keep the final change focused on the requested feature.

## Existing Code Takes Priority

When modifying the project, preserve existing conventions when they are reasonable.

Before introducing a new pattern:

* Search the repository for an existing implementation.
* Reuse existing utilities and components.
* Follow existing naming conventions.
* Avoid creating duplicate abstractions.

If the existing implementation conflicts with the installed Next.js documentation or current framework behavior, prefer the current supported Next.js approach.

## Final Verification

A completed implementation should satisfy:

```text
✓ TypeScript passes
✓ ESLint passes
✓ Next.js build passes
✓ Ant Design components are used consistently
✓ API logic is separated from UI
✓ Forms are validated
✓ Loading states exist
✓ Error states exist
✓ Empty states exist
✓ Authentication is handled correctly
✓ Mobile layout works
✓ No secrets are committed
✓ No unnecessary dependencies were added
✓ No deprecated Next.js API was introduced
```
