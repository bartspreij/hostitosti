import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import { sharedNetwork } from "../../network";

// Replace with actual environment variables
const PORT = process.env.PORT || "3000";
const UID = process.env.UID || "1000";
const GID = process.env.GID || "1000";
const RAG_PORT = process.env.RAG_PORT || "8000";

// MongoDB
const mongoVolume = new docker.Volume("chat-mongodb-volume");

const mongoDB = new docker.Container("chat-mongodb", {
    image: "mongo",
    restart: "always",
    user: `${UID}:${GID}`,
    volumes: [
        { hostPath: mongoVolume.name, containerPath: "/data/db" },
    ],
    command: ["mongod", "--noauth"],
    networksAdvanced: [{ name: sharedNetwork.name }],
});

// MeiliSearch
const meiliVolume = new docker.Volume("chat-meilisearch-volume");

const meiliSearch = new docker.Container("chat-meilisearch", {
    image: "getmeili/meilisearch:v1.7.3",
    restart: "always",
    user: `${UID}:${GID}`,
    envs: [
        "MEILI_HOST=http://meilisearch:7700",
        "MEILI_NO_ANALYTICS=true",
    ],
    volumes: [
        { hostPath: meiliVolume.name, containerPath: "/meili_data" },
    ],
    networksAdvanced: [{ name: sharedNetwork.name }],
});

// VectorDB
const vectorDbVolume = new docker.Volume("vectordb-volume");

const vectorDB = new docker.Container("vectordb", {
    image: "ankane/pgvector:latest",
    restart: "always",
    envs: [
        "POSTGRES_DB=mydatabase",
        "POSTGRES_USER=myuser",
        "POSTGRES_PASSWORD=mypassword",
    ],
    volumes: [
        { hostPath: vectorDbVolume.name, containerPath: "/var/lib/postgresql/data" },
    ],
    networksAdvanced: [{ name: sharedNetwork.name }],
});

// RAG API
const ragApi = new docker.Container("rag-api", {
    image: "ghcr.io/danny-avila/librechat-rag-api-dev-lite:latest",
    restart: "always",
    envs: [
        "DB_HOST=vectordb",
        "RAG_PORT=RAG_PORT",
    ],
    networksAdvanced: [{ name: sharedNetwork.name }],
});

// LibreChat API
const libreChatApi = new docker.Container("librechat-api", {
    image: "ghcr.io/danny-avila/librechat-dev:latest",
    restart: "always",
    user: `${UID}:${GID}`,
    envs: [
        "HOST=0.0.0.0",
        "MONGO_URI=mongodb://chat-mongodb:27017/LibreChat",
        "MEILI_HOST=http://chat-meilisearch:7700",
        "RAG_PORT=RAG_PORT",
        "RAG_API_URL=`http://rag-api:${RAG_PORT}`",
    ],
    ports: [
        {
            internal: parseInt(PORT),
            external: parseInt(PORT),
        },
    ],
    extraHosts: [
        { host: "host.docker.internal", ip: "host-gateway" },
    ],
    volumes: [
        { type: "bind", hostPath: "./.env", containerPath: "/app/.env" },
        { type: "bind", hostPath: "./images", containerPath: "/app/client/public/images" },
        { type: "bind", hostPath: "./logs", containerPath: "/app/api/logs" },
    ],
    networksAdvanced: [{ name: sharedNetwork.name }],
});

// Export services
export const libreChatUrl = pulumi.interpolate`http://${sharedNetwork.name}:${PORT}`;

