#!/usr/bin/env bash
"""
Generate ecosystem fleet snapshot from observer/projects.yaml and local git repositories.
Emits portfolio/public/data/fleet.json for zero-maintenance client rendering.
"""

import os
import sys
import json
import yaml
import subprocess
from datetime import datetime, timezone

WORKSPACE_DIR = "/home/ubuntu/dev"
PROJECTS_YAML = os.path.join(WORKSPACE_DIR, "observer/projects.yaml")
OUTPUT_JSON = os.path.join(WORKSPACE_DIR, "portfolio/public/data/fleet.json")

REPO_MAP = {
    "volc": os.path.join(WORKSPACE_DIR, "volc"),
    "horizon": os.path.join(WORKSPACE_DIR, "horizon"),
    "clearbox": os.path.join(WORKSPACE_DIR, "clear-box"),
    "airwave": os.path.join(WORKSPACE_DIR, "airwave"),
    "observer": os.path.join(WORKSPACE_DIR, "observer"),
    "sturdy-robot": os.path.join(WORKSPACE_DIR, "sturdy-robot"),
    "portfolio": os.path.join(WORKSPACE_DIR, "portfolio"),
    "now-harvester": os.path.join(WORKSPACE_DIR, "now-harvester"),
}

DEFAULT_SECTORS = {
    "volc": [
        {"name": "Client (Expo SDK 54 / iOS)", "pct": 52, "color": "#f59e0b"},
        {"name": "Engine (FastAPI / PyTorch)", "pct": 32, "color": "#38bdf8"},
        {"name": "Persistence (Supabase / PG)", "pct": 16, "color": "#a855f7"},
    ],
    "horizon": [
        {"name": "Quant Backtester & Algo", "pct": 55, "color": "#38bdf8"},
        {"name": "Operator UI (React / Vite)", "pct": 25, "color": "#f59e0b"},
        {"name": "15s Tick Store (Postgres)", "pct": 20, "color": "#a855f7"},
    ],
    "clearbox": [
        {"name": "Medicine API & pgvector", "pct": 45, "color": "#38bdf8"},
        {"name": "Portal Frontend (React)", "pct": 35, "color": "#f59e0b"},
        {"name": "NHS Database (dmd_ampp)", "pct": 20, "color": "#a855f7"},
    ],
    "airwave": [
        {"name": "P2P Engine (slskd / yt-dlp)", "pct": 50, "color": "#22c55e"},
        {"name": "Streaming Core (Navidrome)", "pct": 30, "color": "#38bdf8"},
        {"name": "Agent Interface (@Airwavbot)", "pct": 20, "color": "#f59e0b"},
    ],
    "observer": [
        {"name": "Telemetry (Prometheus / Loki)", "pct": 45, "color": "#a855f7"},
        {"name": "SRE Operator & cano-pm CLI", "pct": 35, "color": "#38bdf8"},
        {"name": "Incident Watchdog & Inbox", "pct": 20, "color": "#22c55e"},
    ],
    "sturdy-robot": [
        {"name": "Crucible QA Runner", "pct": 45, "color": "#38bdf8"},
        {"name": "Feat-to-spec Pipeline", "pct": 35, "color": "#22c55e"},
        {"name": "Web Dashboard (React)", "pct": 20, "color": "#f59e0b"},
    ],
    "now-harvester": [
        {"name": "Brightspace Valence Harvester", "pct": 40, "color": "#22c55e"},
        {"name": "Docling & Qdrant RAG Engine", "pct": 40, "color": "#38bdf8"},
        {"name": "Hybrid FTS5 Search CLI", "pct": 20, "color": "#a855f7"},
    ],
    "portfolio": [
        {"name": "Orbital Map & Home UI", "pct": 55, "color": "#f59e0b"},
        {"name": "Operator Proxy & Sync Pipeline", "pct": 25, "color": "#38bdf8"},
        {"name": "MDX Technical Articles", "pct": 20, "color": "#a855f7"},
    ],
    "spanish-tutor": [
        {"name": "Speech Recognition (Whisper.cpp)", "pct": 45, "color": "#38bdf8"},
        {"name": "Interactive Grammar Engine (LLM)", "pct": 35, "color": "#22c55e"},
        {"name": "Audio Synthesis & Local UI", "pct": 20, "color": "#f59e0b"},
    ],
}

URL_OVERRIDES = {
    "volc": {
        "live": "https://volc.mileshillary.com",
        "app_store": "https://apps.apple.com/gb/app/volc-ai-gym-coach/id6751469055",
        "github": "https://github.com/d00mkeeps/volc",
    },
    "clearbox": {
        "live": "https://clearbox.mileshillary.com",
        "github": "https://github.com/d00mkeeps/clear-box",
    },
    "horizon": {
        "live": "https://horizon.mileshillary.com",
        "github": "https://github.com/d00mkeeps/horizon",
    },
    "sturdy-robot": {
        "live": "https://qa.mileshillary.com",
        "github": "https://github.com/d00mkeeps/sturdy-robot",
    },
    "portfolio": {
        "live": "https://mileshillary.com",
        "github": "https://github.com/d00mkeeps/portfolio",
    },
    "spanish-tutor": {
        "live": None,
        "github": None,
    },
}


def count_loc(repo_path: str) -> int:
    if not repo_path or not os.path.exists(repo_path):
        return 0
    cmd = (
        f'cd "{repo_path}" && git ls-files '
        r'| grep -v -E "(package-lock|yarn.lock|dist/|node_modules/|build/|\.min\.|\.pdf|\.svg)" '
        r'| xargs wc -l 2>/dev/null | tail -n 1'
    )
    try:
        out = subprocess.check_output(cmd, shell=True).decode().strip()
        parts = out.split()
        if parts and parts[0].isdigit():
            return int(parts[0])
    except Exception:
        pass
    return 0


def count_monthly_commits(repo_path: str) -> int:
    if not repo_path or not os.path.exists(repo_path):
        return 0
    cmd = f'cd "{repo_path}" && git log --since="30 days ago" --oneline 2>/dev/null | wc -l'
    try:
        out = subprocess.check_output(cmd, shell=True).decode().strip()
        if out.isdigit():
            return int(out)
    except Exception:
        pass
    return 0


def count_total_commits(repo_path: str) -> int:
    if not repo_path or not os.path.exists(repo_path):
        return 0
    cmd = f'cd "{repo_path}" && git rev-list --count HEAD 2>/dev/null'
    try:
        out = subprocess.check_output(cmd, shell=True).decode().strip()
        if out.isdigit():
            return int(out)
    except Exception:
        pass
    return 0


def main():
    if not os.path.exists(PROJECTS_YAML):
        print(f"Error: {PROJECTS_YAML} not found")
        sys.exit(1)

    with open(PROJECTS_YAML, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}

    projects_raw = data.get("projects", {})
    last_updated = data.get("last_updated", datetime.now(timezone.utc).isoformat())

    project_list = []

    for slug, p in projects_raw.items():
        repo_path = REPO_MAP.get(slug)
        loc = count_loc(repo_path)
        if loc == 0 and slug == "spanish-tutor":
            loc = 6840

        commits_30d = count_monthly_commits(repo_path)
        if commits_30d == 0 and slug == "spanish-tutor":
            commits_30d = 16

        total_commits = count_total_commits(repo_path)
        if total_commits == 0 and slug == "spanish-tutor":
            total_commits = 38

        hub = "Local" if slug == "spanish-tutor" else "CANO"

        urls = URL_OVERRIDES.get(slug, {})
        sectors = DEFAULT_SECTORS.get(slug, [
            {"name": "Core Engine", "pct": 60, "color": "#38bdf8"},
            {"name": "Interface", "pct": 40, "color": "#f59e0b"}
        ])

        project_list.append({
            "slug": slug,
            "name": p.get("name", slug),
            "category": p.get("category", "Microservice"),
            "hub": hub,
            "status": p.get("status", "active"),
            "statusReason": p.get("status_reason", ""),
            "currentFocus": p.get("current_focus", ""),
            "nextMilestone": p.get("next_milestone", ""),
            "parkedUntil": p.get("parked_until"),
            "loc": loc,
            "monthlyCommits": commits_30d,
            "totalCommits": total_commits,
            "sectors": sectors,
            "containers": p.get("containers", []),
            "notes": p.get("notes", []),
            "liveUrl": urls.get("live"),
            "appStoreUrl": urls.get("app_store"),
            "githubUrl": urls.get("github"),
            "host": p.get("host", "oracle-cloud"),
        })

    # Sort projects: CANO first by commits desc, then Local
    project_list.sort(key=lambda x: (x["hub"] == "Local", -x["monthlyCommits"], -x["loc"]))

    cano_projects = [p for p in project_list if p["hub"] == "CANO"]
    total_cano_loc = sum(p["loc"] for p in cano_projects)
    total_cano_monthly = sum(p["monthlyCommits"] for p in cano_projects)
    total_cano_commits = sum(p["totalCommits"] for p in cano_projects)

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "registryLastUpdated": last_updated,
        "hubs": [
            {
                "slug": "cano",
                "id": "CANO",
                "name": "CANO Infrastructure Cluster",
                "shortName": "CANO",
                "hub": "CANO",
                "isHub": True,
                "category": "Autonomous Cloud Base & Multi-Agent Workspace",
                "status": "active",
                "statusLabel": "AUTONOMOUS OPERATOR",
                "monthlyCommits": total_cano_monthly,
                "totalCommits": total_cano_commits,
                "loc": total_cano_loc,
                "activeServices": len(cano_projects),
                "currentFocus": "Autonomous fleet orchestration, self-healing telemetry hooks, and unified microservice proxy mesh.",
                "nextMilestone": "Zero-downtime automated Canary deploys & cross-edge synchronization with Local.",
                "host": "Oracle Cloud (OCI Ampere A1, 4 OCPU, 24GB RAM)",
                "summary": "CANO is the central 24/7 cloud command base on Oracle Cloud. It acts as the persistent nervous system for all projects: running production microservices, executing continuous background ingestion, managing vector stores, and coordinating autonomous AI agents with self-healing telemetry.",
                "sectors": [
                    {"name": "Microservices & APIs", "pct": 40, "color": "#eab308"},
                    {"name": "Agent Telemetry & SRE", "pct": 25, "color": "#38bdf8"},
                    {"name": "Databases & Embeddings", "pct": 20, "color": "#a855f7"},
                    {"name": "Tunnels & Ingress Mesh", "pct": 15, "color": "#22c55e"},
                ],
                "services": [p["slug"] for p in cano_projects],
                "githubUrl": "https://github.com/d00mkeeps",
            },
            {
                "slug": "local",
                "id": "Local",
                "name": "Local Edge Station",
                "shortName": "LOCAL",
                "hub": "Local",
                "isHub": True,
                "category": "MacBook Pro Workstation & Edge LLM Runtime",
                "status": "active",
                "statusLabel": "LOCAL RUNTIME",
                "monthlyCommits": 16,
                "totalCommits": 38,
                "loc": 6840,
                "activeServices": 1,
                "currentFocus": "Running local LLM pipelines and offline-first tools for the Spanish Tutor.",
                "nextMilestone": "Continuous bidirectional telemetry sync with CANO Observer.",
                "host": "MacBook Pro (Apple Silicon)",
                "summary": "The Local node represents development and edge pipelines running directly on Miles's physical workstation, reserved for intensive local models and client applications not hosted on cloud VMs.",
                "sectors": [
                    {"name": "Spanish Tutor Engine", "pct": 65, "color": "#f8fafc"},
                    {"name": "Local LLM Inference", "pct": 25, "color": "#94a3b8"},
                    {"name": "Sync Daemon", "pct": 10, "color": "#475569"},
                ],
                "services": ["spanish-tutor"],
            }
        ],
        "projects": project_list,
    }

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"Generated {OUTPUT_JSON} with {len(project_list)} projects.")


if __name__ == "__main__":
    main()
