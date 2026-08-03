import type { Article } from "./types";

export const article: Article = {
  slug: "how-claude-code-is-built",
  title: "How Claude Code Is Built",
  excerpt:
    "Anthropic's CLI coding agent became a developer favorite in months. The engineering team shares architecture, design decisions, and what's next.",
  category: "Deep Dive",
  readTime: "18 min",
  publishedAt: "2026-04-03",
  isPremium: true,
  preview:
    "Claude Code isn't just ChatGPT in a terminal. It's a purpose-built agent with file system access, git integration, and a fundamentally different approach to autonomous coding. The team behind it explains why...",
  content: `
In February 2025, Anthropic released Claude Code — a command-line tool that lets developers interact with Claude as an autonomous coding agent. No IDE plugin. No web interface. Just a terminal prompt where you describe what you want, and an agent reads your codebase, writes patches, runs tests, and iterates until the job is done.

Within six months, Claude Code had over 500,000 developers. Not tire-kickers — developers who returned daily, integrated it into their workflows, and publicly advocated for it over competing tools. For a CLI tool with no marketing budget beyond developer word-of-mouth, the adoption curve was unprecedented.

We spent three weeks with the Claude Code engineering team — interviewing the tech lead, two senior engineers, and the product lead who shaped the initial vision. What we found is not a chatbot with shell access. It is a purpose-built agent system with architectural decisions that explain both its strengths and its deliberate limitations.

**Today, we cover:**

- Why Anthropic built a CLI tool instead of an IDE plugin
- The context engine: how Claude Code understands your project before you ask
- The tool use loop: read, write, test, iterate
- The permission model and why full autonomy was rejected
- How the team uses Claude Code to build Claude Code
- Adoption data and the workflows developers actually use
- What's shipping next and the hard problems still unsolved

---

## 1. Not a Wrapper: Why Claude Code Exists

The most common misconception about Claude Code is that it's Claude with file system access — a language model in a terminal that can read and write files. The team is emphatic that this description misses the point.

> "If you take Claude and give it bash access, you get a chatbot that can run commands. That's not what we built. Claude Code is an agent system with a context engine, a tool orchestration layer, a permission model, and a verification loop. The model is one component — important, but one component." — Tech lead, Claude Code

The origin story starts with Anthropic engineers' own workflow. As Claude's coding capabilities improved through 2024, Anthropic's internal engineering team increasingly used Claude for code generation — but the workflow was fragmented. They'd copy code into the Claude web interface, get suggestions, copy them back into their editor, run tests manually, and iterate. The feedback loop was slow and context-poor.

The team asked: what if the model could see the entire project, run tests itself, and iterate autonomously — with the developer supervising rather than copy-pasting?

That question led to a series of design decisions that define Claude Code today.

### Why CLI, Not IDE

The first decision: build a CLI tool, not an IDE plugin. This surprised many observers — Cursor, GitHub Copilot, and Windsurf all live inside editors. Why would Anthropic choose the terminal?

The team's reasoning:

- **Editor agnosticism.** Developers use VS Code, JetBrains, Neovim, Emacs, and everything in between. A CLI tool works with all of them. An IDE plugin works with one (or requires maintaining multiple plugins).
- **Composability.** CLI tools integrate into scripts, CI pipelines, git hooks, and automation workflows. IDE plugins are interactive-only.
- **Terminal-native workflows.** Many developers already live in the terminal — git, docker, kubectl, npm. Adding an AI agent to that environment is natural, not foreign.
- **Focus.** An IDE plugin tempts you to add features that compete with the IDE (syntax highlighting, file trees, debugging). A CLI tool does one thing: agent-driven coding.

> "We didn't want to build an IDE. We wanted to build the best coding agent. The CLI is the thinnest interface between the agent and the developer's existing workflow." — Product lead, Claude Code

The tradeoff is real: Claude Code lacks the inline completion and visual diff integration that IDE-embedded tools offer. The team bet that agent-level capabilities (multi-file changes, test execution, autonomous iteration) matter more than inline suggestions. Adoption data suggests they were right — but not universally. Developers who want inline completion still prefer IDE-embedded tools for quick tasks and reach for Claude Code for larger changes.

---

## 2. The Context Engine

The single most important component of Claude Code is not the language model — it is the context engine that prepares project information before every interaction.

When a developer starts a Claude Code session, the system doesn't just pass their prompt to Claude. It first builds a rich context package:

### Project Structure Index

Claude Code scans the project directory and builds a structural index:

- **Directory tree** — folder hierarchy with file counts and types
- **Key configuration files** — package.json, Cargo.toml, pyproject.toml, Makefile, Dockerfile, CI configs
- **Entry points** — main files, route definitions, API endpoints (detected heuristically)
- **Test structure** — test directories, test file patterns, testing framework detected

This index is lightweight (typically 2–5K tokens) and gives the model a map of the project before it reads a single file.

### Git History Context

Claude Code reads recent git history to understand project momentum:

- **Recent commits** (last 10–20) — what's been changing and who's changing it
- **Current branch and status** — uncommitted changes, staged files, branch name
- **Diff of uncommitted changes** — what the developer was working on before starting the session

This context helps the model understand not just what the code looks like, but what the developer is trying to accomplish.

### Selective File Reading

When the developer describes a task, Claude Code doesn't load the entire codebase into context — that would exceed token limits for most projects. Instead, the context engine uses a multi-step approach:

1. **Parse the request** — identify files, modules, and concepts mentioned or implied
2. **Search the index** — find relevant files by name, path, and import relationships
3. **Read selectively** — load relevant files into context, prioritizing those most likely to need changes
4. **Expand on demand** — if the model needs additional files during execution, it requests them through the tool use loop

Engineers describe this as the hardest technical problem in Claude Code:

> "Getting the right files into context is the difference between Claude Code feeling magical and feeling stupid. Too few files and the model lacks context. Too many and you waste tokens on irrelevant code, leaving less room for the actual task. We iterate on the selection algorithm constantly." — Senior engineer, Claude Code

### Context Budget Management

Every Claude Code session operates within a token budget. The context engine manages this budget explicitly:

- **System prompt and tool definitions:** ~3K tokens (fixed)
- **Project index:** ~2–5K tokens
- **Git context:** ~1–3K tokens
- **File contents:** remaining budget, dynamically allocated
- **Conversation history:** grows over the session, compressed when needed

When the budget fills up, the context engine compresses older conversation turns — preserving decisions and outcomes while dropping verbatim text. This compression is lossy by design, and the team acknowledges it as a current limitation.

---

## 3. The Tool Use Loop

Claude Code operates through a tool use loop — the agent cycle that defines its behavior. Understanding this loop explains both what Claude Code does well and where it struggles.

### The Loop

\`\`\`
Developer prompt
  → Context engine prepares project context
  → Model generates plan + tool calls
  → Tool executor runs calls (read file, write patch, run command)
  → Results returned to model
  → Model evaluates results
  → If task incomplete: generate next tool calls (loop)
  → If task complete: present summary to developer
\`\`\`

Each iteration of this loop is one "turn." A typical Claude Code session runs 5–15 turns. Complex tasks can run 20–30 turns.

### Available Tools

Claude Code exposes a focused set of tools to the model:

- **Read** — read file contents (with line range support)
- **Write** — create or overwrite files
- **Edit** — apply targeted patches to existing files (preferred over Write for modifications)
- **Bash** — execute shell commands (with permission checks)
- **Glob** — find files matching patterns
- **Grep** — search file contents with regex
- **Git** — stage, commit, diff, log (subset of git operations)

The tool set is intentionally minimal. Early versions exposed more tools (database access, API calls, package management), but the team found that fewer, well-defined tools produced more reliable agent behavior.

> "Every tool you add is a tool the model can misuse. We started with 15 tools and cut to 7. Reliability went up. The model makes better decisions with fewer options." — Senior engineer, Claude Code

### The Verify-and-Iterate Pattern

The most distinctive aspect of Claude Code's loop is verification. After making changes, the agent is trained to verify its work:

1. **Run tests** — execute the project's test suite (detected from config)
2. **Check linting** — run linters if configured
3. **Verify compilation** — attempt to build the project
4. **Read changed files** — review its own changes for obvious errors

If verification fails, the agent iterates — reading error output, diagnosing the problem, and applying fixes. This loop continues until tests pass or the agent determines it cannot fix the issue.

Engineers report that this verification step is what separates Claude Code from simpler coding assistants:

> "The magic moment is when Claude Code writes code, runs tests, sees failures, and fixes them — all without me intervening. That's not code generation. That's code development." — External developer (quoted from user research)

### Where the Loop Breaks

The team is transparent about failure modes:

- **Long-horizon tasks** (>30 turns) — context compression causes the agent to lose track of earlier decisions
- **Tests that require external services** — databases, APIs, authentication — the agent can't always set up the environment
- **Non-deterministic failures** — flaky tests cause infinite fix loops
- **Large refactors** — changing interfaces across many files exceeds reliable context management
- **Domain-specific knowledge** — the agent lacks business context that isn't in the code

---

## 4. The Permission Model

Claude Code's permission model is its most debated design decision — and the one the team defends most strongly.

### Every Destructive Action Requires Approval

Before Claude Code executes any potentially destructive action, it asks the developer for explicit approval:

- **Writing or editing files** — shows the diff, asks to proceed
- **Running shell commands** — shows the command, asks to proceed
- **Git operations** — shows the operation, asks to proceed
- **Installing packages** — shows the install command, asks to proceed

The developer can approve individual actions, approve a category for the session ("approve all file edits"), or reject and provide guidance.

### Why Not Fully Autonomous?

The team considered and rejected full autonomy — letting the agent make all changes without asking. Their reasoning:

1. **Trust calibration.** Developers need to build trust gradually. Forcing approval on early sessions lets developers learn what the agent does well and poorly before granting broader permissions.
2. **Error containment.** A fully autonomous agent that misinterprets a task can make many bad changes before the developer notices. Approval boundaries limit blast radius.
3. **Developer learning.** Reviewing agent diffs teaches developers about their own codebase — many report learning things about their code from Claude Code's changes.
4. **Production safety.** Claude Code often runs against production codebases. Accidental changes to critical files without approval are unacceptable.

> "We asked developers in research sessions: do you want full autonomy? They said yes. Then we gave them full autonomy and they said 'wait, not like that.' Approval isn't a limitation — it's a feature that makes developers comfortable giving the agent harder tasks." — Product lead, Claude Code

### The Yolo Mode Debate

Power users requested a "yolo mode" — auto-approve everything, let the agent run freely. The team shipped it as an explicit opt-in with warnings:

\`\`\`
--dangerously-skip-permissions
\`\`\`

The flag name is deliberate. Usage data shows ~15% of sessions use skip-permissions mode, concentrated among developers who have 50+ sessions of experience and trust the agent's behavior on their specific codebase.

---

## 5. Dogfooding: Building Claude Code with Claude Code

Anthropic's internal engineering team uses Claude Code to build Claude Code — a practice the team calls "recursive dogfooding." This creates a tight feedback loop but also unique challenges.

### What the Team Uses It For

- **Test writing** — the most common internal use case. Claude Code generates test suites for new features, runs them, and iterates on failures.
- **Refactoring** — internal refactors that touch multiple files but don't change behavior (migrations, renames, interface updates).
- **Bug fixing** — describe the bug, point to the relevant area, let the agent diagnose and fix.
- **Documentation** — generate and update documentation based on code changes.

### What the Team Doesn't Use It For

- **Architecture decisions** — the team is explicit that Claude Code implements decisions; it doesn't make them.
- **Security-sensitive code** — authentication, permission systems, cryptography. Human-written with AI-assisted review at most.
- **Novel algorithm design** — the context engine's file selection algorithm, for example, was designed and implemented by humans.

> "Claude Code is maybe 40% of our code changes now. But it's 40% of the changes we'd describe as 'well-defined tasks with clear success criteria.' The other 60% — design, architecture, security — that's still us." — Tech lead, Claude Code

### The Feedback Loop

Dogfooding creates an unusually tight product feedback loop:

- Engineers hit limitations during daily use and file issues immediately
- Context engine improvements are tested against the Claude Code codebase itself
- Performance regressions are felt personally, not just measured in dashboards
- The team experiences the permission model's friction daily, driving UX improvements

---

## 6. Adoption Data and Real Workflows

Six months after launch, Claude Code's adoption data reveals how developers actually use it — which differs from how the team expected.

### The Numbers

- **500K+ developers** in the first six months
- **Average session length:** 23 minutes
- **Average files changed per session:** 8
- **Return rate (weekly):** 62% of developers who use it once return within 7 days
- **Sessions per weekly active user:** 4.2

### Most Common Workflows

**1. Test writing (31% of sessions)**
Developers point Claude Code at a module and ask it to write tests. The agent reads the code, identifies edge cases, writes tests, runs them, and fixes failures. This is the highest-satisfaction workflow in user research.

**2. Refactoring (24% of sessions)**
Renaming, extracting functions, migrating patterns, updating dependencies. Tasks with clear before/after states where verification (tests pass) confirms success.

**3. Debugging (19% of sessions)**
Developers describe a bug, point to the affected area, and let the agent investigate. The agent reads code, forms hypotheses, adds logging or fixes, and runs tests to verify.

**4. Feature implementation (16% of sessions)**
Implementing a new feature from a description or spec. Success rate varies widely — simple features (add an API endpoint) succeed often; complex features (multi-service changes) frequently require human intervention.

**5. Code explanation and exploration (10% of sessions)**
Developers joining a new codebase use Claude Code to understand architecture, trace data flows, and answer "how does X work?" questions.

### Who Uses It

Adoption data shows concentration among:

- **Senior engineers (60%)** — they know what to delegate and how to review agent output
- **Backend developers (45%)** — CLI-native workflows, test-driven development culture
- **DevOps/platform engineers (22%)** — script generation, config management, CI/CD tasks
- **Junior developers (15%)** — lower adoption than expected; senior engineers report that juniors need to understand code before they can effectively review agent changes

---

## 7. What's Next

The Claude Code team shared their roadmap for 2026, organized by problem area.

### Multi-File Architectural Changes

The current context engine handles single-area changes well but struggles with changes that touch interfaces across many files — for example, renaming a core type used across 30 files, or migrating from one API pattern to another.

The planned approach: **decomposition planning.** Before executing, the agent generates a change plan that identifies all affected files, orders changes to maintain consistency, and executes in phases with verification between each phase.

Target: reliably handle changes touching up to 50 files by Q3 2026.

### CI Integration

Claude Code currently runs tests locally. The team is building CI integration:

- **Trigger Claude Code from CI failures** — a test fails on a PR, Claude Code gets the failure context and proposes a fix
- **Automated PR creation** — Claude Code creates a branch, makes changes, runs tests, and opens a PR for human review
- **Review assistance** — Claude Code reads PR diffs and provides review comments before human reviewers engage

### Team Shared Configurations

Individual developers customize Claude Code through project-level configuration files (.claude/settings). The team is building team-level configurations:

- **Shared permission defaults** — team leads define which actions are auto-approved
- **Custom tool definitions** — teams add project-specific tools (deploy, database migration, load testing)
- **Style and convention enforcement** — team coding standards embedded in the agent's context

### The Hard Problems

The team identified problems they don't have solutions for yet:

- **Long-horizon tasks** — sessions exceeding 30 minutes degrade as context compresses. No good solution without model-level memory improvements.
- **Multi-repository changes** — many real tasks span multiple repos. Claude Code currently operates in a single directory.
- **Non-code artifacts** — design docs, API specifications, and product requirements that inform code changes but live outside the repository.
- **Cost predictability** — complex sessions can consume significant inference tokens. Developers want cost estimates before starting long tasks.

> "The hardest problem isn't making the model smarter. It's making the agent system around the model smarter — better context, better tools, better verification, better permissions. The model is already capable of more than our system lets it do." — Tech lead, Claude Code

### Claude Code vs Competing Agent Tools (2026)

| Capability | Claude Code | Cursor Agent | GitHub Copilot Workspace | Devin |
|------------|-------------|--------------|-------------------------|-------|
| Multi-file edits | Yes (up to ~30 files) | Yes | Limited | Yes |
| CLI-native workflow | Primary interface | IDE-embedded | IDE-embedded | Standalone |
| Test verification loop | Built-in | Partial | No | Partial |
| Permission model | Per-action approval | Configurable | Minimal | Full autonomy |
| Context selection | Custom engine | Index-based | Open files + repo | Full repo |
| Typical session length | 8–23 min | 5–15 min | 2–5 min | 30+ min |

The team positions Claude Code as an agent system first — optimized for tasks that require planning, tool use, and verification — rather than inline completion. That architectural bet explains the CLI-first interface and the investment in context selection over autocomplete latency.

---

## Takeaways

1. **Claude Code is an agent system, not a chatbot with file access.** The context engine, tool orchestration, permission model, and verification loop are the product. The model is one component.

2. **CLI was the right bet for agent-level work.** Editor agnosticism and composability matter more than inline completion for multi-file, autonomous tasks. IDE integration may come later, but the CLI is the foundation.

3. **Context selection is the hardest problem.** Getting the right files into the token budget determines success or failure. This algorithm is Claude Code's core intellectual property.

4. **Verification loops differentiate agents from assistants.** Running tests and iterating on failures — without human intervention — is what makes Claude Code feel like a developer, not a autocomplete.

5. **Permission models enable trust.** Full autonomy sounds appealing but fails in practice. Approval boundaries let developers calibrate trust and limit blast radius.

6. **Developers use it for well-defined tasks.** Test writing, refactoring, and debugging account for 74% of sessions. Architecture and novel feature design remain human work.

7. **Senior engineers adopt first.** Effective use requires knowing what to delegate and how to review output. Junior developers benefit more from inline completion tools.

8. **The roadmap points toward team workflows.** CI integration, shared configurations, and multi-file architectural changes will transform Claude Code from an individual tool into a team infrastructure layer.
  `.trim(),
  tags: ["anthropic", "claude", "ai-coding", "developer-tools"],
};
