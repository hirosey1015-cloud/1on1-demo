export type SubordinateType = 'young' | 'mid' | 'high_performer';
export type Situation =
  | 'low_motivation'
  | 'no_results'
  | 'no_issues'
  | 'career_concern'
  | 'relationship_issue';

export type CategoryKey =
  | 'relationship'
  | 'engagement'
  | 'situation'
  | 'issues'
  | 'feedback'
  | 'career';

export interface Question {
  id: string;
  category: CategoryKey;
  categoryName: string;
  categoryNum: string;
  categoryColor: string;
  text: string;
}

export interface GeneratedContent {
  questions: Question[];
  ngActions: string[];
  deepDiveQuestions: string[];
}

export const CATEGORY_META: Record<CategoryKey, { name: string; num: string; color: string }> = {
  relationship: { name: '人間関係の構築',   num: '①', color: 'blue'   },
  engagement:   { name: 'エンゲージメント', num: '②', color: 'purple' },
  situation:    { name: '状況把握',          num: '③', color: 'green'  },
  issues:       { name: '課題',              num: '④', color: 'orange' },
  feedback:     { name: 'フィードバック',    num: '⑤', color: 'pink'   },
  career:       { name: '能力開発・キャリア', num: '⑥', color: 'indigo' },
};

interface QuestionData {
  category: CategoryKey;
  text: string;
}

interface ComboSet {
  questions: QuestionData[];      // 5問
  ngActions: string[];            // 2件
  deepDiveQuestions: string[];    // 2問
}

type CombinationKey = `${SubordinateType}_${Situation}`;

// ────────────────────────────────────────────
// 全15パターンの質問セット
// ────────────────────────────────────────────
const COMBO_SETS: Record<CombinationKey, ComboSet> = {

  // ── 若手 ──────────────────────────────────
  young_low_motivation: {
    questions: [
      { category: 'engagement',   text: '最近、仕事に意義を感じていますか？何を変えれば意義を感じられると思いますか？' },
      { category: 'relationship', text: '職場で一番話しやすい人は誰ですか？' },
      { category: 'career',       text: '今の仕事で、新しく挑戦してみたいことはありますか？' },
      { category: 'issues',       text: '今、一番困っていることを教えてください。私が力になれることはありますか？' },
      { category: 'feedback',     text: '私のサポートで、もっとこうしてほしいということはありますか？' },
    ],
    ngActions: [
      '成果や進捗ばかり聞かない（マイクロマネジメントになる）',
      '解決策をすぐに提示しない（まず話を聞く）',
    ],
    deepDiveQuestions: [
      'もし明日から仕事内容を自由に選べるとしたら、何をしてみたいですか？',
      '去年の今頃と比べて、自分の中で変わったことはありますか？',
    ],
  },

  young_no_results: {
    questions: [
      { category: 'situation',    text: '今取り組んでいる仕事で、一番時間がかかっていることは何ですか？' },
      { category: 'issues',       text: 'うまくいかないと感じる原因について、自分ではどう考えていますか？' },
      { category: 'relationship', text: '困ったとき、チームのメンバーに相談できていますか？' },
      { category: 'engagement',   text: '今の仕事で、楽しいと感じる部分はありますか？' },
      { category: 'feedback',     text: '私のサポートで、もっとこうしてほしいことはありますか？' },
    ],
    ngActions: [
      '責めるような言い方をしない',
      '他のメンバーと比べない',
    ],
    deepDiveQuestions: [
      '理想の状態になるには、何が一番変わればいいと思いますか？',
      '今の自分に足りないと感じているものは何ですか？',
    ],
  },

  young_no_issues: {
    questions: [
      { category: 'career',       text: '入社してから、一番成長を感じた瞬間を教えてください' },
      { category: 'engagement',   text: '今の仕事で、一番楽しいことは何ですか？' },
      { category: 'situation',    text: '最近、自分でできるようになったことはありますか？' },
      { category: 'relationship', text: 'チームの中で、もっと一緒に仕事をしてみたい人はいますか？' },
      { category: 'feedback',     text: '私とのコミュニケーションで、改善できることはありますか？' },
    ],
    ngActions: [
      '「問題がないなら大丈夫」と短く終わらせない',
      'マネージャー側の話ばかりで、部下の話す時間を奪わない',
    ],
    deepDiveQuestions: [
      '今の調子を10点満点で言うと何点ですか？満点にするには何が必要ですか？',
      '半年後の自分に期待していることを教えてください',
    ],
  },

  young_career_concern: {
    questions: [
      { category: 'career',       text: '今の仕事を続けていて、将来どんな自分になりたいですか？' },
      { category: 'engagement',   text: '今の仕事で、自分の強みを活かせている部分はありますか？' },
      { category: 'situation',    text: 'キャリアについて悩み始めたのは、どんなきっかけですか？' },
      { category: 'relationship', text: '社内で「こんな仕事をしてみたい」と思うロールモデルはいますか？' },
      { category: 'issues',       text: 'キャリアを考えるうえで、今一番不安に思っていることは何ですか？' },
    ],
    ngActions: [
      '「まだ若いからそんなこと考えなくていい」と否定しない',
      '会社の都合だけを押し付けない（本人の希望を最優先で聞く）',
    ],
    deepDiveQuestions: [
      '5年後の自分が今の自分にアドバイスをするとしたら、何と言うと思いますか？',
      '理想のキャリアを歩んでいる人を知っていますか？その人と自分の違いは何だと思いますか？',
    ],
  },

  young_relationship_issue: {
    questions: [
      { category: 'relationship', text: '最近、チームとのコミュニケーションで気になることはありますか？' },
      { category: 'situation',    text: 'その状況は、毎日の仕事にどう影響していますか？' },
      { category: 'engagement',   text: '人間関係の課題はありつつも、今の仕事で楽しいと感じる部分はありますか？' },
      { category: 'issues',       text: '状況を改善するために、自分でできることはあると思いますか？' },
      { category: 'feedback',     text: '私が間に入ってできることはありますか？' },
    ],
    ngActions: [
      '特定の人物の悪口・批判に同調しない',
      '「気にしすぎ」と問題を軽視しない',
    ],
    deepDiveQuestions: [
      '相手の立場から見ると、今の状況はどう見えていると思いますか？',
      '関係を改善するために、今すぐ一つだけできることは何だと思いますか？',
    ],
  },

  // ── 中堅 ──────────────────────────────────
  mid_low_motivation: {
    questions: [
      { category: 'engagement',   text: '今の役割で一番充実感を感じていた時期と比べて、何が変わりましたか？' },
      { category: 'situation',    text: '最近、業務の内容や量に変化はありましたか？' },
      { category: 'career',       text: '今後、新しく挑戦してみたいことや任されたい仕事はありますか？' },
      { category: 'relationship', text: 'チームや職場の雰囲気について、最近どう感じていますか？' },
      { category: 'feedback',     text: '私のマネジメントで、改善してほしいことはありますか？' },
    ],
    ngActions: [
      '「以前は頑張っていたのに」と過去と比べない',
      '「気持ちの問題だ」と精神論で励まさない',
    ],
    deepDiveQuestions: [
      'もし今の仕事を自分でデザインできるとしたら、何を変えますか？',
      '最後に「本当にやりがいがある」と感じたのはいつですか？その時との違いは何ですか？',
    ],
  },

  mid_no_results: {
    questions: [
      { category: 'situation',  text: '今、一番時間を使っている仕事を教えてください。進捗はどうですか？' },
      { category: 'issues',     text: '成果に影響している課題があれば教えてください。一緒に解決しましょう' },
      { category: 'engagement', text: '今の役割で、やりがいを感じている部分はどこですか？' },
      { category: 'career',     text: '今後どのようなスキルを身につけたいと思っていますか？' },
      { category: 'feedback',   text: '私からのサポートや関わり方について、改善できることはありますか？' },
    ],
    ngActions: [
      '責めるような言い方をしない',
      '解決策の押しつけをしない（まず部下のアイデアを聞く）',
    ],
    deepDiveQuestions: [
      '理想の状態と今の状態のギャップは、何が一番大きいと思いますか？',
      '今の状況を変えるために、あなたが今すぐできることは何だと思いますか？',
    ],
  },

  mid_no_issues: {
    questions: [
      { category: 'career',       text: '3年後、どんなポジションや役割を目指していますか？' },
      { category: 'engagement',   text: '最近の仕事で、特に手応えを感じたことを教えてください' },
      { category: 'situation',    text: '今のチームに、あなたが貢献できていると感じることは何ですか？' },
      { category: 'relationship', text: '後輩や若手メンバーのサポートについて、どう感じていますか？' },
      { category: 'feedback',     text: '私のサポートで、もっとできることはありますか？' },
    ],
    ngActions: [
      '「問題がないなら大丈夫」と対話を省かない',
      '成果を当然のものとして扱わず、しっかり認める',
    ],
    deepDiveQuestions: [
      '今の仕事を10点満点で採点すると何点ですか？満点にするには何が必要ですか？',
      '今のあなたを一言で表すとしたら、どんな言葉が浮かびますか？',
    ],
  },

  mid_career_concern: {
    questions: [
      { category: 'career',       text: '今後のキャリアで、一番実現したいことは何ですか？' },
      { category: 'engagement',   text: '今の仕事で、自分のどんな強みが活かせていると感じますか？' },
      { category: 'situation',    text: 'キャリアの悩みは、どんな場面で特に強く感じますか？' },
      { category: 'issues',       text: '理想のキャリアを歩むために、今の課題は何だと思いますか？' },
      { category: 'relationship', text: '社内外に、キャリアについて相談できる人はいますか？' },
    ],
    ngActions: [
      '「もっと今の仕事に集中して」と否定しない',
      '異動や転職への関心を頭ごなしに否定しない',
    ],
    deepDiveQuestions: [
      '理想のキャリアを実現している人を知っていますか？その人と自分の違いは何だと思いますか？',
      '10年後の自分が今の自分にアドバイスをするとしたら、何と言うと思いますか？',
    ],
  },

  mid_relationship_issue: {
    questions: [
      { category: 'relationship', text: '最近、チームや職場の人間関係で気になることを教えてください' },
      { category: 'situation',    text: 'その状況は、仕事のパフォーマンスや日々の気持ちに影響していますか？' },
      { category: 'engagement',   text: '人間関係の課題以外では、今の仕事に満足していることはありますか？' },
      { category: 'issues',       text: '関係を改善するために、あなた自身でできることはあると思いますか？' },
      { category: 'feedback',     text: '私が間に入ってできることはありますか？' },
    ],
    ngActions: [
      '特定の人物の批判に同調しない',
      '「よくあることだよ」と問題を軽視しない',
    ],
    deepDiveQuestions: [
      '相手の立場から見ると、今の状況はどう見えていると思いますか？',
      'この経験を通じて、チームのあり方について気づいたことはありますか？',
    ],
  },

  // ── ハイパフォーマー ──────────────────────
  high_performer_low_motivation: {
    questions: [
      { category: 'engagement',   text: '今のあなたの力を100%発揮できていると感じますか？もし違うなら、何が足りないでしょうか？' },
      { category: 'career',       text: '今の役割の先に、どんなキャリアを描いていますか？' },
      { category: 'situation',    text: '最近、特にストレスを感じている仕事や状況はありますか？' },
      { category: 'relationship', text: 'チームや組織全体に対して、何か感じていることはありますか？' },
      { category: 'feedback',     text: '私のマネジメントで、変えてほしいことはありますか？' },
    ],
    ngActions: [
      '成果が出ているからといって放置しない',
      '焦りや不満を「贅沢な悩み」と軽視しない',
    ],
    deepDiveQuestions: [
      '今の仕事を続ける理由と、辞めたくなる理由を正直に教えてもらえますか？',
      '今のポジションで達成したいことのうち、まだ手をつけていないことはありますか？',
    ],
  },

  high_performer_no_results: {
    questions: [
      { category: 'situation',  text: '今の状況を、自分ではどう分析していますか？' },
      { category: 'issues',     text: '成果を出すうえで、自分の力だけでは解決しにくい障壁はありますか？' },
      { category: 'career',     text: 'この経験を通じて、どんなスキルや学びを得たいと思いますか？' },
      { category: 'engagement', text: '今の状況でも、前向きに取り組めていることはありますか？' },
      { category: 'feedback',   text: '私のサポートで、もっとうまくできることはありますか？' },
    ],
    ngActions: [
      '「あなたなら大丈夫」と根拠なく励まさない',
      '過去の成果と比較して責めない',
    ],
    deepDiveQuestions: [
      '今回の経験は、長期的にどんな意味をもつと思いますか？',
      '今の状況を乗り越えるために、一番必要なリソースは何だと思いますか？',
    ],
  },

  high_performer_no_issues: {
    questions: [
      { category: 'career',       text: '5年後、どんな仕事をしていたいですか？' },
      { category: 'engagement',   text: '今の仕事で、もっと時間を使いたい領域はありますか？' },
      { category: 'relationship', text: 'チームの中で、もっと関わりたいと思っている人はいますか？' },
      { category: 'feedback',     text: '私がもっとうまくサポートできることはありますか？' },
      { category: 'issues',       text: 'あなたの成長の邪魔になっているものがあれば教えてください' },
    ],
    ngActions: [
      '成果を当然と思って褒めることを忘れない',
      '業務の話ばかりにならない（キャリアの話を必ず入れる）',
    ],
    deepDiveQuestions: [
      '今の仕事を10点満点で採点すると何点ですか？満点にするには何が必要ですか？',
      'あなたが一番「自分らしく働けている」と感じる瞬間はどんな時ですか？',
    ],
  },

  high_performer_career_concern: {
    questions: [
      { category: 'career',       text: '理想のキャリアを実現している人を知っていますか？自分との違いは何だと思いますか？' },
      { category: 'engagement',   text: '今の仕事でもっとも情熱を感じる瞬間はいつですか？' },
      { category: 'situation',    text: '今の役割で、あなたの可能性が制限されていると感じることはありますか？' },
      { category: 'relationship', text: '社外も含めて、キャリアについて相談できる人はいますか？' },
      { category: 'feedback',     text: '私が、あなたのキャリア実現のためにできることはありますか？' },
    ],
    ngActions: [
      '転職や社外への関心を頭ごなしに否定しない',
      '会社の都合だけを押し付けない（本人の可能性を最大化する視点で話す）',
    ],
    deepDiveQuestions: [
      '5年後の自分が今の自分を見たとき、何に後悔しそうですか？',
      '今の会社で実現したいことのうち、まだ叶えていないものは何ですか？',
    ],
  },

  high_performer_relationship_issue: {
    questions: [
      { category: 'relationship', text: 'チームへの影響力という観点から、今の人間関係をどう見ていますか？' },
      { category: 'situation',    text: 'その状況は、あなたのパフォーマンスや意思決定にどう影響していますか？' },
      { category: 'engagement',   text: '人間関係の課題を除けば、今の仕事への満足度はどうですか？' },
      { category: 'career',       text: 'この経験は、将来どんなリーダーになりたいかと関係していると思いますか？' },
      { category: 'feedback',     text: '私にできるサポートはありますか？' },
    ],
    ngActions: [
      '相手を悪者にする発言に同調しない',
      '「そのくらい大丈夫でしょ」とハイパフォーマーの悩みを軽視しない',
    ],
    deepDiveQuestions: [
      'この経験から、組織やチームのあり方について気づいたことはありますか？',
      '10年後にこの経験を振り返ったとき、どんな意味があったと思いそうですか？',
    ],
  },
};

// ────────────────────────────────────────────
// 質問生成
// ────────────────────────────────────────────
export function generateContent(
  type: SubordinateType,
  situations: Situation[]
): GeneratedContent {
  const primary = situations[0];
  const secondary = situations[1];

  const key: CombinationKey = `${type}_${primary}`;
  const primarySet = COMBO_SETS[key];

  // 質問：基本は1つ目の状況の5問をそのまま使用
  // 2つ目の状況がある場合、異なるカテゴリーの質問を1問差し替え
  let questions = [...primarySet.questions];
  if (secondary) {
    const secondaryKey: CombinationKey = `${type}_${secondary}`;
    const secondarySet = COMBO_SETS[secondaryKey];
    const usedCategories = new Set(questions.map(q => q.category));
    const extraQ = secondarySet.questions.find(q => !usedCategories.has(q.category));
    if (extraQ) {
      // 末尾の質問を置き換え
      questions = [...questions.slice(0, 4), extraQ];
    }
  }

  // NG行動：1つ目から1件 + 2つ目から1件（合計最大2件）
  const ngActions = [
    primarySet.ngActions[0],
    secondary
      ? COMBO_SETS[`${type}_${secondary}`].ngActions[0]
      : primarySet.ngActions[1],
  ];

  // 深掘り：1つ目から1問 + 2つ目から1問（なければ1つ目の2問目）
  const deepDiveQuestions = [
    primarySet.deepDiveQuestions[0],
    secondary
      ? COMBO_SETS[`${type}_${secondary}`].deepDiveQuestions[0]
      : primarySet.deepDiveQuestions[1],
  ];

  return {
    questions: questions.map((q, i) => ({
      id: `q-${i}`,
      category: q.category,
      categoryName: CATEGORY_META[q.category].name,
      categoryNum:  CATEGORY_META[q.category].num,
      categoryColor: CATEGORY_META[q.category].color,
      text: q.text,
    })),
    ngActions,
    deepDiveQuestions,
  };
}
