"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutesFromOpenAPI = registerRoutesFromOpenAPI;
const spec_1 = require("./spec");
const HTTP_METHODS = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "options",
    "head",
];
function toExpressPath(openApiPath) {
    // /cases/{caseId} -> /cases/:caseId
    return openApiPath.replace(/\{([^}]+)\}/g, ":$1");
}
function registerRoutesFromOpenAPI(app, opts) {
    const skipAuthFor = opts?.skipAuthFor ?? [/^\/auth\/login$/];
    const paths = spec_1.openapi.paths || {};
    for (const [pathKey, pathItem] of Object.entries(paths)) {
        const expressPath = toExpressPath(pathKey);
        for (const method of HTTP_METHODS) {
            const operation = pathItem[method];
            if (!operation)
                continue;
            app[method](expressPath, (_req, res) => {
                res.status(501).json({
                    message: "Not Implemented",
                    method: method.toUpperCase(),
                    path: pathKey,
                    operationId: operation.operationId || null,
                    summary: operation.summary || null,
                });
            });
        }
    }
    // 편의: 루트에 간단한 인덱스
    app.get("/", (_req, res) => {
        res.json({
            name: spec_1.openapi?.info?.title || "PIIP API",
            version: spec_1.openapi?.info?.version || "0.0.0",
            docs: "/docs",
            openapi: "/openapi.json",
            health: "/healthz",
        });
    });
    // 인증을 건너뛰는 경로 목록 노출(디버그)
    app.get("/_skip-auth", (_req, res) => res.json({ skipAuthFor: skipAuthFor.map((r) => r.toString()) }));
}
