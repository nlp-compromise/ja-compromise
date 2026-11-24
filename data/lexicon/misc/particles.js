// 助詞 - japanese particles.
// these are postpositions, not prepositions - they follow the word they mark.
// the tag decides what the tagger may infer about the word *before* it.
export default {
  // 格助詞 - case particles. mark the role a noun plays in the clause
  'が': 'CaseParticle',   // subject
  'を': 'CaseParticle',   // direct object
  'に': 'CaseParticle',   // indirect object, location-of-being, time
  'へ': 'CaseParticle',   // direction
  'で': 'CaseParticle',   // location-of-action, means  (also the て-form of だ)
  'と': 'CaseParticle',   // with, and, quotative
  'から': 'CaseParticle', // from
  'より': 'CaseParticle', // than, from
  'まで': 'CaseParticle', // until
  'や': 'CaseParticle',   // 'and', for an open-ended list
  'の': 'AdnominalParticle', // possessive / nominalizer

  // 係助詞 - binding particles. set the topic or add contrast
  'は': 'TopicParticle',
  'も': 'TopicParticle',
  'こそ': 'TopicParticle',
  'しか': 'TopicParticle',
  'さえ': 'TopicParticle',
  'でも': 'TopicParticle',
  'なら': 'TopicParticle',

  // 副助詞 - adverbial particles. quantify or delimit
  'だけ': 'AdverbialParticle',
  'ばかり': 'AdverbialParticle',
  'ほど': 'AdverbialParticle',
  'くらい': 'AdverbialParticle',
  'ぐらい': 'AdverbialParticle',
  'など': 'AdverbialParticle',
  'なんか': 'AdverbialParticle',
  'ずつ': 'AdverbialParticle',
  'とか': 'AdverbialParticle',
  'やら': 'AdverbialParticle',

  // 接続助詞 - conjunctive particles. join clauses, attach to verbs/adjectives
  'て': 'ConjunctiveParticle',
  'で': 'CaseParticle',
  'ば': 'ConjunctiveParticle',
  'たら': 'ConjunctiveParticle',
  'なら': 'TopicParticle',
  'ながら': 'ConjunctiveParticle',
  'ので': 'ConjunctiveParticle',
  'のに': 'ConjunctiveParticle',
  'けれど': 'ConjunctiveParticle',
  'けれども': 'ConjunctiveParticle',
  'けど': 'ConjunctiveParticle',
  'し': 'ConjunctiveParticle',
  'たり': 'ConjunctiveParticle',
  'つつ': 'ConjunctiveParticle',
  'ても': 'ConjunctiveParticle',

  // 終助詞 - sentence-final particles. mood, not structure
  'か': 'SentenceParticle',
  'ね': 'SentenceParticle',
  'よ': 'SentenceParticle',
  'な': 'SentenceParticle',
  'わ': 'SentenceParticle',
  'ぞ': 'SentenceParticle',
  'ぜ': 'SentenceParticle',
  'さ': 'SentenceParticle',
  'かな': 'SentenceParticle',
  'かしら': 'SentenceParticle',
  'よね': 'SentenceParticle',
  'のか': 'SentenceParticle',
  'ものか': 'SentenceParticle',
  'ねえ': 'SentenceParticle',
  'なあ': 'SentenceParticle',
}
