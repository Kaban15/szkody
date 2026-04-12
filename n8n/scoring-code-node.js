// n8n Code node: Lead Scoring
// Deployed in "Szkody - Formularz" workflow (reads $json.fields with Airtable field IDs)
// For "Szkody - Chat AI" a separate adapted version is deployed inline.

const items = $input.all();
const results = [];

const STATUS_FIELD = 'fldvigglUZz1WCh9w';
const PRIORITY_FIELD = 'fldLIbFpVcGT4zwFl';
const CASE_TYPE_FIELD = 'fldFvHcaJFi5avKIJ';
const SOURCE_FIELD = 'fld32SWWh3EpUz3su';

const TYPE_SCORES = {
  'Komunikacyjne': 3,
  'Śmierć bliskiej': 3,
  'Przy pracy': 2,
  'Błąd medyczny': 2,
  'Rolnicze': 1,
};

const CHANNEL_SCORES = {
  'chat-ai': 3,
  'kontakt': 2,
};

function getPriority(score) {
  if (score >= 5) return 'Gorący';
  if (score >= 3) return 'Ciepły';
  return 'Zimny';
}

for (const item of items) {
  const fields = item.json.fields || {};

  const caseType = fields[CASE_TYPE_FIELD] || '';
  const source = fields[SOURCE_FIELD] || '';

  let typeScore = TYPE_SCORES[caseType] || 1;

  let channelScore = CHANNEL_SCORES[source] || 1;
  if (!CHANNEL_SCORES[source] && source.startsWith('kontakt')) {
    channelScore = 2;
  }

  const totalScore = typeScore + channelScore;
  const priority = getPriority(totalScore);

  fields[STATUS_FIELD] = 'Nowy';
  fields[PRIORITY_FIELD] = priority;

  results.push({ json: { ...item.json, fields } });
}

return results;
