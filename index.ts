import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const config = new pulumi.Config();

const webNetwork = new docker.Network("webNetwork", {
    driver: "bridge",
});

const internalNetwork = new docker.Network("internalNetwork", {
    driver: "bridge",
});

const overseerr = new docker.Container("overseerr", {
    image: "sctx/overseerr:latest",
    name: "overseer",
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
    networksAdvanced: [{ name: webNetwork.name }],
    labels: [
	{label:"traefik.enable", value: "true"},
        {label: "traefik.http.routers.overseerr-https.rule", value: "Host(\`overseer.goochem.dev\`)"},
        {label: "traefik.http.routers.overseerr-https.tls", value: "true"},
        {label: "traefik.http.routers.overseerr-https.certresolver", value: "cloudflare"},
        {label: "traefik.http.routers.overseerr-https.entrypoints", value: "websecure"},
    { label: "homepage.group", value: "Media" },
    { label: "homepage.name", value: "Overseerr" },
    { label: "homepage.icon", value: "overseerr.png" },
    { label: "homepage.href", value: "http://192.168.178.147:5055" },
    { label: "homepage.description", value: "Manage your movie and TV show requests" },
    ],
});

const librechat = new docker.Container("librechat", {
    image: "ghcr.io/danny-avila/librechat-dev:latest",
    name: "librechat",
    restart: "unless-stopped",
    ports: [{ internal: 3080, external: 3080 }],
    networksAdvanced: [{ name: webNetwork.name }],
    labels: [
	{label:"traefik.enable", value: "true"},
        {label: "traefik.http.routers.librechat-https.rule", value: "Host(\`chat.goochem.dev\`)"},
        {label: "traefik.http.routers.librechat-https.tls", value: "true"},
        {label: "traefik.http.routers.librechat-https.certresolver", value: "cloudflare"},
        {label: "traefik.http.routers.librechat-https.entrypoints", value: "websecure"},
        { label: "homepage.group", value: "Communication" },
        { label: "homepage.name", value: "LibreChat" },
        { label: "homepage.icon", value: "librechat.png" },
        { label: "homepage.href", value: "http://chat.goochem.dev" },
        { label: "homepage.description", value: "AI chat powered by LibreChat" },
    ],
});

const plex = new docker.Container("plex", {
    image: "plexinc/pms-docker:latest",
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
    labels: [
    { label: "homepage.group", value: "Media" },
    { label: "homepage.name", value: "Plex" },
    { label: "homepage.icon", value: "plex.png" },
    { label: "homepage.href", value: "http://192.168.178.147:32400" }, 
    { label: "homepage.description", value: "Media server for movies and TV" },
],

    networksAdvanced: [{ name: internalNetwork.name }],
});

const radarr1080p = new docker.Container("radarr-1080p", {
    image: "cr.hotio.dev/hotio/radarr:latest",
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
    labels: [
    { label: "homepage.group", value: "Automation" },
    { label: "homepage.name", value: "Radarr 1080p" },
    { label: "homepage.icon", value: "radarr.png" },
    { label: "homepage.href", value: "http://192.168.178.147:7878" }, 
    { label: "homepage.description", value: "TV show automation for 1080p quality" },
],
    networksAdvanced: [{ name: internalNetwork.name }],
});

const radarr4k = new docker.Container("radarr-4k", {
    image: "cr.hotio.dev/hotio/radarr:latest",
    restart: "unless-stopped",
    ports: [{ internal: 7879, external: 7879 }],
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
    labels: [
    { label: "homepage.group", value: "Automation" },
    { label: "homepage.name", value: "Radar 4K" },
    { label: "homepage.icon", value: "sonarr.png" },
    { label: "homepage.href", value: "http://192.168.178.147:7879" },
    { label: "homepage.description", value: "Movie automation for 4K quality" },
    ],
    networksAdvanced: [{ name: internalNetwork.name }],
});

const sonarr1080p = new docker.Container("sonarr-1080p", {
    image: "cr.hotio.dev/hotio/sonarr:latest",
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
    labels: [
    { label: "homepage.group", value: "Automation" },
    { label: "homepage.name", value: "Sonarr 1080p" },
    { label: "homepage.icon", value: "sonarr.png" },
    { label: "homepage.href", value: "http://192.168.178.147:8989" },
    { label: "homepage.description", value: "TV shows automation for HD quality" },
    ],
    networksAdvanced: [{ name: internalNetwork.name }],
});

const sonarr4k = new docker.Container("sonarr-4k", {
    image: "cr.hotio.dev/hotio/sonarr:latest",
    restart: "unless-stopped",
    ports: [{ internal: 8990, external: 8990 }],
    envs: [
        "PUID=1001",
        "PGID=1001",
        "TZ=Europe/Amsterdam",
    ],
    volumes: [
        { hostPath: "/etc/localtime", containerPath: "/etc/localtime", readOnly: true},
        { hostPath: "/docker/appdata/heimdall", containerPath: "/config" },
    ],
    labels: [
    { label: "homepage.group", value: "Automation" },
    { label: "homepage.name", value: "Sonarr 4K" },
    { label: "homepage.icon", value: "sonarr.png" },
    { label: "homepage.href", value: "http://192.168.178.147:8990" }, // Use internal IP address
    { label: "homepage.description", value: "TV show automation for 4K quality" },
    ],
    networksAdvanced: [{ name: internalNetwork.name }],
});
 
// This allows automatic discovery, makes it possible for docker containers to know about other containers running and use that information
const dockerproxy = new docker.Container("dockerproxy", {
  image: "ghcr.io/tecnativa/docker-socket-proxy:latest",
  restart: "unless-stopped",
  name: "dockerproxy",
  envs: [
	  "CONTAINERS=1",
	  "SERVICES=1",
	  "TASKS=1", 
	  "POST=0",
  ],
  ports: [{
	  ip: "127.0.0.1",
	  internal:2375,
	  external:2375,
  }],
  volumes: [
	  { hostPath: "/var/run/docker.sock", containerPath: "/var/run/docker.sock", readOnly: true },
  ],
});
 
const homepage = new docker.Container("homepage", {
  image: "ghcr.io/gethomepage/homepage:latest",
  name: "homepage",
  restart: "unless-stopped",
  ports: [{ internal: 3000, external: 3000 }],
  volumes: [
	  { hostPath: "/docker/appdata/homepage", containerPath: "/app/config" },
	  { hostPath: "/var/run/docker.sock", containerPath: "/var/run/docker.sock", readOnly: true },
  ],
    labels: [
	{label:"traefik.enable", value: "true"},
        {label: "traefik.http.routers.homepage-https.rule", value: "Host(\`goochem.dev\`)"},
        {label: "traefik.http.routers.homepage-https.tls", value: "true"},
        {label: "traefik.http.routers.homepage-https.certresolver", value: "cloudflare"},
        {label: "traefik.http.routers.homepage-https.entrypoints", value: "websecure"},
    ],
  });

const traefik = new docker.Container("traefik", {
    image: "traefik:v3.0",
    restart: "unless-stopped",
    envs: [
	`CF_DNS_API_TOKEN=${config.requireSecret("CF_DNS_API_TOKEN")}`,
    ],
    ports: [
        { internal: 80, external: 80 },
        { internal: 443, external: 443 },
        { internal: 8080, external: 8080 },
    ],
    volumes: [
	    { hostPath: "/var/run/docker.sock", containerPath: "/var/run/docker.sock"},
	    { hostPath: "/docker/appdata/traefik/traefik.yaml", containerPath: "/etc/traefik/traefik.yaml/", readOnly: true },
	    { hostPath: "/data/certs", containerPath: "/var/traefik/certs/", readOnly: false },
    ],
    networksAdvanced: [
        { name: webNetwork.name },
        { name: internalNetwork.name },  
    ],
});

