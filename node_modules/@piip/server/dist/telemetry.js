"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// OpenTelemetry SDK initialization for Node.js
require("dotenv/config");
const sdk_node_1 = require("@opentelemetry/sdk-node");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const disabled = !!process.env.OTEL_SDK_DISABLED;
if (disabled) {
    if (process.env.OTEL_DEBUG) {
        // eslint-disable-next-line no-console
        console.log("OpenTelemetry SDK disabled (OTEL_SDK_DISABLED set)");
    }
}
else {
    // Configure OTLP endpoint: use OTEL_EXPORTER_OTLP_TRACES_ENDPOINT or OTEL_EXPORTER_OTLP_ENDPOINT
    const otlpTracesEndpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
        (process.env.OTEL_EXPORTER_OTLP_ENDPOINT
            ? `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT.replace(/\/$/, "")}/v1/traces`
            : undefined);
    // Parse OTEL_EXPORTER_OTLP_HEADERS (format: key=value,key2=value2)
    const rawHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS;
    let parsedHeaders;
    if (rawHeaders) {
        parsedHeaders = Object.fromEntries(rawHeaders
            .split(/[,;]/) // allow comma or semicolon as separator
            .map((pair) => pair.trim())
            .filter(Boolean)
            .map((pair) => {
            const eqIdx = pair.indexOf("=");
            if (eqIdx === -1)
                return [pair.trim(), ""]; // header with empty value
            const k = pair.slice(0, eqIdx).trim();
            const v = pair.slice(eqIdx + 1).trim();
            return [k, v];
        }));
    }
    const exporter = new exporter_trace_otlp_http_1.OTLPTraceExporter(otlpTracesEndpoint
        ? {
            url: otlpTracesEndpoint,
            ...(parsedHeaders ? { headers: parsedHeaders } : {}),
        }
        : undefined);
    const serviceName = process.env.OTEL_SERVICE_NAME || "piip-server";
    const sdk = new sdk_node_1.NodeSDK({
        traceExporter: exporter,
        resource: new resources_1.Resource({
            [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: serviceName,
            [semantic_conventions_1.SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || "0.0.0",
            environment: process.env.NODE_ENV || "development",
        }),
        instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
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
