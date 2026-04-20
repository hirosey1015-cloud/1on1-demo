'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession, saveCarryOverTopics, getCarryOverTopics, Session } from '@/lib/storage';
import { CATEGORY_META, CategoryKey } from '@/lib/questionEngine';

const ALL_CATEGORIES: CategoryKey[] = [
  'relationship', 'engagement', 'situation', 'issues', 'feedback', 'career',
];

const CATEGORY_BADGE: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-700 border border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border border-purple-200',
  green:  'bg-green-100 text-green-700 border border-green-200',
  orange: 'bg-orange-100 text-orange-700 border border-orange-200',
  pink:   'bg-pink-100 text-pink-700 border border-pink-200',
  indigo: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
};

// ── クロージングメッセージ生成（ルールベース）──────────────
function generateClosingMessages(session: Session): string[] {
  const name = session.subordinateName;
  const dn = name.endsWith('さん') ? name : `${name}さん`;

  const cats = new Set(session.questions.map((q) => q.category));
  const items = session.actionItems;
  const mgrItems = items.filter((i) => i.assignee === 'manager');
  const subItems = items.filter((i) => i.assignee === 'subordinate');

  const mgrPromise   = mgrItems[0] ? `「${mgrItems[0].title}」、私のほうで必ず進めますね。` : '';
  const subEncourage = subItems[0] ? `「${subItems[0].title}」に挑戦するあなたを応援しています。` : '';
  const itemsLine    = items.length > 0 ? `今日決めた${items.length}つの約束、一緒に進めていきましょう。` : '';

  const careerLine = cats.has('career')
    ? 'キャリアのことも引き続き一緒に考えていきましょう。' : '';
  const engLine = cats.has('engagement')
    ? 'あなたのやりがいをもっと引き出せるよう努めます。' : '';
  const relLine = cats.has('relationship')
    ? 'チームとの関係も、少しずつ改善していきましょう。' : '';

  const msg1 = [
    `今日は率直に話してくれてありがとう、${dn}。`,
    mgrPromise,
    careerLine || engLine || '次の1on1でもまた話しましょう。',
  ].filter(Boolean).join('\n');

  const msg2 = [
    `${dn}の声をしっかり受け止めました。`,
    itemsLine || '今日の話を活かして、もっとサポートできるよう努めます。',
    relLine || 'いつでも気軽に声をかけてください。',
  ].filter(Boolean).join('\n');

  const msg3 = [
    `今日も大切な時間をありがとうございました、${dn}。`,
    subEncourage || `${dn}の成長を全力でサポートしていきます。`,
    '次回もまた一緒に前進しましょう。',
  ].filter(Boolean).join('\n');

  return [msg1, msg2, msg3];
}

function formatDuration(start: string, end: string): string {
  const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60);
  if (diff < 1) return '1分未満';
  return `約${diff}分`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── コピーボタン ────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all print-hidden ${
        copied
          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          コピー済み
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          コピー
        </>
      )}
    </button>
  );
}

// ── メインコンポーネント ────────────────────────────────────
export default function SummaryPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [carryTopics, setCarryTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [closingMessages, setClosingMessages] = useState<string[]>([]);

  useEffect(() => {
    const s = loadSession();
    if (!s) { router.push('/'); return; }
    setSession(s);
    setCarryTopics(getCarryOverTopics(s.subordinateName));
    setClosingMessages(generateClosingMessages(s));
  }, [router]);

  const addTopic = () => {
    if (!session || !newTopic.trim()) return;
    const updated = [...carryTopics, newTopic.trim()];
    setCarryTopics(updated);
    saveCarryOverTopics(session.subordinateName, updated);
    setNewTopic('');
  };

  const removeTopic = (idx: number) => {
    if (!session) return;
    const updated = carryTopics.filter((_, i) => i !== idx);
    setCarryTopics(updated);
    saveCarryOverTopics(session.subordinateName, updated);
  };

  if (!session) return null;

  const displayName = session.subordinateName.endsWith('さん')
    ? session.subordinateName
    : `${session.subordinateName}さん`;

  const usedCategories = new Set(session.questions.map((q) => q.category as CategoryKey));
  const duration = session.completedAt
    ? formatDuration(session.createdAt, session.completedAt) : '—';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

      {/* ── ヘッダー ─────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-7 text-white print-card">
        <div className="flex items-start justify-between mb-4 print-hidden">
          <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
            1on1 完了
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors print-hidden"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            印刷 / PDF保存
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-white/70 text-sm mb-0.5">1on1 お疲れさまでした！</p>
            <h1 className="text-2xl font-bold">{displayName}との1on1</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-white/20">
          <div>
            <p className="text-white/60 text-xs mb-0.5">実施日時</p>
            <p className="text-sm font-semibold">
              {session.completedAt ? formatDateTime(session.completedAt) : formatDateTime(session.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-white/60 text-xs mb-0.5">所要時間</p>
            <p className="text-sm font-semibold">{duration}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs mb-0.5">タイプ</p>
            <p className="text-sm font-semibold">{session.typeName}</p>
          </div>
        </div>
      </div>

      {/* ── ① 今日話したカテゴリー ──────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print-card">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm">💬</span>
          今日話したカテゴリー
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const used = usedCategories.has(cat);
            return (
              <div
                key={cat}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  used
                    ? CATEGORY_BADGE[meta.color]
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}
              >
                <span>{meta.num}{meta.name}</span>
                {!used && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded-full whitespace-nowrap">
                    次回おすすめ
                  </span>
                )}
                {used && (
                  <svg className="w-3.5 h-3.5 ml-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ② 合意した実行項目 ──────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print-card">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-sm">✅</span>
          合意した実行項目
          {session.actionItems.length > 0 && (
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
              {session.actionItems.length}件
            </span>
          )}
        </h2>
        {session.actionItems.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">実行項目は登録されていません</p>
        ) : (
          <ul className="space-y-2">
            {session.actionItems.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                  item.assignee === 'subordinate' ? 'bg-blue-400' : 'bg-purple-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.assignee === 'subordinate'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {item.assignee === 'subordinate' ? '部下担当' : 'マネージャー担当'}
                    </span>
                    {item.deadline && (
                      <span className="text-xs text-gray-400">
                        期限: {new Date(item.deadline).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── ③ 次回へ持ち越した話題 ──────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print-card">
        <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-sm">📎</span>
          次回へ持ち越した話題
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          今日話せなかったことを記録しておくと、次回の準備画面に自動表示されます
        </p>

        {/* 追加フォーム */}
        <div className="flex gap-2 mb-4 print-hidden">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTopic()}
            placeholder="例：チームの目標設定について改めて話したい"
            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-800 placeholder-gray-400"
          />
          <button
            onClick={addTopic}
            disabled={!newTopic.trim()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
          >
            追加
          </button>
        </div>

        {carryTopics.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-3">まだ登録されていません</p>
        ) : (
          <ul className="space-y-2">
            {carryTopics.map((topic, idx) => (
              <li key={idx} className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="flex-1 text-sm text-amber-900">{topic}</span>
                <button
                  onClick={() => removeTopic(idx)}
                  className="text-amber-300 hover:text-amber-500 transition-colors print-hidden flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── ④ クロージングメッセージ案 ─────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print-card">
        <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span className="w-7 h-7 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 text-sm">💌</span>
          部下へのクロージングメッセージ案
        </h2>
        <p className="text-xs text-gray-400 mb-4">今日の内容をもとに自動生成しました。コピーしてお使いください</p>
        <div className="space-y-3">
          {closingMessages.map((msg, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-semibold text-gray-500">パターン {i + 1}</span>
                <CopyButton text={msg} />
              </div>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{msg}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── ⑤ ボタン ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 print-hidden">
        <button
          onClick={() => router.push('/')}
          className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          トップに戻る
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex-1 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm shadow-sm border border-gray-200 hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          ダッシュボードを見る
        </button>
      </div>

    </div>
  );
}
