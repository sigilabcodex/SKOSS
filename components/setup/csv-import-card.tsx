'use client';

import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';
import type { CsvEntity } from '@/lib/domain/csv-import';
import { parseCsvContent } from '@/lib/domain/csv-import';

type CsvFieldDescriptor = {
  key: string;
  label: string;
  required?: boolean;
};

type CsvImportCardProps = {
  entity: CsvEntity;
  title: string;
  description: string;
  hint: string;
  sampleHeader: string;
  actionLabel: string;
  chooseFileLabel: string;
  mappingTitle: string;
  previewTitle: string;
  emptyPreview: string;
  noFileLabel: string;
  fields: CsvFieldDescriptor[];
  action: (formData: FormData) => void;
  redirectTo: string;
};

export function CsvImportCard({
  entity,
  title,
  description,
  hint,
  sampleHeader,
  actionLabel,
  chooseFileLabel,
  mappingTitle,
  previewTitle,
  emptyPreview,
  noFileLabel,
  fields,
  action,
  redirectTo,
}: CsvImportCardProps) {
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [csvContent, setCsvContent] = useState('');
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      setFileName('');
      setParseError('');
      setHeaders([]);
      setRows([]);
      setCsvContent('');
      setMapping({});
      return;
    }

    setFileName(nextFile.name);

    try {
      const text = await nextFile.text();
      const parsed = parseCsvContent(text);

      if (parsed.headers.length === 0) {
        setParseError('No columns were found in this CSV file.');
        setHeaders([]);
        setRows([]);
        setCsvContent('');
        setMapping({});
        return;
      }

      const nextMapping: Record<string, string> = {};
      fields.forEach((field) => {
        const directHeader = parsed.headers.find((header) => header.toLowerCase() === field.key.toLowerCase());
        if (directHeader) {
          nextMapping[field.key] = directHeader;
        }
      });

      setParseError('');
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setCsvContent(text);
      setMapping(nextMapping);
    } catch {
      setParseError('The CSV file could not be read. Please try again.');
      setHeaders([]);
      setRows([]);
      setCsvContent('');
      setMapping({});
    }
  }

  return (
    <article className="subpanel page-stack csv-import-card">
      <div className="table-header-row">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <p className="helper-text no-margin">{hint}</p>
      <code className="inline-code">{sampleHeader}</code>

      <label>
        <span className="field-heading">{chooseFileLabel}</span>
        <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
      </label>
      <p className="helper-text no-margin">{fileName || noFileLabel}</p>
      {parseError ? <p className="inline-warning">{parseError}</p> : null}

      {headers.length > 0 ? (
        <form action={action} className="page-stack">
          <input type="hidden" name="entity" value={entity} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input type="hidden" name="mapping" value={JSON.stringify(mapping)} />
          <input type="hidden" name="csvContent" value={csvContent} />

          <div className="page-stack">
            <h4>{mappingTitle}</h4>
            <div className="grid-two">
              {fields.map((field) => (
                <label key={field.key}>
                  <span className="field-heading">
                    {field.label}
                    {field.required ? <span className="setup-required-mark" aria-hidden="true">*</span> : null}
                  </span>
                  <select
                    name={`map-${field.key}`}
                    value={mapping[field.key] ?? ''}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setMapping({ ...mapping, [field.key]: nextValue });
                    }}
                  >
                    <option value="">—</option>
                    {headers.map((header) => (
                      <option key={`${field.key}-${header}`} value={header}>{header}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div className="page-stack">
            <h4>{previewTitle}</h4>
            {previewRows.length > 0 ? (
              <div className="table-scroll-wrap">
                <table className="table-compact">
                  <thead>
                    <tr>
                      {headers.map((header) => (
                        <th key={`${entity}-${header}`}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, index) => (
                      <tr key={`${entity}-preview-${index}`}> 
                        {headers.map((header, columnIndex) => (
                          <td key={`${entity}-preview-${index}-${header}`}>{row[columnIndex] ?? ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-state">{emptyPreview}</p>
            )}
          </div>

          <button type="submit" className="button-primary">{actionLabel}</button>
        </form>
      ) : null}
    </article>
  );
}
