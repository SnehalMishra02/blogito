import { parseDocument } from 'htmlparser2';
import { isTag } from 'domhandler';
import type { ChildNode } from 'domhandler'; // FIX: Import the ChildNode type

function extractStyleValue(style: string, prop: string): string | null {
  const regex = new RegExp(`${prop}\\s*:\\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})`, 'i');
  const match = style.match(regex);
  return match ? match[1] : null;
}

function extractBackgroundColorFromLine(line: string): string | null {
  const match = line.match(/bg\s*:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/i);
  return match ? match[1] : null;
}

// ✅ Invert a hex color
function invertHexColor(hex: string): string {
  // Normalize 3-digit hex to 6-digit
  if (hex.length === 4) {
    hex = '#' + hex.slice(1).split('').map(ch => ch + ch).join('');
  }

  const r = 255 - parseInt(hex.slice(1, 3), 16);
  const g = 255 - parseInt(hex.slice(3, 5), 16);
  const b = 255 - parseInt(hex.slice(5, 7), 16);

  const toHex = (val: number) => val.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function extractColorsFromHtml(html: string): {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
} {
  let backgroundColor = '#ffffff'; // fallback
  let textColor = '#000000'; // fallback
  const colorFreqMap: Record<string, number> = {};

  // Step 1: Handle last line for background color
  const lines = html.trim().split('\n');
  const lastLine = lines[lines.length - 1]?.trim();
  const bgColorCandidate = extractBackgroundColorFromLine(lastLine);

  if (bgColorCandidate) {
    backgroundColor = bgColorCandidate;
    lines.pop(); // Remove last line from HTML
  }

  const cleanedHtml = lines.join('\n');
  const doc = parseDocument(cleanedHtml);
  const nodes = doc.childNodes;

  // FIX: Change 'any' to the more specific 'ChildNode' type
  function traverse(node: ChildNode) {
    if (!isTag(node)) return;

    if (node.name === 'span' && node.attribs?.style) {
      const spanColor = extractStyleValue(node.attribs.style, 'color');
      if (spanColor) {
        colorFreqMap[spanColor] = (colorFreqMap[spanColor] || 0) + 1;
      }
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  nodes.forEach(traverse);

  // Determine most frequent text color
  const sorted = Object.entries(colorFreqMap).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    textColor = sorted[0][0];
  }

  const primaryColor = invertHexColor(backgroundColor);

  return { backgroundColor, textColor, primaryColor };
}