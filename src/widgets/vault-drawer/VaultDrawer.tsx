import { useMemo, useState } from 'react';
import type { PromptKind } from '../../entities/prompt-document/model/types';
import { localize } from '../../shared/lib/i18n/localize';
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
  const { language, t } = useI18n();
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
    () =>
      localize(language, {
        ko: {
          XML_STACK: {
            label: 'XML Stack Prompt',
            description:
              'Default tree-based prompt type optimized for safe XML export.',
          },
          MARKDOWN_DOC: {
            label: 'Markdown Document',
            description:
              'Markdown-focused document type for structured instructions and notes.',
          },
          RAW_XML: {
            label: 'Raw XML',
            description:
              'RawXML-oriented document type for directly managed XML fragments.',
          },
          CHAT_MESSAGES_JSON: {
            label: 'Chat Messages JSON',
            description:
              'Best suited for role/content style message-array prompt formats.',
          },
        },
        en: {
          XML_STACK: {
            label: 'XML Stack Prompt',
            description:
              'Default tree-based prompt type optimized for safe XML export.',
          },
          MARKDOWN_DOC: {
            label: 'Markdown Document',
            description:
              'Markdown-focused document type for structured instructions and notes.',
          },
          RAW_XML: {
            label: 'Raw XML',
            description:
              'RawXML-oriented document type for directly managed XML fragments.',
          },
          CHAT_MESSAGES_JSON: {
            label: 'Chat Messages JSON',
            description:
              'Best suited for role/content style message-array prompt formats.',
          },
        },
      }),
    [language],
  );

  const allKinds = localize(language, {
    ko: {
      label: 'All Kinds',
      description: 'Show documents of every kind in the list.',
    },
    en: {
      label: 'All Kinds',
      description: 'Show documents of every kind in the list.',
    },
  });

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

  const hints = useMemo(
    () =>
      localize(language, {
        ko: {
          create: 'Create a new prompt document with name, kind and tags.',
          filters: 'Narrow documents quickly by name, tag and kind.',
          documents: 'Documents sorted by most recently updated.',
          kind: 'Document format category.',
          tags: 'Document labels used for search and grouping.',
          updatedAt: 'Last saved timestamp of this document.',
          open: 'Switch this document as the active editor target.',
          rename: 'Edit document display name.',
          duplicate: 'Clone this document into a new one.',
          delete:
            'Delete this document. A confirmation may appear depending on settings.',
        },
        en: {
          create: 'Create a new prompt document with name, kind and tags.',
          filters: 'Narrow documents quickly by name, tag and kind.',
          documents: 'Documents sorted by most recently updated.',
          kind: 'Document format category.',
          tags: 'Document labels used for search and grouping.',
          updatedAt: 'Last saved timestamp of this document.',
          open: 'Switch this document as the active editor target.',
          rename: 'Edit document display name.',
          duplicate: 'Clone this document into a new one.',
          delete:
            'Delete this document. A confirmation may appear depending on settings.',
        },
      }),
    [language],
  );

  const metaLabels = localize(language, {
    ko: {
      kind: 'Kind',
      tags: 'Tags',
      updatedAt: 'Updated',
    },
    en: {
      kind: 'Kind',
      tags: 'Tags',
      updatedAt: 'Updated',
    },
  });

  return (
    <Drawer onClose={onClose} open={open} title={t('promptVault')}>
      <div className="drawer-group">
        <h4 className="omc-tooltip-hint" data-tooltip={hints.create}>
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
        <h4 className="omc-tooltip-hint" data-tooltip={hints.filters}>
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
          <option value="ALL">{allKinds.label}</option>
          {KIND_OPTIONS.map((kind) => (
            <option key={kind} value={kind}>
              {kindMeta[kind].label}
            </option>
          ))}
        </select>
        <p className="field-help">
          {kindFilter === 'ALL'
            ? allKinds.description
            : kindMeta[kindFilter].description}
        </p>
        <Input
          onChange={(event) => setTagFilter(event.target.value)}
          placeholder={t('tagFilter')}
          value={tagFilter}
        />
      </div>

      <div className="drawer-group">
        <h4 className="omc-tooltip-hint" data-tooltip={hints.documents}>
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
                <strong className="omc-tooltip-hint" data-tooltip={hints.kind}>
                  {metaLabels.kind}
                </strong>
                {`: ${kindMeta[document.kind].label} (${document.kind})`}
              </p>
              <p className="vault-meta">
                <strong className="omc-tooltip-hint" data-tooltip={hints.tags}>
                  {metaLabels.tags}
                </strong>
                {`: ${document.tags.join(', ') || t('noTags')}`}
              </p>
              <p className="vault-meta">
                <strong className="omc-tooltip-hint" data-tooltip={hints.updatedAt}>
                  {metaLabels.updatedAt}
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
                  tooltip={hints.open}
                  tone="brand"
                >
                  {t('open')}
                </Button>
                <Button
                  onClick={() => {
                    setEditingNameId(document.id);
                    setEditingName(document.name);
                  }}
                  tooltip={hints.rename}
                  tone="ghost"
                >
                  {t('rename')}
                </Button>
                <Button
                  onClick={() => duplicateDocument(document.id)}
                  tooltip={hints.duplicate}
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
                  tooltip={hints.delete}
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
