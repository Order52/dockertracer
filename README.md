# DockerTracer Betaaaa 🐳

**DockerLens Lite** is a lightweight, interactive container and network topology like Packet Tracer but with Docker tool built with **FastAPI**, **SQLAlchemy**, and **vis-network.js**. It provides an interactive network graph mapping Docker containers, their assigned IP addresses, connected Docker networks, and exposed host ports.

---

## 📌 Project Overview

DockerLens Lite combines data from two sources:
1. **Live Docker Daemon**: Automatically queries currently running Docker containers, inspecting their network settings, IP addresses, and exposed port mappings using the Docker SDK for Python.
2. **Database Registry (SQLite)**: Stores manually registered container definitions and configurations via REST API.

The backend compiles these sources into a consolidated network topology map and serves an interactive web-based physics graph where users can explore, drag, zoom, and search containers.

---

## 🏗️ Architecture & Design Pattern

The backend follows a clean **Layered Architecture** adhering to Separation of Concerns and Dependency Injection principles:

```
[ Frontend (HTML / CSS / Vis.js) ]
                │  HTTP (REST / UI)
                ▼
[ API Routes Layer (`app/api/routes`) ]
                │  FastAPI Depends
                ▼
[ Service Layer (`app/services`) ]
       │                         │
       ▼                         ▼
[ Docker Daemon SDK ]    [ Repository Layer (`app/repositories`) ]
                                 │
                                 ▼
                         [ SQLite Database (`app/models`) ]
```

- **Routes (`app/api/routes`)**: Handles HTTP request parsing, status codes, and delegates business logic to services.
- **Services (`app/services`)**: Orchestrates Docker daemon discovery, database container aggregation, and validation.
- **Repositories (`app/repositories`)**: Encapsulates database queries (CRUD) using SQLAlchemy ORM.
- **Schemas (`app/schemas`)**: Pydantic models for data validation, serialization, and OpenAPI documentation.
- **Models (`app/models`)**: Database schema definitions with constraints and indexes.
- **Core (`app/core`)**: Database connection lifecycles and configuration management.
- **Frontend (`frontend`)**: Single-page visualization using Vis Network for dynamic physics-based graph rendering.

---

## 📂 File Structure

Below is the detailed breakdown of all directories and files in the repository:

```
project-train/
│
├── app/                                # Main application package
│   ├── __init__.py                     # Package marker
│   ├── main.py                         # FastAPI instance, static mount, and route aggregation
│   │
│   ├── api/                            # API presentation layer
│   │   ├── __init__.py                 # Package marker
│   │   ├── dependencies.py             # Dependency injection providers for repos & services
│   │   └── routes/                     # API route handlers
│   │       ├── __init__.py             # Unified API router aggregation
│   │       ├── containers.py           # Endpoints for container registration (POST /containers)
│   │       └── topology.py             # Endpoints for topology JSON data and UI serving
│   │
│   ├── core/                           # Application core & infrastructure
│   │   ├── __init__.py                 # Package marker
│   │   ├── config.py                   # Environment settings and configuration defaults
│   │   └── database.py                 # SQLAlchemy engine, session maker, and DB dependency
│   │
│   ├── models/                         # Database ORM models
│   │   ├── __init__.py                 # Package marker
│   │   └── container.py                # `ContainerNode` SQLAlchemy model for stored containers
│   │
│   ├── repositories/                   # Data access layer
│   │   ├── __init__.py                 # Package marker
│   │   └── container.py                # `ContainerRepository` for database queries
│   │
│   ├── schemas/                        # Pydantic schemas (DTOs)
│   │   ├── __init__.py                 # Package marker
│   │   ├── container.py                # Schemas for container creation and API responses
│   │   └── topology.py                 # Schemas for network topology graph payload
│   │
│   └── services/                       # Business logic layer
│       ├── __init__.py                 # Package marker
│       ├── container_service.py        # Logic for container validation and DB persistence
│       └── topology_service.py         # Merges live Docker daemon containers & DB containers
│
├── frontend/                           # UI Assets and visualization
│   ├── index.html                      # Single-page interface with canvas & search input
│   ├── css/
│   │   └── style.css                   # Dark theme styling and layout definitions
│   └── js/
│       └── app.js                      # Vis.js graph builder, node/edge parser, search & shortcuts
│
├── tests/                              # Unit and integration test suite
│   ├── __init__.py                     # Package marker
│   ├── test_containers.py              # Tests for container registration endpoints
│   ├── test_repository.py              # Tests for container database repository
│   └── test_topology.py                # Tests for topology calculation and output
│
├── .env.example                        # Example environment variables template
├── .gitignore                          # Git ignore rules
├── dockerlens.db                       # Local SQLite database file
├── main.py                             # Project entrypoint with port checking & auto-restart
├── pyproject.toml                      # Project build and package metadata
├── requirements.txt                    # Project Python dependencies
└── README.md                           # Comprehensive project documentation
```

---

## ⚙️ Core Components Explained

### 1. Application Entrypoint (`main.py` vs `app/main.py`)
- **[`main.py`](file:///Users/alithebig/Documents/Swibit/project-train/main.py)**: The operational entrypoint script. It checks if port `8000` is already in use by another process, prompts the user to terminate the conflicting process if desired, and launches the Uvicorn server with hot reload enabled.
- **[`app/main.py`](file:///Users/alithebig/Documents/Swibit/project-train/app/main.py)**: Initializes the FastAPI app, ensures database tables are created via `Base.metadata.create_all()`, mounts `/static` to the `frontend/` directory, and registers API routers.

### 2. Live Docker & Database Aggregation (`app/services/topology_service.py`)
- **[`TopologyService`](file:///Users/alithebig/Documents/Swibit/project-train/app/services/topology_service.py)** connects to the local Docker daemon using `docker.from_env()`.
- Iterates over active Docker containers, reading their IP address, attached networks (e.g., `bridge`, custom networks), and exposed host port mappings.
- Fetches static/manual container entries from the SQLite database.
- Builds a unified dictionary indexed by network name:
  ```json
  {
    "bridge": [
      {
        "name": "web_nginx (Live)",
        "ip": "172.17.0.2",
        "port": "8080->80/tcp"
      }
    ],
    "custom-net": [
      {
        "name": "db_postgres (DB)",
        "ip": "172.20.0.3",
        "port": 5432
      }
    ]
  }
  ```

### 3. Frontend Visualization (`frontend/js/app.js`)
- Fetches data from `/api/topology/data`.
- Dynamically creates nodes for:
  - **Host Node** (representing the host machine).
  - **Network Clouds** (for each Docker network).
  - **Container Nodes** (displaying container name, assigned IP, and port).
- Creates edges connecting each container to its corresponding network cloud, as well as dashed edges from the Host machine for exposed ports.
- Provides physics-based repulsion clustering and interactive **Search (with `Ctrl+F` / `Cmd+F` shortcut)** that auto-focuses on matching container nodes.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Docker (optional, for live container detection)

### 2. Installation
```bash
# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic docker
```

### 3. Running the Application
```bash
python main.py
```

Open your browser and navigate to:
- **Interactive UI**: [http://localhost:8000/ui](http://localhost:8000/ui)
- **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Topology JSON API**: [http://localhost:8000/api/topology/data](http://localhost:8000/api/topology/data)

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Redirects to `/ui` |
| `GET` | `/ui` | Serves the interactive Vis.js topology web page |
| `GET` | `/api/topology/data` | Returns JSON mapping of networks and containers |
| `POST` | `/containers` | Registers a new container in the database |

### Example: Register a container via API
```bash
curl -X POST "http://localhost:8000/containers" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "payment-api",
       "network": "backend-net",
       "ip_address": "172.28.0.5",
       "port": 8080
     }'
```
