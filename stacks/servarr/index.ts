import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import { servarrNetwork, proxyNetwork } from "../../network";

const config = new pulumi.Config("servarr");

const overseerrImage = new docker.RemoteImage("overseerr", {
  name: `sctx/overseerr:${config.require("overseerrImageTag")}`,
});

const overseerr = new docker.Container("overseerr", {
  image: overseerrImage.imageId,
  name: "overseerr",
  restart: "unless-stopped",
  ports: [{ internal: 5055, external: 5055 }],
  envs: [
    "LOG_LEVEL=debug",
    "TZ=Europe/Amsterdam",
    "PORT=5055",
  ],
  volumes: [
    { hostPath: "/docker/appdata/overseerr", containerPath: "/app/config" },
  ],
  labels: [
    { label: "traefik.enable", value: "true" },
    { label: "traefik.http.routers.overseerr.rule", value: "Host(`overseer.goochem.dev`)" },
    { label: "traefik.http.routers.overseerr.tls", value: "true" },
    { label: "traefik.http.routers.overseerr.tls.certresolver", value: "cloudflare" },
    { label: "traefik.http.routers.overseerr.entrypoints", value: "websecure" },
    { label: "homepage.group", value: "Media" },
    { label: "homepage.name", value: "Overseerr" },
    { label: "homepage.icon", value: "overseerr.png" },
    { label: "homepage.href", value: "https://overseer.goochem.dev" },
    { label: "homepage.description", value: "Media Requests" },
  ],
  networkMode: "bridge",
  networksAdvanced: [
    { name: servarrNetwork.name, },
    { name: proxyNetwork.name, },
  ]
});

const jellyseerrImage = new docker.RemoteImage("jellyseerr", {
  name: `ghcr.io/fallenbagel/jellyseerr:${config.require("jellyseerrImageTag")}`,
});
const jellyseerr = new docker.Container("jellyseerr", {
  image: jellyseerrImage.imageId,
  name: "jellyseerr",
  init: true,
  restart: "unless-stopped",
  envs: [
    "LOG_LEVEL=debug",
    "TZ=Europe/Amsterdam",
  ],
  ports: [
    { internal: 5055, external: 5056 },
  ],
  volumes: [
    { hostPath: "/docker/appdata/jellyseerr", containerPath: "/app/config" },
  ],
  labels: [
    { label: "traefik.enable", value: "true" },
    { label: "traefik.http.routers.jellyseerr.rule", value: "Host(`jellyseerr.goochem.dev`)" },
    { label: "traefik.http.routers.jellyseerr.tls", value: "true" },
    { label: "traefik.http.routers.jellyseerr.tls.certresolver", value: "cloudflare" },
    { label: "traefik.http.routers.jellyseerr.entrypoints", value: "websecure" },
  ],

  networkMode: "bridge",
  networksAdvanced: [
    { name: servarrNetwork.name, },
    { name: proxyNetwork.name, },
  ],
});

const plexRemoteImage = new docker.RemoteImage("plex", { name: "plexinc/pms-docker:latest" });
const plex = new docker.Container("plex", {
  image: plexRemoteImage.imageId,
  name: "plex",
  restart: "unless-stopped",
  ports: [{ internal: 32400, external: 32400 }],
  envs: [
    "PLEX_CLAIM=claim-iYktyHEZWzAHFiRD5hks",
    "PLEX_UID=1001",
    "PLEX_GID=1001",
  ],
  volumes: [
    { hostPath: "/plex/database", containerPath: "/config" },
    { hostPath: "/plex/transcode", containerPath: "/transcode" },
    { hostPath: "/data", containerPath: "/data" },
  ],
  networkMode: "bridge",
  networksAdvanced: [
    {
      name: servarrNetwork.name,
    },
  ],
  labels: [
    { label: "homepage.group", value: "Media" },
    { label: "homepage.name", value: "Plex Server" },
    { label: "homepage.icon", value: "plex.png" },
    { label: "homepage.href", value: "http://192.168.178.147:32400" },
    { label: "homepage.description", value: "Media Server" },
  ],
});

const radarrImage = new docker.RemoteImage("radarr", {
  name: `ghcr.io/hotio/radarr:${config.require("radarrImageTag")}`,
});
const radarr1080p = new docker.Container("radarr-1080p", {
  image: radarrImage.imageId,
  name: "radarr1080p",
  restart: "unless-stopped",
  ports: [{ internal: 7878, external: 7878 }],
  envs: [
    "PUID=1001",
    "PGID=1001",
    "TZ=Europe/Amsterdam",
  ],
  volumes: [
    { hostPath: "/etc/localtime", containerPath: "/etc/localtime", readOnly: true },
    { hostPath: "/docker/appdata/radarr", containerPath: "/config" },
    { hostPath: "/data", containerPath: "/data" },
  ],
  networkMode: "bridge",
  networksAdvanced: [
    {
      name: servarrNetwork.name,
    },
  ],
  labels: [
    { label: "homepage.group", value: "Media Management" },
    { label: "homepage.name", value: "Movies" },
    { label: "homepage.icon", value: "radarr.png" },
    { label: "homepage.href", value: "http://192.168.178.147:7878" },
    { label: "homepage.description", value: "Movies" },
  ],

});

const radarr4k = new docker.Container("radarr-4k", {
  image: radarrImage.imageId,
  name: "radarr4k",
  restart: "unless-stopped",
  ports: [{ internal: 7878, external: 7880 }],
  envs: [
    "PUID=1001",
    "PGID=1001",
    "TZ=Europe/Amsterdam",
  ],
  volumes: [
    { hostPath: "/etc/localtime", containerPath: "/etc/localtime", readOnly: true },
    { hostPath: "/docker/appdata/radarr-4k", containerPath: "/config" },
    { hostPath: "/data", containerPath: "/data" },
  ],
  networkMode: "bridge",
  networksAdvanced: [
    {
      name: servarrNetwork.name,
    }
  ],
  labels: [
    { label: "homepage.group", value: "Media Management" },
    { label: "homepage.name", value: "Radarr 4k" },
    { label: "homepage.icon", value: "radarr.png" },
    { label: "homepage.href", value: "http://192.168.178.147:7880" },
    { label: "homepage.description", value: "Movies 4k" },
  ],
});

const sonarrImage = new docker.RemoteImage("sonarr", {
  name: `ghcr.io/hotio/sonarr:${config.require("sonarrImageTag")}`,
});
const sonarr1080p = new docker.Container("sonarr-1080p", {
  image: sonarrImage.imageId,
  name: "sonarr1080p",
  restart: "unless-stopped",
  ports: [{ internal: 8989, external: 8989 }],
  envs: [
    "PUID=1001",
    "PGID=1001",
    "TZ=Europe/Amsterdam",
  ],
  labels: [
    { label: "homepage.group", value: "Media Management" },
    { label: "homepage.name", value: "Sonarr 1080p" },
    { label: "homepage.icon", value: "sonarr.png" },
    { label: "homepage.href", value: "http://192.168.178.147:8989/" },
    { label: "homepage.description", value: "TV Shows" },
  ],
  volumes: [
    { hostPath: "/etc/localtime", containerPath: "/etc/localtime", readOnly: true },
    { hostPath: "/docker/appdata/sonarr", containerPath: "/config" },
    { hostPath: "/data", containerPath: "/data" },
  ],
  networkMode: "bridge",
  networksAdvanced: [
    {
      name: servarrNetwork.name,
    },
  ],
});

const sonarr4k = new docker.Container("sonarr-4k", {
  image: sonarrImage.imageId,
  name: "sonarr4k",
  restart: "unless-stopped",
  ports: [{ internal: 8989, external: 8990 }],
  envs: [
    "PUID=1001",
    "PGID=1001",
    "TZ=Europe/Amsterdam",
  ],
  volumes: [
    { hostPath: "/etc/localtime", containerPath: "/etc/localtime", readOnly: true },
    { hostPath: "/docker/appdata/sonarr-4k", containerPath: "/config" },
    { hostPath: "/data", containerPath: "/data" },
  ],
  labels: [
    { label: "homepage.group", value: "Media Management" },
    { label: "homepage.name", value: "Sonarr 4K" },
    { label: "homepage.icon", value: "sonarr.png" },
    { label: "homepage.href", value: "http://192.168.178.147:8990/" },
    { label: "homepage.description", value: "TV Shows 4k" },
  ],
  networkMode: "bridge",
  networksAdvanced: [
    {
      name: servarrNetwork.name,
    },
  ],
});


const prowlarrImage = new docker.RemoteImage("prowlarr", {
  name: `ghcr.io/hotio/prowlarr:${config.require("prowlarrImageTag")}`,
});
const prowlarr = new docker.Container("prowlarr", {
  image: prowlarrImage.imageId,
  name: "prowlarr",
  restart: "unless-stopped",
  ports: [{ internal: 9696, external: 9696 }],
  envs: [
    "PUID=1001",
    "PGID=1001",
    "TZ=Europe/Amsterdam",
  ],
  volumes: [
    { hostPath: "/docker/appdata/prowlarr", containerPath: "/config" },
  ],
  networkMode: "bridge",
  networksAdvanced: [
    {
      name: servarrNetwork.name,
    },
  ],
  labels: [
    { label: "homepage.group", value: "File Management" },
    { label: "homepage.name", value: "Prowlarr" },
    { label: "homepage.icon", value: "prowlarr.png" },
    { label: "homepage.href", value: "http://192.168.178.147:9696" },
    { label: "homepage.description", value: "Indexers" },
    { label: "homepage.widget.type", value: "prowlarr" },
    { label: "homepage.widget.url", value: "http://192.168.178.147:9696" },
    { label: "homepage.widget.key", value: "94426d1a1fba4401b3be3cf4a263b9d2" },
  ],
});

const qbittorrentImage = new docker.RemoteImage("qbittorrent", {
  name: `ghcr.io/hotio/qbittorrent:${config.require("qbittorrentImageTag")}`,
});
const qbittorrent = new docker.Container("qbittorrent", {
  image: qbittorrentImage.imageId,
  name: "qbittorrent",
  restart: "unless-stopped",
  ports: [{ internal: 8181, external: 8181 }],
  envs: [
    "PUID=1001",
    "PGID=1001",
    "UMASK=002",
    "WEBUI_PORTS=8181/tcp,8181/udp",
    "TZ=Europe/Amsterdam",
  ],
  volumes: [
    { hostPath: "/data", containerPath: "/data" },
    { hostPath: "/docker/appdata/qbittorent", containerPath: "/config" },
  ],
  networkMode: "bridge",
  networksAdvanced: [
    {
      name: servarrNetwork.name,
    },
  ],
  labels: [
    { label: "homepage.group", value: "File Management" },
    { label: "homepage.name", value: "qBittorrent" },
    { label: "homepage.icon", value: "qbittorrent.png" },
    { label: "homepage.href", value: "http://192.168.178.147:8181" },
    { label: "homepage.description", value: "Torrents Downloader" },
    { label: "homepage.widget.type", value: "qbittorrent" },
    { label: "homepage.widget.url", value: "http://192.168.178.147:8181" },
    { label: "homepage.widget.username", value: "admin" },
    { label: "homepage.widget.password", value: "adminadmin" },
  ],
});

const sabnzbdImage = new docker.RemoteImage("sabnzbd", {
  name: `ghcr.io/hotio/sabnzbd:${config.require("sabnzbdImageTag")}`,
});
const sabnzbd1080p = new docker.Container("sabnzbd-1080p", {
  image: sabnzbdImage.imageId,
  name: "sabnzbd1080p",
  restart: "unless-stopped",
  ports: [{ internal: 8080, external: 8888 }],
  envs: [
    "PUID=1001",
    "PGID=1001",
    "TZ=Europe/Amsterdam",
  ],
  volumes: [
    { hostPath: "/etc/localtime", containerPath: "/etc/localtime", readOnly: true },
    { hostPath: "/docker/appdata/sabnzbd", containerPath: "/config" },
    { hostPath: "/data/usenet", containerPath: "/data/usenet" },
  ],
  networkMode: "bridge",
  networksAdvanced: [
    {
      name: servarrNetwork.name,
    },
  ],
  labels: [
    { label: "homepage.group", value: "File Management" },
    { label: "homepage.name", value: "Sabnzbd" },
    { label: "homepage.icon", value: "sabnzbd.png" },
    { label: "homepage.href", value: "http://192.168.178.147:8888" },
    { label: "homepage.description", value: "Usenet Downloader" },
    { label: "homepage.widget.type", value: "sabnzbd" },
    { label: "homepage.widget.url", value: "http://192.168.178.147:8888" },
    { label: "homepage.widget.key", value: "ea6b65be8884429881f2e911b48146d8" },
  ],
});

const sabnzbd4k = new docker.Container("sabnzbd-4k", {
  image: sabnzbdImage.imageId,
  name: "sabnzbd4k",
  restart: "unless-stopped",
  ports: [{ internal: 8080, external: 8889 }],
  envs: [
    "PUID=1001",
    "PGID=1001",
    "TZ=Europe/Amsterdam",
  ],
  volumes: [
    { hostPath: "/etc/localtime", containerPath: "/etc/localtime", readOnly: true },
    { hostPath: "/docker/appdata/sabnzbd-4k", containerPath: "/config" },
    { hostPath: "/data/usenet", containerPath: "/data/usenet" },
  ],
  networkMode: "bridge",
  networksAdvanced: [
    {
      name: servarrNetwork.name,
    },
  ],
  labels: [
    { label: "homepage.group", value: "File Management" },
    { label: "homepage.name", value: "Sabnzbd 4k" },
    { label: "homepage.icon", value: "sabnzbd.png" },
    { label: "homepage.href", value: "http://192.168.178.147:8889" },
    { label: "homepage.description", value: "Usenet Downloader" },
    { label: "homepage.widget.type", value: "sabnzbd" },
    { label: "homepage.widget.url", value: "http://192.168.178.147:8889" },
    { label: "homepage.widget.key", value: "226e04409d0c41f990913f85cf2ae32f" },
  ],
});

const bazarrImage = new docker.RemoteImage("bazarr", {
  name: `ghcr.io/hotio/bazarr:${config.require("bazarrImageTag")}`,
});
const bazarr = new docker.Container("bazarr", {
  image: bazarrImage.imageId,
  name: "bazarr",
  restart: "unless-stopped",
  ports: [{ internal: 6767, external: 6767 }],
  envs: [
    "PUID=1001",
    "PGID=1001",
    "UMASK=002",
    "TZ=Europe/Amsterdam",
    "WEBUI_PORTS=6767/tcp,6767/udp",
  ],
  volumes: [
    // move config to /docker/appdata or docker volume
    { hostPath: "/home/goochemerd/infrastructure/infra/stacks/servarr/config", containerPath: "/config" },
    { hostPath: "/data", containerPath: "/data" },
  ],
  networkMode: "bridge",
  networksAdvanced: [
    { name: servarrNetwork.name },
    { name: proxyNetwork.name }
  ]
})

const homepageImage = new docker.RemoteImage("homepage", {
  name: `ghcr.io/gethomepage/homepage:${config.require("homepageImageTag")}`,
});
const homepage = new docker.Container("homepage", {
  image: homepageImage.imageId,
  name: "homepage",
  restart: "unless-stopped",
  volumes: [
    { hostPath: "/docker/appdata/homepage", containerPath: "/app/config" },
    { hostPath: "/var/run/docker.sock", containerPath: "/var/run/docker.sock" },
  ],
  envs: [
    "HOMEPAGE_ALLOWED_HOSTS=goochem.dev"
  ],
  labels: [
    { label: "traefik.enable", value: "true" },
    { label: "traefik.http.routers.homepage.rule", value: "Host(`goochem.dev`)" },
    { label: "traefik.http.routers.homepage.tls", value: "true" },
    { label: "traefik.http.routers.homepage.tls.certresolver", value: "cloudflare" },
    { label: "traefik.http.routers.homepage.entrypoints", value: "websecure" },
  ],
  networkMode: "bridge",
  networksAdvanced: [
    { name: servarrNetwork.name, },
    { name: proxyNetwork.name, },
  ],
});

const flareSolverrImage = new docker.RemoteImage("flaresolverr", {
  name: `ghcr.io/flaresolverr/flaresolverr:${config.require("flareSolverrImageTag")}`,
});

const flareSolverr = new docker.Container("flaresolverr", {
	image: flareSolverrImage.imageId,
	name: "flaresolverr",
	restart: "unless-stopped",
	envs: [
	  `LOG_LEVEL=${config.get("logLevel") ?? "info"}`,
	  `LOG_FILE=${config.get("logFile") ?? "none"}`,
	  `LOG_HTML=${config.get("logHtml") ?? "false"}`,
	  `CAPTCHA_SOLVER=${config.get("captchaSolver") ?? "none"}`,
	  "TZ=Europe/Amsterdam" 
	],
	ports: [{ internal: 8191, external: 8191}],
	volumes: [ { hostPath: "/var/lib/flaresolver", containerPath: "/config" } ],
	networkMode: "bridge",
	networksAdvanced: [
	{ name: servarrNetwork.name, },
	],
})





