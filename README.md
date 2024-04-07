# CS2 Support
**Request some file edit at all game update : `game/csgo_core/gameinfo.gi`  `DefensiveConCommands` to 0**

# SRCDS Prometheus exporter
### The goal of this project is to provide a simple way to get metrics from various Source dedicated servers and expose them in Grafana.
<p align="center">
    <img src="./images/csgo.png" height="80">
    <img src="./images/css.png" height="80">
    <img src="./images/gmod.png" height="80">
    <img src="./images/hl2.png" height="80">
    <img src="./images/l4d2.png" height="80">
    <img src="./images/tf2.png" height="80">
</p>

## How to install

### Method 1 : With docker
`docker run -d -p <external port>:9591 --name srcds_exporter --restart=always ghcr.io/french-csgo/srcds_exporter`

### Method 2 : Download sources and run

You need to have NodeJS installed if you want to run the sources, NVM (Node Version Manager) is a simple tool to get it running : https://github.com/nvm-sh/nvm

1. Download the repo (using git clone or direct zip download)
2. Enter the srcds_exporter directory and run `npm i`, this will install all required dependencies
3. Start the script with node : `node index.js`, you can create a service or run it in a screen to keep it active in background

By default, the exporter runs on port 9591, it's possible to customize this by setting the HTTP_PORT variable to the desired port.

## Configure the game's server

1. Make sure to configure a rcon password

2. Add `-usercon` to your srcds start parameters, otherwise rcon connection cannot be done from "outside" of the game/server's console, resulting in the exporter showing 0 for all metrics

## Configure Prometheus

Add the following configuration to Prometheus static configuration :

```
- job_name: 'srcds'
    static_configs:
      - targets: ["<ip>:<port>:<rconpassword>:<game>"]


    relabel_configs:
      - source_labels: [__address__]
        regex: "(.+):.+:.+:.+"
        replacement: "$1"
        target_label: __param_ip
      - source_labels: [__address__]
        regex: ".+:(.+):.+:.+"
        replacement: "$1"
        target_label: __param_port
      - source_labels: [__address__]
        regex: ".+:.+:(.+):.+"
        replacement: "$1"
        target_label: __param_password
      - source_labels: [__address__]
        regex: ".+:.+:.+:(.+)"
        replacement: "$1"
        target_label: __param_game
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: <IP>:<port> # Real exporter's IP:Port
```

Values for `game` field :

| Game   |      Value      |
|:----------:|:-------------:|
| Counter Strike: Global Offensive |  csgo |
| Counter Strike 2 | cs2 |
| Counter Strike: Source |    css   |
| Garry's Mod |    gmod   |
| Half Life 2 DM |    hl2   |
| Left 4 Dead 2 |    l4d2   |
| Team Fortress 2 |    tf2   |

## How to access

If you want to see what the exporter returns, you can access :

 `http://<ip>:9591/metrics?ip=<srcds ip>&port=<srcds port>&password=<rcon password>&game=<game>`

## Grafana dashboards

Grafana dashboards are being revamped and should be available soon!

### Support

If you encounter any issue, feel free to open an issue.
