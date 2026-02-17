import { useMemo, useState } from 'react';
import type { PromptKind } from '../../entities/prompt-document/model/types';
import { useI18n } from '../../shared/lib/i18n/useI18n';
import { useAppStore } from '../../shared/model/store';
import { Button } from '../../shared/ui/Button';
import { Drawer } from '../../shared/ui/Drawer';
import { Input } from '../../shared/ui/Input';

const KIND_OPTIONS: PromptKind[] = [
  'XML_STACK',
  'MARKDOWN_DOC',
  'RAW_XML',
  'CHAT_MESSAGES_JSON',
];

interface VaultDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function VaultDrawer({ open, onClose }: VaultDrawerProps) {
  const { t } = useI18n();
  const documentsById = useAppStore((state) => state.documentsById);
  const documentOrder = useAppStore((state) => state.documentOrder);
  const activeDocumentId = useAppStore((state) => state.activeDocumentId);
  const settings = useAppStore((state) => state.settings);
  const createDocument = useAppStore((state) => state.createDocument);
  const setActiveDocument = useAppStore((state) => state.setActiveDocument);
  const duplicateDocument = useAppStore((state) => state.duplicateDocument);
  const deleteDocument = useAppStore((state) => state.deleteDocument);
  const renameDocument = useAppStore((state) => state.renameDocument);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<'ALL' | PromptKind>('ALL');
  const [tagFilter, setTagFilter] = useState('');
  const [newName, setNewName] = useState('Untitled Prompt');
  const [newKind, setNewKind] = useState<PromptKind>('XML_STACK');
  const [newTags, setNewTags] = useState('');
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const kindMeta = useMemo(
    () => ({
      XML_STACK: {
        label: t('kindXmlStackLabel'),
        description: t('kindXmlStackDescription'),
      },
      MARKDOWN_DOC: {
        label: t('kindMarkdownDocLabel'),
        description: t('kindMarkdownDocDescription'),
      },
      RAW_XML: {
        label: t('kindRawXmlLabel'),
        description: t('kindRawXmlDescription'),
      },
      CHAT_MESSAGES_JSON: {
        label: t('kindChatJsonLabel'),
        description: t('kindChatJsonDescription'),
      },
    }),
    [t],
  );

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedTag = tagFilter.trim().toLowerCase();

    return documentOrder
      .map((id) => documentsById[id])
      .filter((document): document is NonNullable<typeof document> => Boolean(document))
      .filter((document) => {
        const searchHit =
          !normalizedSearch ||
          document.name.toLowerCase().includes(normalizedSearch) ||
          document.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

        const kindHit = kindFilter === 'ALL' || document.kind === kindFilter;
        const tagHit =
          !normalizedTag ||
          document.tags.some((tag) => tag.toLowerCase().includes(normalizedTag));

        return searchHit && kindHit && tagHit;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [documentOrder, documentsById, kindFilter, search, tagFilter]);

  return (
    <Drawer onClose={onClose} open={open} title={t('promptVault')}>
      <div className="drawer-group">
        <h4 className="omc-tooltip-hint" data-tooltip={t('hintVaultCreate')}>
          {t('create')}
        </h4>
        <Input onChange={(event) => setNewName(event.target.value)} value={newName} />
        <select
          className="omc-select"
          onChange={(event) => setNewKind(event.target.value as PromptKind)}
          value={newKind}
        >
          {KIND_OPTIONS.map((kind) => (
            <option key={kind} value={kind}>
              {kindMeta[kind].label}
            </option>
          ))}
        </select>
        <p className="field-help">{kindMeta[newKind].description}</p>
        <Input
          onChange={(event) => setNewTags(event.target.value)}
          placeholder={t('tagsPlaceholder')}
          value={newTags}
        />
        <Button
          onClick={() => {
            createDocument({
              name: newName.trim() || 'Untitled Prompt',
              kind: newKind,
              tags: newTags
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            });
            onClose();
          }}
          tone="brand"
        >
          {t('createDocument')}
        </Button>
      </div>

      <div className="drawer-group">
        <h4 className="omc-tooltip-hint" data-tooltip={t('hintVaultFilters')}>
          {t('filters')}
        </h4>
        <Input
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('searchNameOrTags')}
          value={search}
        />
        <select
          className="omc-select"
          onChange={(event) =>
            setKindFilter((event.target.value as 'ALL' | PromptKind) ?? 'ALL')
          }
          value={kindFilter}
        >
          <option value="ALL">{t('kindAllLabel')}</option>
          {KIND_OPTIONS.map((kind) => (
            <option key={kind} value={kind}>
              {kindMeta[kind].label}
            </option>
          ))}
        </select>
        <p className="field-help">
          {kindFilter === 'ALL'
            ? t('kindAllDescription')
            : kindMeta[kindFilter].description}
        </p>
        <Input
          onChange={(event) => setTagFilter(event.target.value)}
          placeholder={t('tagFilter')}
          value={tagFilter}
        />
      </div>

      <div className="drawer-group">
        <h4 className="omc-tooltip-hint" data-tooltip={t('hintVaultDocuments')}>
          {t('documents')}
        </h4>
        <div className="vault-list">
          {filteredDocuments.map((document) => (
            <article
              className="vault-item"
              data-active={activeDocumentId === document.id}
              key={document.id}
            >
              {editingNameId === document.id ? (
                <div className="vault-edit-row">
                  <Input onChange={(event) => setEditingName(event.target.value)} value={editingName} />
                  <Button
                    onClick={() => {
                      renameDocument(document.id, editingName.trim() || document.name);
                      setEditingNameId(null);
                    }}
                    tone="brand"
                  >
                    {t('save')}
                  </Button>
                </div>
              ) : (
                <p className="vault-title">{document.name}</p>
              )}

              <p className="vault-meta">
                <strong className="omc-tooltip-hint" data-tooltip={t('hintVaultKind')}>
                  {t('vaultLabelKind')}
                </strong>
                {`: ${kindMeta[document.kind].label} (${document.kind})`}
              </p>
              <p className="vault-meta">
                <strong className="omc-tooltip-hint" data-tooltip={t('hintVaultTags')}>
                  {t('tags')}
                </strong>
                {`: ${document.tags.join(', ') || t('noTags')}`}
              </p>
              <p className="vault-meta">
                <strong className="omc-tooltip-hint" data-tooltip={t('hintVaultUpdatedAt')}>
                  {t('vaultLabelUpdated')}
                </strong>
                {': '}
                {t('updatedAt', {
                  time: new Date(document.updatedAt).toLocaleString(),
                })}
              </p>

              <div className="vault-actions">
                <Button
                  onClick={() => {
                    setActiveDocument(document.id);
                    onClose();
                  }}
                  tooltip={t('hintVaultOpen')}
                  tone="brand"
                >
                  {t('open')}
                </Button>
                <Button
                  onClick={() => {
                    setEditingNameId(document.id);
                    setEditingName(document.name);
                  }}
                  tooltip={t('hintVaultRename')}
                  tone="ghost"
                >
                  {t('rename')}
                </Button>
                <Button
                  onClick={() => duplicateDocument(document.id)}
                  tooltip={t('hintVaultDuplicate')}
                  tone="ghost"
                >
                  {t('duplicate')}
                </Button>
                <Button
                  onClick={() => {
                    if (settings.confirmBeforeDelete) {
                      const ok = window.confirm(
                        t('confirmDeleteDocument', { name: document.name }),
                      );
                      if (!ok) {
                        return;
                      }
                    }
                    deleteDocument(document.id);
                  }}
                  tooltip={t('hintVaultDelete')}
                  tone="danger"
                >
                  {t('delete')}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Drawer>
  );
}
