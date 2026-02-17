import { useMemo } from 'react';
import { useI18n } from '../../shared/lib/i18n/useI18n';
import { selectActiveDocument, useAppStore } from '../../shared/model/store';
import { Button } from '../../shared/ui/Button';
import { Drawer } from '../../shared/ui/Drawer';
import { Input } from '../../shared/ui/Input';

interface IncludesDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function IncludesDrawer({ open, onClose }: IncludesDrawerProps) {
  const { t } = useI18n();
  const activeDocument = useAppStore(selectActiveDocument);
  const includesById = useAppStore((state) => state.includesById);
  const includeOrder = useAppStore((state) => state.includeOrder);
  const createInclude = useAppStore((state) => state.createInclude);
  const updateInclude = useAppStore((state) => state.updateInclude);
  const deleteInclude = useAppStore((state) => state.deleteInclude);
  const toggleIncludeForActiveDocument = useAppStore(
    (state) => state.toggleIncludeForActiveDocument,
  );

  const includes = useMemo(
    () =>
      includeOrder
        .map((id) => includesById[id])
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [includeOrder, includesById],
  );

  return (
    <Drawer onClose={onClose} open={open} title={t('globalIncludes')}>
      <div className="drawer-group">
        <Button onClick={createInclude} tone="brand">
          {t('addInclude')}
        </Button>
        <p className="drawer-hint">
          {t('includeHint')}
        </p>
      </div>

      <div className="drawer-group">
        {includes.map((includeItem) => {
          const selected =
            activeDocument?.globalIncludeIds.includes(includeItem.id) ?? false;
          const firstNode = includeItem.nodes[0];

          return (
            <article className="include-item" key={includeItem.id}>
              <div className="editor-row">
                <label>
                  <input
                    checked={selected}
                    onChange={() => toggleIncludeForActiveDocument(includeItem.id)}
                    type="checkbox"
                  />
                  {t('useInActiveDocument')}
                </label>
                <Button onClick={() => deleteInclude(includeItem.id)} tone="danger">
                  {t('delete')}
                </Button>
              </div>

              <Input
                onChange={(event) =>
                  updateInclude(includeItem.id, { name: event.target.value })
                }
                value={includeItem.name}
              />
              <Input
                onChange={(event) =>
                  updateInclude(includeItem.id, { description: event.target.value })
                }
                placeholder={t('description')}
                value={includeItem.description}
              />

              <div className="editor-row">
                <select
                  className="omc-select"
                  onChange={(event) =>
                    updateInclude(includeItem.id, {
                      insertion: {
                        ...includeItem.insertion,
                        position: event.target.value as
                          | 'TOP'
                          | 'BOTTOM'
                          | 'BEFORE_TAG'
                          | 'AFTER_TAG'
                          | 'INSIDE_TAG',
                      },
                    })
                  }
                  value={includeItem.insertion.position}
                >
                  <option value="TOP">TOP</option>
                  <option value="BOTTOM">BOTTOM</option>
                  <option value="BEFORE_TAG">BEFORE_TAG</option>
                  <option value="AFTER_TAG">AFTER_TAG</option>
                  <option value="INSIDE_TAG">INSIDE_TAG</option>
                </select>

                <Input
                  onChange={(event) =>
                    updateInclude(includeItem.id, {
                      insertion: {
                        ...includeItem.insertion,
                        targetTagName: event.target.value,
                      },
                    })
                  }
                  placeholder={t('targetTagName')}
                  value={includeItem.insertion.targetTagName}
                />
              </div>

              <div className="editor-row">
                <Input
                  onChange={(event) =>
                    updateInclude(includeItem.id, {
                      nodes: [
                        {
                          ...(firstNode ?? {
                            id: includeItem.id,
                            tagName: 'include',
                            attributes: {},
                            contentMode: 'Plain',
                            content: '',
                            children: [],
                            enabled: true,
                            collapsed: false,
                          }),
                          tagName: event.target.value,
                        },
                      ],
                    })
                  }
                  placeholder={t('includeTag')}
                  value={firstNode?.tagName ?? 'include'}
                />
                <Input
                  onChange={(event) =>
                    updateInclude(includeItem.id, {
                      nodes: [
                        {
                          ...(firstNode ?? {
                            id: includeItem.id,
                            tagName: 'include',
                            attributes: {},
                            contentMode: 'Plain',
                            content: '',
                            children: [],
                            enabled: true,
                            collapsed: false,
                          }),
                          content: event.target.value,
                        },
                      ],
                    })
                  }
                  placeholder={t('includeContent')}
                  value={firstNode?.content ?? ''}
                />
              </div>
            </article>
          );
        })}
      </div>
    </Drawer>
  );
}
