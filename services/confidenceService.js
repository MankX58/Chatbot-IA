import knowledgeBase from '../config/knowledgeBase.js';

const OUT_OF_SCOPE_REPLY =
  'Lo siento, solo puedo ayudarte con temas relacionados con la Universidad de Medellin.';

const STOPWORDS = new Set([
  'al', 'algo', 'como', 'con', 'cual', 'cuando', 'de', 'del', 'donde', 'el', 'en',
  'es', 'esta', 'este', 'esto', 'hay', 'la', 'las', 'lo', 'los', 'mas', 'mi', 'necesito',
  'no', 'para', 'por', 'que', 'quiero', 'se', 'si', 'sin', 'sobre', 'tengo', 'una',
  'un', 'ya', 'yo',
]);

function normalizeText(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function tokenize(text) {
  return [...new Set(
    normalizeText(text)
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2 && !STOPWORDS.has(token))
  )];
}

function overlapScore(sourceTokens, targetTokens) {
  if (!sourceTokens.length || !targetTokens.length) {
    return 0;
  }

  const targetSet = new Set(targetTokens);
  const hits = sourceTokens.filter((token) => targetSet.has(token)).length;

  return hits / sourceTokens.length;
}

function scoreKnowledgeBaseEntry(queryTokens, entry) {
  const problemTokens = tokenize(entry.problema);
  const topicTokens = tokenize(entry.tema);
  const solutionTokens = tokenize(entry.solucion);

  const problemScore = overlapScore(queryTokens, problemTokens);
  const topicScore = overlapScore(queryTokens, topicTokens);
  const solutionScore = overlapScore(queryTokens, solutionTokens);

  return (problemScore * 0.55) + (topicScore * 0.2) + (solutionScore * 0.25);
}

function toConfidenceLabel(score) {
  if (score >= 0.75) {
    return 'Alta';
  }

  if (score >= 0.45) {
    return 'Media';
  }

  return 'Baja';
}

function buildResult(score, matchedEntry = null) {
  let boostedScore = score * 1.40;
  if (boostedScore > 1.0) {
    boostedScore = 0.9;
  }
  return {
    score: boostedScore,
    percentage: Math.round(boostedScore * 100),
    label: toConfidenceLabel(boostedScore),
    autoEscalate: boostedScore < 0.45,
    matchedTopic: matchedEntry?.tema ?? null,
    matchedProblem: matchedEntry?.problema ?? null,
  };
}

export function calculateResponseConfidence(query, answer) {
  const normalizedAnswer = normalizeText(answer);

  if (!answer?.trim()) {
    return buildResult(0.05);
  }

  if (normalizedAnswer.includes(normalizeText(OUT_OF_SCOPE_REPLY))) {
    return buildResult(0.2);
  }

  if (normalizedAnswer.includes('error al conectar')) {
    return buildResult(0.05);
  }

  const queryTokens = tokenize(query);

  if (!queryTokens.length) {
    return buildResult(0.35);
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    const entryScore = scoreKnowledgeBaseEntry(queryTokens, entry);

    if (entryScore > bestScore) {
      bestScore = entryScore;
      bestMatch = entry;
    }
  }

  const answerLengthBonus = answer.trim().length > 180 ? 0.08 : answer.trim().length > 80 ? 0.04 : 0;
  const groundedScore = Math.min(0.95, 0.28 + (bestScore * 0.62) + answerLengthBonus);

  if (bestScore < 0.16) {
    return buildResult(Math.min(0.42, groundedScore), bestMatch);
  }

  return buildResult(groundedScore, bestMatch);
}
