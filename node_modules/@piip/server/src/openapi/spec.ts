import fs from "fs";
import path from "path";
import YAML from "yaml";

// OpenAPI YAML 로드
const specPath = path.join(
  __dirname,
  "../../../..",
  "docs",
  "openapi",
  "openapi.yaml"
);
const raw = fs.readFileSync(specPath, "utf8");
export const openapi = YAML.parse(raw);

export type OpenAPISpec = typeof openapi;
