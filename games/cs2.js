const { cs2Registry } = require('../utils/metrics.js').registries;

const { metrics } = require('../utils/metrics.js');

const formatRconResult = function (result) {
    let { stats, status } = result;
    //console.log(stats);
    stats = stats.split(/\r?\n/);
    stats.pop();
    stats.shift();
    stats = stats[0].trim().split(/\s+/);

    const infosArray = status.split(/\r?\n/);
    const sourceTVIndex = infosArray.findIndex(line => line.includes("'SourceTV'"));
    const TotalSlotsIndex = infosArray.findIndex(line => line.includes("Total Slots"));
    
    let botCount = 0;

    for (const line of infosArray) {
    if (line.includes('BOT') && !line.includes('SourceTV')) {
        botCount++;
    }
    }
    
    status = {
        hostname: infosArray[5].split(': ').slice(1).join(': '),
        version: infosArray[7].split(': ')[1].split('/')[0],
        map: infosArray[14].split(': ')[3].split('| ')[0].trim(),
        players: infosArray[12].split(': ')[1].split(' humans')[0].trim(),
        playerstv: infosArray[TotalSlotsIndex].split(', ')[1].split(' ')[1].trim(),
        bot: botCount,
    }
    
    if (sourceTVIndex !== -1) {
        stats[6] -= 1;
    }

    return {
        stats,
        status
    };
}

const setMetrics = function (result, reqInfos) {
    const { stats, status } = formatRconResult(result);

    const defaultLabels = {
        server: `${reqInfos.ip}:${reqInfos.port}`,
        game: reqInfos.game,
        version: status.version,
        hostname: status.hostname,
        map: status.map,
    };
    cs2Registry.setDefaultLabels(defaultLabels);

    metrics.status.set((Number(1)));
    metrics.cpu.set((Number(stats[0])));
    metrics.netin.set((Number(stats[1])));
    metrics.netout.set((Number(stats[2])));
    metrics.uptime.set((Number(stats[3])));
    metrics.maps.set((Number(stats[4])));
    metrics.fps.set((Number(stats[5])));
    metrics.players.set((Number(status.players)));
    metrics.playerstv.set((Number(status.playerstv)));
    metrics.bot.set((Number(status.bot)));

    return cs2Registry.metrics();
}

setNoMetrics = function (reqInfos) {
    const defaultLabels = {
        server: `${reqInfos.ip}:${reqInfos.port}`,
        game: reqInfos.game,
    };
    csgoRegistry.setDefaultLabels(defaultLabels);

    metrics.status.set((Number(0)));

    return csgoRegistry.metrics();
}

module.exports = {
    setMetrics,
    setNoMetrics
}
