'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateContent, SubordinateType, Situation, GeneratedContent, CATEGORY_META, CategoryKey } from '@/lib/questionEngine';
import { saveSession, saveCategoryHistory, getMissingCategories, getCarryOverTopics, clearCarryOverTopics } from '@/lib/storage';
import { getPreviousItems, PreviousActionItem, isOverdue } from '@/lib/demoData';

const TYPE_OPTIONS = [
  { value: 'young',          label: '若手',            desc: '入社1〜3年目', emoji: '🌱' },
  { value: 'mid',            label: '中堅',            desc: '4〜8年目',     emoji: '⚡' },
  { value: 'high_performer', label: 'ハイパフォーマー', desc: '高成果者',     emoji: '🌟' },
];

const SITUATION_OPTIONS = [
  { value: 'low_motivation',     label: 'やる気が下がっている',  emoji: '📉' },
  { value: 'no_results',         label: '成果が出ていない',       emoji: '🎯' },
  { value: 'no_issues',          label: '特に問題はない',         emoji: '✅' },
  { value: 'career_concern',     label: 'キャリアに悩んでいる',   emoji: '🗺️' },
  { value: 'relationship_issue', label: '人間関係に課題がある',   emoji: '👥' },
];

const CATEGORY_BADGE: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-700 border border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border border-purple-200',
  green:  'bg-green-100 text-green-700 border border-green-200',
  orange: 'bg-orange-100 text-orange-700 border border-orange-200',
  pink:   'bg-pink-100 text-pink-700 border border-pink-200',
  indigo: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
};

export default function ManagerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<SubordinateType | ''>('');
  const [situations, setSituations] = useState<Situation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [missingCategories, setMissingCategories] = useState<CategoryKey[]>([]);

  // 前回の実行項目（名前に応じて動的に取得）
  const previousItems: PreviousActionItem[] = getPreviousItems(name);
  const overdueItems = previousItems.filter(
    item => !confirmedIds.has(item.id) && isOverdue(item.deadline)
  );
  const hasOverdue = overdueItems.length > 0;

  // 前回の持ち越し話題
  const carryOverTopics: string[] = name.trim() ? getCarryOverTopics(name.trim()) : [];

  const toggleSituation = (value: Situation) => {
    setSituations(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  const handleConfirm = (item: PreviousActionItem) => {
    setConfirmedIds(prev => new Set([...prev, item.id]));
  };

  const handleGenerate = async () => {
    if (!name.trim() || !type || situations.length === 0) return;
    setIsGenerating(true);
    setGenerated(null);
    await new Promise(r => setTimeout(r, 1600));
    const result = generateContent(type as SubordinateType, situations);
    setGenerated(result);

    // 不足カテゴリーのサジェストを計算
    const currentCats = result.questions.map(q => q.category as CategoryKey);
    setMissingCategories(getMissingCategories(name.trim(), currentCats));

    setIsGenerating(false);
  };

  const handleStartSession = () => {
    if (!generated || !type) return;
    const typeOption = TYPE_OPTIONS.find(t => t.value === type);

    // 確認済みの前回項目をメモに自動追記
    const confirmed = previousItems.filter(i => confirmedIds.has(i.id));
    let initialMemo = '';
    if (confirmed.length > 0) {
      initialMemo =
        '【前回の約束 確認済み】\n' +
        confirmed
          .map(i => `✓ ${i.title}（${i.assignee === 'manager' ? 'マネージャー担当' : '部下担当'}）`)
          .join('\n') +
        '\n\n';
    }

    // 持ち越し話題をクリア（新しいセッション開始）
    clearCarryOverTopics(name.trim());

    // カテゴリー履歴を保存
    saveCategoryHistory(
      name.trim(),
      generated.questions.map(q => q.category as CategoryKey)
    );

    saveSession({
      id: Date.now().toString(),
      subordinateName: name.trim(),
      type,
      typeName: typeOption?.label ?? '',
      situations,
      questions: generated.questions,
      ngActions: generated.ngActions,
      deepDiveQuestions: generated.deepDiveQuestions,
      memo: initialMemo,
      actionItems: [],
      status: 'prepared',
      createdAt: new Date().toISOString(),
    });
    router.push('/memo');
  };

  const canGenerate = name.trim() && type && situations.length > 0;
  const displayName = name.trim()
    ? name.trim().endsWith('さん') ? name.trim() : `${name.trim()}さん`
    : '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* 期限切れ警告バナー */}
      {hasOverdue && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 animate-fadeIn">
          <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
          <div>
            <p className="font-semibold text-red-800 text-sm">
              {displayName}との前回の約束が未対応です
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              期限切れの実行項目が {overdueItems.length} 件あります。1on1の前に確認してください。
            </p>
          </div>
        </div>
      )}

      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">今日の1on1の準備</h1>
        <p className="mt-1 text-gray-500 text-sm">
          部下の情報を入力すると、AIが最適な質問を提案します
        </p>
      </div>

      {/* 入力フォーム */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">

        {/* 部下の名前 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            部下の名前
          </label>
          <input
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setConfirmedIds(new Set()); // 名前が変わったらリセット
            }}
            placeholder="例：田中 太郎"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* 部下タイプ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            部下のタイプ
          </label>
          <div className="grid grid-cols-3 gap-3">
            {TYPE_OPTIONS.map(opt => {
              const isSelected = type === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value as SubordinateType)}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl mb-1.5">{opt.emoji}</span>
                  <span className={`font-semibold text-sm ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 今の状況 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            今の状況
            <span className="text-gray-400 font-normal ml-1">（複数選択可）</span>
          </label>
          <div className="space-y-2">
            {SITUATION_OPTIONS.map(opt => {
              const isSelected = situations.includes(opt.value as Situation);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleSituation(opt.value as Situation)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mr-3 flex-shrink-0 transition-all ${
                    isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="mr-2 text-lg">{opt.emoji}</span>
                  <span className={`font-medium text-sm ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 生成ボタン */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
            canGenerate && !isGenerating
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              AIが質問を生成しています...
            </span>
          ) : (
            '✨ 質問を生成する'
          )}
        </button>
      </div>

      {/* 前回の持ち越し話題 */}
      {carryOverTopics.length > 0 && (
        <div className="mt-4 animate-fadeIn">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h2 className="text-base font-bold text-amber-800 mb-3 flex items-center gap-2">
              <span>📎</span>
              前回の持ち越し
              <span className="ml-auto text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                {carryOverTopics.length}件
              </span>
            </h2>
            <ul className="space-y-2">
              {carryOverTopics.map((topic, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-amber-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  {topic}
                </li>
              ))}
            </ul>
            <p className="text-xs text-amber-600 mt-3">
              「1on1を開始する」を押すと自動的にクリアされます
            </p>
          </div>
        </div>
      )}

      {/* 前回の約束セクション */}
      {previousItems.length > 0 && (
        <div className="mt-4 animate-fadeIn">
          <div className={`rounded-2xl border p-6 ${
            hasOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <h2 className={`text-base font-bold mb-4 flex items-center gap-2 ${
              hasOverdue ? 'text-red-800' : 'text-gray-900'
            }`}>
              <span>📋</span>
              前回の約束
              {overdueItems.length > 0 && (
                <span className="ml-auto text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-700 rounded-full border border-red-200">
                  {overdueItems.length}件 期限切れ
                </span>
              )}
            </h2>
            <ul className="space-y-3">
              {previousItems.map(item => {
                const overdue = isOverdue(item.deadline);
                const confirmed = confirmedIds.has(item.id);
                return (
                  <li
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      confirmed
                        ? 'bg-gray-50 border-gray-100 opacity-60'
                        : overdue
                        ? 'bg-white border-red-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        confirmed ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}>
                        {item.title}
                      </p>
                      <div className="flex items-center flex-wrap gap-2 mt-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          item.assignee === 'subordinate'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {item.assignee === 'subordinate' ? '部下担当' : 'マネージャー担当'}
                        </span>
                        <span className={`text-xs font-medium ${
                          confirmed ? 'text-gray-400' : overdue ? 'text-red-600 font-semibold' : 'text-gray-400'
                        }`}>
                          {overdue && !confirmed ? '⚠️ ' : ''}
                          期限 {new Date(item.deadline).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                          {overdue && !confirmed ? '（期限切れ）' : ''}
                        </span>
                      </div>
                    </div>
                    {confirmed ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        確認済み
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConfirm(item)}
                        className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border-2 border-emerald-400 text-emerald-700 hover:bg-emerald-50 transition-colors mt-0.5"
                      >
                        確認済み
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            {confirmedIds.size > 0 && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                確認済みの項目は1on1開始後にメモへ自動追記されます
              </p>
            )}
          </div>
        </div>
      )}

      {/* 生成結果 */}
      {generated && !isGenerating && (
        <div className="mt-6 space-y-4 animate-fadeIn">

          {/* おすすめ質問 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                💬
              </span>
              おすすめの質問 5選
            </h2>
            <ol className="space-y-4">
              {generated.questions.map((q, i) => (
                <li key={q.id} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1.5 ${CATEGORY_BADGE[q.categoryColor]}`}>
                      {q.categoryNum}{q.categoryName}
                    </span>
                    <p className="text-gray-800 text-sm leading-relaxed">{q.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* 不足カテゴリーのサジェスト */}
          {missingCategories.length > 0 && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 animate-fadeIn">
              <p className="text-sm font-semibold text-sky-800 mb-3 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                直近3回で使われていないカテゴリー
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {missingCategories.map(cat => {
                  const meta = CATEGORY_META[cat];
                  return (
                    <span
                      key={cat}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${CATEGORY_BADGE[meta.color]}`}
                    >
                      {meta.num}{meta.name}
                    </span>
                  );
                })}
              </div>
              <p className="text-xs text-sky-600">
                次回のセッションでこれらのカテゴリーを取り入れることを検討してみましょう
              </p>
            </div>
          )}

          {/* NG行動 */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
            <h2 className="text-base font-bold text-amber-800 mb-4 flex items-center gap-2">
              <span>⚠️</span> 注意すべきNG行動
            </h2>
            <ul className="space-y-2">
              {generated.ngActions.map((ng, i) => (
                <li key={i} className="flex gap-2 text-amber-800 text-sm">
                  <span className="flex-shrink-0 font-bold text-amber-500 mt-0.5">✕</span>
                  <span>{ng}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 深掘り質問 */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
            <h2 className="text-base font-bold text-emerald-800 mb-4 flex items-center gap-2">
              <span>🔬</span> 深掘り質問
            </h2>
            <ul className="space-y-3">
              {generated.deepDiveQuestions.map((q, i) => (
                <li key={i} className="flex gap-3 text-emerald-800 text-sm">
                  <span className="flex-shrink-0 font-bold text-emerald-600">Q{i + 1}.</span>
                  <span className="leading-relaxed">{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 開始ボタン */}
          <button
            onClick={handleStartSession}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            1on1を開始する
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
