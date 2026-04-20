export type CategoryKey = 'relationship' | 'engagement' | 'situation' | 'issues' | 'feedback' | 'career';

export interface TranscriptionAnalysis {
  categories: CategoryKey[];
  emotion: {
    level: 'positive' | 'neutral' | 'negative';
    label: string;
    score: number;
    quotes: string[];
  };
  keyTopics: string[];
  actionItems: Array<{ title: string; assignee: 'manager' | 'subordinate' }>;
  followUpPoints: string[];
  engagementRisk: {
    level: 'low' | 'medium' | 'high';
    label: string;
    reasons: string[];
    recommendation: string;
  };
}

const CATEGORY_KEYWORDS: Record<CategoryKey, string[]> = {
  relationship: ['チーム', '同僚', '話しやすい', '相談', '雰囲気', '人間関係', 'コミュニケーション', '連携', '協力'],
  engagement:   ['やりがい', 'モチベーション', '楽しい', 'やる気', '意欲', 'やってみたい', '面白い', '自信', '不安', 'ついていけ', '充実', '迷って'],
  situation:    ['進捗', '業務', '仕事', '現状', '時間', '忙しい', 'タスク', '状況', '業務量', '取り組'],
  issues:       ['課題', '問題', '困っ', 'できてない', 'できない', 'うまくいかない', '難しい', 'ついていけ', '壁', '障壁', 'レベルが違'],
  feedback:     ['フィードバック', '評価', '成長', '改善', 'サポート', 'ありがとう', '褒め', '認め'],
  career:       ['キャリア', '将来', 'スキル', 'AI', '学び', 'アイデア', '挑戦', '目指', '転職', '異動', '採用', 'MANA'],
};

const POSITIVE_KEYWORDS = ['やってみたい', '楽しそう', '面白い', 'いいですね', 'やります', 'やってみます', '嬉しい', '好き', '前向き', '頑張', 'できそう', 'ワクワク'];
const NEGATIVE_KEYWORDS = ['不安', '自信がない', 'ついていけない', '辞めたい', 'つらい', '難しい', '迷ってます', '焦り', 'レベルが違', 'できてない', '落ち込', 'しんどい', '悩んで'];
const HIGH_RISK_KEYWORDS = ['辞めたい', '転職したい', 'もう無理', '限界', '続けられない', 'やめたい'];
const MEDIUM_RISK_KEYWORDS = ['不安', '自信がない', 'ついていけない', '迷ってます', 'しんどい', '疲れ'];

const TOPIC_TEMPLATES: { keywords: string[]; topic: string }[] = [
  { keywords: ['AI', 'MANA', 'デジタル', 'DX'],                topic: 'AI・デジタルツールの活用と適応への課題' },
  { keywords: ['不安', '自信がない', 'ついていけない'],          topic: '自己効力感の低下・自信のサポートが必要' },
  { keywords: ['キャリア', '将来', '目指', '転職'],             topic: 'キャリア方向性の明確化' },
  { keywords: ['チーム', '同僚', '人間関係', 'コミュニケーション'], topic: 'チームコミュニケーションの課題' },
  { keywords: ['成果', '目標', '達成', '結果'],                 topic: '成果と目標達成のギャップ' },
  { keywords: ['スキル', '研修', '学習', '勉強'],               topic: 'スキルアップ計画の立案' },
  { keywords: ['モチベーション', 'やる気', 'やりがい', '意欲'], topic: 'モチベーションの変化と要因' },
  { keywords: ['MANA', 'ツール', 'システム', 'アプリ'],         topic: '業務ツールの活用アイデア（MANA等）' },
  { keywords: ['採用', '面接', '選考', 'HR'],                   topic: '採用・HRプロセスへの改善提案' },
  { keywords: ['松澤', '比較', 'レベル', '差'],                 topic: '同僚との比較意識と自己評価の課題' },
  { keywords: ['残業', '業務量', '多い', '忙し'],               topic: '業務量とワークライフバランス' },
  { keywords: ['評価', '昇進', '昇格', '昇給'],                 topic: '評価・待遇への関心と期待' },
];

const FOLLOW_UP_MAP: Partial<Record<CategoryKey, string[]>> = {
  career:       ['キャリアアクションプランを次回までに一緒に作成する', 'ロールモデルとなる先輩との対話機会を設定する'],
  engagement:   ['やりがいを感じる業務の割合を増やす方法を検討する', '具体的なスキルアップ計画を共有する'],
  issues:       ['課題の根本原因を特定し、解決策を一緒に考える', 'タスク優先順位の整理をサポートする'],
  relationship: ['チームとの関係改善に向けた具体的なアクションを確認する', '関係者への働きかけ方を一緒に検討する'],
  situation:    ['業務の進捗を定期的にチェックインする機会を設ける', '業務負荷のバランスを見直す'],
  feedback:     ['次回の1on1で成長の振り返りを行う', '具体的な行動変化を積極的に褒める機会を作る'],
};

function detectCategories(text: string): CategoryKey[] {
  const scores: Record<CategoryKey, number> = {
    relationship: 0, engagement: 0, situation: 0, issues: 0, feedback: 0, career: 0,
  };
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [CategoryKey, string[]][]) {
    for (const kw of keywords) {
      if (text.includes(kw)) scores[cat]++;
    }
  }
  return (Object.entries(scores) as [CategoryKey, number][])
    .filter(([, s]) => s >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat]) => cat);
}

function detectEmotion(text: string): TranscriptionAnalysis['emotion'] {
  // Extract subordinate lines (second speaker)
  const lines = text.split('\n');
  const speakerLines: Record<string, string[]> = {};
  const speakerOrder: string[] = [];
  for (const line of lines) {
    const m = line.match(/^(.+?)：(.+)$/);
    if (m) {
      const sp = m[1].trim();
      if (!speakerLines[sp]) { speakerLines[sp] = []; speakerOrder.push(sp); }
      speakerLines[sp].push(m[2].trim());
    }
  }
  const subLines = speakerOrder.length >= 2
    ? speakerLines[speakerOrder[1]] ?? []
    : Object.values(speakerLines).flat();
  const subText = subLines.join('。');

  let posCount = 0, negCount = 0;
  for (const kw of POSITIVE_KEYWORDS) if (subText.includes(kw)) posCount++;
  for (const kw of NEGATIVE_KEYWORDS) if (subText.includes(kw)) negCount++;

  const score = (posCount - negCount) * 10;
  let level: 'positive' | 'neutral' | 'negative' = 'neutral';
  let label = 'ニュートラル';
  if (negCount > posCount + 1) { level = 'negative'; label = 'ネガティブ寄り'; }
  else if (posCount > negCount + 1) { level = 'positive'; label = 'ポジティブ'; }
  else if (negCount > 0 && posCount > 0) { label = 'ニュートラル（不安と意欲が混在）'; }

  // Extract quotes
  const quotes: string[] = [];
  for (const line of subLines) {
    if (NEGATIVE_KEYWORDS.some(kw => line.includes(kw)) && quotes.length < 3) {
      const cleaned = line.replace(/[。、！？]/g, '').trim();
      if (cleaned.length > 5 && cleaned.length < 50) quotes.push(`「${cleaned}」`);
    }
  }
  if (quotes.length === 0 && negCount > 0) {
    quotes.push('（ネガティブな発言が確認されました）');
  }

  return { level, label, score, quotes };
}

function extractKeyTopics(text: string): string[] {
  const topics: string[] = [];
  for (const { keywords, topic } of TOPIC_TEMPLATES) {
    if (keywords.some(kw => text.includes(kw))) {
      topics.push(topic);
    }
    if (topics.length >= 5) break;
  }
  if (topics.length === 0) topics.push('会話内容の詳細な分析が必要です');
  return topics;
}

function extractActionItems(text: string): TranscriptionAnalysis['actionItems'] {
  const items: TranscriptionAnalysis['actionItems'] = [];

  // Pattern: 来週までに〜してみてもらえますか / てもらえますか
  const p1 = text.match(/来週(?:までに|中に)([^。\n？！]{4,30})(?:てみてもらえますか|てもらえますか|てください|をお願い)/);
  if (p1) {
    const raw = p1[1].trim();
    items.push({ title: raw.endsWith('し') ? raw + 'てみる' : raw + 'を行う', assignee: 'subordinate' });
  }

  // Pattern: 私〜します / しますね
  const p2 = text.match(/(?:私|僕)(?:の方|のほう)?で([^。\n]{4,30})(?:しますね|します|進めます)/);
  if (p2) {
    items.push({ title: p2[1].trim() + 'をフォローする', assignee: 'manager' });
  }

  // Pattern: 〜してみてください
  if (items.length < 3) {
    const p3 = text.match(/([^。\n]{4,25})(?:してみてください|やってみてください)/);
    if (p3) {
      items.push({ title: p3[1].trim() + 'に取り組む', assignee: 'subordinate' });
    }
  }

  return items.slice(0, 3);
}

function extractFollowUps(categories: CategoryKey[], emotion: TranscriptionAnalysis['emotion']): string[] {
  const points: string[] = [];
  for (const cat of categories.slice(0, 2)) {
    const suggestions = FOLLOW_UP_MAP[cat];
    if (suggestions) points.push(suggestions[0]);
  }
  if (emotion.level === 'negative') {
    points.push('感情面のサポートを優先し、まず気持ちを受け止める時間を確保する');
  } else if (emotion.level === 'neutral' && emotion.quotes.length > 0) {
    points.push('次回は本音をより引き出す深掘り質問を準備しておく');
  }
  return points.slice(0, 4);
}

function assessRisk(text: string): TranscriptionAnalysis['engagementRisk'] {
  const highMatches = HIGH_RISK_KEYWORDS.filter(kw => text.includes(kw));
  const medMatches  = MEDIUM_RISK_KEYWORDS.filter(kw => text.includes(kw));

  if (highMatches.length >= 1) {
    return {
      level: 'high', label: '高リスク',
      reasons: highMatches.map(kw => `「${kw}」に関する発言が確認されました`),
      recommendation: '速やかに上位マネージャーへ相談し、今週中に個別面談を設定してください',
    };
  }
  if (medMatches.length >= 2) {
    return {
      level: 'medium', label: '中リスク',
      reasons: [
        `不安・自信低下に関する発言が${medMatches.length}件確認されました`,
        '継続した観察と積極的なサポートが必要です',
      ],
      recommendation: '次回1on1を2週間以内に実施し、具体的な支援計画を立てることを推奨します',
    };
  }
  return {
    level: 'low', label: '低リスク',
    reasons: ['特に懸念される発言は見当たりませんでした'],
    recommendation: '現状維持で定期的な1on1を継続してください',
  };
}

export function analyzeTranscription(text: string): TranscriptionAnalysis {
  const categories = detectCategories(text);
  const emotion    = detectEmotion(text);
  const keyTopics  = extractKeyTopics(text);
  const actionItems = extractActionItems(text);
  const followUpPoints = extractFollowUps(categories, emotion);
  const engagementRisk = assessRisk(text);
  return { categories, emotion, keyTopics, actionItems, followUpPoints, engagementRisk };
}
