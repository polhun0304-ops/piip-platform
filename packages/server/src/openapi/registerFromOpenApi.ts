import { Application, Request, Response } from "express";
import { openapi } from "./spec";

const HTTP_METHODS = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
] as const;

type HttpMethod = (typeof HTTP_METHODS)[number];

function toExpressPath(openApiPath: string) {
  // /cases/{caseId} -> /cases/:caseId
  return openApiPath.replace(/\{([^}]+)\}/g, ":$1");
}

export function registerRoutesFromOpenAPI(
  app: Application,
  opts?: { skipAuthFor?: RegExp[] }
) {
  const skipAuthFor = opts?.skipAuthFor ?? [/^\/auth\/login$/];

  const paths = openapi.paths || {};
  for (const [pathKey, pathItem] of Object.entries(paths)) {
    const expressPath = toExpressPath(pathKey);
    for (const method of HTTP_METHODS) {
      const operation: any = (pathItem as any)[method];
      if (!operation) continue;

      app[method](expressPath, (_req: Request, res: Response) => {
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
      name: openapi?.info?.title || "PIIP API",
      version: openapi?.info?.version || "0.0.0",
      docs: "/docs",
      openapi: "/openapi.json",
      health: "/healthz",
    });
  });

  // 인증을 건너뛰는 경로 목록 노출(디버그)
  app.get("/_skip-auth", (_req, res) =>
    res.json({ skipAuthFor: skipAuthFor.map((r) => r.toString()) })
  );
}
