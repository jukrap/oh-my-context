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
  const { language, t } = useI18n();
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

  const hints = useMemo(() => {
    if (language === 'ko') {
      return {
        library: '내보내기 시 자동 삽입할 전역 포함 블록을 관리합니다.',
        assignment:
          '현재 활성 문서에 어떤 전역 포함 블록을 적용할지 선택합니다.',
        includeName: '전역 포함 목록에서 식별하기 위한 이름입니다.',
        includeDescription: '용도/설명을 짧게 기록해 재사용성을 높입니다.',
        insertionRule:
          'TOP/BOTTOM 등 삽입 위치 규칙입니다. 고급 위치는 v1 확장 대상입니다.',
        targetTag:
          '특정 태그 기준 삽입 시 사용할 대상 태그명입니다.',
        includeNode:
          '내보내기에 삽입될 실제 태그와 본문 내용입니다.',
        delete: '해당 전역 포함 블록을 삭제합니다.',
      };
    }

    return {
      library:
        'Manage global include blocks that are injected during export.',
      assignment:
        'Choose which includes are enabled for the currently active document.',
      includeName: 'Display name used to identify this include preset.',
      includeDescription:
        'Short purpose note to make reuse easier.',
      insertionRule:
        'Placement rule such as TOP/BOTTOM. Advanced positions are v1 extensions.',
      targetTag:
        'Target tag name used when insertion is tag-relative.',
      includeNode:
        'Actual tag/content node inserted during export.',
      delete: 'Delete this include preset.',
    };
  }, [language]);

  const labels =
    language === 'ko'
      ? {
          library: '포함 블록',
          assignment: '문서 적용',
          name: '이름',
          description: '설명',
          insertionRule: '삽입 규칙',
          includeNode: '삽입 노드',
        }
      : {
          library: 'Include Library',
          assignment: 'Document Assignment',
          name: 'Name',
          description: 'Description',
          insertionRule: 'Insertion Rule',
          includeNode: 'Include Node',
        };

  return (
    <Drawer onClose={onClose} open={open} title={t('globalIncludes')}>
      <div className="drawer-group">
        <h4 className="omc-tooltip-hint" data-tooltip={hints.library}>
          {labels.library}
        </h4>
        <Button onClick={createInclude} tone="brand">
          {t('addInclude')}
        </Button>
        <p className="drawer-hint">
          {t('includeHint')}
        </p>
      </div>

      <div className="drawer-group">
        <h4 className="omc-tooltip-hint" data-tooltip={hints.assignment}>
          {labels.assignment}
        </h4>
        {includes.map((includeItem) => {
          const selected =
            activeDocument?.globalIncludeIds.includes(includeItem.id) ?? false;
          const firstNode = includeItem.nodes[0];

          return (
            <article className="include-item" key={includeItem.id}>
              <div className="editor-row">
                <label className="omc-tooltip-hint" data-tooltip={hints.assignment}>
                  <input
                    checked={selected}
                    onChange={() => toggleIncludeForActiveDocument(includeItem.id)}
                    type="checkbox"
                  />
                  {t('useInActiveDocument')}
                </label>
                <Button
                  onClick={() => deleteInclude(includeItem.id)}
                  tooltip={hints.delete}
                  tone="danger"
                >
                  {t('delete')}
                </Button>
              </div>

              <label className="field-label omc-tooltip-hint" data-tooltip={hints.includeName}>
                {labels.name}
              </label>
              <Input
                onChange={(event) =>
                  updateInclude(includeItem.id, { name: event.target.value })
                }
                value={includeItem.name}
              />
              <label className="field-label omc-tooltip-hint" data-tooltip={hints.includeDescription}>
                {labels.description}
              </label>
              <Input
                onChange={(event) =>
                  updateInclude(includeItem.id, { description: event.target.value })
                }
                placeholder={t('description')}
                value={includeItem.description}
              />

              <label className="field-label omc-tooltip-hint" data-tooltip={hints.insertionRule}>
                {labels.insertionRule}
              </label>
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
                  className="omc-tooltip-btn"
                  data-tooltip={hints.targetTag}
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

              <label className="field-label omc-tooltip-hint" data-tooltip={hints.includeNode}>
                {labels.includeNode}
              </label>
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
