import { orders, shiftLogs, wipEntries, workspace } from '@/data/demo-fixtures';

export function getWorkspaceSummary() {
  return {
    workspace,
    ordersToday: orders.filter((order) => order.productionDate === '2026-03-28').length,
    changedOrders: orders.filter((order) => order.status === 'changed').length,
    readyWip: wipEntries.filter((entry) => entry.status === 'ready').length,
  };
}

export function getProductionDayView(productionDate: string) {
  const productionOrders = orders.filter((order) => order.productionDate === productionDate);

  const groupedDemandMap = new Map<string, { label: string; quantity: number; unit: string }>();

  for (const order of productionOrders) {
    for (const line of order.lines) {
      if (line.lineType === 'note_item') {
        continue;
      }

      const existing = groupedDemandMap.get(line.productLabel);
      if (existing) {
        existing.quantity += line.quantity;
      } else {
        groupedDemandMap.set(line.productLabel, {
          label: line.productLabel,
          quantity: line.quantity,
          unit: line.unit,
        });
      }
    }
  }

  return {
    productionDate,
    lastUpdated: '2026-03-21T09:00:00Z',
    groupedDemand: [...groupedDemandMap.values()],
    draftLines: productionOrders.flatMap((order) =>
      order.lines
        .filter((line) => line.lineType === 'draft_product' || line.lineType === 'note_item')
        .map((line) => ({
          id: line.id,
          label: line.productLabel,
          note: line.note ?? order.notes ?? 'Needs review',
        })),
    ),
    wipEntries: wipEntries.filter((entry) => entry.productionDate === productionDate),
    shiftLog: shiftLogs.find((entry) => entry.productionDate === productionDate) ?? null,
  };
}
