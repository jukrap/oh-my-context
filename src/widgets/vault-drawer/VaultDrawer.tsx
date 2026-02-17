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

  const hints = useMemo(() => {
    if (language === 'ko') {
      return {
        create:
          '이름, 종류, 태그를 입력해 새 프롬프트 문서를 생성합니다.',
        filters:
          '문서명/태그/종류로 빠르게 목록을 좁힙니다.',
        documents:
          '최근 수정 순으로 정렬된 문서 목록입니다.',
        kind: '문서의 형식 분류입니다.',
        tags: '검색과 그룹화를 위한 문서 라벨입니다.',
        updatedAt: '문서가 마지막으로 저장된 시각입니다.',
        open: '해당 문서를 편집 대상으로 전환합니다.',
        rename: '문서 표시 이름을 수정합니다.',
        duplicate: '문서를 복제해 새 문서로 만듭니다.',
        delete: '문서를 삭제합니다. 설정에 따라 확인 창이 뜹니다.',
      };
    }

    return {
      create:
        'Create a new prompt document with name, kind and tags.',
      filters:
        'Narrow documents quickly by name, tag and kind.',
      documents: 'Documents sorted by most recently updated.',
      kind: 'Document format category.',
      tags: 'Document labels used for search and grouping.',
      updatedAt: 'Last saved timestamp of this document.',
      open: 'Switch this document as the active editor target.',
      rename: 'Edit document display name.',
      duplicate: 'Clone this document into a new one.',
      delete:
        'Delete this document. A confirmation may appear depending on settings.',
    };
  }, [language]);

  const metaLabels =
    language === 'ko'
      ? {
          kind: '종류',
          tags: '태그',
          updatedAt: '수정됨',
        }
      : {
          kind: 'Kind',
          tags: 'Tags',
          updatedAt: 'Updated',
        };

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
              {kind}
            </option>
          ))}
        </select>
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
          <option value="ALL">ALL</option>
          {KIND_OPTIONS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
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
                {`: ${document.kind}`}
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
