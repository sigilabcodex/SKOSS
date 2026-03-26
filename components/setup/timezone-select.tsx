'use client';

import * as React from 'react';

type TimezoneSelectProps = {
  name?: string;
  defaultValue?: string;
};

export function TimezoneSelect({ name = 'timezone', defaultValue = 'UTC' }: TimezoneSelectProps) {
  const detectedTimezone = typeof window !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : '';
  const supportedTimezones = React.useMemo(() => {
    if (typeof Intl.supportedValuesOf === 'function') {
      return Intl.supportedValuesOf('timeZone');
    }

    return ['UTC'];
  }, []);

  const selectedTimezone = (detectedTimezone && supportedTimezones.includes(detectedTimezone))
    ? detectedTimezone
    : defaultValue;

  return (
    <label>
      <span className="field-heading">Timezone <span className="setup-required-mark" aria-hidden="true">*</span></span>
      <select name={name} defaultValue={selectedTimezone} required>
        {(detectedTimezone && supportedTimezones.includes(detectedTimezone)) ? (
          <option value={detectedTimezone}>{detectedTimezone} (detected from this device)</option>
        ) : null}
        {supportedTimezones.map((timezone) => (
          <option key={timezone} value={timezone}>{timezone}</option>
        ))}
      </select>
      <span className="helper-text">Detected from your browser when available. You can change this later.</span>
    </label>
  );
}
