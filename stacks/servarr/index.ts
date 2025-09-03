import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import { servarrNetwork, proxyNetwork } from "../../network";

const config = new pulumi.Config();

const overseerrRemoteImage = new docker.RemoteImage("overseer", { name: "sctx/overseerr:latest"});
const overseerr = new docker.Container("overseerr", {
    image: overseerrRemoteImage.imageId,
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
	{label:"traefik.enable", value: "true"},
        {label: "traefik.http.routers.overseerr.rule", value: "Host(`overseer.goochem.dev`)"},
        {label: "traefik.http.routers.overseerr.tls", value: "true"},
        {label: "traefik.http.routers.overseerr.tls.certresolver", value: "cloudflare"},
        {label: "traefik.http.routers.overseerr.entrypoints", value: "websecure"},
    ],
    networksAdvanced: [
      { name: servarrNetwork.name, },
      { name: proxyNetwork.name, },
    ]
});

const plexRemoteImage = new docker.RemoteImage("plex", {name: "plexinc/pms-docker:latest"});
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
    networksAdvanced: [
      {
        name: servarrNetwork.name,
      },
    ],
});

const radarrRemoteImage = new docker.RemoteImage("radarr", {name: "ghcr.io/hotio/radarr:latest"});
const radarr1080p = new docker.Container("radarr-1080p", {
    image: radarrRemoteImage.imageId,
    name: "radarr1080p",
    restart: "unless-stopped",
    ports: [{ internal: 7878, external: 7878 }],
    envs: [
        "PUID=1001",
        "PGID=1001",
        "TZ=Europe/Amsterdam",
    ],
    volumes: [
        { hostPath: "/etc/localtime", containerPath: "/etc/localtime", readOnly: true},
        { hostPath: "/docker/appdata/radarr", containerPath: "/config" },
        { hostPath: "/data", containerPath: "/data" },
    ],
    networksAdvanced: [
      {
        name: servarrNetwork.name,
      },
    ],

});

const radarr4k = new docker.Container("radarr-4k", {
    image: radarrRemoteImage.imageId,
    name: "radarr4k",
    restart: "unless-stopped",
    ports: [{ internal: 7878, external: 7880 }],
    envs: [
        "PUID=1001",
        "PGID=1001",
        "TZ=Europe/Amsterdam",
    ],
    volumes: [
        { hostPath: "/etc/localtime", containerPath: "/etc/localtime", readOnly: true},
        { hostPath: "/docker/appdata/radarr-4k", containerPath: "/config" },
        { hostPath: "/data", containerPath: "/data" },
    ],
	networksAdvanced: [
		{
        name: servarrNetwork.name,
		}
	],
});

const sonarrRemoteImage = new docker.RemoteImage("sonarr", {name: "ghcr.io/hotio/sonarr:latest"});
const sonarr1080p = new docker.Container("sonarr-1080p", {
    image: sonarrRemoteImage.imageId,
    name: "sonarr1080p",
    restart: "unless-stopped",
    ports: [{ internal: 8989, external: 8989 }],
    envs: [
        "PUID=1001",
        "PGID=1001",
        "TZ=Europe/Amsterdam",
    ],
    volumes: [
        { hostPath: "/etc/localtime", containerPath: "/etc/localtime", readOnly: true},
        { hostPath: "/docker/appdata/sonarr", containerPath: "/config" },
        { hostPath: "/data", containerPath: "/data" },
    ],
    networksAdvanced: [
      {
        name: servarrNetwork.name,
      },
    ],
});

const sonarr4k = new docker.Container("sonarr-4k", {
    image: sonarrRemoteImage.imageId,
    name: "sonarr4k",
    restart: "unless-stopped",
    ports: [{ internal: 8989, external: 8990 }],
    envs: [
        "PUID=1001",
        "PGID=1001",
        "TZ=Europe/Amsterdam",
    ],
    volumes: [
        { hostPath: "/etc/localtime", containerPath: "/etc/localtime", readOnly: true},
        { hostPath: "/docker/appdata/sonarr-4k", containerPath: "/config" },
        { hostPath: "/data", containerPath: "/data" },
    ],
    labels: [
    ],
    networksAdvanced: [
      {
        name: servarrNetwork.name,
      },
    ],
});


const prowlarrRemoteImage = new docker.RemoteImage("prowlarr", {name: "ghcr.io/hotio/prowlarr:latest"});
const prowlarr = new docker.Container("prowlarr", {
    image: prowlarrRemoteImage.imageId,
    name: "prowlarr",
    restart: "unless-stopped",
    ports: [{ internal: 9696, external: 9696 }],
    envs: [
        "PUID=1001",
        "PGID=1001",
        "TZ=Europe/Amsterdam",
    ],
    volumes: [
        { hostPath: "/docker/appdata/prowlarr", containerPath: "/config"},
    ],
    networksAdvanced: [
      {
        name: servarrNetwork.name,
      },
    ],
});

const qBittorrentRemoteImage = new docker.RemoteImage("qbittorrent", {name: "ghcr.io/hotio/qbittorrent:latest"});
const qbittorrent = new docker.Container("qbittorrent", {
    image: qBittorrentRemoteImage.imageId,
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
        { hostPath: "/data", containerPath: "/data"},
        { hostPath: "/docker/appdata/qbittorent", containerPath: "/config"},
    ],
    networksAdvanced: [
      {
        name: servarrNetwork.name,
      },
    ],
});

const sabnzbdRemoteImage = new docker.RemoteImage("sabnzbd", {name: "ghcr.io/hotio/sabnzbd:latest"});
const sabnzbd1080p = new docker.Container("sabnzbd-1080p", {
    image: sabnzbdRemoteImage.imageId,
    name: "sabnzbd1080p",
    restart: "unless-stopped",
    ports: [{ internal: 8080, external: 8888 }],
    envs: [
        "PUID=1001",
        "PGID=1001",
        "TZ=Europe/Amsterdam",
    ],
    volumes: [
        { hostPath: "/etc/localtime", containerPath: "/etc/localtime", readOnly: true},
        { hostPath: "/docker/appdata/sabnzbd", containerPath: "/config"},
        { hostPath: "/data/usenet", containerPath: "/data/usenet"},
    ],
    networksAdvanced: [
      {
        name: servarrNetwork.name,
      },
    ],
});

const sabnzbd4k = new docker.Container("sabnzbd-4k", {
    image: sabnzbdRemoteImage.imageId,
    name: "sabnzbd4k",
    restart: "unless-stopped",
    ports: [{ internal: 8080, external: 8889 }],
    envs: [
        "PUID=1001",
        "PGID=1001",
        "TZ=Europe/Amsterdam",
    ],
    volumes: [
        { hostPath: "/etc/localtime", containerPath: "/etc/localtime", readOnly: true},
        { hostPath: "/docker/appdata/sabnzbd-4k", containerPath: "/config"},
        { hostPath: "/data/usenet", containerPath: "/data/usenet"},
    ],
    networksAdvanced: [
      {
        name: servarrNetwork.name,
      },
    ],
});

const homepage = new docker.Container("homepage", {
  image: "ghcr.io/gethomepage/homepage:latest",
  name: "homepage",
  restart: "unless-stopped",
  ports: [{ internal: 3000, external: 3000 }],
  volumes: [
	  { hostPath: "/docker/appdata/homepage", containerPath: "/app/config" },
  ],
    labels: [
	{label:"traefik.enable", value: "true"},
        {label: "traefik.http.routers.homepage.rule", value: "Host(`goochem.dev`)"},
        {label: "traefik.http.routers.homepage.tls", value: "true"},
        {label: "traefik.http.routers.homepage.tls.certresolver", value: "cloudflare"},
        {label: "traefik.http.routers.homepage.entrypoints", value: "websecure"},
    ],
    networksAdvanced: [
      { name: servarrNetwork.name, },
      { name: proxyNetwork.name, },
    ],
  });

