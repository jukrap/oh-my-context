export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadTextFile(
  fileName: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}

export function createExportFileName(
  documentName: string,
  view: 'xml' | 'markdown' | 'json',
): string {
  const safeName = documentName.trim().replaceAll(/\s+/g, '-').toLowerCase();
  const finalName = safeName.length > 0 ? safeName : 'untitled';

  if (view === 'xml') {
    return `${finalName}-xml.xml`;
  }

  if (view === 'markdown') {
    return `${finalName}-markdown.md`;
  }

  return `${finalName}-json.json`;
}
