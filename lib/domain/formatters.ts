export function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatDateTimeLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(date));
}

export function formatShiftKeyLabel(shiftKey: 'night' | 'morning' | 'afternoon') {
  return shiftKey.charAt(0).toUpperCase() + shiftKey.slice(1);
}

export function formatStatusLabel(value: string) {
  return value.replaceAll('_', ' ');
}
