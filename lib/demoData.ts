export interface PreviousActionItem {
  id: string;
  title: string;
  assignee: 'manager' | 'subordinate';
  deadline: string; // YYYY-MM-DD
}

// 名前キーワード → 前回の実行項目（デモ用）
const DEMO_PREVIOUS_ITEMS: Record<string, PreviousActionItem[]> = {
  '田中': [
    {
      id: 'prev-1',
      title: 'AI基礎研修の受講を検討する',
      assignee: 'manager',
      deadline: '2026-03-30', // 過去日付（期限切れ）
    },
    {
      id: 'prev-2',
      title: '人事部向け提案の勉強会に参加してみる',
      assignee: 'subordinate',
      deadline: '2026-03-15', // 過去日付（期限切れ）
    },
    {
      id: 'prev-3',
      title: '松澤さんとの1on1をセッティングする',
      assignee: 'manager',
      deadline: '2026-04-06', // 過去日付（期限切れ）
    },
  ],
};

export function getPreviousItems(name: string): PreviousActionItem[] {
  for (const [keyword, items] of Object.entries(DEMO_PREVIOUS_ITEMS)) {
    if (name.includes(keyword)) {
      return items.map(i => ({ ...i }));
    }
  }
  return [];
}

export function isOverdue(deadline: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(deadline) < today;
}
