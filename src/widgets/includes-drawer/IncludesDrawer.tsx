import { useMemo } from 'react';
import { localize } from '../../shared/lib/i18n/localize';
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

  const hints = useMemo(
    () =>
      localize(language, {
        ko: {
          library: '?대낫?닿린 ???먮룞 ?쎌엯???꾩뿭 ?ы븿 釉붾줉??愿由ы빀?덈떎.',
          assignment:
            '?꾩옱 ?쒖꽦 臾몄꽌???대뼡 ?꾩뿭 ?ы븿 釉붾줉???곸슜?좎? ?좏깮?⑸땲??',
          includeName: '?꾩뿭 ?ы븿 紐⑸줉?먯꽌 ?앸퀎?섍린 ?꾪븳 ?대쫫?낅땲??',
          includeDescription: '?⑸룄/?ㅻ챸??吏㏐쾶 湲곕줉???ъ궗?⑹꽦???믪엯?덈떎.',
          insertionRule:
            'TOP/BOTTOM ???쎌엯 ?꾩튂 洹쒖튃?낅땲?? 怨좉툒 ?꾩튂??v1 ?뺤옣 ??곸엯?덈떎.',
          targetTag:
            '?뱀젙 ?쒓렇 湲곗? ?쎌엯 ???ъ슜??????쒓렇紐낆엯?덈떎.',
          includeNode:
            '?대낫?닿린???쎌엯???ㅼ젣 ?쒓렇? 蹂몃Ц ?댁슜?낅땲??',
          delete: '?대떦 ?꾩뿭 ?ы븿 釉붾줉????젣?⑸땲??',
        },
        en: {
          library: 'Manage global include blocks that are injected during export.',
          assignment:
            'Choose which includes are enabled for the currently active document.',
          includeName: 'Display name used to identify this include preset.',
          includeDescription: 'Short purpose note to make reuse easier.',
          insertionRule:
            'Placement rule such as TOP/BOTTOM. Advanced positions are v1 extensions.',
          targetTag:
            'Target tag name used when insertion is tag-relative.',
          includeNode:
            'Actual tag/content node inserted during export.',
          delete: 'Delete this include preset.',
        },
      }),
    [language],
  );

  const labels = localize(language, {
    ko: {
      library: '?ы븿 釉붾줉',
      assignment: '臾몄꽌 ?곸슜',
      name: '?대쫫',
      description: '?ㅻ챸',
      insertionRule: '?쎌엯 洹쒖튃',
      includeNode: '?쎌엯 ?몃뱶',
    },
    en: {
      library: 'Include Library',
      assignment: 'Document Assignment',
      name: 'Name',
      description: 'Description',
      insertionRule: 'Insertion Rule',
      includeNode: 'Include Node',
    },
  });

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
