const prometheus = require('prom-client');
const { Gauge } = prometheus;

const registries = {
    csgoRegistry: new prometheus.Registry(),
    gmodRegistry: new prometheus.Registry(),
    cssRegistry: new prometheus.Registry(),
    tf2Registry: new prometheus.Registry(),
    l4d2Registry: new prometheus.Registry(),
    hl2Registry: new prometheus.Registry(),
    cs2Registry: new prometheus.Registry(),
};

const metrics = {
    status: new Gauge({ 
        name: "srcds_status", 
        help: "The server's status: 0 = offline/bad password, 1 = online", 
        registers: [registries.csgoRegistry, registries.cs2Registry, registries.gmodRegistry, registries.cssRegistry, registries.hl2Registry, registries.tf2Registry, registries.l4d2Registry] 
    }),

    cpu: new Gauge({ name: "srcds_cpu", help: "The server's CPU usage", registers: [registries.csgoRegistry, registries.cs2Registry,registries.gmodRegistry, registries.cssRegistry, registries.hl2Registry, registries.tf2Registry, registries.l4d2Registry] }),
    netin: new Gauge({ name: "srcds_netin", help: "The server's netin usage", registers: [registries.csgoRegistry, registries.cs2Registry,registries.gmodRegistry, registries.cssRegistry, registries.hl2Registry, registries.tf2Registry, registries.l4d2Registry] }),
    netout: new Gauge({ name: "srcds_netout", help: "The server's netout usage", registers: [registries.csgoRegistry, registries.cs2Registry,registries.gmodRegistry, registries.cssRegistry, registries.hl2Registry, registries.tf2Registry, registries.l4d2Registry] }),
    uptime: new Gauge({ name: "srcds_uptime", help: "The server's uptime", registers: [registries.csgoRegistry, registries.cs2Registry,registries.gmodRegistry, registries.cssRegistry, registries.hl2Registry, registries.tf2Registry, registries.l4d2Registry] }),
    maps: new Gauge({ name: "srcds_maps", help: "The server's map index", registers: [registries.csgoRegistry, registries.cs2Registry,registries.gmodRegistry, registries.cssRegistry, registries.hl2Registry, registries.tf2Registry] }),
    fps: new Gauge({ name: "srcds_fps", help: "The server's FPS", registers: [registries.csgoRegistry, registries.cs2Registry,registries.gmodRegistry, registries.cssRegistry, registries.hl2Registry, registries.tf2Registry, registries.l4d2Registry] }),
    players: new Gauge({ name: "srcds_players", help: "Current connected human players", registers: [registries.csgoRegistry, registries.cs2Registry,registries.gmodRegistry, registries.cssRegistry, registries.hl2Registry, registries.tf2Registry, registries.l4d2Registry] }),

    // CS:GO only
    svms: new Gauge({ name: "srcds_svms", help: "SVMs (CSGO only)", registers: [registries.csgoRegistry] }),
    varms: new Gauge({ name: "srcds_varm", help: "VARMs (CSGO only)", registers: [registries.csgoRegistry] }),
    tick: new Gauge({ name: "srcds_tick", help: "Tickrate (CSGO only)", registers: [registries.csgoRegistry] }),

    // Other games
    connects: new Gauge({ name: "srcds_connects", help: "Number of players who connected since boot", registers: [registries.gmodRegistry, registries.cssRegistry, registries.hl2Registry, registries.tf2Registry] }),
    users: new Gauge({ name: "srcds_users", help: "Number of users since boot", registers: [registries.l4d2Registry] }),

    // --- CS2 specific ---
    playerstv: new Gauge({ 
        name: "srcds_gotv_spectators", 
        help: "Sum of all GOTV spectators (all TV instances)", 
        registers: [registries.cs2Registry] 
    }),

    bot: new Gauge({ 
        name: "srcds_bot", 
        help: "Number of bots (excluding SourceTV bots)", 
        registers: [registries.cs2Registry] 
    }),

    // New recommended metrics:
    gotv_instances: new Gauge({
        name: "srcds_gotv_instances",
        help: "Number of active SourceTV instances",
        registers: [registries.cs2Registry]
    }),

    gotv_total_slots: new Gauge({
        name: "srcds_gotv_total_slots",
        help: "Sum of Total Slots across all GOTV instances",
        registers: [registries.cs2Registry]
    }),

    up_to_date: new Gauge({
        name: "srcds_up_to_date",
        help: "1 if the server is up to date according to Steam API, 0 otherwise",
        registers: [registries.cs2Registry]
    }),

    rcon_rtt: new Gauge({
        name: "srcds_rcon_rtt_ms",
        help: "Round-trip time of the RCON connection in milliseconds",
        registers: [registries.csgoRegistry, registries.cs2Registry, registries.gmodRegistry, registries.cssRegistry, registries.hl2Registry, registries.tf2Registry, registries.l4d2Registry]
    }),

    icmp_ping: new Gauge({
        name: "srcds_icmp_ping_ms",
        help: "ICMP ping latency to the server host in milliseconds, -1 if unreachable",
        registers: [registries.csgoRegistry, registries.cs2Registry, registries.gmodRegistry, registries.cssRegistry, registries.hl2Registry, registries.tf2Registry, registries.l4d2Registry]
    }),

};

module.exports = {
    registries,
    metrics,
}
