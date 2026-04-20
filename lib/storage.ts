export interface ActionItem {
  id: string;
  title: string;
  assignee: 'manager' | 'subordinate';
  deadline: string;
  done: boolean;
}

export interface Session {
  id: string;
  subordinateName: string;
  type: string;
  typeName: string;
  situations: string[];
  questions: Array<{
    id: string;
    category: string;
    categoryName: string;
    categoryColor: string;
    text: string;
  }>;
  ngActions: string[];
  deepDiveQuestions: string[];
  memo: string;
  actionItems: ActionItem[];
  status: 'prepared' | 'in_progress' | 'completed';
  closingMessage?: string;
  createdAt: string;
  completedAt?: string;
}

const SESSION_KEY = '1on1_current_session';

export function saveSession(session: Session): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as Session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

// ────────────────────────────────────────────
// 持ち越し話題
// ────────────────────────────────────────────
const CARRYOVER_KEY = '1on1_carryover';

function loadAllCarryOver(): Record<string, string[]> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(CARRYOVER_KEY) ?? '{}'); } catch { return {}; }
}

export function saveCarryOverTopics(name: string, topics: string[]): void {
  if (typeof window === 'undefined') return;
  const all = loadAllCarryOver();
  all[name] = topics;
  localStorage.setItem(CARRYOVER_KEY, JSON.stringify(all));
}

export function getCarryOverTopics(name: string): string[] {
  return loadAllCarryOver()[name] ?? [];
}

export function clearCarryOverTopics(name: string): void {
  if (typeof window === 'undefined') return;
  const all = loadAllCarryOver();
  delete all[name];
  localStorage.setItem(CARRYOVER_KEY, JSON.stringify(all));
}

// ────────────────────────────────────────────
// カテゴリー使用履歴（直近3回）
// ────────────────────────────────────────────
type CategoryKey = 'relationship' | 'engagement' | 'situation' | 'issues' | 'feedback' | 'career';

const HISTORY_KEY = '1on1_cat_history';

function loadAllHistory(): Record<string, CategoryKey[][]> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(HISTORY_KEY);
  if (!data) return {};
  try { return JSON.parse(data); } catch { return {}; }
}

export function saveCategoryHistory(name: string, categories: CategoryKey[]): void {
  if (typeof window === 'undefined') return;
  const all = loadAllHistory();
  const prev = all[name] ?? [];
  all[name] = [categories, ...prev].slice(0, 3); // 最新3回だけ保持
  localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
}

export function getCategoryHistory(name: string): CategoryKey[][] {
  return loadAllHistory()[name] ?? [];
}

export function getMissingCategories(
  name: string,
  currentCategories: CategoryKey[]
): CategoryKey[] {
  const history = getCategoryHistory(name);
  if (history.length === 0) return []; // 履歴なし → サジェストしない

  const ALL_CATS: CategoryKey[] = ['relationship', 'engagement', 'situation', 'issues', 'feedback', 'career'];
  const recentUsed = new Set(history.flat());
  const currentUsed = new Set(currentCategories);

  // 直近3回でも今回でも使われていないカテゴリー
  return ALL_CATS.filter(c => !recentUsed.has(c) && !currentUsed.has(c));
}
