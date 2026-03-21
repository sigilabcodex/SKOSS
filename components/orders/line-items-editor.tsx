'use client';

import { MinusIcon, PlusIcon } from '@/components/ui-icons';

export type LineDraft = {
  lineType: string;
  productLabel: string;
  quantity: number | string;
  unit: string;
  note: string;
  completedQuantity?: number;
  lineStatus?: string;
};

interface LineOption {
  value: string;
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

function updateEditorState(editor: HTMLElement) {
  const rows = Array.from(editor.querySelectorAll<HTMLElement>('[data-line-row]')).filter((row) => row.dataset.template !== 'true');
  const countLabel = editor.querySelector<HTMLElement>('[data-line-count]');

  rows.forEach((row, index) => {
    const number = row.querySelector<HTMLElement>('[data-line-number]');
    if (number) {
      number.textContent = `Line ${index + 1}`;
    }
  });

  if (countLabel) {
    countLabel.textContent = `${rows.length} visible rows`;
  }

  rows.forEach((row) => {
    const removeButton = row.querySelector<HTMLButtonElement>('[data-remove-line]');
    if (removeButton) {
      removeButton.disabled = rows.length === 1;
    }
  });
}

function addLine(editorId: string) {
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
  updateEditorState(editor);
}

function removeLine(button: HTMLButtonElement) {
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
  updateEditorState(editor);
}

function LineRow({
  line,
  index,
  lineTypeOptions,
  status,
  template = false,
}: {
  line: LineDraft;
  index: number;
  lineTypeOptions: readonly LineOption[];
  status?: { label: string; tone: string };
  template?: boolean;
}) {
  return (
    <div
      className="line-entry-card line-entry-card-structured"
      data-line-row
      data-template={template ? 'true' : 'false'}
    >
      <div className="line-entry-top">
        <div>
          <strong data-line-number>{`Line ${index + 1}`}</strong>
          <p className="helper-text no-margin">Keep item naming practical. Blank rows can be removed.</p>
        </div>
        <div className="action-cluster wrap-cluster compact-actions">
          {status ? <span className={`badge badge-${status.tone}`}>{status.label}</span> : null}
          <button
            type="button"
            className="button-ghost button-reset"
            data-remove-line
            onClick={(event) => removeLine(event.currentTarget)}
            disabled={index === 0 && !template}
            aria-label={`Remove line ${index + 1}`}
          >
            <MinusIcon className="button-icon" />
            <span>Remove</span>
          </button>
        </div>
      </div>
      <div className="line-grid">
        <label>
          <span className="field-heading">Kind</span>
          <select name="lineType" defaultValue={line.lineType}>
            {lineTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="line-span-2">
          <span className="field-heading">Item name</span>
          <input
            name="productLabel"
            list="product-suggestions"
            defaultValue={line.productLabel}
            placeholder="Country loaf / 800g or mini sweet tray"
          />
        </label>
        <label>
          <span className="field-heading">Quantity</span>
          <input name="quantity" type="number" min="0" step="1" defaultValue={line.quantity} />
        </label>
        <label>
          <span className="field-heading">Unit</span>
          <input name="unit" defaultValue={line.unit} placeholder="pieces" />
        </label>
        <label className="line-span-2">
          <span className="field-heading">Line note</span>
          <input
            name="lineNote"
            defaultValue={line.note}
            placeholder="Packing reminder, flavor note, or exception"
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
  const lines = initialLines.length > 0 ? initialLines : [emptyLine];
  const visibleSuggestions = Array.from(new Set(productSuggestions)).sort();

  return (
    <div className="line-editor-stack" id={editorId} data-line-editor>
      <div className="list-feedback-row">
        <p className="helper-text no-margin">{sectionLabel}</p>
        <span className="inline-meta" data-line-count>{lines.length} visible rows</span>
      </div>

      <div className="line-grid-stack" data-line-list>
        {lines.map((line, index) => (
          <LineRow
            key={`line-row-${index}`}
            line={line}
            index={index}
            lineTypeOptions={lineTypeOptions}
            status={existingStatuses?.[index]}
          />
        ))}
      </div>

      <div className="action-row action-row-start">
        <button type="button" className="button-secondary button-reset" onClick={() => addLine(editorId)}>
          <PlusIcon className="button-icon" />
          <span>Add line</span>
        </button>
      </div>

      <div className="visually-hidden" data-line-row-template>
        <LineRow line={emptyLine} index={lines.length} lineTypeOptions={lineTypeOptions} template />
      </div>

      <datalist id="product-suggestions">
        {visibleSuggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
    </div>
  );
}
