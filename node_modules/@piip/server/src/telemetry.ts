// OpenTelemetry SDK initialization for Node.js
import "dotenv/config";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const disabled = !!process.env.OTEL_SDK_DISABLED;
if (disabled) {
  if (process.env.OTEL_DEBUG) {
    // eslint-disable-next-line no-console
    console.log("OpenTelemetry SDK disabled (OTEL_SDK_DISABLED set)");
  }
} else {
  // Configure OTLP endpoint: use OTEL_EXPORTER_OTLP_TRACES_ENDPOINT or OTEL_EXPORTER_OTLP_ENDPOINT
  const otlpTracesEndpoint =
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
    (process.env.OTEL_EXPORTER_OTLP_ENDPOINT
      ? `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT.replace(/\/$/, "")}/v1/traces`
      : undefined);

  // Parse OTEL_EXPORTER_OTLP_HEADERS (format: key=value,key2=value2)
  const rawHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS;
  let parsedHeaders: Record<string, string> | undefined;
  if (rawHeaders) {
    parsedHeaders = Object.fromEntries(
      rawHeaders
        .split(/[,;]/) // allow comma or semicolon as separator
        .map((pair) => pair.trim())
        .filter(Boolean)
        .map((pair) => {
          const eqIdx = pair.indexOf("=");
          if (eqIdx === -1) return [pair.trim(), ""]; // header with empty value
          const k = pair.slice(0, eqIdx).trim();
          const v = pair.slice(eqIdx + 1).trim();
          return [k, v];
        })
    );
  }

  const exporter = new OTLPTraceExporter(
    otlpTracesEndpoint
      ? {
          url: otlpTracesEndpoint,
          ...(parsedHeaders ? { headers: parsedHeaders } : {}),
        }
      : undefined
  );

  const serviceName = process.env.OTEL_SERVICE_NAME || "piip-server";

  const sdk = new NodeSDK({
    traceExporter: exporter,
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]:
        process.env.npm_package_version || "0.0.0",
      environment: process.env.NODE_ENV || "development",
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  // Start SDK immediately
  Promise.resolve(sdk.start())
    .then(() => {
      if (process.env.OTEL_DEBUG) {
        // eslint-disable-next-line no-console
        console.log("OpenTelemetry SDK started");
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Error starting OpenTelemetry SDK", err);
    });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => {
        // eslint-disable-next-line no-console
        console.log("OpenTelemetry SDK shutdown complete");
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Error shutting down OpenTelemetry SDK", err);
      })
      .finally(() => process.exit(0));
  });
}
