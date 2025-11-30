# Metrics Labeling and Dashboard Best Practices

## Route label standardization

- Use normalized route patterns (e.g., `/cases/:id`) rather than raw URLs to control cardinality.
- Combine `baseUrl + route.path` where possible; default to `unknown` if not available.

## Cardinality control

- Avoid including user IDs, request IDs, or timestamps in labels.
- Keep label sets small and stable; prefer separate metrics over high-cardinality labels.

## Histograms

- Use tuned buckets to reflect typical latencies (e.g., 5ms, 10ms, 25ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s).
- Prefer histograms for request latency; counters for request totals and errors.

## Error classification

- Add status code labels for totals, but consider bucketing (2xx, 4xx, 5xx) for dashboards.

## Dashboards

- SLO panel: p95/p99 request latency per route and method.
- Error rate: 5xx rate and 4xx spikes by route.
- Traffic: requests per second.
- Saturation: CPU/memory of the pod/VM alongside request latency.

## Alerting

- Burn-rate alerts for SLOs (multi-window, multi-burn).
- Sudden increase in 5xx error rate and latency.

## Security

- Expose `/metrics` internally only (e.g., `METRICS_EXPOSE=internal`) and scrape from a sidecar or internal network.
