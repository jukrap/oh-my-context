import { ChevronDown, Crosshair, ListTree, Tag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../shared/lib/i18n/useI18n';
import { selectSelectedNode, useAppStore } from '../../../shared/model/store';
import {
  DEFAULT_NODE_TAG,
  RECOMMENDED_NODE_TAGS,
} from '../model/constants';

export function AddNodeMenu() {
  const { t } = useI18n();
  const addRootNode = useAppStore((state) => state.addRootNode);
  const addChildNode = useAppStore((state) => state.addChildNode);
  const selectedNode = useAppStore(selectSelectedNode);
  const [open, setOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(DEFAULT_NODE_TAG);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const defaultTagItem =
    RECOMMENDED_NODE_TAGS.find((item) => item.value === DEFAULT_NODE_TAG) ??
    RECOMMENDED_NODE_TAGS[0];
  const extraTagItems = RECOMMENDED_NODE_TAGS.filter(
    (item) => item.value !== DEFAULT_NODE_TAG,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent): void => {
      const container = menuRef.current;
      if (!container) {
        return;
      }

      if (event.target instanceof Node && !container.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleSelectTag = (tagName: string): void => {
    setSelectedTag(tagName);
    setOpen(false);
  };

  const handleAddNode = (target: 'root' | 'child'): void => {
    if (target === 'child') {
      if (!selectedNode) {
        return;
      }
      addChildNode(selectedNode.id, selectedTag);
      return;
    }

    addRootNode(selectedTag);
  };

  return (
    <div className="stack-add-menu" ref={menuRef}>
      <div className="stack-add-inline">
        <button
          aria-expanded={open}
          aria-label={t('selectAddTag')}
          className="omc-btn stack-tag-picker stack-tooltip-btn"
          data-tooltip={t('selectAddTag')}
          data-tooltip-side="bottom"
          onClick={() => setOpen((prev) => !prev)}
          type="button"
        >
          <Tag size={14} />
          <span className="stack-tag-pill">{`<${selectedTag}>`}</span>
          <ChevronDown size={14} />
        </button>

        <button
          aria-label={t('addAtRoot')}
          className="omc-btn stack-add-inline-btn stack-add-root-btn stack-tooltip-btn"
          data-tooltip={t('addAtRoot')}
          data-tooltip-side="bottom"
          onClick={() => handleAddNode('root')}
          type="button"
        >
          <ListTree size={14} />
        </button>

        <button
          aria-disabled={!selectedNode}
          aria-label={selectedNode ? t('addToSelected') : t('selectNodeFirst')}
          className="omc-btn stack-add-inline-btn stack-add-selected-btn stack-tooltip-btn"
          data-disabled={!selectedNode}
          data-tooltip={selectedNode ? t('addToSelected') : t('selectNodeFirst')}
          data-tooltip-side="bottom"
          onClick={() => handleAddNode('child')}
          type="button"
        >
          <Crosshair size={14} />
        </button>
      </div>

      {open ? (
        <div className="stack-add-popover" role="menu">
          <p className="stack-add-section-title">{t('recommendedTags')}</p>

          {defaultTagItem ? (
            <button
              className="stack-add-item stack-add-item-default"
              data-selected={selectedTag === defaultTagItem.value}
              onClick={() => handleSelectTag(defaultTagItem.value)}
              type="button"
            >
              <span className="stack-add-item-head">
                <span className="stack-add-item-title">{'<context>'}</span>
                <span className="stack-add-badge">{t('defaultLabel')}</span>
              </span>
              <span className="stack-add-item-desc">
                {t(defaultTagItem.descriptionKey)}
              </span>
            </button>
          ) : null}

          <div className="stack-add-popover-divider" />
          <div className="stack-add-list">
            {extraTagItems.map((item) => (
              <button
                className="stack-add-item"
                data-selected={selectedTag === item.value}
                key={item.value}
                onClick={() => handleSelectTag(item.value)}
                type="button"
              >
                <span className="stack-add-item-title">
                  {'<'}
                  {item.value}
                  {'>'}
                </span>
                <span className="stack-add-item-desc">{t(item.descriptionKey)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
