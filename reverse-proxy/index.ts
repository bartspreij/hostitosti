import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import { sharedNetwork } from "../network";
 
const config = new pulumi.Config();

const traefik = new docker.Container("traefik", {
    image: "traefik:v3.0",
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
            { hostPath: "/var/run/docker.sock", containerPath: "/var/run/docker.sock"},
            { hostPath: "/docker/appdata/traefik/traefik.yaml", containerPath: "/etc/traefik/traefik.yaml", readOnly: true },
            { hostPath: "/data/certs", containerPath: "/var/traefik/certs/", readOnly: false },
    ],
    networksAdvanced: [
      {
        name: sharedNetwork.name,
      },
    ],
});

