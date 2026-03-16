# Spec-Driven Development Tools: Comparative Analysis

## Executive Summary

Five spec-driven development frameworks were evaluated: **Beads**, **BMAD Method**, **Get Shit Done (GSD)**, **OpenSpec**, and **Spec Kit**. Each takes a fundamentally different approach to the same problem — bridging the gap between human intent and AI-generated code. This analysis evaluates them across dimensions of human usability, AI effectiveness, feature completeness, and practical tradeoffs.

**Quick verdict:**
- **Best for humans:** OpenSpec (lowest friction, most intuitive) and Spec Kit (clearest mental model, strong community)
- **Best for AI agents:** GSD (purpose-built for agent orchestration) and Beads (agent-first architecture)
- **Most comprehensive:** BMAD Method (covers the full product lifecycle)
- **Most innovative:** Beads (distributed graph tracker) and GSD (context rot prevention)

---

## The Contenders at a Glance

| Dimension | Beads | BMAD Method | GSD | OpenSpec | Spec Kit |
|---|---|---|---|---|---|
| **Core identity** | Distributed graph issue tracker | AI-driven agile framework | Context-optimized build system | Lightweight spec alignment layer | Spec-first development pipeline |
| **Primary artifact** | SQL issues in Dolt DB | Markdown planning docs | XML-structured PLAN.md files | Delta-spec change folders | Numbered spec directories |
| **Storage** | Dolt (version-controlled SQL) | Flat markdown files | Flat markdown + YAML | Flat markdown files | Flat markdown files |
| **Version** | v0.9.11 (alpha) | v6.1.0 | v1.22.4 | v1.2.0 | v0.2.0 |
| **License** | — | MIT | MIT | MIT | MIT |
| **Install** | `brew install beads` | `npx bmad-method install` | `npx get-shit-done-cc` | `npm install -g @fission-ai/openspec` | `uv tool install specify-cli` |
| **Runtime deps** | Dolt database | Node.js 20+ | Node.js (Claude Code) | Node.js 20+ | Python 3.11+, uv |
| **AI tools supported** | 9+ (deep integrations) | 20+ (skill-based) | 4 (Claude Code primary) | 24 (broadest) | 20+ (agent-agnostic) |

---

## Detailed Analysis

### 1. Beads

git location: https://github.com/steveyegge/beads

**What it is:** Not a spec tool at all — it's a **distributed, dependency-aware issue tracker** built specifically for AI agents. Think "Jira for robots, powered by Git-like version control."

**Philosophy:** AI agents working on long-horizon tasks need persistent, structured memory that survives context window resets. Issues live in a Dolt SQL database with hash-based IDs, dependency graphs, and atomic claiming to prevent race conditions between parallel agents.

**Strengths:**
- **`bd ready` is brilliant.** A single command that resolves the entire blocking graph in ~10ms offline and returns only unblocked work. This is the primitive that enables agent autonomy — no planning document parsing, no status file reading, just "what can I do right now?"
- **Collision-free concurrent work.** Hash-based IDs, cell-level 3-way merge, and atomic `--claim` mean multiple agents can create/claim/close issues on different branches without merge conflicts. No other tool in this comparison handles multi-agent parallelism at the data layer.
- **Gates system.** External conditions (PR merges, CI runs, timers, human approvals) become nodes in the dependency graph. Agents don't poll — they run `bd ready` and blocked work simply doesn't appear until the gate clears.
- **Wisps (ephemeral issues).** Agent execution traces that never sync — they exist locally, get squashed to a digest or burned. This is elegant for routine operations that don't need permanent records.
- **Molecular templates.** Reusable workflow templates that can be dynamically bonded at runtime — the "Christmas ornament" pattern for unknown-at-design-time parallelism is genuinely novel.

**Weaknesses:**
- **Dolt is a heavy dependency.** Installing a full SQL database server for issue tracking is a hard sell. Embedded mode helps for solo use, but multi-agent requires server mode.
- **Alpha instability.** The FAQ explicitly warns "API may change before 1.0." The storage backend has changed twice (JSONL → SQLite → Dolt), leaving a trail of incompatible community tools.
- **No spec/planning layer.** There's no structured artifact for capturing requirements before decomposing into issues. Descriptions live on individual issues, not in a coherent planning document. You'd need to pair Beads with another tool for the "spec" part of spec-driven development.
- **The "Gas Town" dependency.** Docs reference a separate orchestration system ("Gas Town") for multi-agent coordination features. The full vision requires something beyond just Beads.

**Best example of what it does well:**
```bash
# Agent A creates work, Agent B discovers it's ready
bd create "OAuth integration" -t feature -p 1 --json
bd dep add bd-a1b2 bd-c3d4   # blocks until c3d4 is done
# Later, on a different machine:
bd ready --json               # bd-a1b2 appears only when bd-c3d4 is closed
bd update bd-a1b2 --claim     # Atomic — no other agent can grab it
```

---

### 2. BMAD Method

git location: https://github.com/bmad-code-org/BMAD-METHOD

**What it is:** A full-lifecycle **AI-driven agile framework** with named persona agents (PM, Architect, Scrum Master, Dev) that guide humans through progressive planning phases producing increasingly detailed context documents.

**Philosophy:** "Traditional AI tools do the thinking for you, producing average results. BMad agents act as expert collaborators who guide you through a structured process to bring out your best thinking." Each phase produces documents that feed the next, so agents always know what to build and why.

**Strengths:**
- **Most comprehensive coverage.** No other tool covers brainstorming (60+ techniques), market research, PRD creation (12-step guided interview), UX design, architecture, epic breakdown, sprint planning, story preparation, TDD implementation, adversarial code review, AND retrospectives. It's the only tool that handles the full product lifecycle.
- **Create-Story as context engine.** The Scrum Master's story preparation is remarkably thorough — it loads all planning artifacts, reads recent git commits for patterns, does web research for latest library versions, and synthesizes a comprehensive developer guide. The dev agent starts with everything it needs.
- **Adversarial review by design.** The code review workflow explicitly instructs: "YOU ARE AN ADVERSARIAL CODE REVIEWER." It cross-references story file claims against actual `git diff` output to detect false completions. This is the strongest quality gate of any tool here.
- **Micro-file step architecture.** Workflows split into individual step files loaded one at a time. This prevents LLMs from "looking ahead," forces sequential discipline, and enables resumability via frontmatter state tracking.
- **Scale-adaptive tracks.** Quick Flow (one tech-spec for bug fixes) vs. full BMad Method (multi-story products) vs. Enterprise, with built-in escalation detection.
- **Party Mode.** Multiple agents respond in character in a single conversation, disagree with each other, and build on each other's points. Unique and useful for design reviews.

**Weaknesses:**
- **Ceremony overhead.** For a 3-story app, going through PRD → Architecture → Epics → sprint-planning → create-story → dev-story is significant overhead. The Quick Flow mitigates this, but the workflow picker is entirely human judgment.
- **Fresh chat requirement.** A new conversation per workflow is correct for context management but tedious in practice. No automation to manage sessions.
- **No CI/CD or external tool integration.** Sprint tracking is a flat YAML file that agents parse and rewrite. No hooks into GitHub, Linear, Jira. Workflow customization for external tools is roadmap-only.
- **Dev loop still manual.** Phase 4 automation is noted as "Coming soon." Each story requires manual invocation of create-story → dev-story → code-review. The most tedious part is the least automated.
- **LLM instruction-following dependency.** The entire system depends on AI faithfully executing XML-tagged workflow instructions. The dev agent literally has "NEVER lie about tests" as a critical action. Works well with Claude Opus/Sonnet, unknown with weaker models.

**Best example of what it does well:**
```
Phase 2 Planning:
  PM agent interviews you → PRD.md (12-step deep dive)

Phase 3 Solutioning:
  Architect creates architecture.md (patterns, structure, validation)
  PM breaks into epics with stories
  Readiness gate: PASS/CONCERNS/FAIL check across ALL docs

Phase 4 Implementation:
  SM creates story file → loads PRD + architecture + UX + git history + web research
  Dev agent receives a story so rich it needs zero conversation history
  Adversarial reviewer cross-checks git diff against story claims
```

---

### 3. Get Shit Done (GSD)

git location: https://github.com/gsd-build/get-shit-done

**What it is:** A **multi-agent orchestration framework** that solves "context rot" — quality degradation as AI fills its context window — by giving each execution unit a fresh 200k-token context containing only what it needs.

**Philosophy:** "I'm not a 50-person software company. I don't want to play enterprise theater." Built for solo developers who shape what gets built while AI does all the coding. Plans are prompts, not documents. Complexity hides in the system, not the workflow.

**Strengths:**
- **Context rot prevention is the killer insight.** Every executor agent gets a fresh 200k context window with only the relevant PLAN.md, project context, and source files. The orchestrator stays lean at 10-15% context usage. This is architecturally superior to any tool that accumulates context in a single session.
- **Nyquist Validation.** Named after the sampling theorem — before any code is written, every requirement is mapped to a specific automated test command. Plans without automated verify commands are rejected. Test infrastructure is guaranteed before implementation.
- **Wave-based parallel execution with pre-computed dependencies.** Wave numbers are written into PLAN.md frontmatter at planning time. Execute-phase just reads them — no runtime dependency analysis. The planner's architecture decisions about parallelism are explicitly captured and inspectable.
- **Goal-backward `must_haves` verification.** The frontmatter `must_haves` field specifies truths (assertions), artifacts (files with min_lines), and key_links (connections between components verified by regex). Verification checks whether the codebase delivers the promised outcome, not whether tasks ran.
- **Autonomous mode.** `/gsd:autonomous` runs an entire milestone hands-off: smart discuss → plan → execute → verify for each phase, with pauses only for genuine decisions. This is the closest any tool gets to "describe it and walk away."
- **Context window self-monitoring.** A PostToolUse hook warns agents at 35% remaining context and instructs STOP at 25%. Infrastructure-level awareness of a fundamental LLM constraint.
- **Deviation rules.** Executors auto-fix bugs, add missing critical functionality, and fix blocking issues — but STOP for architectural changes. Smart autonomy boundaries.

**Weaknesses:**
- **Claude Code lock-in.** Despite supporting 4 runtimes, the entire orchestration (Task() subagent API, agent frontmatter, PostToolUse hooks) is built around Claude Code's specific capabilities. Other runtimes get reduced functionality.
- **Significant token costs.** A typical phase triggers: 4 parallel researchers + synthesizer + planner + plan-checker (up to 3x) + multiple executors + verifier. The "balanced" profile uses Opus for planning and Sonnet for execution. Budget profile exists but with quality tradeoffs.
- **Solo-only design.** No concept of team review, branching strategy for collaboration, PR integration, or access control. The author explicitly doesn't want to be "a 50-person software company."
- **`--dangerously-skip-permissions` recommendation.** The README recommends this flag, noting "stopping to approve `date` and `git commit` 50 times defeats the purpose." Security-conscious environments may find this unacceptable.
- **No native IDE integration.** Entirely CLI/terminal-based. No VS Code extension, no GUI, no web dashboard. Observability during long execute-phase runs is limited.
- **Rapidly evolving.** Multiple releases per week. Features documented in the README may differ from installed versions.

**Best example of what it does well:**
```yaml
# PLAN.md frontmatter — the verification contract
must_haves:
  truths: ["User can see existing messages", "Messages persist across refresh"]
  artifacts:
    - path: "src/components/Chat.tsx"
      provides: "Message list rendering"
      min_lines: 30
  key_links:
    - from: "src/components/Chat.tsx"
      to: "/api/chat"
      via: "fetch in useEffect"
      pattern: "fetch.*api/chat"
# After execution, the verifier checks ALL of these against the actual codebase
```

---

### 4. OpenSpec

git location: https://github.com/Fission-AI/OpenSpec

**What it is:** A **lightweight spec alignment layer** — "agree before you build." Humans and AI align on what to build via structured change proposals before any code is written.

**Philosophy:** "Fluid not rigid, iterative not waterfall, easy not complex, brownfield-first." Any action can happen at any time, guided by a dependency graph rather than rigid phase gates.

**Strengths:**
- **Lowest friction entry point.** The core workflow is three commands: `/opsx:propose` → `/opsx:apply` → `/opsx:archive`. You can go from install to productive use in under a minute. The "core" profile installs only 4 commands to avoid overwhelming new users.
- **Dynamic CLI-driven AI context.** Unlike tools that create markdown for AI to read passively, OpenSpec has agents actively query the CLI (`openspec status --json`, `openspec instructions --json`) for structured, stateful data. The AI knows exactly what artifacts exist, what's ready, and what's blocked — in real time.
- **Delta spec semantics.** ADDED/MODIFIED/REMOVED/RENAMED sections aren't formatting conventions — the CLI parses and applies them as merge operations when archiving. This is closer to spec version control than document management.
- **Schema customization as first-class.** The artifact dependency graph is user-configurable via YAML. You can create entirely custom workflows (e.g., `research → proposal → tasks`, skipping specs and design).
- **Broadest tool support (24 agents).** Individual adapters for each tool with format-appropriate command/skill files.
- **Eats its own cooking.** The project manages its own development with OpenSpec, providing real working examples of every concept.
- **Guided onboarding.** `/opsx:onboard` is a 15-30 min tutorial using your real codebase.

**Weaknesses:**
- **Parallel archive corruption (documented, unfixed).** When two changes touch the same spec requirement, the second archive silently overwrites the first. The fix (fingerprint-based conflict detection) is planned but not implemented.
- **No test generation or execution.** Creates specs with testable scenarios but no automated path from scenarios to test code.
- **Artifact regeneration gap.** The docs claim you can "update artifacts mid-flight and continue" but no actual mechanism exists — if you edit design.md after tasks.md exists, you must manually intervene.
- **50KB context limit.** Project context in config.yaml is capped, which may constrain large codebases.
- **Design artifact required for all changes.** The default schema requires a design.md even for trivial tasks. A "rapid" schema exists in docs but requires manual setup.

**Best example of what it does well:**
```bash
# AI queries CLI for structured state — not just reading files
$ openspec status --change "add-auth" --json
{
  "artifacts": [
    {"id": "proposal", "status": "done"},
    {"id": "specs",    "status": "ready"},     # ← unlocked by proposal
    {"id": "design",   "status": "blocked", "missingDeps": ["specs"]},
    {"id": "tasks",    "status": "blocked", "missingDeps": ["design"]}
  ]
}
# Agent knows exactly what to do next — deterministically
```

---

### 5. Spec Kit

git location: https://github.com/github/spec-kit

**What it is:** A **spec-first development pipeline** where specifications generate implementation through a staged transformation: specify → plan → tasks → implement.

**Philosophy:** "Specifications don't serve code — code serves specifications." The spec is the source of truth; code is regenerated output. Framed as "intent-driven development" — humans express what and why, AI handles translation to code.

**Strengths:**
- **Clearest mental model.** The seven-step pipeline (constitution → specify → clarify → plan → analyze → tasks → implement) is the most intuitive workflow of any tool here. Each step has a single purpose and a clear handoff to the next.
- **Constitutional governance.** The constitution file acts as versioned, dated architectural law with semantic versioning. Changes propagate through all templates via a "Sync Impact Report." No other tool has an equivalent constraint mechanism.
- **"Unit tests for English."** The `/speckit.checklist` command tests whether requirements are well-written, unambiguous, and measurable — not whether code works. Items ask "Is X clearly specified?" not "Does the system do X?" This inverts the usual quality gate.
- **Structured clarification.** `/speckit.clarify` asks questions one at a time (max 5), provides AI-recommended answers with reasoning, and writes answers back into the spec incrementally. More disciplined than free-form conversation.
- **Cross-artifact consistency analysis.** `/speckit.analyze` performs semantic analysis across spec, plan, and tasks with severity ratings and coverage percentages. Strictly read-only — it reports but doesn't touch.
- **Strong community.** 71k stars, 6k+ forks, community extensions for Jira, Azure DevOps, review, verify, retrospective, and more. External walkthroughs for .NET, Spring Boot, ASP.NET, and Jakarta EE.
- **Extension + preset system.** Hooks with optional/mandatory semantics, stackable presets with priority ordering. Supports enterprise layered customization.
- **Feature number coordination.** The create-new-feature script scans all remotes and branches to prevent number collisions in multi-developer setups.

**Weaknesses:**
- **Short-lived spec lifecycle.** Specs are tied to feature branches. The community has raised the need for longer-lived "spec of record" but it's still roadmap.
- **No production feedback loop.** The philosophy describes production metrics updating specs, but no tooling exists for this.
- **Constitution is unguided.** The template is generic placeholder text. New users must figure out what makes a good principle; bad principles create noise.
- **No spec-to-code drift detection.** If requirements change after implementation, no structured propagation workflow exists (community `spec-kit-sync` extension partially addresses this).
- **Context window saturation.** `/speckit.implement` loads multiple large design documents before executing. No automated splitting for large features.
- **GitHub MCP dependency for issues.** The `/speckit.taskstoissues` command requires GitHub MCP server, not the standard `gh` CLI.

**Best example of what it does well:**
```markdown
# .specify/specs/001-auth/spec.md

## User Scenarios
### US1: User Login (P1)
**Why P1:** Core functionality — nothing else works without authentication.
**Independent Test:** User can log in and see dashboard.

#### Scenario: Valid credentials
- GIVEN a registered user with email "test@example.com"
- WHEN the user submits the login form with valid credentials
- THEN a JWT token is returned with 24-hour expiry
- AND the user is redirected to /dashboard

## Requirements
- FR-001: System MUST authenticate users via email/password
- FR-002: System MUST issue JWT tokens with configurable expiry
- FR-003: System SHOULD support "remember me" functionality
  [NEEDS CLARIFICATION: What is the extended session duration?]

## Success Criteria
- SC-001: Users can complete login in under 2 seconds
- SC-002: Failed login attempts are rate-limited after 5 attempts
```

---

## Head-to-Head Comparisons

### Best for Humans

| Rank | Tool | Why |
|---|---|---|
| 1 | **OpenSpec** | Three-command core workflow, guided onboarding, lowest cognitive overhead. You can be productive in under a minute. The "propose → apply → archive" loop is immediately intuitive. |
| 2 | **Spec Kit** | Clear seven-step pipeline maps to how humans naturally think about features. The clarification workflow (one question at a time, AI-recommended answers) respects human attention. Strong community means help is available. |
| 3 | **BMAD Method** | The PM/Architect/SM personas make conversations feel natural. `bmad-help` inspects your project and tells you what to do next. But the fresh-chat-per-workflow requirement and planning overhead are real friction. |
| 4 | **GSD** | Powerful once you understand it, but the mental model (waves, must_haves, deviation rules, profiles) takes time. Best for solo developers who want to invest in learning the system. |
| 5 | **Beads** | Agent-first means human-second. The CLI is clean but issue tracking via terminal commands is less natural than markdown files. The Dolt dependency raises the barrier significantly. |

### Best for AI Agents

| Rank | Tool | Why |
|---|---|---|
| 1 | **GSD** | Purpose-built for agent orchestration. Fresh 200k contexts per executor, pre-computed wave parallelism, `must_haves` verification contracts, context window monitoring, deviation rules. The most sophisticated agent-to-agent coordination. |
| 2 | **Beads** | `bd ready --json` gives agents deterministic "what to do next" in 10ms. Atomic claiming prevents race conditions. Hash IDs prevent merge collisions. The dependency graph is resolved at the data layer, not by parsing documents. |
| 3 | **OpenSpec** | Dynamic CLI-driven context (`openspec status --json`) gives agents structured, real-time state. Agents query rather than parse. The artifact DAG provides clear next-step logic. |
| 4 | **Spec Kit** | Shell scripts output JSON for reliable parsing. Handoff metadata in command frontmatter chains workflows. But the pipeline is sequential and there's no parallelism primitive. |
| 5 | **BMAD Method** | Rich context engineering (the story files are incredibly detailed), but the micro-file step architecture requires the AI to faithfully load one file at a time and not peek ahead. Relies heavily on LLM instruction-following quality. |

### Feature Comparison Matrix

| Feature | Beads | BMAD | GSD | OpenSpec | Spec Kit |
|---|---|---|---|---|---|
| **Requirements capture** | No (issues only) | Yes (PRD, 12-step) | Yes (REQUIREMENTS.md) | Yes (RFC 2119 specs) | Yes (Given/When/Then) |
| **Architecture planning** | No | Yes (8-step) | Yes (research phase) | Yes (design.md) | Yes (plan.md) |
| **Task decomposition** | Manual issues | Epics/stories | XML plans with waves | tasks.md checkbox | tasks.md with [P] markers |
| **Dependency tracking** | Graph DB (best) | Implicit in phases | Wave frontmatter | Artifact DAG | Sequential pipeline |
| **Parallel execution** | Multi-agent native | No | Wave-based (best) | No | [P] markers (manual) |
| **Test strategy** | No | TDD in dev workflow | Nyquist validation | No | Checklist-based |
| **Code review** | No | Adversarial (best) | No | Verify command | Analyze command |
| **Git integration** | Dolt + git hooks | Manual commits | Atomic per-task commits | No | Branch per feature |
| **External tool sync** | Gates (PR, CI) | No | No | No | GitHub issues (MCP) |
| **Context management** | `bd prime` (1-2k tokens) | Fresh chat per workflow | Fresh context per executor | CLI-driven state | Template loading |
| **Multi-agent support** | Native (best) | No | Orchestrator pattern | No | No |
| **Recovery/resume** | Dolt history | Frontmatter state | STATE.md + pause/resume | Change folder state | Git branch state |
| **Custom workflows** | Molecules | Not yet | Profiles | Custom schemas (best) | Extensions + presets |
| **Brownfield support** | Yes | Yes (document project) | Yes (codebase mapper) | Yes (first-class) | Yes (first-class) |
| **Team collaboration** | Dolt sync (best) | No | No | No | Feature number coordination |

---

## Ranking by Use Case

### Solo Developer, Greenfield Project
1. **GSD** — Built for exactly this. Autonomous mode can build an entire milestone.
2. **BMAD** — If you want thorough planning before building.
3. **OpenSpec** — If you want lightweight alignment without heavy orchestration.

### Solo Developer, Existing Codebase
1. **OpenSpec** — Brownfield-first philosophy, delta specs for incremental changes.
2. **Spec Kit** — Explicitly supports brownfield, community walkthroughs for large codebases.
3. **GSD** — Codebase mapper agent handles analysis, but planning assumes you're building features.

### Team of Humans + AI Agents
1. **Beads** — Only tool with real multi-agent coordination (atomic claiming, collision-free IDs, sync).
2. **Spec Kit** — Feature number coordination, extension ecosystem, agent-agnostic design.
3. **BMAD** — Rich artifacts serve as team communication, but no collaboration primitives.

### Enterprise / Regulated Environment
1. **Spec Kit** — Constitutional governance, extension hooks, preset stacking, compliance layering.
2. **BMAD** — Full audit trail through planning phases, readiness gates.
3. **OpenSpec** — Schema customization for compliance workflows.

### Quick Bug Fix / Small Change
1. **OpenSpec** — `/opsx:propose` → `/opsx:apply` → done.
2. **BMAD Quick Flow** — One tech-spec, one dev session.
3. **Spec Kit** — Pipeline overhead is noticeable even for small changes.

### Maximum AI Autonomy
1. **GSD `/gsd:autonomous`** — Runs entire milestones with minimal human intervention.
2. **Beads** — `bd ready` loop enables fully autonomous agent operation.
3. **BMAD** — Requires human to invoke each workflow step.

---

## What's Missing From All of Them

1. **Production feedback loops.** No tool connects runtime behavior back to specs. Spec Kit's philosophy describes this but none implement it.

2. **Spec-to-code drift detection.** After implementation, how do you know the code still matches the spec? Only BMAD's adversarial review partially addresses this, and only at the story level.

3. **Cost tracking and optimization.** GSD acknowledges token costs but none track actual spend per feature or provide cost-vs-quality recommendations.

4. **Multi-model orchestration.** GSD uses different models for different roles (Opus for planning, Sonnet for execution, Haiku for mapping), but none allow dynamic model selection based on task complexity.

5. **Incremental spec evolution.** What happens when requirements change mid-implementation? OpenSpec's delta specs are closest, but the parallel merge problem is unsolved. Spec Kit explicitly calls this a gap.

6. **Cross-project specification reuse.** Beads' molecules are the only reusable template system. None support "import the auth spec from our other project."

7. **Visual/diagrammatic specs.** All tools are text-only. No tool generates or consumes architecture diagrams, sequence diagrams, or wireframes as first-class artifacts.

---

## Final Recommendations

**If you're choosing one tool today:**
- For **maximum productivity with AI**, pick **GSD**. It has the most sophisticated understanding of how AI agents actually work (context windows, parallelism, verification) and its autonomous mode is genuinely impressive. Accept the Claude Code lock-in and token costs.
- For **team adoption and longevity**, pick **Spec Kit**. Clearest mental model, strongest community, agent-agnostic design, and the extension ecosystem provides a growth path. The constitutional governance model is uniquely valuable for maintaining consistency.
- For **lightweight experimentation**, pick **OpenSpec**. Lowest barrier to entry, broadest tool support, and the schema customization means you can shape it to your workflow rather than adapting to its opinions.

**If you can combine tools:**
- **Beads + BMAD** or **Beads + Spec Kit** — Use BMAD or Spec Kit for the spec/planning layer, Beads for multi-agent work coordination. They occupy complementary niches.
- **GSD for execution + OpenSpec for specs** — OpenSpec's lightweight alignment layer could feed GSD's execution engine, though no integration exists today.

**If you're building for AI agents specifically:**
- **GSD** if you want the agent to do everything (plan, execute, verify) autonomously.
- **Beads** if you want multiple agents collaborating on a shared work graph with proper concurrency control.

---

*Analysis performed March 2026. All tools are under active development — re-evaluate in 3-6 months as the space is moving fast.*
