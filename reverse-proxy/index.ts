import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import { proxyNetwork } from "../network";

const config = new pulumi.Config();

const traefikRemoteImage = new docker.RemoteImage("traefik", { name: "traefik:v3.0" });
const traefik = new docker.Container("traefik", {
  image: traefikRemoteImage.imageId,
  name: "traefik",
  restart: "unless-stopped",
  envs: [
    `CF_DNS_API_TOKEN=${config.requireSecret("CF_DNS_API_TOKEN")}`,
  ],
  ports: [
    { internal: 80, external: 80 },
    { internal: 443, external: 443 },
  ],
  volumes: [
    { hostPath: "/var/run/docker.sock", containerPath: "/var/run/docker.sock", readOnly: true },
    { hostPath: "/docker/appdata/traefik/traefik.yaml", containerPath: "/etc/traefik/traefik.yaml", readOnly: true },
    { hostPath: "/var/traefik/certs/cloudflare-acme.json", containerPath: "/var/traefik/certs/", readOnly: false },
  ],
  networkMode: "bridge",
  networksAdvanced: [
    {
      name: proxyNetwork.name,
    },
  ],
});

