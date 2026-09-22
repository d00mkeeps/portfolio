# Miles Hillary Portfolio Architecture & Topology

> *Auto-generated on every push via GitHub Actions. Do not edit manually.*  
> **Last Generated:** 2026-09-22 11:33:42 UTC

## Service Mesh Overview

```mermaid
graph TD
    subgraph Volcano_Host["Volcano Server (Docker Mesh)"]
        portfolio["<b>miles-portfolio</b><br/>Ports: 3002:80, traefik.enable=false"]
        observability["<b>observability</b><br/>Internal only"]
        crucible-net["<b>crucible-net</b><br/>Internal only"]
    end

    External[Client / Ingress] --> Volcano_Host
```

---

## Container Specifications

| Container Name | Service Name | Mapped Ports | Volumes | Memory Limit |
| :--- | :--- | :--- | :--- | :--- |
| `miles-portfolio` | `portfolio` | `3002:80, traefik.enable=false` | `"3002:80"` | `unlimited` |
| `observability` | `observability` | `None` | `None` | `unlimited` |
| `crucible-net` | `crucible-net` | `None` | `None` | `unlimited` |
