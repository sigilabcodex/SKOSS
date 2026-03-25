import type { ActivityActionType, ActivityEntityType, AppData } from '@/lib/domain/types';

type AppendActivityInput = {
  entityType: ActivityEntityType;
  entityId: string;
  action: ActivityActionType;
  summary: string;
  userId?: string;
  timestamp?: string;
};

const activityRetentionLimit = 400;

export function appendActivity(data: AppData, input: AppendActivityInput) {
  const timestamp = input.timestamp ?? new Date().toISOString();
  const summary = input.summary.trim();

  if (!summary) {
    return;
  }

  data.activities = [
    {
      id: `activity-${crypto.randomUUID()}`,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      summary,
      timestamp,
      userId: input.userId,
    },
    ...data.activities,
  ]
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
    .slice(0, activityRetentionLimit);
}
