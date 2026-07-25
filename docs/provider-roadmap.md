# Provider and multi-account roadmap

The current release deliberately supports one in-memory Google connection. Its
domain and adapter boundaries are designed for the following extension without
changing calendar screens or event operations.

## Current boundary

- `CalendarProviderAdapter` owns provider authorization and API translation.
- `CalendarProviderRegistry` creates adapters by provider identifier.
- `accounts` owns connected adapter instances and active connection selection.
- `calendar` aggregates standard `Calendar` and `CalendarEvent` models.
- Vue components call store operations and never call provider APIs.

## Phase 1: multiple ephemeral connections

1. Add an account switcher and “connect another account” action.
2. Create one adapter instance per connection.
3. Keep a selected calendar per connection.
4. Load each selected calendar concurrently and merge events by start time.
5. Add connection/calendar identity to event filters and creation forms.
6. Surface provider capabilities when editing fields not supported everywhere.
7. Keep tokens in memory; reconnect all accounts after a full reload.

This phase remains deployable as a static application, but repeated
authorization becomes increasingly inconvenient.

## Phase 2: Microsoft Outlook adapter

1. Register a Microsoft Entra application.
2. Implement an adapter using Microsoft Authentication Library and Microsoft
   Graph Calendar endpoints.
3. Map Graph events, calendars, attendees, recurrence, time zones, and
   categories to the standard domain.
4. Add Microsoft capability flags instead of emulating unsupported Google
   behavior.
5. Test mixed Google/Microsoft aggregation, edits, deletion, and authorization
   expiry independently.

## Phase 3: durable account manager

Durable multi-account sessions require a backend-for-frontend:

1. Introduce a Day32 session without changing the frontend calendar contracts.
2. Move OAuth authorization-code exchanges and refresh tokens to the backend.
3. Encrypt refresh tokens at rest and rotate encryption keys deliberately.
4. Store provider connections, selected calendars, consent metadata, and sync
   cursors server-side.
5. Replace browser provider adapters with HTTP adapters that implement the same
   `CalendarProviderAdapter` operations through the Day32 backend.
6. Add revocation, account deletion, audit logging, rate-limit handling, and
   provider webhook/subscription renewal.
7. Add incremental Google sync tokens and Microsoft delta queries before
   considering a persistent event cache.

## Calendar-selection implementation

When calendar selection is scheduled:

1. List calendars for every connected account.
2. Default to each provider’s primary calendar.
3. Persist only non-sensitive calendar identifiers locally while static.
4. Let the user choose visible calendars and one creation destination.
5. Preserve connection and calendar IDs on every event operation.
6. Exclude read-only calendars from creation/edit destinations.
7. Provide an explicit “all connected calendars” aggregate view.

Do not broaden OAuth scopes solely to implement selection. The application
filters calendars after authorization and requests the minimum provider scopes
needed for event management and calendar metadata.
