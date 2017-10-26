# React SSR example

This example shows off the Router's ability to render in both the server and client environments.

All data resolution can be handled within the router so that `await router.start()` guarantees that the application
can be rendered in a single pass.
