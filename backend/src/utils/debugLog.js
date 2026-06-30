const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '../../../debug-db9a91.log');

// #region agent log
const debugLog = (location, message, data, hypothesisId, runId = 'pre-fix') => {
  const payload = {
    sessionId: 'db9a91',
    runId,
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };
  try {
    fs.appendFileSync(LOG_PATH, `${JSON.stringify(payload)}\n`);
  } catch (_) {}
  return fetch('http://127.0.0.1:7489/ingest/1c86fd52-618c-449a-ab3c-a0465569063a', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'db9a91' },
    body: JSON.stringify(payload),
  }).catch(() => {});
};
// #endregion

module.exports = debugLog;
