import { operatingModeOptions, presetOptions } from '@/lib/business-presets';
import type { WorkspacePreferences } from '@/lib/domain/types';
import { localeOptions } from '@/lib/i18n/config';
import { getServerTranslator } from '@/lib/i18n/server';
import { saveOnboardingPreferencesAction } from '@/lib/server/actions';
import { themeOptions } from '@/lib/theme';
import { SetupIcon, SparklesIcon } from '@/components/ui-icons';

type OnboardingAssistantProps = {
  businessName: string;
  preferences: WorkspacePreferences;
  saved?: boolean;
  error?: string;
  variant?: 'first-run' | 'settings';
};

export async function OnboardingAssistant({
  businessName,
  preferences,
  saved = false,
  error,
  variant = 'settings',
}: OnboardingAssistantProps) {
  const { t } = await getServerTranslator();
  const titleKey = variant === 'first-run' ? 'setupAssistant.firstRunTitle' : 'setupAssistant.settingsTitle';
  const introKey = variant === 'first-run' ? 'setupAssistant.firstRunIntro' : 'setupAssistant.settingsIntro';

  return (
    <section className={`panel page-stack onboarding-assistant ${variant === 'first-run' ? 'onboarding-first-run' : ''}`}>
      <div className="table-header-row onboarding-header">
        <div>
          <p className="eyebrow">{t('setupAssistant.eyebrow')}</p>
          <h2>{t(titleKey)}</h2>
          <p>{t(introKey)}</p>
        </div>
        <span className="summary-pill">{t('setupAssistant.progress')}</span>
      </div>

      {saved ? <p className="inline-success">{t('setup.saved.preferences')}</p> : null}
      {error ? <p className="inline-warning">{error}</p> : null}

      <div className="onboarding-progress" aria-label={t('setupAssistant.progressAria')}>
        {[1, 2, 3].map((step) => (
          <span key={step} className="onboarding-progress-step">
            {t('setupAssistant.stepLabel', { step })}
          </span>
        ))}
      </div>

      <form action={saveOnboardingPreferencesAction} className="page-stack">
        <input type="hidden" name="redirectTo" value={variant === 'first-run' ? '/' : '/setup'} />

        <section className="field-section page-stack">
          <div className="field-section-header">
            <div>
              <h3>{t('setupAssistant.sections.business')}</h3>
              <p className="helper-text">{t('setupAssistant.sections.businessHelp')}</p>
            </div>
            <SetupIcon className="callout-icon" />
          </div>
          <label>
            <span className="field-heading">
              {t('setupAssistant.fields.businessName')} <span className="required-dot">{t('common.required')}</span>
            </span>
            <input
              name="businessName"
              defaultValue={businessName}
              placeholder={t('setupAssistant.placeholders.businessName')}
              required
            />
          </label>
          <div className="grid-two">
            <label>
              <span className="field-heading">
                {t('setupAssistant.fields.language')} <span className="required-dot">{t('common.required')}</span>
              </span>
              <select name="locale" defaultValue={preferences.locale}>
                {localeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.nativeLabel}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-heading">
                {t('setupAssistant.fields.operatingMode')} <span className="required-dot">{t('common.required')}</span>
              </span>
              <select name="operatingMode" defaultValue={preferences.operatingMode}>
                {operatingModeOptions.map((mode) => (
                  <option key={mode} value={mode}>
                    {t(`operatingModes.${mode}.label`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="field-section page-stack">
          <div className="field-section-header">
            <div>
              <h3>{t('setupAssistant.sections.preset')}</h3>
              <p className="helper-text">{t('setupAssistant.sections.presetHelp')}</p>
            </div>
            <SparklesIcon className="callout-icon" />
          </div>
          <div className="option-card-grid">
            {presetOptions.map((preset) => (
              <label key={preset} className="option-card">
                <input
                  type="radio"
                  name="preset"
                  value={preset}
                  defaultChecked={preferences.preset === preset}
                />
                <span className="option-card-body">
                  <strong>{t(`presets.${preset}.label`)}</strong>
                  <span className="helper-text">{t(`presets.${preset}.description`)}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="field-section page-stack">
          <div className="field-section-header">
            <div>
              <h3>{t('setupAssistant.sections.appearance')}</h3>
              <p className="helper-text">{t('setupAssistant.sections.appearanceHelp')}</p>
            </div>
            <SparklesIcon className="callout-icon" />
          </div>
          <div className="option-card-grid option-card-grid-compact">
            {themeOptions.map((option) => {
              const Icon = option.icon;

              return (
                <label key={option.name} className="option-card option-card-theme">
                  <input
                    type="radio"
                    name="theme"
                    value={option.name}
                    defaultChecked={preferences.theme === option.name}
                  />
                  <span className="option-card-body">
                    <span className="theme-chip">
                      <Icon className="button-icon" />
                      <strong>{t(`theme.${option.name}.label`)}</strong>
                    </span>
                    <span className="helper-text">{t(`theme.${option.name}.description`)}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <div className="onboarding-actions">
          <button type="submit" className="button-primary">{t('setupAssistant.actions.save')}</button>
          <p className="helper-text no-margin">{t('setupAssistant.footer')}</p>
        </div>
      </form>
    </section>
  );
}
