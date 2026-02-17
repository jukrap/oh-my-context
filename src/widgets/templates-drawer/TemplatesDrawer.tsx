import { useMemo } from 'react';
import {
  createPromptTemplate,
  getPromptTemplateIds,
  type PromptTemplateId,
} from '../../entities/prompt-document/model/templates';
import { useI18n } from '../../shared/lib/i18n/useI18n';
import { selectActiveDocument, useAppStore } from '../../shared/model/store';
import { Button } from '../../shared/ui/Button';
import { Drawer } from '../../shared/ui/Drawer';

interface TemplatesDrawerProps {
  open: boolean;
  onClose: () => void;
}

function getTemplateTranslationKeys(templateId: PromptTemplateId): {
  nameKey:
    | 'templateXmlBaselineName'
    | 'templateXmlStrictOutputName'
    | 'templateRawXmlFragmentName'
    | 'templateChatMessagesStarterName';
  descriptionKey:
    | 'templateXmlBaselineDescription'
    | 'templateXmlStrictOutputDescription'
    | 'templateRawXmlFragmentDescription'
    | 'templateChatMessagesStarterDescription';
} {
  switch (templateId) {
    case 'XML_BASELINE':
      return {
        nameKey: 'templateXmlBaselineName',
        descriptionKey: 'templateXmlBaselineDescription',
      };
    case 'XML_STRICT_OUTPUT':
      return {
        nameKey: 'templateXmlStrictOutputName',
        descriptionKey: 'templateXmlStrictOutputDescription',
      };
    case 'RAW_XML_FRAGMENT':
      return {
        nameKey: 'templateRawXmlFragmentName',
        descriptionKey: 'templateRawXmlFragmentDescription',
      };
    case 'CHAT_MESSAGES_STARTER':
      return {
        nameKey: 'templateChatMessagesStarterName',
        descriptionKey: 'templateChatMessagesStarterDescription',
      };
  }
}

export function TemplatesDrawer({ open, onClose }: TemplatesDrawerProps) {
  const { t } = useI18n();
  const activeDocument = useAppStore(selectActiveDocument);
  const createDocument = useAppStore((state) => state.createDocument);
  const updateActiveDocument = useAppStore((state) => state.updateActiveDocument);
  const setSelectedNodeId = useAppStore((state) => state.setSelectedNodeId);

  const templateIds = useMemo(() => getPromptTemplateIds(), []);

  const applyToActiveDocument = (templateId: PromptTemplateId): void => {
    if (!activeDocument) {
      return;
    }

    const template = createPromptTemplate(templateId);
    updateActiveDocument({
      kind: template.kind,
      tags: template.tags,
      rootTagEnabled: template.rootTagEnabled,
      rootTagName: template.rootTagName,
      nodes: template.nodes,
    });

    setSelectedNodeId(template.nodes[0]?.id ?? null);
  };

  const createFromTemplate = (templateId: PromptTemplateId): void => {
    const template = createPromptTemplate(templateId);
    createDocument({
      name: template.suggestedName,
      kind: template.kind,
      tags: template.tags,
    });

    updateActiveDocument({
      rootTagEnabled: template.rootTagEnabled,
      rootTagName: template.rootTagName,
      nodes: template.nodes,
    });
    setSelectedNodeId(template.nodes[0]?.id ?? null);
    onClose();
  };

  return (
    <Drawer onClose={onClose} open={open} title={t('templatesV1')}>
      <div className="drawer-group">
        <h4 className="omc-tooltip-hint" data-tooltip={t('templatesHint')}>
          {t('templateLibrary')}
        </h4>
        <p className="drawer-hint">{t('templatesHint')}</p>
      </div>

      <div className="vault-list">
        {templateIds.map((templateId) => {
          const template = createPromptTemplate(templateId);
          const translationKeys = getTemplateTranslationKeys(templateId);

          return (
            <article className="vault-item" key={templateId}>
              <p className="vault-title">{t(translationKeys.nameKey)}</p>
              <p className="vault-meta">{t(translationKeys.descriptionKey)}</p>
              <p className="vault-meta">
                <strong>{t('templateKindLabel')}</strong>
                {`: ${template.kind}`}
              </p>
              <p className="vault-meta">
                <strong>{t('templateNodeCountLabel')}</strong>
                {`: ${template.nodes.length}`}
              </p>
              <div className="vault-actions">
                <Button
                  disabled={!activeDocument}
                  onClick={() => applyToActiveDocument(templateId)}
                  tooltip={
                    activeDocument
                      ? t('templateApplyToActiveHint')
                      : t('templateActiveDocumentRequired')
                  }
                  tone="ghost"
                >
                  {t('templateApplyToActive')}
                </Button>
                <Button
                  onClick={() => createFromTemplate(templateId)}
                  tooltip={t('templateCreateDocumentHint')}
                  tone="brand"
                >
                  {t('templateCreateDocument')}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </Drawer>
  );
}
