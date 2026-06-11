'use client';

import type { OrderLine } from '@/lib/domain/types';
import { useI18n } from '@/components/i18n-provider';
import { MinusIcon, PlusIcon } from '@/components/ui-icons';

export type LineDraft = {
  lineType: OrderLine['lineType'];
  productLabel: string;
  quantity: number | string;
  unit: string;
  note: string;
  completedQuantity?: number;
  lineStatus?: string;
};

interface LineOption {
  value: OrderLine['lineType'];
  label: string;
}

interface LineItemsEditorProps {
  editorId: string;
  initialLines: LineDraft[];
  productSuggestions: string[];
  lineTypeOptions: readonly LineOption[];
  existingStatuses?: Array<{ label: string; tone: string }>;
  sectionLabel: string;
}

const emptyLine: LineDraft = {
  lineType: 'product_variant',
  productLabel: '',
  quantity: 0,
  unit: 'pieces',
  note: '',
};

function updateEditorState(editor: HTMLElement, labels: { line: string; visibleRows: string; removeLine: string }) {
  const rows = Array.from(editor.querySelectorAll<HTMLElement>('[data-line-row]')).filter((row) => row.dataset.template !== 'true');
  const countLabel = editor.querySelector<HTMLElement>('[data-line-count]');

  rows.forEach((row, index) => {
    const number = row.querySelector<HTMLElement>('[data-line-number]');
    if (number) {
      number.textContent = `${labels.line} ${index + 1}`;
    }

    const removeButton = row.querySelector<HTMLButtonElement>('[data-remove-line]');
    if (removeButton) {
      removeButton.disabled = rows.length === 1;
      removeButton.setAttribute('aria-label', `${labels.removeLine} ${index + 1}`);
    }
  });

  if (countLabel) {
    countLabel.textContent = `${rows.length} ${labels.visibleRows}`;
  }
}

function addLine(editorId: string, labels: { line: string; visibleRows: string; removeLine: string }) {
  const editor = document.getElementById(editorId);
  const list = editor?.querySelector<HTMLElement>('[data-line-list]');
  const template = editor?.querySelector<HTMLElement>('[data-line-row-template] [data-line-row]');

  if (!editor || !list || !template) {
    return;
  }

  const clone = template.cloneNode(true);
  if (!(clone instanceof HTMLElement)) {
    return;
  }

  clone.dataset.template = 'false';
  list.appendChild(clone);
  updateEditorState(editor, labels);
}

function removeLine(button: HTMLButtonElement, labels: { line: string; visibleRows: string; removeLine: string }) {
  const editor = button.closest<HTMLElement>('[data-line-editor]');
  const row = button.closest<HTMLElement>('[data-line-row]');

  if (!editor || !row) {
    return;
  }

  const rows = Array.from(editor.querySelectorAll<HTMLElement>('[data-line-row]')).filter((item) => item.dataset.template !== 'true');
  if (rows.length <= 1) {
    return;
  }

  row.remove();
  updateEditorState(editor, labels);
}

function LineRow({
  line,
  index,
  lineTypeOptions,
  suggestionListId,
  status,
  template = false,
}: {
  line: LineDraft;
  index: number;
  lineTypeOptions: readonly LineOption[];
  suggestionListId: string;
  status?: { label: string; tone: string };
  template?: boolean;
}) {
  const { t } = useI18n();
  const isEmptyDraft = !line.productLabel.trim() && !String(line.quantity).trim() && !line.note.trim();
  const labels = {
    line: t('orders.lineEditor.line'),
    remove: t('orders.lineEditor.remove'),
    removeAria: t('orders.lineEditor.removeAria'),
  };

  return (
    <div
      className={`line-entry-card line-entry-card-structured ${isEmptyDraft && !template ? 'line-entry-card-empty' : ''}`}
      data-line-row
      data-template={template ? 'true' : 'false'}
    >
      <div className="line-entry-top">
        <div>
          <strong data-line-number>{`${labels.line} ${index + 1}`}</strong>
          <p className="helper-text no-margin">{isEmptyDraft && !template ? 'Type the item and quantity. Add more lines only if needed.' : t('orders.lineEditor.rowHelp')}</p>
        </div>
        <div className="action-cluster wrap-cluster compact-actions">
          {status ? <span className={`badge badge-${status.tone}`}>{status.label}</span> : null}
          <button
            type="button"
            className="button-ghost button-reset"
            data-remove-line
            onClick={(event) => removeLine(event.currentTarget, {
              line: labels.line,
              visibleRows: t('orders.lineEditor.visibleRows'),
              removeLine: labels.removeAria,
            })}
            disabled={index === 0 && !template}
            aria-label={`${labels.removeAria} ${index + 1}`}
          >
            <MinusIcon className="button-icon" />
            <span>{labels.remove}</span>
          </button>
        </div>
      </div>
      <div className="line-grid">
        <label>
          <span className="field-heading">{t('orders.lineEditor.kind')}</span>
          <select name="lineType" defaultValue={line.lineType}>
            {lineTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="line-span-2">
          <span className="field-heading">{t('orders.lineEditor.itemName')}</span>
          <input
            name="productLabel"
            list={suggestionListId}
            defaultValue={line.productLabel}
            placeholder={t('orders.lineEditor.placeholders.itemName')}
          />
        </label>
        <label>
          <span className="field-heading">{t('orders.lineEditor.quantity')}</span>
          <input name="quantity" type="number" min="0" step="1" defaultValue={line.quantity} />
        </label>
        <label>
          <span className="field-heading">{t('orders.lineEditor.unit')}</span>
          <input name="unit" defaultValue={line.unit} placeholder={t('orders.lineEditor.placeholders.unit')} />
        </label>
        <label className="line-span-2">
          <span className="field-heading">{t('orders.lineEditor.lineNote')}</span>
          <input
            name="lineNote"
            defaultValue={line.note}
            placeholder={t('orders.lineEditor.placeholders.lineNote')}
          />
        </label>
      </div>
    </div>
  );
}

export function LineItemsEditor({
  editorId,
  initialLines,
  productSuggestions,
  lineTypeOptions,
  existingStatuses,
  sectionLabel,
}: LineItemsEditorProps) {
  const { t } = useI18n();
  const lines = initialLines.length > 0 ? initialLines : [emptyLine];
  const visibleSuggestions = Array.from(new Set(productSuggestions)).sort();
  const suggestionListId = `${editorId}-suggestions`;
  const labels = {
    line: t('orders.lineEditor.line'),
    visibleRows: t('orders.lineEditor.visibleRows'),
    removeLine: t('orders.lineEditor.removeAria'),
  };

  return (
    <div className="line-editor-stack" id={editorId} data-line-editor>
      <div className="list-feedback-row">
        <p className="helper-text no-margin">{sectionLabel}</p>
        <span className="inline-meta" data-line-count>{lines.length} {t('orders.lineEditor.visibleRows')}</span>
      </div>

      <div className="line-grid-stack" data-line-list>
        {lines.map((line, index) => (
          <LineRow
            key={`line-row-${index}`}
            line={line}
            index={index}
            lineTypeOptions={lineTypeOptions}
            suggestionListId={suggestionListId}
            status={existingStatuses?.[index]}
          />
        ))}
      </div>

      <div className="action-row action-row-start">
        <button type="button" className="button-secondary button-reset" onClick={() => addLine(editorId, labels)}>
          <PlusIcon className="button-icon" />
          <span>{t('orders.lineEditor.addLine')}</span>
        </button>
      </div>

      <div className="visually-hidden" data-line-row-template>
        <LineRow
          line={emptyLine}
          index={lines.length}
          lineTypeOptions={lineTypeOptions}
          suggestionListId={suggestionListId}
          template
        />
      </div>

      <datalist id={suggestionListId}>
        {visibleSuggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
    </div>
  );
}
