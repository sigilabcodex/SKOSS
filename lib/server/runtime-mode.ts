export type RuntimeMode = 'production' | 'pilot' | 'demo';

const supportedRuntimeModes: RuntimeMode[] = ['production', 'pilot', 'demo'];

export function getRuntimeMode(): RuntimeMode {
  const value = process.env.SKOSS_RUNTIME_MODE?.trim().toLowerCase();

  if (value && supportedRuntimeModes.includes(value as RuntimeMode)) {
    return value as RuntimeMode;
  }

  return process.env.NODE_ENV === 'production' ? 'pilot' : 'demo';
}

export function isNonProductionMode() {
  return getRuntimeMode() !== 'production';
}

export function getRuntimeModeLabel() {
  const mode = getRuntimeMode();

  if (mode === 'pilot') {
    return 'Internal Pilot Mode';
  }

  if (mode === 'demo') {
    return 'Demo / Developer Mode';
  }

  return 'Production';
}
