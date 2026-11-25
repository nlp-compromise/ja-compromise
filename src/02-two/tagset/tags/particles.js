// only our own tags, and what differs from the shared tagset - see ../plugin.js
export default {
  Particle: {
    aliases: [null, '助詞'],
    is: undefined,
    not: ['Noun', 'Verb', 'Adjective', 'Adverb', 'Value'],
  },
  CaseParticle: {
    aliases: [null, '格助詞'],
    is: 'Particle',
    also: ['Preposition'],
    not: ['TopicParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'SentenceParticle', 'AdnominalParticle', 'QuotativeParticle'],
  },
  TopicParticle: {
    aliases: [null, '係助詞'],
    is: 'Particle',
    also: ['Preposition'],
    not: ['CaseParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'SentenceParticle', 'AdnominalParticle', 'QuotativeParticle'],
  },
  AdverbialParticle: {
    aliases: [null, '副助詞'],
    is: 'Particle',
    also: ['Preposition'],
    not: ['CaseParticle', 'TopicParticle', 'ConjunctiveParticle', 'SentenceParticle', 'AdnominalParticle', 'QuotativeParticle'],
  },
  ConjunctiveParticle: {
    aliases: [null, '接続助詞'],
    is: 'Particle',
    also: ['Conjunction'],
    not: ['CaseParticle', 'TopicParticle', 'AdverbialParticle', 'SentenceParticle', 'AdnominalParticle', 'QuotativeParticle'],
  },
  SentenceParticle: {
    aliases: [null, '終助詞'],
    is: 'Particle',
    not: ['CaseParticle', 'TopicParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'AdnominalParticle', 'QuotativeParticle'],
  },
  AdnominalParticle: {
    aliases: [null, '連体助詞'],
    is: 'Particle',
    also: ['Preposition'],
    not: ['CaseParticle', 'TopicParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'SentenceParticle', 'QuotativeParticle'],
  },
  QuotativeParticle: {
    aliases: [null, '引用助詞'],
    is: 'Particle',
    also: ['Conjunction'],
    not: ['CaseParticle', 'TopicParticle', 'AdverbialParticle', 'ConjunctiveParticle', 'SentenceParticle', 'AdnominalParticle'],
  },
}
