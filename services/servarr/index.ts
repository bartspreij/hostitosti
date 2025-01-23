import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import { sharedNetwork } from "../../network";

const config = new pulumi.Config();

// LOGS
const dozzle = new docker.Container("dozzle", {
    image: "amir20/dozzle:latest",
    name: "dozzle",
    restart: "unless-stopped",
    ports: [{ internal: 8080, external: 7070 }],
    volumes: [
        { hostPath: "/var/run/docker.sock", containerPath: "/var/run/docker.sock" },
    ],
    networksAdvanced: [
      {
        name: sharedNetwork.name,
      },
    ],
});

const overseerr = new docker.Container("overseerr", {
    image: "sctx/overseerr:latest",
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
      {
        name: sharedNetwork.name,
      },
    ],
});

//const librechat = new docker.Container("librechat", {
   // image: "ghcr.io/danny-avila/librechat-dev:latest",
   // name: "librechat",
   // restart: "unless-stopped",
   // ports: [{ internal: 3080, external: 3080 }],
   // labels: [
//	{label:"traefik.enable", value: "true"},
 //       {label: "traefik.http.routers.librechat.rule", value: "Host(`chat.goochem.dev`)"},
  //      {label: "traefik.http.routers.librechat.tls", value: "true"},
   //     {label: "traefik.http.routers.librechat.tls.certresolver", value: "cloudflare"},
    //    {label: "traefik.http.routers.librechat.entrypoints", value: "websecure"},
  //  ],
   // networksAdvanced: [
    //  {
     //   name: sharedNetwork.name,
    //  },
   // ],
//});

const plex = new docker.Container("plex", {
    image: "plexinc/pms-docker:latest",
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
        name: sharedNetwork.name,
      },
    ],
});

const radarr1080p = new docker.Container("radarr-1080p", {
    image: "ghcr.io/hotio/radarr:latest",
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
        name: sharedNetwork.name,
      },
    ],

});

const radarr4k = new docker.Container("radarr-4k", {
    image: "ghcr.io/hotio/radarr:latest",
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
        name: sharedNetwork.name,
		}
	],
});

const sonarr1080p = new docker.Container("sonarr-1080p", {
    image: "ghcr.io/hotio/sonarr:latest",
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
        name: sharedNetwork.name,
      },
    ],
});

const sonarr4k = new docker.Container("sonarr-4k", {
    image: "ghcr.io/hotio/sonarr:latest",
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
        name: sharedNetwork.name,
      },
    ],
});

const prowlarr = new docker.Container("prowlarr", {
    image: "ghcr.io/hotio/prowlarr:latest",
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
        name: sharedNetwork.name,
      },
    ],
});

const qbittorent = new docker.Container("qbittorent", {
    image: "ghcr.io/hotio/qbittorrent",
    name: "qbittorent",
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
        name: sharedNetwork.name,
      },
    ],
});

const sabnzbd1080p = new docker.Container("sabnzbd-1080p", {
    image: "ghcr.io/hotio/sabnzbd:latest",
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
        name: sharedNetwork.name,
      },
    ],
});

const sabnzbd4k = new docker.Container("sabnzbd-4k", {
    image: "ghcr.io/hotio/sabnzbd:latest",
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
        name: sharedNetwork.name,
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
      {
        name: sharedNetwork.name,
      },
    ],
  });

