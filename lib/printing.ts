import type { WorkspaceSurface } from '@/lib/domain/types';

export const printArtifactKinds = [
  'order_ticket',
  'production_ticket',
  'handoff_slip',
  'simple_label',
] as const;

export type PrintArtifactKind = (typeof printArtifactKinds)[number];

export const printPurposes = [
  'kitchen_execution',
  'frontdesk_handoff',
  'shift_handoff',
  'item_identification',
] as const;

export type PrintPurpose = (typeof printPurposes)[number];

export interface PrintIntent {
  artifact: PrintArtifactKind;
  purpose: PrintPurpose;
  sourceWorkspace: WorkspaceSurface;
  title: string;
  summary?: string;
  reference?: string;
}

export function createPrintIntent(intent: PrintIntent) {
  return intent;
}
