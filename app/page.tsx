import Link from 'next/link';
import { formatDateLabel } from '@/lib/domain/formatters';
import { getWorkspaceSummary } from '@/lib/server/demo-data';
import { getServerTranslator } from '@/lib/i18n/server';
import { ArrowRightIcon, HandoffIcon, OrdersIcon, ProductionIcon, SetupIcon, SparklesIcon } from '@/components/ui-icons';

type QuickLink = {
  href: Parameters<typeof Link>[0]['href'];
  title: string;
  description: string;
  icon: typeof OrdersIcon;
};

export default async function HomePage() {
  const [summary, { t, locale }] = await Promise.all([getWorkspaceSummary(), getServerTranslator()]);

  const quickLinks: QuickLink[] = [
    {
      href: '/orders',
      title: t('home.quickLinks.orders.title'),
      description: t('home.quickLinks.orders.description'),
      icon: OrdersIcon,
    },
    {
      href: '/production',
      title: t('home.quickLinks.production.title'),
      description: t('home.quickLinks.production.description'),
      icon: ProductionIcon,
    },
    {
      href: '/handoff',
      title: t('home.quickLinks.handoff.title'),
      description: t('home.quickLinks.handoff.description'),
      icon: HandoffIcon,
    },
    {
      href: '/setup',
      title: t('home.quickLinks.setup.title'),
      description: t('home.quickLinks.setup.description'),
      icon: SetupIcon,
    },
  ];

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

      <section className="grid-cards">
        {quickLinks.map((link) => {
          const Icon = link.icon;

          return (
            <Link key={String(link.href)} href={link.href} className="panel-link">
              <div className="panel-link-header">
                <div className="panel-link-icon-wrap">
                  <Icon className="panel-link-icon" />
                </div>
                <ArrowRightIcon className="panel-link-arrow" />
              </div>
              <h2>{link.title}</h2>
              <p>{link.description}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
