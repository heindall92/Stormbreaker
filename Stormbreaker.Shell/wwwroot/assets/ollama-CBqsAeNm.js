import{a as e,c as t,d as n,f as r,i,o as a,p as o,r as s}from"./case-data-B0NLWAdD.js";function c(e,t){return e.length>t?e.slice(0,t)+`…`:e}function l(){let n=e.filter(e=>e.lvl===`critical`),r=[];r.push(`CASE ${s.id} — host ${s.host} (${s.os})`),r.push(`Analyst: ${s.analyst} · Acquired: ${s.acquired}`),r.push(``),r.push(`KILL CHAIN:`);for(let e of i)r.push(`  [${e.t}] ${e.phase} — ${e.title} (${e.mitre.join(`, `)}) — sources: ${e.src.join(`, `)}`);r.push(``),r.push(`CRITICAL EVENTS:`);for(let e of n)r.push(`  [${e.ts}] EID ${e.id} ${e.ch} user=${e.user} pid=${e.pid} — ${c(e.msg,220)} [MITRE ${e.mitre.join(`, `)}]`);r.push(``),r.push(`MFT TIMESTOMP CANDIDATES:`);for(let e of t.filter(e=>e.flag))r.push(`  rec ${e.rec} ${e.path} — $SI=${e.si} $FN=${e.fn} — ${e.note}`);r.push(``),r.push(`IOCs:`);for(let e of a)r.push(`  (${e.type}, ${e.conf}) ${e.val} — ${e.ctx}`);return r.join(`
`)}async function u(e,t=2500){let n=new AbortController,r=setTimeout(()=>n.abort(),t);try{let t=await fetch(`${e.replace(/\/+$/,``)}/api/tags`,{signal:n.signal});return t.ok?{ok:!0,models:((await t.json()).models??[]).map(e=>e.name)}:{ok:!1,models:[]}}catch{return{ok:!1,models:[]}}finally{clearTimeout(r)}}async function d(e){let t=await fetch(`${e.endpoint.replace(/\/+$/,``)}/api/chat`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({model:e.model,messages:e.messages,stream:!0,options:{temperature:.2}}),signal:e.signal});if(!t.ok||!t.body)throw Error(`Ollama HTTP ${t.status}`);let n=t.body.getReader(),r=new TextDecoder,i=``,a=``;for(;;){let{value:t,done:o}=await n.read();if(o)break;i+=r.decode(t,{stream:!0});let s=i.split(`
`);i=s.pop()??``;for(let t of s){let n=t.trim();if(n)try{let t=JSON.parse(n).message?.content??``;t&&(a+=t,e.onToken(t))}catch{}}}return a}function f(e){return[{role:`system`,content:`You are Stormbreaker, a senior DFIR (Digital Forensics & Incident Response) analyst embedded in a Windows evidence review console.

STRICT RULES
- Analyse ONLY the EVIDENCE DOSSIER provided. Never invent hosts, users, IPs, hashes, event IDs or timestamps.
- If the dossier does not support a claim, say "insufficient evidence".
- Use UTC timestamps exactly as given. Quote Event IDs (EID), MITRE technique IDs (Txxxx.xxx) and file paths verbatim.
- Be terse. Prefer bullet points.

OUTPUT FORMAT (Markdown, <= 450 words, in this order)
## Executive summary
2-4 sentences: what happened, when, blast radius, confidence.

## Attack chain
Numbered steps. Each step: phase — action (EID / source) [Txxxx].

## Key indicators (IOCs)
Bullets grouped by type (IP, Domain, Hash, Path, Registry, USB) with confidence high/medium/low.

## MITRE ATT&CK
Comma-separated unique list of every Txxxx cited above.

## Anomalies & timestomp
Call out $SI vs $FN mismatches, cleared logs, gaps or off-hours activity.

## Containment & next steps
Numbered, prioritised, imperative.

## Confidence & gaps
One line: overall confidence + missing evidence.`},{role:`user`,content:`EVIDENCE DOSSIER (verbatim, do not paraphrase source values):

${l()}

ANALYST QUESTION: ${e||`Provide a full triage analysis of this incident.`}`}]}function p(e){let t=[],n=Array.from(new Set(e.match(/T\d{4}(?:\.\d{3})?/g)??[]));n.length&&t.push({kind:`critical`,title:`${n.length} MITRE technique(s) detected`,detail:n.slice(0,6).join(` · `)});let r=Array.from(new Set(e.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)??[]));return r.length&&t.push({kind:`warning`,title:`${r.length} suspicious IP(s)`,detail:r.slice(0,4).join(` · `)}),/timestomp|cleared|vssadmin|shadow/i.test(e)&&t.push({kind:`critical`,title:`Anti-forensics activity`,detail:`Timestomp / cleared logs / shadow deletion`}),t}function m(e){return`## Executive summary
Confirmed intrusion on **${s.host}** starting **09:41 UTC** via a malicious USB (Kingston SN AABBCC112233 — **T1091**). An obfuscated PowerShell one-liner (EID 4688 / PS 4104 — **T1059.001**, **T1027**) fetched a stager from **185.220.101.47** and established a TLS beacon to :443 (Sysmon 3 — **T1071.001**), a known Tor exit node.

## Attack chain
1. **Initial access** — USB drop, .lnk launched under CORP\\jsmith.
2. **Execution & C2** — encoded PowerShell beacons over TLS.
3. **Persistence** — HKCU Run key \`${r.value}\` and service \`${o.name}\` (**T1547.001**, **T1543.003**).
4. **Defense evasion** — \`${o.name}.exe\` timestomped ($SI 2021 vs $FN 2026 — **T1070.006**); Security.evtx cleared, EID 1102 (**T1070.001**).
5. **Impact** — \`vssadmin delete shadows /all /quiet\` (**T1490**) then mass \`del /f /q\` on \\\\SRV-FILES-01\\finance (**T1485**), 847 files destroyed.
6. **Lateral movement** — NTLM logon type 3 to SRV-FILES-01 (**T1021.002**).

## Key indicators (IOCs)
- IP: \`185.220.101.47\` (Tor exit, high)
- Domain: \`cdn-static-eu.hopto.pro\`
- SHA256: \`${n.sha256Short}\` (${o.name}.exe)
- Path: \`${o.imagePath}\`
- USB serial: \`AABBCC112233\`
- Registry: \`${r.hive}\\...\\Run\\${r.value}\`

## MITRE ATT&CK
T1091 · T1059.001 · T1027 · T1071.001 · T1547.001 · T1543.003 · T1070.006 · T1070.001 · T1490 · T1485 · T1021.002

## Containment & next steps
1. Isolate WKS-FIN-07 and SRV-FILES-01 from the network.
2. Kill \`${o.name}\` and remove Run key + \`${o.name}.exe\`.
3. Block \`185.220.101.47\` and the hopto.pro sub-domain at the perimeter.
4. Restore \\\\SRV-FILES-01\\finance from offline backup; shadow copies are gone.
5. Rotate CORP\\jsmith credentials; hunt for reuse across the estate.
6. Sweep for the SHA256 and USB serial on other hosts.

_Fallback analysis (Ollama unreachable). Configure endpoint in Settings for a live model._`}async function h(e,t,n){let r=e.match(/.{1,4}/gs)??[];for(let e of r){if(n?.aborted)return;t(e),await new Promise(e=>setTimeout(e,8))}}export{u as a,d as i,m as n,h as o,p as r,f as t};