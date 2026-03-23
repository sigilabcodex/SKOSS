import type { ReactNode } from 'react';
import type { PrintIntent } from '@/lib/printing';
import { PrintButton } from '@/components/printing/print-button';
import { ArrowRightIcon } from '@/components/ui-icons';

type PrintDocumentProps = {
  intent: PrintIntent;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  printNowLabel: string;
  browserFirstBadge: string;
  browserFirstHelp: string;
  artifactLabel: string;
  purposeLabel: string;
  sourceWorkspaceLabel: string;
  purposeValue: string;
  sourceWorkspaceValue: string;
  children: ReactNode;
};

export function PrintDocument({
  intent,
  title,
  description,
  backHref,
  backLabel,
  printNowLabel,
  browserFirstBadge,
  browserFirstHelp,
  artifactLabel,
  purposeLabel,
  sourceWorkspaceLabel,
  purposeValue,
  sourceWorkspaceValue,
  children,
}: PrintDocumentProps) {
  return (
    <div className="page-stack print-page">
      <section className="page-context-card screen-only">
        <div>
          <strong>{browserFirstBadge}</strong>
          <p className="helper-text no-margin">{browserFirstHelp}</p>
        </div>
      </section>

      <div className="action-cluster action-row-start screen-only print-toolbar">
        <a href={backHref} className="button-secondary">
          <ArrowRightIcon className="button-icon button-icon-reverse" />
          <span>{backLabel}</span>
        </a>
        <PrintButton label={printNowLabel} />
      </div>

      <article className="panel print-sheet page-stack">
        <header className="print-document-header">
          <div className="page-stack print-title-block">
            <p className="eyebrow">{browserFirstBadge}</p>
            <div>
              <h1>{title}</h1>
              <p className="lede no-margin">{description}</p>
            </div>
          </div>
          <div className="print-intent-grid">
            <div className="print-intent-card">
              <span className="field-label">{artifactLabel}</span>
              <strong>{intent.title}</strong>
              {intent.reference ? <span>{intent.reference}</span> : null}
            </div>
            <div className="print-intent-card">
              <span className="field-label">{purposeLabel}</span>
              <strong>{purposeValue}</strong>
              {intent.summary ? <span>{intent.summary}</span> : null}
            </div>
            <div className="print-intent-card">
              <span className="field-label">{sourceWorkspaceLabel}</span>
              <strong>{sourceWorkspaceValue}</strong>
              <span>{intent.title}</span>
            </div>
          </div>
        </header>

        {children}
      </article>
    </div>
  );
}
