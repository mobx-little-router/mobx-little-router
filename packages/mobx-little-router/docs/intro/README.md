# Introduction

Routing has become more complex in modern-day progressive web apps (PWAs). What evolved from a simple backend concern,
routing in today's JavaScript application need to fulfill many requirements.

- Client-side routing (both [History-based](https://developer.mozilla.org/en-US/docs/Web/API/History) and hash-based).
- Server-side routing (for use in Node/express).
- Code-splitting / dynamic routes.
- Animations and transitions.
- Data and effect resolution.
- Guarding against authentication, authorization, etc.
- etc.

The approach that `mobx-little-router` is to handle all the routing logic in a predictable manner using MobX to
manage both the router state and router events. Then, a view layer (such as React) can render the UI as needed
based on the state snapshot.

By decoupling routing concerns from the view, our router can live outside of the lifecycle of view components. This
makes many features (animations, guards, effects) simple to support.

The router is also event based, so every change goes through a well-defined pipeline of events. The
middleware layer can intercept any event and add custom logic that are application-specific.

