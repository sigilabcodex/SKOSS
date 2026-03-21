'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
  icon?: ReactNode;
}

export function SubmitButton({ children, pendingLabel, className = '', icon }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={`${className} ${pending ? 'is-pending' : ''}`.trim()} disabled={pending}>
      {icon}
      <span>{pending ? pendingLabel : children}</span>
    </button>
  );
}
