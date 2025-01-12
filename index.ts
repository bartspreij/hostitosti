import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

// Configuration variables
const config = new pulumi.Config();
const domainOverseerr = "overseer.goochem.dev";
const domainLibreChat = "chat.goochem.dev";
const cloudflareEmail = config.require("cloudflareEmail");
const cloudflareApiKey = config.require("cloudflareApiKey");

// Create a Docker network for the services
const webNetwork = new docker.Network("web", {
    name: "web",
    driver: "bridge",
});

// CONTAINERS
const traefik = new docker.Container("traefik", {
    image: "traefik:v3.0",
    restart: "unless-stopped",
    ports: [
        { internal: 80, external: 80 },
        { internal: 443, external: 443 },
    ],
    networksAdvanced: [{ name: webNetwork.name }],
    volumes: [
        { hostPath: "/var/run/docker.sock", containerPath: "/var/run/docker.sock" },
    ],
    envs: [
        `CF_API_EMAIL=${cloudflareEmail}`,
        `CF_API_KEY=${cloudflareApiKey}`,
    ],
});

const overseerr = new docker.Container("overseerr", {
    image: "sctx/overseerr:latest",
    restart: "unless-stopped",
    networksAdvanced: [{ name: webNetwork.name }],
    ports: [{ internal: 5055, external: 5055}],
    envs: [
        "LOG_LEVEL=debug",
        "TZ=Europe/Amsterdam",
    ],
    volumes: [
        { hostPath: "/docker/appdata/overseerr", containerPath: "/app/config" },
    ],
    labels: [
    { label: "traefik.enable", value: "true" },
    { label: "traefik.http.routers.overseerr.rule", value: `Host(\`${domainOverseerr}\`)` },
    { label: "traefik.http.routers.overseerr.entrypoints", value: "websecure" },
    { label: "traefik.http.routers.overseerr.tls.certresolver", value: "cloudflare" }
	]

});

const librechat = new docker.Container("librechat", {
    image: "ghcr.io/danny-avila/librechat-dev:latest",
    restart: "unless-stopped",
    networksAdvanced: [{ name: webNetwork.name }],
    ports: [{ internal: 3080, external: 3080 }],
    labels: [
    { label: "traefik.enable", value: "true" },
    { label: "traefik.http.routers.overseerr.rule", value: `Host(\`${domainLibreChat}\`)` },
    { label: "traefik.http.routers.overseerr.entrypoints", value: "websecure" },
    { label: "traefik.http.routers.overseerr.tls.certresolver", value: "cloudflare" }
]

});

export const traefikContainerId = traefik.id;
export const overseerrContainerId = overseerr.id;
export const librechatContainerId = librechat.id;



