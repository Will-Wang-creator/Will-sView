function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineFormat(text: string): string {
  return escapeHtml(text).replace(
    /\*\*(.+?)\*\*/g,
    "<strong>$1</strong>"
  );
}

function isTableRow(line: string): boolean {
  return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(lines: string[]): string {
  const rows = lines.filter((line) => !isTableSeparator(line)).map(parseTableRow);
  if (rows.length === 0) return "";

  const [header, ...body] = rows;
  const thead = `<thead><tr>${header.map((cell) => `<th>${inlineFormat(cell)}</th>`).join("")}</tr></thead>`;
  const tbody = body.length
    ? `<tbody>${body
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${inlineFormat(cell)}</td>`).join("")}</tr>`
        )
        .join("")}</tbody>`
    : "";

  return `<table>${thead}${tbody}</table>`;
}

export function renderMarkdown(content: string): string {
  const lines = content.trim().split("\n");
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (isTableRow(line)) {
      const tableLines: string[] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      html.push(renderTable(tableLines));
      continue;
    }

    if (line.startsWith("````")) {
      i++;
      while (i < lines.length && !lines[i].startsWith("````")) i++;
      if (i < lines.length) i++;
      continue;
    }

    if (line.startsWith("## ")) {
      html.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      html.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
      i++;
      continue;
    }

    if (line.startsWith("---")) {
      html.push("<hr />");
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(inlineFormat(lines[i].slice(2)));
        i++;
      }
      html.push(`<blockquote>${quoteLines.join(" ")}</blockquote>`);
      continue;
    }

    if (/^-\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^-\s/.test(lines[i])) {
        items.push(`<li>${inlineFormat(lines[i].replace(/^-\s/, ""))}</li>`);
        i++;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(
          `<li>${inlineFormat(lines[i].replace(/^\d+\.\s/, ""))}</li>`
        );
        i++;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("> ") &&
      !/^-\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !lines[i].startsWith("---") &&
      !isTableRow(lines[i]) &&
      !lines[i].startsWith("````")
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    html.push(`<p>${inlineFormat(paraLines.join(" "))}</p>`);
  }

  return html.join("\n");
}
