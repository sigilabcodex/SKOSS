'use client';

import { PrinterIcon } from '@/components/ui-icons';

type PrintButtonProps = {
  label: string;
  className?: string;
};

export function PrintButton({ label, className = 'button-primary' }: PrintButtonProps) {
  return (
    <button type="button" className={className} onClick={() => window.print()}>
      <PrinterIcon className="button-icon" />
      <span>{label}</span>
    </button>
  );
}
