# Stormbreaker DFIR

Windows incident-response console with local-LLM triage (Ollama), streaming
report generation, MITRE ATT&CK correlation, integrity verification and
audit-ready PDF export.

Built on **TanStack Start + React 19 + Vite 7 + Tailwind v4**.

---

## 1. Unzip the project

```bash
unzip stormbreaker-dfir.zip -d stormbreaker-dfir
cd stormbreaker-dfir
```

If you got the folder some other way, just `cd` into it.

## 2. Install dependencies

Requires **Bun ≥ 1.1** (https://bun.sh). Node/pnpm/npm are not supported by
this template's lockfile.

```bash
bun install
```

## 3. Start the dev server

```bash
bun dev
```

Vite will print a local URL (default `http://localhost:8080`). Open it in a
browser — you should land on the case dashboard for `CASE-2026-041`.

## 4. (Optional) Run a local LLM via Ollama

The AI features fall back to a canned senior-analyst response when no LLM is
reachable, so **the app works out of the box without Ollama**. To exercise
real streaming end-to-end:

```bash
# Install Ollama: https://ollama.com/download
ollama serve                 # starts the daemon on http://localhost:11434
ollama pull llama3.1:8b      # or any model listed in Settings
```

In the app, open **Settings** and confirm:

- **Endpoint** = `http://localhost:11434`
- **Model** = `llama3.1:8b` (or whichever you pulled)

The status pill should flip to **Connected**.

## 5. Verify the streaming report

1. Navigate to **Reports** (sidebar).
2. Click **Generate report**.
3. You should see, in real time:
   - The **progress bar** advancing (target ≈ 900 tokens).
   - **Tokens**, **Elapsed** and **tok/s** counters ticking.
   - The right-hand preview filling in Markdown as tokens arrive.
   - A pulsing **streaming** indicator over the preview.
   - Source pill = `Ollama · <model>` (or `Demo fallback` if Ollama is down).
4. While it's streaming, click **Cancel** — generation stops within ~1s, the
   bar turns amber (**Cancelled**), and the partial output stays exportable.
5. Click **Report ( .pdf )** — you'll get a multi-page PDF with:
   - Cover + case metadata
   - Executive summary (from the AI narrative if present)
   - Numbered **Attack chain**
   - **MITRE ATT&CK mapping** table
   - Key IOCs and numbered **Conclusions & recommended actions**
   - **Appendix A — Audit trail** (events, MFT, registry, IOCs with UTC
     timestamps and phase mapping)

Also worth clicking through:

- **Correlation** → *Verify integrity* → *Run correlation* (SHA-256 hash
  chain per source; kill-chain reconstruction is gated behind a green pass).
- **Timeline / Events / MFT** → clicking anywhere opens the **Related
  evidence** side panel and cross-links back to the source view.

## 6. Useful scripts

```bash
bun dev            # dev server (HMR)
bun run build      # production build
bun run preview    # serve the production build locally
bun run lint       # eslint
bun run format     # prettier --write .
```

## Troubleshooting

- **`bun: command not found`** → install Bun: `curl -fsSL https://bun.sh/install | bash`.
- **Port already in use** → `PORT=8081 bun dev`.
- **AI panel shows "Demo fallback"** → Ollama isn't reachable at the
  configured endpoint. Check `curl http://localhost:11434/api/tags`.
- **PDF export is empty** → hard-reload the tab; the PDF is generated
  client-side via `jspdf` and needs the bundle to be fresh.

## Project layout

```
src/
  routes/            # TanStack file-based routes (_app.*.tsx)
  lib/
    case-data.ts     # single source of truth for the demo case
    ollama.ts        # streaming chat client + DFIR prompt
    pdf-report.ts    # jsPDF report + audit-trail appendix
    integrity.ts     # per-source SHA-256 hash chain
    data-service.ts  # loadCase() seam for the future FastAPI backend
    store.ts         # zustand app store
  components/        # UI + AI Elements
```

The `dataService.loadCase(id)` seam in `src/lib/data-service.ts` is the
single place to swap from the bundled mock to a real backend
(`GET /cases/{id}` on the FastAPI you already have wired up in Settings).
