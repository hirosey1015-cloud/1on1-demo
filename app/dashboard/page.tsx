'use client';

import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

// ─────────────────────────────────────────────────────────────
// ① 既存データ（KPI・マネージャー表・カテゴリー）
// ─────────────────────────────────────────────────────────────

const KPI = [
  {
    label: '1on1 実施率', value: '78%', sub: 'チーム全体（今月）', color: 'indigo',
    icon: (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
    progress: 78,
  },
  {
    label: '今月の実施回数', value: '32回', sub: '前月比 +4回', color: 'emerald',
    icon: (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
  },
  {
    label: '未対応の実行項目', value: '12件', sub: 'うち期限超過 3件', color: 'amber',
    icon: (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>),
  },
  {
    label: '継続実施率', value: '89%', sub: '3ヶ月連続実施', color: 'purple',
    icon: (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>),
    progress: 89,
  },
];

const KPI_COLORS: Record<string, { bg: string; icon: string; progress: string }> = {
  indigo: { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  progress: 'bg-indigo-500'  },
  emerald:{ bg: 'bg-emerald-50', icon: 'text-emerald-600', progress: 'bg-emerald-500' },
  amber:  { bg: 'bg-amber-50',   icon: 'text-amber-600',   progress: 'bg-amber-500'   },
  purple: { bg: 'bg-purple-50',  icon: 'text-purple-600',  progress: 'bg-purple-500'  },
};

const MANAGERS = [
  { name: '山田 花子', dept: '第一営業部',   count: 8, target: 8, lastDate: '2024-01-15' },
  { name: '渡辺 優子', dept: '第二営業部',   count: 8, target: 8, lastDate: '2024-01-15' },
  { name: '佐藤 美咲', dept: 'マーケティング', count: 7, target: 8, lastDate: '2024-01-14' },
  { name: '鈴木 一郎', dept: '製品開発',     count: 6, target: 8, lastDate: '2024-01-12' },
  { name: '田中 健一', dept: 'カスタマー',   count: 3, target: 8, lastDate: '2024-01-08' },
];

const CATEGORIES = [
  { name: '状況把握',           count: 45, color: 'bg-green-500'  },
  { name: 'エンゲージメント',   count: 38, color: 'bg-purple-500' },
  { name: '課題',               count: 32, color: 'bg-orange-500' },
  { name: '人間関係の構築',     count: 28, color: 'bg-blue-500'   },
  { name: 'フィードバック',     count: 25, color: 'bg-pink-500'   },
  { name: '能力開発・キャリア', count: 18, color: 'bg-indigo-500' },
];
const MAX_COUNT = Math.max(...CATEGORIES.map(c => c.count));

// ─────────────────────────────────────────────────────────────
// ② アラートデータ
// ─────────────────────────────────────────────────────────────

const EMPLOYEE_ALERTS = [
  {
    name: '山田 太郎', dept: '営業部', risk: 'high' as const,
    reasons: ['3回連続でエンゲージメント低下（72 → 61 → 52）', '「辞めることも考えている」発言あり'],
    action: '今週中に1on1を実施してください',
  },
  {
    name: '木村 さくら', dept: 'マーケティング', risk: 'medium' as const,
    reasons: ['キャリア不安の発言が2回連続で検出', '実行項目4件が未対応（うち2件は期限超過）'],
    action: 'キャリア面談の実施を検討してください',
  },
];

const MANAGER_ALERTS = [
  {
    name: '田中 健一', dept: 'カスタマー',
    issues: ['実施率低下', 'カテゴリー偏り'],
    reasons: ['今月の実施率が38%（目標75%を大幅下回る）', '質問の72%が「状況把握」カテゴリーに集中（マイクロマネジメントの可能性）'],
    action: '1on1研修の受講を推奨します',
  },
];

const EXCELLENT_MANAGERS = [
  {
    name: '山田 花子', dept: '第一営業部',
    reasons: ['実施率100%', '6カテゴリーをバランスよく活用', '部下エンゲージメント+15pt向上'],
  },
  {
    name: '渡辺 優子', dept: '第二営業部',
    reasons: ['実施率100%', '部下3名全員のエンゲージメントが上昇傾向'],
  },
];

// ─────────────────────────────────────────────────────────────
// ③ エンゲージメント変遷データ
// ─────────────────────────────────────────────────────────────

const OVERALL_TREND = [
  { month: '8月',  score: 58 },
  { month: '9月',  score: 61 },
  { month: '10月', score: 63 },
  { month: '11月', score: 67 },
  { month: '12月', score: 71 },
  { month: '1月',  score: 74 },
];

const DEPT_TREND = [
  { month: '8月',  営業部: 62, マーケ: 58, 製品開発: 55, カスタマー: 52 },
  { month: '9月',  営業部: 66, マーケ: 62, 製品開発: 58, カスタマー: 55 },
  { month: '10月', 営業部: 70, マーケ: 65, 製品開発: 62, カスタマー: 56 },
  { month: '11月', 営業部: 73, マーケ: 68, 製品開発: 65, カスタマー: 58 },
  { month: '12月', 営業部: 77, マーケ: 70, 製品開発: 67, カスタマー: 60 },
  { month: '1月',  営業部: 79, マーケ: 72, 製品開発: 68, カスタマー: 61 },
];

const EMPLOYEE_ENG = [
  { name: '山田 太郎',   dept: '営業部',       last: 72, current: 61 },
  { name: '木村 さくら', dept: 'マーケティング', last: 65, current: 70 },
  { name: '鈴木 一郎',   dept: '製品開発',      last: 75, current: 78 },
  { name: '佐藤 花子',   dept: 'カスタマー',    last: 68, current: 66 },
];

// ─────────────────────────────────────────────────────────────
// ④ KPI相関データ
// ─────────────────────────────────────────────────────────────

const SCATTER_DATA = [
  { dept: '第一営業', 実施率: 100, 離職率: 2  },
  { dept: '第二営業', 実施率: 100, 離職率: 3  },
  { dept: 'マーケ',   実施率: 88,  離職率: 5  },
  { dept: '製品開発', 実施率: 75,  離職率: 8  },
  { dept: 'カスタマー',実施率: 38, 離職率: 18 },
];

const KPI_BAR_DATA = [
  { dept: '第一営業', 実施率: 100, 達成率: 95 },
  { dept: '第二営業', 実施率: 100, 達成率: 92 },
  { dept: 'マーケ',   実施率: 88,  達成率: 85 },
  { dept: '製品開発', 実施率: 75,  達成率: 71 },
  { dept: 'カスタマー',実施率: 38, 達成率: 52 },
];

const PRODUCTIVITY_DATA = [
  { month: '8月',  エンゲージメント: 58, 生産性スコア: 62 },
  { month: '9月',  エンゲージメント: 61, 生産性スコア: 65 },
  { month: '10月', エンゲージメント: 63, 生産性スコア: 67 },
  { month: '11月', エンゲージメント: 67, 生産性スコア: 71 },
  { month: '12月', エンゲージメント: 71, 生産性スコア: 74 },
  { month: '1月',  エンゲージメント: 74, 生産性スコア: 77 },
];

const KPI_INSIGHTS = [
  {
    stat: '約1/4', desc: '1on1実施率が高い部署の離職率は、低い部署の約1/4（2% vs 18%）',
    bg: 'bg-emerald-50', border: 'border-emerald-200', statColor: 'text-emerald-600', descColor: 'text-emerald-900',
  },
  {
    stat: '1.8倍', desc: 'エンゲージメント上位グループの目標達成率は下位グループの1.8倍',
    bg: 'bg-indigo-50', border: 'border-indigo-200', statColor: 'text-indigo-600', descColor: 'text-indigo-900',
  },
  {
    stat: '+16pt', desc: '毎週1on1を実施したチームのエンゲージメントは3ヶ月で+16pt向上',
    bg: 'bg-purple-50', border: 'border-purple-200', statColor: 'text-purple-600', descColor: 'text-purple-900',
  },
];

// ─────────────────────────────────────────────────────────────
// 共通コンポーネント
// ─────────────────────────────────────────────────────────────

const SectionHeader = ({ title, sub }: { title: string; sub: string }) => (
  <div className="mb-5">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
  </div>
);

const SectionDivider = () => (
  <div className="border-t border-gray-100 my-2" />
);

// Scatter カスタム Tooltip
const ScatterTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: typeof SCATTER_DATA[0] }[] }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
        <p className="font-bold text-gray-900 mb-1">{d.dept}</p>
        <p className="text-gray-600">1on1実施率：<span className="font-semibold text-indigo-600">{d.実施率}%</span></p>
        <p className="text-gray-600">離職率：<span className="font-semibold text-red-500">{d.離職率}%</span></p>
      </div>
    );
  }
  return null;
};

// Scatter ドットにラベルを付ける
const LabeledDot = (props: { cx?: number; cy?: number; payload?: typeof SCATTER_DATA[0] }) => {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="#4F46E5" opacity={0.85} />
      <text x={cx} y={cy - 13} textAnchor="middle" fontSize={10} fill="#374151" fontWeight={600}>
        {payload.dept}
      </text>
    </g>
  );
};

// ─────────────────────────────────────────────────────────────
// メインコンポーネント
// ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* ── ページヘッダー ─────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">1on1 エグゼクティブダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-1">人事部長・CHRO向け サマリー（2026年1月時点）</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold border border-amber-200 flex-shrink-0 ml-4">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          デモデータ
        </span>
      </div>

      {/* ══════════════════════════════════════════
          ① アラートセクション
      ══════════════════════════════════════════ */}
      <SectionHeader
        title="🚨 アラート"
        sub="要対応の従業員・マネージャー、および表彰情報"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 -mt-3">

        {/* 要注意従業員 */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔴</span>
            <h3 className="font-bold text-red-800 text-sm">要注意従業員アラート</h3>
            <span className="ml-auto bg-red-200 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {EMPLOYEE_ALERTS.length}名
            </span>
          </div>
          <div className="space-y-3">
            {EMPLOYEE_ALERTS.map((a, i) => (
              <div key={i} className="bg-white rounded-xl border border-red-100 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">{a.risk === 'high' ? '🔴' : '🟡'}</span>
                  <span className="font-bold text-gray-900 text-sm">{a.name}</span>
                  <span className="text-xs text-gray-400">{a.dept}</span>
                  <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                    a.risk === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {a.risk === 'high' ? '高リスク' : '中リスク'}
                  </span>
                </div>
                <ul className="text-xs text-gray-600 space-y-0.5 mb-2">
                  {a.reasons.map((r, j) => <li key={j} className="flex gap-1"><span className="text-red-400">•</span>{r}</li>)}
                </ul>
                <p className="text-xs font-semibold text-red-700">→ {a.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 要注意マネージャー */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🟠</span>
            <h3 className="font-bold text-orange-800 text-sm">要注意マネージャーアラート</h3>
            <span className="ml-auto bg-orange-200 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {MANAGER_ALERTS.length}名
            </span>
          </div>
          <div className="space-y-3">
            {MANAGER_ALERTS.map((a, i) => (
              <div key={i} className="bg-white rounded-xl border border-orange-100 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-gray-900 text-sm">{a.name}</span>
                  <span className="text-xs text-gray-400">{a.dept}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {a.issues.map((issue, j) => (
                    <span key={j} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                      {issue}
                    </span>
                  ))}
                </div>
                <ul className="text-xs text-gray-600 space-y-0.5 mb-2">
                  {a.reasons.map((r, j) => <li key={j} className="flex gap-1"><span className="text-orange-400">•</span>{r}</li>)}
                </ul>
                <p className="text-xs font-semibold text-orange-700">→ {a.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 優秀マネージャー */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🌟</span>
            <h3 className="font-bold text-emerald-800 text-sm">優秀マネージャー表彰</h3>
            <span className="ml-auto bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {EXCELLENT_MANAGERS.length}名
            </span>
          </div>
          <div className="space-y-3">
            {EXCELLENT_MANAGERS.map((a, i) => (
              <div key={i} className="bg-white rounded-xl border border-emerald-100 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">🏆</span>
                  <span className="font-bold text-gray-900 text-sm">{a.name}</span>
                  <span className="text-xs text-gray-400">{a.dept}</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  {a.reasons.map((r, j) => <li key={j} className="flex gap-1"><span className="text-emerald-400">✓</span>{r}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ══════════════════════════════════════════
          KPIカード（既存）
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {KPI.map((kpi) => {
          const c = KPI_COLORS[kpi.color];
          return (
            <div key={kpi.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center ${c.icon} mb-3`}>
                {kpi.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-sm font-semibold text-gray-600 mt-0.5">{kpi.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
              {kpi.progress !== undefined && (
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${c.progress} rounded-full`} style={{ width: `${kpi.progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SectionDivider />

      {/* ══════════════════════════════════════════
          ② エンゲージメント変遷グラフ
      ══════════════════════════════════════════ */}
      <div>
        <SectionHeader
          title="📈 エンゲージメント変遷"
          sub="過去6ヶ月の推移。目標ライン（75点）を赤い点線で表示"
        />

        {/* 全体平均 ＋ 部署別（横並び） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {/* 全体平均 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm font-bold text-gray-800 mb-1">全体平均スコア推移</p>
            <p className="text-xs text-gray-400 mb-4">月次平均（100点満点）</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={OVERALL_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis domain={[50, 80]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip
                  formatter={(v: number | undefined) => [`${v ?? ''}点`, 'スコア']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                />
                <ReferenceLine y={75} stroke="#EF4444" strokeDasharray="4 4"
                  label={{ value: '目標 75', position: 'right', fontSize: 10, fill: '#EF4444' }} />
                <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={2.5}
                  dot={{ fill: '#4F46E5', r: 4 }} name="全体平均" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 部署別比較 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm font-bold text-gray-800 mb-1">部署別エンゲージメント比較</p>
            <p className="text-xs text-gray-400 mb-4">4部署の月次推移</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={DEPT_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis domain={[48, 82]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                  formatter={(v: number, name: string) => [`${v}点`, name]} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="営業部"     stroke="#4F46E5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="マーケ"     stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="製品開発"   stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="カスタマー" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 個人別テーブル */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-bold text-gray-800 mb-4">個人別エンゲージメント（今月 vs 先月）</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['氏名', '部署', '先月', '今月', '変化'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EMPLOYEE_ENG.map((emp, i) => {
                  const diff = emp.current - emp.last;
                  const isUp   = diff >= 5;
                  const isDown = diff <= -5;
                  return (
                    <tr key={i} className={`border-b border-gray-50 last:border-0 ${
                      isDown ? 'bg-red-50/40' : isUp ? 'bg-emerald-50/40' : ''
                    }`}>
                      <td className="py-3 pr-4 font-semibold text-gray-900">{emp.name}</td>
                      <td className="py-3 pr-4 text-gray-500 text-xs">{emp.dept}</td>
                      <td className="py-3 pr-4 text-gray-700">{emp.last}<span className="text-gray-400 text-xs">点</span></td>
                      <td className="py-3 pr-4 font-bold text-gray-900">{emp.current}<span className="text-gray-400 text-xs font-normal">点</span></td>
                      <td className="py-3 pr-4">
                        <span className={`font-bold text-sm ${
                          isDown ? 'text-red-600' : isUp ? 'text-emerald-600' : 'text-gray-500'
                        }`}>
                          {diff > 0 ? '+' : ''}{diff}
                          {isDown ? ' 🔴' : isUp ? ' 🟢' : ''}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ══════════════════════════════════════════
          マネージャー別実施状況（既存）
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs">👤</span>
          マネージャー別 実施回数（今月）
        </h2>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[460px]">
            <thead>
              <tr className="border-b border-gray-100">
                {['マネージャー', '部署', '実施回数', '達成率', '最終実施日'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-3 px-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MANAGERS.map((mgr, i) => {
                const rate = Math.round((mgr.count / mgr.target) * 100);
                return (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 px-2 font-medium text-gray-800">{mgr.name}</td>
                    <td className="py-3 px-2 text-gray-500">{mgr.dept}</td>
                    <td className="py-3 px-2 text-center">
                      <span className="font-bold text-gray-900">{mgr.count}</span>
                      <span className="text-gray-400">/{mgr.target}</span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                          <div
                            className={`h-full rounded-full ${rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold min-w-[36px] ${rate >= 80 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                          {rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-400 text-xs">
                      {new Date(mgr.lastDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SectionDivider />

      {/* ══════════════════════════════════════════
          ③ 1on1 × ビジネスKPI相関
      ══════════════════════════════════════════ */}
      <div>
        <SectionHeader
          title="🔗 1on1 × ビジネスKPI 相関分析"
          sub="1on1実施率と離職率・目標達成率・生産性との相関"
        />

        {/* インサイトカード */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {KPI_INSIGHTS.map((item, i) => (
            <div key={i} className={`${item.bg} border ${item.border} rounded-2xl p-5`}>
              <p className={`text-4xl font-black ${item.statColor} mb-2`}>{item.stat}</p>
              <p className={`text-xs ${item.descColor} leading-relaxed`}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 散布図 ＋ 棒グラフ（横並び） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {/* 散布図: 実施率 × 離職率 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm font-bold text-gray-800 mb-1">1on1実施率 × 離職率（部署別）</p>
            <p className="text-xs text-gray-400 mb-4">実施率が高いほど離職率が低い傾向</p>
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  type="number" dataKey="実施率" name="1on1実施率"
                  domain={[20, 110]} unit="%" tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  label={{ value: '1on1実施率（%）', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#6B7280' }}
                />
                <YAxis
                  type="number" dataKey="離職率" name="離職率"
                  domain={[0, 22]} unit="%" tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  label={{ value: '離職率（%）', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#6B7280' }}
                />
                <Tooltip content={<ScatterTooltip />} />
                <Scatter data={SCATTER_DATA} shape={<LabeledDot />} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* 棒グラフ: 実施率 × 目標達成率 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm font-bold text-gray-800 mb-1">1on1実施率 × 目標達成率（部署別）</p>
            <p className="text-xs text-gray-400 mb-4">2指標を並べて比較</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={KPI_BAR_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis domain={[0, 110]} unit="%" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v}%`, name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="実施率" fill="#4F46E5" radius={[3, 3, 0, 0]} />
                <Bar dataKey="達成率" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 折れ線: エンゲージメント × 生産性（フル幅） */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-bold text-gray-800 mb-1">エンゲージメント × 生産性スコア（6ヶ月推移）</p>
          <p className="text-xs text-gray-400 mb-4">エンゲージメントの向上に生産性も連動して上昇</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={PRODUCTIVITY_DATA} margin={{ top: 5, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis yAxisId="left"  domain={[55, 80]} tick={{ fontSize: 11, fill: '#4F46E5' }}
                label={{ value: 'ENG', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#4F46E5' }} />
              <YAxis yAxisId="right" orientation="right" domain={[58, 82]} tick={{ fontSize: 11, fill: '#10B981' }}
                label={{ value: '生産性', angle: 90, position: 'insideRight', fontSize: 10, fill: '#10B981' }} />
              <Tooltip
                formatter={(v: number, name: string) => [`${v}点`, name]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line yAxisId="left"  type="monotone" dataKey="エンゲージメント"
                stroke="#4F46E5" strokeWidth={2.5} dot={{ fill: '#4F46E5', r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="生産性スコア"
                stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 4 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <SectionDivider />

      {/* ══════════════════════════════════════════
          カテゴリ分布グラフ（既存）
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs">📊</span>
          質問カテゴリの偏り
        </h2>
        <p className="text-xs text-gray-400 mb-5">チーム全体で使われた質問カテゴリの分布（今月）</p>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const pct = Math.round((cat.count / MAX_COUNT) * 100);
            return (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                  <span className="text-sm font-bold text-gray-600">{cat.count}回</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">⚠️ 気になる傾向：</span>「能力開発・キャリア」の質問が少なめです。
            ハイパフォーマー層への1on1でキャリア対話を増やすことを推奨します。
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-300 text-center mt-4">
        ※ このダッシュボードはデモ用のサンプルデータです
      </p>
    </div>
  );
}
