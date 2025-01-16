import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

export const sharedNetwork = new docker.Network("hostitosti", {
	name: "hostitosti",
});
