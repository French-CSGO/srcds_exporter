// utils/parseCs2.js

function safeMatch(line, regex, group = 1) {
  const m = line && line.match(regex);
  return m ? m[group] : null;
}

function parseHeader(lines) {
  const header = {
    hostname: null,
    version: null,
    humans: null,
    botsReported: null,
  };

  for (const line of lines) {
    if (!header.hostname)
      header.hostname = safeMatch(line, /^hostname\s*:\s*(.+)$/);

    if (!header.version)
      header.version = safeMatch(line, /^version\s*:\s*([0-9.]+)/);

    if (header.humans === null || header.botsReported === null) {
      const m = line.match(/^players\s*:\s*(\d+)\s+humans,\s*(\d+)\s+bots/i);
      if (m) {
        header.humans = Number(m[1]);
        header.botsReported = Number(m[2]);
      }
    }
  }

  return header;
}

function splitSections(statusText) {
  const lines = statusText.split(/\r?\n/);

  const playersStart = lines.findIndex(l =>
    l.trim().startsWith("---------players--------")
  );

  const playersEnd = lines.findIndex(
    (l, idx) => idx > playersStart && l.trim() === "#end"
  );

  const tvBlocks = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("--- SourceTV[")) {
      const start = i;
      let end = lines.findIndex((l, idx) => idx > start && l.trim() === "#end");
      if (end === -1) end = lines.length;
      tvBlocks.push(lines.slice(start, end + 1));
      i = end;
    }
  }

  const headerLines =
    playersStart !== -1 ? lines.slice(0, playersStart) : lines;

  const playersTable =
    playersStart !== -1 && playersEnd !== -1
      ? lines.slice(playersStart + 1, playersEnd)
      : [];

  return { headerLines, playersTable, tvBlocks };
}

function parsePlayersTable(playersTable) {
  let humans = 0;
  let botsNonTV = 0;
  let sourceTVBots = 0;

  for (const line of playersTable) {
    const isBot = /\sBOT\s/.test(line);
    const isSourceTV = line.includes("'SourceTV'");
    const isValid = /^\s*\d+/.test(line) || line.includes("NoChan");

    if (!isValid) continue;

    if (isBot) {
      if (isSourceTV) sourceTVBots++;
      else botsNonTV++;
    } else {
      if (!line.includes("NoChan")) humans++;
    }
  }

  return { humans, botsNonTV, sourceTVBots };
}

function parseSingleTVBlock(blockLines) {
  const joined = blockLines.join("\n");

  const totalSlots = Number(safeMatch(joined, /Total Slots\s+(\d+)/)) || 0;
  const spectators = Number(safeMatch(joined, /Spectators\s+(\d+)/)) || 0;
  const map = safeMatch(joined, /Map\s+"([^"]+)"/);

  return { totalSlots, spectators, map };
}

function parseMapFallback(lines) {
  for (const line of lines) {
    const m = line.match(/loaded spawngroup\(\s*1\).*?\[\s*1:\s*([^|\]]+)/i);
    if (m) return m[1].trim();
  }
  return null;
}

function formatRconResult(result) {
  const { stats, status } = result;

  // Parse stats
  
let statsArr = [];
try {
    const lines = stats.split(/\r?\n/).filter(Boolean);

    const numericLine = lines.find(l =>
        /^\s*[0-9.]+(\s+[0-9.]+)+$/.test(l.trim())
    );

    if (numericLine) {
        statsArr = numericLine.trim().split(/\s+/);
    }
} catch (e) {
    statsArr = [];
}


  const { headerLines, playersTable, tvBlocks } = splitSections(status);

  const header = parseHeader(headerLines);
  const pt = parsePlayersTable(playersTable);

  let tv_total_slots = 0;
  let tv_spectators = 0;
  let mapFromTV = null;

  for (const block of tvBlocks) {
    const parsed = parseSingleTVBlock(block);
    tv_total_slots += parsed.totalSlots;
    tv_spectators += parsed.spectators;
    if (!mapFromTV && parsed.map) mapFromTV = parsed.map;
  }

  const map = mapFromTV || parseMapFallback(headerLines);

  return {
    stats: statsArr,
    status: {
      hostname: header.hostname,
      version: header.version,
      map,
      players: pt.humans !== 0 ? pt.humans : (header.humans ?? 0),
      bot: (pt.botsNonTV !== 0 ? pt.botsNonTV : (header.botsReported ?? 0)),
      tv_count: tvBlocks.length,
      tv_spectators,
      tv_total_slots,
    }
  };
}

module.exports = { formatRconResult };
