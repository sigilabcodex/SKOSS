import Link from 'next/link';
import { formatDateLabel, formatStatusLabel } from '@/lib/domain/formatters';
import { getTimelineWorkspace } from '@/lib/server/demo-data';
import { ActivityFeed } from '@/components/activity-feed';
import { getCurrentUserContext } from '@/lib/server/auth';
import { getServerTranslator } from '@/lib/i18n/server';
import type { AppLocale } from '@/lib/i18n/config';
import { AlertIcon, ArrowRightIcon, HandoffIcon, OrdersIcon, TimelineIcon } from '@/components/ui-icons';

function formatMinutes(minutes: number | null, t: (key: string) => string) {
  if (minutes === null) {
    return t('timeline.unscheduled');
  }

  const hours = Math.floor(minutes / 60);
  const mins = String(minutes % 60).padStart(2, '0');
  return `${String(hours).padStart(2, '0')}:${mins}`;
}

type TimelineView = Awaited<ReturnType<typeof getTimelineWorkspace>>;
type TimelineEntry = TimelineView['focusEntries'][number];

function getRoleAttentionConfig(role: string | undefined, t: (key: string, values?: Record<string, string | number>) => string) {
  switch (role) {
    case 'kitchen':
      return {
        title: t('timeline.roleAttention.production.title'),
        description: t('timeline.roleAttention.production.description'),
        pick: (entry: TimelineEntry) => entry.remainingQuantity > 0 || entry.changed,
      };
    case 'shift_lead':
      return {
        title: t('timeline.roleAttention.manager.title'),
        description: t('timeline.roleAttention.manager.description'),
        pick: (entry: TimelineEntry) => entry.fulfillmentType === 'own_delivery' || entry.fulfillmentType === 'app_delivery' || entry.needsAssignment,
      };
    case 'sales':
      return {
        title: t('timeline.roleAttention.frontdesk.title'),
        description: t('timeline.roleAttention.frontdesk.description'),
        pick: (entry: TimelineEntry) => entry.fulfillmentType === 'pickup' || Boolean(entry.customerPhone) || Boolean(entry.customerDeliveryNote),
      };
    default:
      return {
        title: t('timeline.roleAttention.manager.title'),
        description: t('timeline.roleAttention.manager.description'),
        pick: (entry: TimelineEntry) => entry.isOverdue || entry.changed || entry.needsAssignment,
      };
  }
}

function TimelineRow({
  entry,
  locale,
  role,
  t,
}: {
  entry: TimelineEntry;
  locale: AppLocale;
  role?: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const statusHints = [] as string[];

  if (entry.remainingQuantity > 0) {
    statusHints.push(t('timeline.remainingHint', { count: entry.remainingQuantity }));
  } else if (entry.readyForPickup) {
    statusHints.push(t('timeline.readyPickupHint'));
  } else if (entry.readyForDispatch) {
    statusHints.push(t('timeline.readyDispatchHint'));
  } else {
    statusHints.push(t('timeline.readyHint'));
  }

  if (entry.needsAssignment) {
    statusHints.push(t('timeline.assignmentNeededHint'));
  }

  if (entry.changed) {
    statusHints.push(t('timeline.changedHint'));
  }

  if (entry.generatedFromTemplate) {
    statusHints.push(t('timeline.recurringHint'));
  }

  const contextLine = role === 'kitchen'
    ? [
        entry.destinationLabel,
        entry.dispatchNotes,
        entry.notes,
      ].filter(Boolean).join(' · ')
    : role === 'shift_lead'
      ? [
          entry.destinationLabel,
          entry.providerLabel,
          entry.deliveryAssignee,
          entry.dispatchNotes,
        ].filter(Boolean).join(' · ')
      : [
          entry.destinationLabel,
          entry.customerPhone,
          entry.customerDeliveryNote,
        ].filter(Boolean).join(' · ');

  return (
    <article className={`timeline-row timeline-row-${entry.timingBucket}`}>
      <div className="timeline-row-time">
        <span className="time-chip">{entry.promisedTime ?? t('timeline.unscheduledShort')}</span>
        <span>{entry.isOverdue ? t('timeline.overdue') : formatDateLabel(entry.productionDate, locale)}</span>
      </div>
      <div className="timeline-row-main">
        <div className="order-card-header">
          <div>
            <strong>{entry.customerLabel}</strong>
            <p>{contextLine || t('common.destinationStillOpen')}</p>
          </div>
          <div className="page-stack compact-badge-stack align-end">
            <span className={`badge badge-${entry.status}`}>{formatStatusLabel(entry.status, t)}</span>
            <span className={`badge badge-${entry.fulfillmentType === 'pickup' ? 'ready' : entry.fulfillmentType === 'app_delivery' ? 'in_progress' : 'active'}`}>
              {formatStatusLabel(entry.fulfillmentType, t)}
            </span>
            {entry.changed ? <span className="badge badge-changed">{t('common.kitchenAttention')}</span> : null}
          </div>
        </div>
        <div className="summary-pill-row">
          {statusHints.map((hint) => (
            <span key={hint} className="summary-pill">{hint}</span>
          ))}
        </div>
        <ul className="mini-line-list timeline-mini-list">
          {entry.lineSummary.map((line) => (
            <li key={line}>
              <strong>{line}</strong>
            </li>
          ))}
          {entry.extraLineCount > 0 ? (
            <li>
              <span>{t('timeline.moreLinesHint', { count: entry.extraLineCount })}</span>
            </li>
          ) : null}
        </ul>
        <Link href={`/orders/${entry.orderId}`} className="button-secondary button-inline-fit">
          <span>{t('common.openOrder')}</span>
          <ArrowRightIcon className="button-icon" />
        </Link>
      </div>
    </article>
  );
}

export default async function TimelinePage() {
  const [view, { currentUser }, { t, locale }] = await Promise.all([
    getTimelineWorkspace(),
    getCurrentUserContext(),
    getServerTranslator(),
  ]);
  const roleAttention = getRoleAttentionConfig(currentUser?.role, t);
  const roleItems = [...view.overdueEntries, ...view.dueNowEntries, ...view.comingSoonEntries, ...view.laterTodayEntries]
    .filter((entry, index, items) => items.findIndex((candidate) => candidate.orderId === entry.orderId) === index)
    .filter(roleAttention.pick)
    .slice(0, 6);

  return (
    <div className="page-stack">
      <section className="section-header page-hero-header">
        <div>
          <p className="eyebrow">{t('timeline.workspace')}</p>
          <h1>{t('timeline.title')}</h1>
          <p>{t('timeline.description')}</p>
        </div>
        <Link href="/orders" className="button-secondary">
          <OrdersIcon className="button-icon" />
          <span>{t('timeline.openOrders')}</span>
        </Link>
      </section>

      <section className="operator-priority-card page-stack">
        <div className="table-header-row">
          <div>
            <p className="eyebrow">Support view</p>
            <h2>{t('timeline.focusDateTitle', { date: formatDateLabel(view.focusDate, locale) })}</h2>
            <p className="helper-text">Use timeline to spot timing risk. Daily work still happens in orders, production, and handoff.</p>
          </div>
          <TimelineIcon className="callout-icon" />
        </div>
        <div className="inline-action-row action-row-start">
          <Link href="/orders" className="button-primary compact-button"><OrdersIcon className="button-icon" />Open orders</Link>
          <Link href="/production" className="button-secondary compact-button">Production board</Link>
          <Link href="/handoff" className="button-ghost compact-button">Handoff</Link>
        </div>
      </section>

      <section className="stats-grid compact-stats-grid support-section">
        <div className="stat-card stat-card-warn">
          <span className="stat-label">{t('timeline.summary.overdue')}</span>
          <strong>{view.summary.overdue}</strong>
          <span>{t('timeline.summary.overdueHelp')}</span>
        </div>
        <div className="stat-card stat-card-info">
          <span className="stat-label">{t('timeline.summary.dueNow')}</span>
          <strong>{view.summary.dueNow}</strong>
          <span>{t('timeline.summary.dueNowHelp')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{t('timeline.summary.comingSoon')}</span>
          <strong>{view.summary.comingSoon}</strong>
          <span>{t('timeline.summary.comingSoonHelp')}</span>
        </div>
        <div className="stat-card stat-card-neutral">
          <span className="stat-label">{t('timeline.summary.laterToday')}</span>
          <strong>{view.summary.laterToday}</strong>
          <span>{t('timeline.summary.laterTodayHelp')}</span>
        </div>
        <div className="stat-card stat-card-success">
          <span className="stat-label">{t('timeline.summary.pickupReady')}</span>
          <strong>{view.summary.readyForPickup}</strong>
          <span>{t('timeline.summary.pickupReadyHelp')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{t('timeline.summary.assignmentNeeded')}</span>
          <strong>{view.summary.needsAssignment}</strong>
          <span>{t('timeline.summary.assignmentNeededHelp')}</span>
        </div>
      </section>

      <section className="timeline-layout">
        <article className="panel page-stack">
          <div className="table-header-row">
            <div>
              <h2>{t('timeline.todayLaneTitle')}</h2>
              <p>{t('timeline.todayLaneHelp')}</p>
            </div>
            <span className="summary-pill">{view.focusEntries.length} {t('common.orders')}</span>
          </div>
          <div className="timeline-lane">
            {view.focusEntries.length ? view.focusEntries.map((entry) => (
              <TimelineRow key={entry.orderId} entry={entry} locale={locale} role={currentUser?.role} t={t} />
            )) : (
              <p className="helper-text no-margin">{t('timeline.noFocusItems')}</p>
            )}
          </div>
        </article>

        <div className="page-stack support-section">
          <article className="panel page-stack">
            <div className="table-header-row">
              <div>
                <h2>{roleAttention.title}</h2>
                <p>{roleAttention.description}</p>
              </div>
              <span className="summary-pill">{currentUser ? t(`roles.${currentUser.role}.label`) : t('roles.shift_lead.label')}</span>
            </div>
            <ul className="stack-list muted-list">
              {roleItems.length ? roleItems.map((entry) => (
                <li key={entry.orderId}>
                  <strong>{entry.customerLabel}</strong>
                  <span>
                    {formatMinutes(entry.promisedMinutes, t)}
                    {entry.destinationLabel ? ` · ${entry.destinationLabel}` : ''}
                    {entry.providerLabel ? ` · ${entry.providerLabel}` : ''}
                    {entry.needsAssignment ? ` · ${t('timeline.assignmentNeededHint')}` : ''}
                    {entry.customerPhone ? ` · ${entry.customerPhone}` : ''}
                  </span>
                </li>
              )) : <li><span>{t('timeline.noRoleAttention')}</span></li>}
            </ul>
          </article>

          <ActivityFeed
            title={t('activity.timelineTitle')}
            description={t('activity.timelineHelp')}
            emptyLabel={t('activity.empty')}
            items={view.recentActivities}
            compact
          />

          <article className="panel page-stack">
            <div className="table-header-row">
              <div>
                <h2>{t('timeline.overdueListTitle')}</h2>
                <p>{t('timeline.overdueListHelp')}</p>
              </div>
              <span className="summary-pill">{view.overdueEntries.length}</span>
            </div>
            <ul className="stack-list muted-list">
              {view.overdueEntries.length ? view.overdueEntries.map((entry) => (
                <li key={entry.orderId}>
                  <strong>{entry.customerLabel}</strong>
                  <span>
                    {formatDateLabel(entry.productionDate, locale)}
                    {entry.promisedTime ? ` · ${entry.promisedTime}` : ''}
                    {entry.destinationLabel ? ` · ${entry.destinationLabel}` : ''}
                    {` · ${t('timeline.remainingHint', { count: entry.remainingQuantity })}`}
                  </span>
                </li>
              )) : <li><span>{t('timeline.noneOverdue')}</span></li>}
            </ul>
          </article>

          <article className="panel page-stack">
            <div className="table-header-row">
              <div>
                <h2>{t('timeline.upcomingTitle')}</h2>
                <p>{t('timeline.upcomingHelp')}</p>
              </div>
              <HandoffIcon className="callout-icon" />
            </div>
            <div className="page-stack">
              {view.upcomingDateGroups.length ? view.upcomingDateGroups.map((group) => (
                <div key={group.productionDate} className="subpanel page-stack">
                  <div className="table-header-row">
                    <strong>{formatDateLabel(group.productionDate, locale)}</strong>
                    <span className="summary-pill">{group.count} {t('common.orders')}</span>
                  </div>
                  <ul className="stack-list muted-list compact-list">
                    {group.entries.slice(0, 4).map((entry) => (
                      <li key={entry.orderId}>
                        <strong>{entry.customerLabel}</strong>
                        <span>
                          {entry.promisedTime ?? t('timeline.unscheduledShort')}
                          {entry.destinationLabel ? ` · ${entry.destinationLabel}` : ''}
                          {entry.fulfillmentType ? ` · ${formatStatusLabel(entry.fulfillmentType, t)}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )) : (
                <section className="page-context-card compact-context-card">
                  <AlertIcon className="callout-icon" />
                  <div>
                    <strong>{t('timeline.noUpcomingTitle')}</strong>
                    <p className="helper-text no-margin">{t('timeline.noUpcomingBody')}</p>
                  </div>
                </section>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
