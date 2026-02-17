import { Braces, Code, Copy, Download, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  copyToClipboard,
  createExportFileName,
  downloadTextFile,
} from '../../../shared/lib/export';
import { toJsonView } from '../../../shared/lib/json/render';
import { localize } from '../../../shared/lib/i18n/localize';
import { useI18n } from '../../../shared/lib/i18n/useI18n';
import { toMarkdownView } from '../../../shared/lib/markdown/render';
import { buildXmlPreview } from '../../../shared/lib/xml/serialize';
import { selectActiveDocument, useAppStore } from '../../../shared/model/store';
import { Button } from '../../../shared/ui/Button';
import { Panel } from '../../../shared/ui/Panel';

type PreviewMode = 'XML' | 'MARKDOWN' | 'JSON';

export function PreviewPanel() {
  const { language, t } = useI18n();
  const document = useAppStore(selectActiveDocument);
  const includesById = useAppStore((state) => state.includesById);
  const settings = useAppStore((state) => state.settings);
  const previewTab = useAppStore((state) => state.previewTab);
  const setPreviewTab = useAppStore((state) => state.setPreviewTab);
  const [jsonWithIncludes, setJsonWithIncludes] = useState(false);
  const [jsonWithSettings, setJsonWithSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const jsonHints = useMemo(
    () =>
      localize(language, {
        ko: {
          includeIncludes:
            'JSON ?대낫?닿린???꾩뿭 ?ы븿 釉붾줉 ?뺤쓽瑜??④퍡 ?ы븿?⑸땲??',
          includeSettings:
            'JSON ?대낫?닿린???뚰겕?ㅽ럹?댁뒪 ?ㅼ젙媛믪쓣 ?④퍡 ?ы븿?⑸땲??',
        },
        en: {
          includeIncludes:
            'Include global include definitions in JSON export output.',
          includeSettings:
            'Include workspace settings in JSON export output.',
        },
      }),
    [language],
  );

  const xmlResult = useMemo(() => {
    if (!document) {
      return {
        xml: '',
        canExport: false,
        issues: [],
      };
    }

    return buildXmlPreview(document, includesById, settings);
  }, [document, includesById, settings]);

  const markdownResult = useMemo(() => {
    if (!document) {
      return '';
    }

    return toMarkdownView(document, includesById);
  }, [document, includesById]);

  const jsonResult = useMemo(() => {
    if (!document) {
      return '';
    }

    return toJsonView(document, includesById, settings, {
      includeIncludes: jsonWithIncludes,
      includeSettings: jsonWithSettings,
    });
  }, [document, includesById, jsonWithIncludes, jsonWithSettings, settings]);

  const currentText = useMemo(() => {
    if (previewTab === 'XML') {
      return xmlResult.xml;
    }

    if (previewTab === 'MARKDOWN') {
      return markdownResult;
    }

    return jsonResult;
  }, [jsonResult, markdownResult, previewTab, xmlResult.xml]);

  const canExport = useMemo(() => {
    if (previewTab === 'XML') {
      return xmlResult.canExport;
    }

    return Boolean(currentText);
  }, [currentText, previewTab, xmlResult.canExport]);

  const exportMode = previewTab.toLowerCase() as 'xml' | 'markdown' | 'json';

  async function handleCopy(): Promise<void> {
    const ok = await copyToClipboard(currentText);
    setToast(ok ? t('copied') : t('copyFailed'));
    window.setTimeout(() => setToast(null), 1200);
  }

  function handleDownload(): void {
    if (!document) {
      return;
    }

    const fileName = createExportFileName(document.name, exportMode);
    const mimeType =
      exportMode === 'xml'
        ? 'application/xml;charset=utf-8'
        : exportMode === 'markdown'
          ? 'text/markdown;charset=utf-8'
          : 'application/json;charset=utf-8';

    downloadTextFile(fileName, currentText, mimeType);
  }

  function renderTabButton(tab: PreviewMode) {
    const icon =
      tab === 'XML' ? <Code size={14} /> : tab === 'MARKDOWN' ? <FileText size={14} /> : <Braces size={14} />;

    return (
      <button
        className="preview-tab-button omc-tooltip-btn"
        data-active={previewTab === tab}
        data-tooltip={tab}
        key={tab}
        onClick={() => setPreviewTab(tab)}
        type="button"
      >
        {icon}
        {tab}
      </button>
    );
  }

  return (
    <Panel
      rightSlot={
        <div className="preview-actions">
          <Button
            disabled={!canExport}
            onClick={() => void handleCopy()}
            title={
              previewTab === 'XML'
                ? t('copyXml')
                : previewTab === 'MARKDOWN'
                  ? t('copyMarkdown')
                  : t('copyJson')
            }
            tone="brand"
          >
            <Copy size={14} />
            {previewTab === 'XML'
              ? t('copyXml')
              : previewTab === 'MARKDOWN'
                ? t('copyMarkdown')
                : t('copyJson')}
          </Button>
          <Button disabled={!canExport} onClick={handleDownload} title={t('download')}>
            <Download size={14} />
            {t('download')}
          </Button>
        </div>
      }
      title={t('previewExport')}
    >
      <div className="preview-tabs">
        {(['XML', 'MARKDOWN', 'JSON'] as PreviewMode[]).map(renderTabButton)}
      </div>

      {previewTab === 'JSON' ? (
        <div className="json-options">
          <label className="omc-tooltip-hint" data-tooltip={jsonHints.includeIncludes}>
            <input
              checked={jsonWithIncludes}
              onChange={(event) => setJsonWithIncludes(event.target.checked)}
              type="checkbox"
            />
            {t('includeIncludes')}
          </label>
          <label className="omc-tooltip-hint" data-tooltip={jsonHints.includeSettings}>
            <input
              checked={jsonWithSettings}
              onChange={(event) => setJsonWithSettings(event.target.checked)}
              type="checkbox"
            />
            {t('includeSettings')}
          </label>
        </div>
      ) : null}

      {previewTab === 'XML' && xmlResult.issues.length > 0 ? (
        <div className="preview-issues">
          {xmlResult.issues.map((issue) => (
            <p key={`${issue.message}-${issue.nodeId ?? 'global'}`}>{issue.message}</p>
          ))}
        </div>
      ) : null}

      <pre className="preview-code">{currentText}</pre>
      {toast ? <div className="preview-toast">{toast}</div> : null}
    </Panel>
  );
}
