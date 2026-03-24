export type CsvEntity = 'customers' | 'suppliers' | 'rawMaterials';

export interface CsvParseResult {
  headers: string[];
  rows: string[][];
}

export type CsvCustomerField = 'displayName' | 'phone' | 'email' | 'address' | 'deliveryNote' | 'internalNote';
export type CsvSupplierField = 'name' | 'contact' | 'notes';
export type CsvRawMaterialField = 'name' | 'category' | 'defaultUnit' | 'brand' | 'notes';

export type CsvImportField = CsvCustomerField | CsvSupplierField | CsvRawMaterialField;

export interface CsvImportResult {
  imported: number;
  skipped: number;
  warnings: string[];
}

export function parseCsvContent(content: string): CsvParseResult {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];

    if (char === '"') {
      const next = normalized[index + 1];
      if (inQuotes && next === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
      continue;
    }

    if (char === '\n' && !inQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  const [headerRow = [], ...dataRows] = rows;
  const headers = headerRow.map((header, index) => header || `column_${index + 1}`);

  return {
    headers,
    rows: dataRows,
  };
}

export function parseCsvMapping(rawMapping: string): Record<string, string> {
  if (!rawMapping) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawMapping);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return Object.entries(parsed).reduce<Record<string, string>>((acc, [field, columnName]) => {
      if (typeof field !== 'string' || typeof columnName !== 'string') {
        return acc;
      }

      const cleanedField = field.trim();
      const cleanedColumnName = columnName.trim();
      if (!cleanedField || !cleanedColumnName) {
        return acc;
      }

      acc[cleanedField] = cleanedColumnName;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

function toRowRecord(headers: string[], row: string[]) {
  return headers.reduce<Record<string, string>>((acc, header, index) => {
    acc[header] = row[index]?.trim() ?? '';
    return acc;
  }, {});
}

function coerceBoolean(value: string | undefined, fallback = true) {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }

  if (['0', 'false', 'inactive', 'no', 'n'].includes(normalized)) {
    return false;
  }

  if (['1', 'true', 'active', 'yes', 'y'].includes(normalized)) {
    return true;
  }

  return fallback;
}

function readMappedValue(
  rowRecord: Record<string, string>,
  mapping: Record<string, string>,
  field: string,
) {
  const columnName = mapping[field];
  return columnName ? rowRecord[columnName] ?? '' : '';
}

export function buildCustomerImportPayload(
  headers: string[],
  rows: string[][],
  mapping: Record<string, string>,
): Array<{
  displayName: string;
  phone?: string;
  email?: string;
  address?: string;
  deliveryNote?: string;
  internalNote?: string;
  active: boolean;
}> {
  return rows.map((row) => {
    const rowRecord = toRowRecord(headers, row);
    return {
      displayName: readMappedValue(rowRecord, mapping, 'displayName'),
      phone: readMappedValue(rowRecord, mapping, 'phone') || undefined,
      email: readMappedValue(rowRecord, mapping, 'email') || undefined,
      address: readMappedValue(rowRecord, mapping, 'address') || undefined,
      deliveryNote: readMappedValue(rowRecord, mapping, 'deliveryNote') || undefined,
      internalNote: readMappedValue(rowRecord, mapping, 'internalNote') || undefined,
      active: coerceBoolean(readMappedValue(rowRecord, mapping, 'active'), true),
    };
  });
}

export function buildSupplierImportPayload(
  headers: string[],
  rows: string[][],
  mapping: Record<string, string>,
): Array<{
  name: string;
  contact?: string;
  notes?: string;
  active: boolean;
}> {
  return rows.map((row) => {
    const rowRecord = toRowRecord(headers, row);

    return {
      name: readMappedValue(rowRecord, mapping, 'name'),
      contact: readMappedValue(rowRecord, mapping, 'contact') || undefined,
      notes: readMappedValue(rowRecord, mapping, 'notes') || undefined,
      active: coerceBoolean(readMappedValue(rowRecord, mapping, 'active'), true),
    };
  });
}

export function buildRawMaterialImportPayload(
  headers: string[],
  rows: string[][],
  mapping: Record<string, string>,
): Array<{
  name: string;
  category?: string;
  defaultUnit?: string;
  brand?: string;
  notes?: string;
  active: boolean;
}> {
  return rows.map((row) => {
    const rowRecord = toRowRecord(headers, row);

    return {
      name: readMappedValue(rowRecord, mapping, 'name'),
      category: readMappedValue(rowRecord, mapping, 'category') || undefined,
      defaultUnit: readMappedValue(rowRecord, mapping, 'defaultUnit') || undefined,
      brand: readMappedValue(rowRecord, mapping, 'brand') || undefined,
      notes: readMappedValue(rowRecord, mapping, 'notes') || undefined,
      active: coerceBoolean(readMappedValue(rowRecord, mapping, 'active'), true),
    };
  });
}
