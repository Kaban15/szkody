// n8n Code node: Lead Scoring
// Paste this into a Code node BEFORE the Airtable Create Record node
// in both "Szkody - Formularz" and "Szkody - Chat AI" workflows.
//
// Input: item with fields tag, event_type (from webhook data)
// Output: item with added fields: priority, status

const items = $input.all();
const results = [];

// Scoring maps
const TYPE_SCORES = {
  'komunikacyjne': 3,
  'smierc': 3,
  'Śmierć bliskiej osoby': 3,
  'praca': 2,
  'Przy pracy': 2,
  'medyczne': 2,
  'Błąd medyczny': 2,
  'rolnicze': 1,
  'Rolnicze': 1,
};

const CHANNEL_SCORES = {
  'chat-ai': 3,
  'kontakt': 2,
};

// Priority thresholds (max 6 points from 2 signals)
function getPriority(score) {
  if (score >= 5) return 'Gorący';
  if (score >= 3) return 'Ciepły';
  return 'Zimny';
}

for (const item of items) {
  const data = item.json;
  const eventType = data.event_type || '';
  const tag = data.tag || '';

  // Score: case type
  let typeScore = TYPE_SCORES[eventType] || 1;

  // Score: channel (tag)
  let channelScore = CHANNEL_SCORES[tag] || 1;
  // kontakt-* pattern (e.g. kontakt-komunikacyjne)
  if (!CHANNEL_SCORES[tag] && tag.startsWith('kontakt-')) {
    channelScore = 2;
  }

  const totalScore = typeScore + channelScore;
  const priority = getPriority(totalScore);

  // Pass through all original data + add scoring fields
  results.push({
    json: {
      ...data,
      priority: priority,
      status: 'Nowy',
      _scoring_debug: `type=${typeScore} channel=${channelScore} total=${totalScore}`,
    }
  });
}

return results;
