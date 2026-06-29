# Visitor Architecture Viewer

## Goal

Let website visitors open the AWS architecture diagram from the chat UI without paying the Mermaid bundle cost on initial load.

## Tasks

- [x] Add Mermaid as a frontend dependency and keep the diagram source in a reusable module. → Verify the dependency is locked and TypeScript can import it.
- [x] Build an accessible, lazy-loaded architecture dialog with loading and error states. → Verify open, close, Escape, focus, and SVG rendering behavior.
- [x] Add a discoverable “View architecture” action and responsive styles matching both themes. → Verify desktop and mobile presentation.
- [x] Run lint, production build, accessibility checks, and an interactive browser smoke test. → Verify all checks pass and the initial route excludes Mermaid code.

## Done When

- [x] A visitor can open, inspect, and close the diagram without leaving the conversation.
- [x] Mermaid is loaded only after visitor intent.
