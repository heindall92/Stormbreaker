// Safe minimal Markdown → HTML: escape first, then apply formatting.
export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function mdToHtml(md: string): string {
  let s = esc(md);
  // code blocks
  s = s.replace(/```([\s\S]*?)```/g, (_m, code) => {
    return `<pre class="mono rounded-md bg-foreground/10 border border-border p-3 my-2 text-xs overflow-x-auto"><code>${code}</code></pre>`;
  });
  // headings
  s = s.replace(/^###\s+(.*)$/gm, '<h3 class="text-base font-semibold mt-4 mb-1 text-primary">$1</h3>');
  s = s.replace(/^##\s+(.*)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2 text-primary">$1</h2>');
  s = s.replace(/^#\s+(.*)$/gm, '<h1 class="text-xl font-bold mt-5 mb-2">$1</h1>');
  // bold / italic / inline code
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/`([^`]+)`/g, '<code class="mono rounded bg-background/50 px-1 py-0.5 text-xs">$1</code>');
  // lists
  s = s.replace(/(^|\n)[-•]\s+(.*)/g, "$1<li>$2</li>");
  s = s.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, '<ul class="list-disc pl-5 my-2 space-y-1">$1</ul>');
  // paragraphs / line breaks
  s = s.replace(/\n{2,}/g, '</p><p class="my-2">');
  s = s.replace(/\n/g, "<br/>");
  return `<p class="my-2">${s}</p>`;
}
