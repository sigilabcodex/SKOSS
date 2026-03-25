import { getServerTranslator } from '@/lib/i18n/server';

type ActivityItem = {
  id: string;
  summary: string;
  timestamp: string;
  userLabel?: string;
};

function formatActivityTime(timestamp: string, locale: string) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export async function ActivityFeed({
  title,
  description,
  emptyLabel,
  items,
  compact = false,
}: {
  title: string;
  description: string;
  emptyLabel: string;
  items: ActivityItem[];
  compact?: boolean;
}) {
  const { locale, t } = await getServerTranslator();

  return (
    <article className="panel page-stack">
      <div className="table-header-row">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span className="summary-pill">{items.length} {t('common.entries')}</span>
      </div>
      {items.length ? (
        <ul className={`stack-list muted-list ${compact ? 'compact-list' : ''}`}>
          {items.map((activity) => (
            <li key={activity.id}>
              <strong>{activity.summary}</strong>
              <span>
                {formatActivityTime(activity.timestamp, locale)}
                {activity.userLabel ? ` · ${activity.userLabel}` : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">{emptyLabel}</p>
      )}
    </article>
  );
}
