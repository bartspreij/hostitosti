import * as docker from "@pulumi/docker";

export const servarrNetwork = new docker.Network("hostitosti", {
	name: "servarr",
});

export const proxyNetwork = new docker.Network("proxy_network", {
	name: "proxy_network",
});
