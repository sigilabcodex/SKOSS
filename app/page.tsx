import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ActivityFeed } from '@/components/activity-feed';
import { formatDateLabel } from '@/lib/domain/formatters';
import { getPresetExperience, type WorkspaceLinkKey } from '@/lib/business-presets';
import { getWorkspaceSummary } from '@/lib/server/demo-data';
import { getCurrentUserContext } from '@/lib/server/auth';
import { detectInstanceGatewayState, shouldRouteToEntryGateway } from '@/lib/server/instance-entry';
import { getServerTranslator } from '@/lib/i18n/server';
import { readAppData } from '@/lib/server/persistence';
import { ArrowRightIcon, CustomersIcon, HandoffIcon, OrdersIcon, ProductionIcon, SetupIcon, SparklesIcon, TimelineIcon } from '@/components/ui-icons';

type QuickLink = {
  href: Parameters<typeof Link>[0]['href'];
  title: string;
  description: string;
  icon: typeof OrdersIcon;
};

export default async function HomePage() {
  const [summary, { t, locale, preset }, data, userContext] = await Promise.all([
    getWorkspaceSummary(),
    getServerTranslator(),
    readAppData(),
    getCurrentUserContext(),
  ]);
  const { currentUser, visibleWorkspaces, homeWorkspace } = userContext;
  const gatewayState = await detectInstanceGatewayState(data);

  if (shouldRouteToEntryGateway(gatewayState, Boolean(currentUser))) {
    redirect('/entry');
  }

  if (!currentUser) {
    redirect('/login?redirectTo=/');
  }
  const presetExperience = getPresetExperience(preset, summary.preferences.operatingMode);
  const recommendedWorkspace = homeWorkspace === 'home' ? presetExperience.emphasisWorkspace : homeWorkspace;

  const quickLinkMap: Record<WorkspaceLinkKey, QuickLink> = {
    timeline: {
      href: '/timeline',
      title: t('home.quickLinks.timeline.title'),
      description: t('home.quickLinks.timeline.description'),
      icon: TimelineIcon,
    },
    orders: {
      href: '/orders',
      title: t('home.quickLinks.orders.title'),
      description: t('home.quickLinks.orders.description'),
      icon: OrdersIcon,
    },
    customers: {
      href: '/customers',
      title: t('home.quickLinks.customers.title'),
      description: t('home.quickLinks.customers.description'),
      icon: CustomersIcon,
    },
    production: {
      href: '/production',
      title: t('home.quickLinks.production.title'),
      description: t('home.quickLinks.production.description'),
      icon: ProductionIcon,
    },
    handoff: {
      href: '/handoff',
      title: t('home.quickLinks.handoff.title'),
      description: t('home.quickLinks.handoff.description'),
      icon: HandoffIcon,
    },
    admin: {
      href: '/admin/setup',
      title: t('home.quickLinks.setup.title'),
      description: t('home.quickLinks.setup.description'),
      icon: SetupIcon,
    },
  };

  const quickLinks = visibleWorkspaces
    .filter((key): key is WorkspaceLinkKey => key in quickLinkMap);
  const featuredQuickLinkKeys = presetExperience.featuredWorkspaces.filter((key) => quickLinks.includes(key));
  const remainingQuickLinkKeys = quickLinks.filter((key) => !featuredQuickLinkKeys.includes(key));
  const orderedQuickLinkKeys = [...featuredQuickLinkKeys, ...remainingQuickLinkKeys];
  const orderedQuickLinks = orderedQuickLinkKeys.map((key) => quickLinkMap[key]);

  if (!summary.preferences.onboardingCompleted) {
    redirect('/bootstrap?step=1');
  }

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-header">
          <div>
            <p className="eyebrow">{t('home.eyebrow')}</p>
            <h1>{summary.workspace.name}</h1>
            <p className="lede">{t('home.lede')}</p>
          </div>
          <div className="hero-note">
            <SparklesIcon className="callout-icon" />
            <div>
              <strong>{t('home.focusDate')}</strong>
              <p className="helper-text no-margin">{formatDateLabel(summary.focusDate, locale)} {t('home.focusDateHelp')}</p>
            </div>
          </div>
        </div>
        <div className="summary-pill-row">
          <span className="summary-pill">{t(`presets.${preset}.label`)}</span>
          <span className="summary-pill">{t(`operatingModes.${summary.preferences.operatingMode}.label`)}</span>
          {currentUser ? <span className="summary-pill">{currentUser.displayName} · {t(`roles.${currentUser.role}.label`)}</span> : null}
          <span className="summary-pill">{t(`nav.${recommendedWorkspace}`)} · {t('home.recommendedFirst')}</span>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">{t('home.stats.ordersToday')}</span>
            <strong>{summary.ordersToday}</strong>
            <span>{t('home.stats.ordersOnDate')} {formatDateLabel(summary.focusDate, locale)}</span>
          </div>
          <div className="stat-card stat-card-warn">
            <span className="stat-label">{t('home.stats.kitchenAttention')}</span>
            <strong>{summary.changedOrders}</strong>
            <span>{t('home.stats.kitchenAttentionHelp')}</span>
          </div>
          <div className="stat-card stat-card-success">
            <span className="stat-label">{t('home.stats.readyWip')}</span>
            <strong>{summary.readyWip}</strong>
            <span>{t('home.stats.readyWipHelp')}</span>
          </div>
          <div className="stat-card stat-card-info">
            <span className="stat-label">{t('home.stats.recurringTemplates')}</span>
            <strong>{summary.recurringTemplates}</strong>
            <span>{t('home.stats.recurringTemplatesHelp')}</span>
          </div>
          <div className="stat-card stat-card-neutral">
            <span className="stat-label">{t('home.stats.partialOrders')}</span>
            <strong>{summary.partialOrders}</strong>
            <span>{t('home.stats.partialOrdersHelp')}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">{t('home.stats.supplierPrices')}</span>
            <strong>{summary.procurementPrices}</strong>
            <span>{summary.suppliers} {t('home.stats.supplierPricesHelp')} · {summary.rawMaterials} {t('home.stats.supplierPricesAnd')}</span>
          </div>
        </div>
      </section>

      <section className="grid-two">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('home.presetFocusTitle')}</h2>
              <p>{t('home.presetFocusBody', { preset: t(`presets.${preset}.label`) })}</p>
            </div>
            <span className="summary-pill">{t(`nav.${presetExperience.emphasisWorkspace}`)}</span>
          </div>
          <ul className="stack-list">
            {presetExperience.starterSuggestionKeys.map((key) => (
              <li key={key}>
                <strong>{t(`presetSuggestions.${key}.title`)}</strong>
                <span>{t(`presetSuggestions.${key}.body`)}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('home.exampleSetupTitle')}</h2>
              <p>{t('home.exampleSetupBody')}</p>
            </div>
            <span className="summary-pill">{t('setup.title')}</span>
          </div>
          <ul className="stack-list">
            {presetExperience.exampleKeys.map((key) => (
              <li key={key}>
                <strong>{t(`presetExamples.${key}.title`)}</strong>
                <span>{t(`presetExamples.${key}.body`)}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <ActivityFeed
        title={t('activity.homeTitle')}
        description={t('activity.homeHelp')}
        emptyLabel={t('activity.empty')}
        items={summary.recentActivities}
      />

      <section className="page-context-card">
        <SparklesIcon className="callout-icon" />
        <div>
          <strong>{t('home.roleFocusTitle')}</strong>
          <p className="helper-text no-margin">
            {currentUser
              ? t('home.roleFocusBody', {
                  role: t(`roles.${currentUser.role}.label`),
                  workspace: t(`nav.${recommendedWorkspace}`),
                })
              : t('home.roleFocusFallback')}
          </p>
        </div>
      </section>

      <section className="grid-cards">
        {orderedQuickLinks.map((link, index) => {
          const Icon = link.icon;
          const isRecommended = homeWorkspace === 'home' ? index === 0 : link.href === `/${recommendedWorkspace}`;

          return (
            <Link key={String(link.href)} href={link.href} className="panel-link">
              <div className="panel-link-header">
                <div className="panel-link-icon-wrap">
                  <Icon className="panel-link-icon" />
                </div>
                <ArrowRightIcon className="panel-link-arrow" />
              </div>
              {isRecommended ? <span className="summary-pill">{t('home.recommendedFirst')}</span> : null}
              <h2>{link.title}</h2>
              <p>{link.description}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
