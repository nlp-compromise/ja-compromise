// 助詞 - japanese particles.
// they follow the word they mark, so calling them 'prepositions' is a stretch -
// but compromise's shared tagset uses #Preposition, and downstream matches
// depend on it, so the case-marking particles keep that as a parent tag.
export default {
  Particle: {
    aliases: [null, '助詞'],
    not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'Value'],
  },
  // 格助詞 - が を に へ で と から より まで
  CaseParticle: {
    aliases: [null, '格助詞'],
    is: 'Particle',
    not: ['TopicParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'SentenceParticle', 'AdnominalParticle', 'QuotativeParticle'],
    also: ['Preposition'],
  },
  // 係助詞 - は も こそ さえ しか
  TopicParticle: {
    aliases: [null, '係助詞'],
    is: 'Particle',
    not: ['CaseParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'SentenceParticle', 'AdnominalParticle', 'QuotativeParticle'],
    also: ['Preposition'],
  },
  // 副助詞 - だけ ばかり ほど くらい など
  AdverbialParticle: {
    aliases: [null, '副助詞'],
    is: 'Particle',
    not: ['CaseParticle', 'TopicParticle', 'ConjunctiveParticle', 'SentenceParticle', 'AdnominalParticle', 'QuotativeParticle'],
    also: ['Preposition'],
  },
  // 接続助詞 - て ば たら ながら ので のに けれど
  ConjunctiveParticle: {
    aliases: [null, '接続助詞'],
    is: 'Particle',
    not: ['CaseParticle', 'TopicParticle', 'AdverbialParticle', 'SentenceParticle', 'AdnominalParticle', 'QuotativeParticle'],
    also: ['Conjunction'],
  },
  // 終助詞 - か ね よ な わ ぞ ぜ
  SentenceParticle: {
    aliases: [null, '終助詞'],
    is: 'Particle',
    not: ['CaseParticle', 'TopicParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'AdnominalParticle', 'QuotativeParticle'],
  },
  // の - possessive and nominalizer
  AdnominalParticle: {
    aliases: [null, '連体助詞'],
    is: 'Particle',
    not: ['CaseParticle', 'TopicParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'SentenceParticle', 'QuotativeParticle'],
    also: ['Preposition'],
  },
  // と, when it introduces a quote
  QuotativeParticle: {
    aliases: [null, '引用助詞'],
    is: 'Particle',
    not: ['CaseParticle', 'TopicParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'SentenceParticle', 'AdnominalParticle'],
    also: ['Conjunction'],
  },
}
