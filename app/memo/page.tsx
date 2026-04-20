'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession, saveSession, ActionItem, Session } from '@/lib/storage';
import { analyzeTranscription, TranscriptionAnalysis, CategoryKey } from '@/lib/transcriptionAnalyzer';

const CATEGORY_BADGE: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  green:  'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  pink:   'bg-pink-100 text-pink-700',
  indigo: 'bg-indigo-100 text-indigo-700',
};

const CATEGORY_LABEL: Record<CategoryKey, { label: string; color: string }> = {
  relationship: { label: '人間関係の構築', color: 'bg-blue-100 text-blue-700' },
  engagement:   { label: 'エンゲージメント', color: 'bg-purple-100 text-purple-700' },
  situation:    { label: '状況把握', color: 'bg-green-100 text-green-700' },
  issues:       { label: '課題', color: 'bg-orange-100 text-orange-700' },
  feedback:     { label: 'フィードバック', color: 'bg-pink-100 text-pink-700' },
  career:       { label: '能力開発・キャリア', color: 'bg-indigo-100 text-indigo-700' },
};

const SAMPLE_TRANSCRIPTION = `広瀬：最近どうですか？
田中：正直、少し迷ってます。AIの仕事が増えてきて、自分についていけるか不安で。
広瀬：具体的にどんなところが？
田中：松澤さんとか見てると、全然レベルが違うなって。自分はまだ全然できてないなって感じてしまって。
広瀬：それは焦りというより、どちらかというと？
田中：自信がないというか。でも、やってみたい気持ちはあります。人事の仕事にAI使えたら面白そうだなって思ってて。
広瀬：それ、いいですね。具体的に何かやってみたいことは？
田中：MANAとか使って、採用の面接サポートとかできないかなと。
広瀬：じゃあ一緒に考えましょう。来週までにラフなアイデアをまとめてみてもらえますか？
田中：はい、やってみます。`;

export default function MemoPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<'memo' | 'transcription'>('memo');
  const [showQuestions, setShowQuestions] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<{ title: string; assignee: 'manager' | 'subordinate'; deadline: string }>({
    title: '',
    assignee: 'subordinate',
    deadline: '',
  });

  // Transcription tab state
  const [transcriptionText, setTranscriptionText] = useState(SAMPLE_TRANSCRIPTION);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TranscriptionAnalysis | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.push('/');
    } else {
      setSession(s);
    }
  }, [router]);

  const update = (partial: Partial<Session>) => {
    if (!session) return;
    const updated = { ...session, ...partial };
    setSession(updated);
    saveSession(updated);
  };

  const addActionItem = () => {
    if (!session || !newItem.title.trim()) return;
    const item: ActionItem = {
      id: Date.now().toString(),
      title: newItem.title.trim(),
      assignee: newItem.assignee,
      deadline: newItem.deadline,
      done: false,
    };
    update({ actionItems: [...session.actionItems, item] });
    setNewItem({ title: '', assignee: 'subordinate', deadline: '' });
    setShowAddForm(false);
  };

  const removeActionItem = (id: string) => {
    if (!session) return;
    update({ actionItems: session.actionItems.filter(i => i.id !== id) });
  };

  const toggleDone = (id: string) => {
    if (!session) return;
    update({
      actionItems: session.actionItems.map(i =>
        i.id === id ? { ...i, done: !i.done } : i
      ),
    });
  };

  const handleFinish = () => {
    update({ status: 'completed', completedAt: new Date().toISOString() });
    router.push('/summary');
  };

  const handleAnalyze = async () => {
    if (!transcriptionText.trim()) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const result = analyzeTranscription(transcriptionText);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const addAnalysisActionsToSession = () => {
    if (!analysis || !session) return;
    const newItems: ActionItem[] = analysis.actionItems.map(item => ({
      id: Date.now().toString() + Math.random(),
      title: item.title,
      assignee: item.assignee,
      deadline: '',
      done: false,
    }));
    update({ actionItems: [...session.actionItems, ...newItems] });
    setActiveTab('memo');
  };

  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* ページヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">1on1 実施中</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{session.subordinateName}{session.subordinateName.endsWith('さん') ? '' : ' さん'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{session.typeName} · {new Date(session.createdAt).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* タブ */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
        <button
          onClick={() => setActiveTab('memo')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'memo'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📝 メモを書く
        </button>
        <button
          onClick={() => setActiveTab('transcription')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'transcription'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🎙️ 文字起こし分析
        </button>
      </div>

      <div className="space-y-4">

        {/* ===== メモを書くタブ ===== */}
        {activeTab === 'memo' && (
          <>
            {/* 準備した質問（折りたたみ） */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setShowQuestions(!showQuestions)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                  <span>💬</span> 準備した質問を確認する
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${showQuestions ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showQuestions && (
                <div className="px-6 pb-5 border-t border-gray-100">
                  <ol className="space-y-3 mt-4">
                    {session.questions.map((q, i) => (
                      <li key={q.id} className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div>
                          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${CATEGORY_BADGE[q.categoryColor]}`}>
                            {q.categoryName}
                          </span>
                          <p className="text-sm text-gray-700 leading-relaxed">{q.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  {session.deepDiveQuestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-emerald-700 mb-2">🔬 深掘り質問</p>
                      {session.deepDiveQuestions.map((q, i) => (
                        <p key={i} className="text-sm text-emerald-800 mb-1.5">Q{i + 1}. {q}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* メモ入力 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>📝</span> 1on1メモ
              </label>
              <textarea
                value={session.memo}
                onChange={e => update({ memo: e.target.value })}
                placeholder="気になったこと、話の流れ、印象に残ったことなどを自由に記録してください..."
                rows={7}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-800 placeholder-gray-400 text-sm resize-none leading-relaxed"
              />
            </div>

            {/* 実行項目 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>✅</span> 実行項目
                  {session.actionItems.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                      {session.actionItems.length}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  追加
                </button>
              </div>

              {/* 追加フォーム */}
              {showAddForm && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="実行項目のタイトル"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-800 placeholder-gray-400"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">担当者</label>
                      <select
                        value={newItem.assignee}
                        onChange={e => setNewItem({ ...newItem, assignee: e.target.value as 'manager' | 'subordinate' })}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none text-sm text-gray-800 bg-white"
                      >
                        <option value="subordinate">部下</option>
                        <option value="manager">自分（マネージャー）</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">期限</label>
                      <input
                        type="date"
                        value={newItem.deadline}
                        onChange={e => setNewItem({ ...newItem, deadline: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none text-sm text-gray-800"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addActionItem}
                      disabled={!newItem.title.trim()}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      追加する
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700 rounded-lg text-sm transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}

              {/* 実行項目リスト */}
              {session.actionItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  実行項目はまだありません
                </p>
              ) : (
                <ul className="space-y-2">
                  {session.actionItems.map(item => (
                    <li
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                        item.done ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => toggleDone(item.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          item.done ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        {item.done && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${item.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            item.assignee === 'subordinate'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {item.assignee === 'subordinate' ? '部下' : 'マネージャー'}
                          </span>
                          {item.deadline && (
                            <span className="text-xs text-gray-400">
                              期限: {new Date(item.deadline).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeActionItem(item.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
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
          </>
        )}

        {/* ===== 文字起こし分析タブ ===== */}
        {activeTab === 'transcription' && (
          <>
            {/* テキストエリア */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>🎙️</span> 会話の文字起こし
                <span className="text-xs font-normal text-gray-400 ml-1">（「話者名：発言」の形式）</span>
              </label>
              <textarea
                defaultValue={SAMPLE_TRANSCRIPTION}
                onChange={e => setTranscriptionText(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-800 placeholder-gray-400 text-sm resize-none leading-relaxed font-mono"
                placeholder="広瀬：最近どうですか？&#10;田中：..."
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !transcriptionText.trim()}
                className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    AI分析中...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    AIで分析する
                  </>
                )}
              </button>
            </div>

            {/* 分析結果 */}
            {analysis && (
              <div className="space-y-4">

                {/* セクション1: 検出されたカテゴリー */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>🏷️</span> 検出されたカテゴリー
                  </h3>
                  {analysis.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysis.categories.map(cat => (
                        <span key={cat} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${CATEGORY_LABEL[cat].color}`}>
                          {CATEGORY_LABEL[cat].label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">カテゴリーを検出できませんでした</p>
                  )}
                </div>

                {/* セクション2: 感情トーン */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>💭</span> 感情トーン分析
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${
                      analysis.emotion.level === 'positive' ? 'bg-green-100 text-green-700' :
                      analysis.emotion.level === 'negative' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {analysis.emotion.level === 'positive' ? '😊 ' : analysis.emotion.level === 'negative' ? '😟 ' : '😐 '}
                      {analysis.emotion.label}
                    </span>
                  </div>
                  {analysis.emotion.quotes.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-gray-500 mb-2">気になる発言</p>
                      {analysis.emotion.quotes.map((q, i) => (
                        <p key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-red-300">
                          {q}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* セクション3: キートピック */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>🔍</span> キートピック
                  </h3>
                  <ul className="space-y-2">
                    {analysis.keyTopics.map((topic, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* セクション4: 実行項目 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>✅</span> 抽出された実行項目
                  </h3>
                  {analysis.actionItems.length > 0 ? (
                    <>
                      <ul className="space-y-2 mb-4">
                        {analysis.actionItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                              item.assignee === 'subordinate' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {item.assignee === 'subordinate' ? '部下' : 'マネージャー'}
                            </span>
                            <p className="text-sm text-gray-700">{item.title}</p>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={addAnalysisActionsToSession}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
                      >
                        この実行項目をメモに追加する
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">会話から実行項目を抽出できませんでした</p>
                  )}
                </div>

                {/* セクション5: フォローアップポイント */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>📋</span> 次回フォローアップポイント
                  </h3>
                  {analysis.followUpPoints.length > 0 ? (
                    <ul className="space-y-2">
                      {analysis.followUpPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-indigo-400 mt-0.5">→</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">フォローアップポイントはありません</p>
                  )}
                </div>

                {/* セクション6: エンゲージメントリスク */}
                <div className={`rounded-2xl shadow-sm border p-6 ${
                  analysis.engagementRisk.level === 'high' ? 'bg-red-50 border-red-200' :
                  analysis.engagementRisk.level === 'medium' ? 'bg-amber-50 border-amber-200' :
                  'bg-emerald-50 border-emerald-200'
                }`}>
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>⚠️</span> エンゲージメントリスク評価
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${
                      analysis.engagementRisk.level === 'high' ? 'bg-red-100 text-red-700' :
                      analysis.engagementRisk.level === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {analysis.engagementRisk.level === 'high' ? '🔴' : analysis.engagementRisk.level === 'medium' ? '🟡' : '🟢'} {analysis.engagementRisk.label}
                    </span>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {analysis.engagementRisk.reasons.map((reason, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                        <span className="text-gray-400 mt-0.5">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                  <div className={`rounded-xl p-3 text-sm font-medium ${
                    analysis.engagementRisk.level === 'high' ? 'bg-red-100 text-red-800' :
                    analysis.engagementRisk.level === 'medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    推奨アクション: {analysis.engagementRisk.recommendation}
                  </div>
                </div>

              </div>
            )}
          </>
        )}

        {/* 終了ボタン（常に表示） */}
        <button
          onClick={handleFinish}
          className="w-full py-4 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
        >
          1on1を終了する
        </button>
      </div>

    </div>
  );
}
