import { useMemo, useState } from 'react';
import type { PromptKind } from '../../entities/prompt-document/model/types';
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

  return (
    <Drawer onClose={onClose} open={open} title="Prompt Vault">
      <div className="drawer-group">
        <h4>Create</h4>
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
          placeholder="tags separated by comma"
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
          Create Document
        </Button>
      </div>

      <div className="drawer-group">
        <h4>Filters</h4>
        <Input
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or tags"
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
          placeholder="Tag filter"
          value={tagFilter}
        />
      </div>

      <div className="drawer-group">
        <h4>Documents</h4>
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
                    Save
                  </Button>
                </div>
              ) : (
                <p className="vault-title">{document.name}</p>
              )}

              <p className="vault-meta">{document.kind}</p>
              <p className="vault-meta">{document.tags.join(', ') || 'No tags'}</p>
              <p className="vault-meta">
                Updated {new Date(document.updatedAt).toLocaleString()}
              </p>

              <div className="vault-actions">
                <Button
                  onClick={() => {
                    setActiveDocument(document.id);
                    onClose();
                  }}
                  tone="brand"
                >
                  Open
                </Button>
                <Button
                  onClick={() => {
                    setEditingNameId(document.id);
                    setEditingName(document.name);
                  }}
                  tone="ghost"
                >
                  Rename
                </Button>
                <Button onClick={() => duplicateDocument(document.id)} tone="ghost">
                  Duplicate
                </Button>
                <Button
                  onClick={() => {
                    if (settings.confirmBeforeDelete) {
                      const ok = window.confirm(`Delete "${document.name}"?`);
                      if (!ok) {
                        return;
                      }
                    }
                    deleteDocument(document.id);
                  }}
                  tone="danger"
                >
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Drawer>
  );
}
