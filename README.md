# SpecGuard

A first-pass tech pack and fit auditor for apparel technical designers. It checks a factory sample against its graded spec, does the arithmetic with code, groups related misses, and drafts fit comments for a person to review and approve. It never claims to know the cause of a fit problem. It says what it sees, what it suspects, and what a human should check.

Built solo for the AI Tinkerers NYC Fashion & Finance hackathon with ZooWork. This is a proof of concept for one style (Style 553972, long sleeve grindle jersey polo, size M, 22 points of measure).

## How it works

1. The app sends the spec, the measurements and the product rules to an agent running on ZooWork Managed Agents.
2. The agent runs a script in its sandbox for every number. It does no arithmetic of its own.
3. The agent groups misses into clusters, ranks likely causes, and drafts numbered fit comments, with open questions it cannot answer kept separate.
4. The agent writes a revision log, and that write waits for a person to approve or reject it.

## Status

Work in progress. The platform test passes and the scaffold, types and mock data are in place. The agent prompt, server routes and page are next.

## Docs

- ENGINEERING.md: stack, ZooWork facts, run flow, data contracts, build plan
- docs/technical-spec-a.md: agent design
- product-rules.md: garment, fabric and fit rules given to the agent
- CLAUDE.md: working rules for coding sessions

## Running

Needs Node 22 or higher and a ZooWork API key. Copy .env.example to .env.local, add the key, and keep it out of git and chat. Run scripts with the .mts extension.

    npm install
    npm run typecheck
    npm run dev

## Notes

The factory measurement column is simulated and illustrative. The senior designer's original fit evaluation is used only to check results and is never given to the agent.
