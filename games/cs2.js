const https = require('https');
const { cs2Registry } = require('../utils/metrics.js').registries;
const { metrics } = require('../utils/metrics.js');
const { formatRconResult } = require('../utils/parseCs2');

function checkUpToDate(buildNumber) {
  return new Promise((resolve) => {
    if (!buildNumber) return resolve(0);
    const url = `https://api.steampowered.com/ISteamApps/UpToDateCheck/v1/?appid=730&version=${encodeURIComponent(buildNumber)}&format=json`;
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return resolve(0);
      }
      const chunks = [];
      res.on('data', chunk => { chunks.push(chunk); });
      res.on('end', () => {
        try {
          const json = JSON.parse(Buffer.concat(chunks).toString());
          resolve(json.response && json.response.success && json.response.up_to_date === true ? 1 : 0);
        } catch {
          resolve(0);
        }
      });
    }).on('error', () => resolve(0));
  });
}

async function setMetrics(result, reqInfos) {
  const { stats, status } = formatRconResult(result);

  const defaultLabels = {
    server: `${reqInfos.ip}:${reqInfos.port}`,
    game: reqInfos.game,
    version: status.version || 'unknown',
    hostname: status.hostname || 'unknown',
    map: status.map || 'unknown',
  };
  cs2Registry.setDefaultLabels(defaultLabels);

  // stats: [cpu, netin, netout, uptime, maps, fps, ...]  → best effort
  const num = (i, d = 0) => (stats[i] !== undefined ? Number(stats[i]) : d);

  metrics.status.set(1);
  metrics.cpu.set(num(0));
  metrics.netin.set(num(1));
  metrics.netout.set(num(2));
  metrics.uptime.set(num(3));
  metrics.maps.set(num(4));
  metrics.fps.set(num(5));

  metrics.players.set(Number(status.players || 0));
  // Si tu veux "playerstv" = spectateurs GOTV (ce que je recommande)
  metrics.playerstv.set(Number(status.tv_spectators || 0));
  metrics.bot.set(Number(status.bot || 0));

  // Optionnel: exposer des compteurs séparés pour GOTV
  if (metrics.gotv_total_slots) metrics.gotv_total_slots.set(Number(status.tv_total_slots || 0));
  if (metrics.gotv_count) metrics.gotv_count.set(Number(status.tv_count || 0));

  const upToDate = await checkUpToDate(status.buildNumber);
  metrics.up_to_date.set(upToDate);

  return cs2Registry.metrics();
}

function setNoMetrics(reqInfos) {
  const defaultLabels = {
    server: `${reqInfos.ip}:${reqInfos.port}`,
    game: reqInfos.game,
  };
  // ⚠️ Correction: cs2Registry (pas csgoRegistry)
  cs2Registry.setDefaultLabels(defaultLabels);

  metrics.status.set(0);
  return cs2Registry.metrics();
}

module.exports = {
  setMetrics,
  setNoMetrics,
};
