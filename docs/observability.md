# Observability Guide (Tracing & Metrics)

This document explains how to enable and verify OpenTelemetry tracing and Prometheus metrics for the PIIP server.

## 1) Environment variables

Set these in `packages/server/.env` or environment:

- OTEL_SERVICE_NAME: Service name (default: piip-server)
- OTEL_EXPORTER_OTLP_ENDPOINT: Base url of OTLP HTTP collector (e.g. <http://localhost:4318>)
- OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: Full traces endpoint; overrides the base if set
- OTEL_EXPORTER_OTLP_HEADERS: Comma or semicolon separated headers: `key=value,key2=value2`
- OTEL_DEBUG: Any value to print SDK start/shutdown logs
- METRICS_EXPOSE: `all` (default) or `internal` to limit /metrics to localhost

## 2) Local collector (optional)

Docker Compose example:

```yaml
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    command: ["--config=/etc/otel-collector-config.yaml"]
    ports:
      - "4318:4318" # OTLP HTTP
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml:ro
```

Minimal `otel-collector-config.yaml`:

```yaml
receivers:
  otlp:
    protocols:
      http:
exporters:
  logging: {}
processors:
  batch: {}
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging]
```

## 3) Verify tracing

1. Start server with OTEL endpoint set.
2. Execute a few API requests (e.g. login, create case).
3. Check collector logs for incoming spans.

## 4) Metrics

- Endpoint: `GET /metrics`
- Security: Set `METRICS_EXPOSE=internal` to restrict to localhost.
- Includes request counters and histograms with standardized route labels.

## 5) Troubleshooting

- No spans? Ensure the endpoint is reachable and not blocked by CORS/firewall.
- Headers: If the backend requires auth, set `OTEL_EXPORTER_OTLP_HEADERS="authorization=Bearer <token>"`.
- To disable OTel quickly, unset OTEL env vars or set `OTEL_SDK_DISABLED=true`.
