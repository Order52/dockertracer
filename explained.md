# Dockertracer Lite - Project Execution Flow

This document explains the architecture and execution flow of the project, tracing what happens from the moment you start the application to how it serves requests, interacts with the frontend, and talks to the database.

## Quick Execution Flow Diagram

Here is a high-level visual representation of how a request moves through the system, starting from when the server is launched, to the user opening the UI, to the frontend communicating with the backend APIs:

```text
[Terminal: `python main.py`]
       │
       ▼
 [main.py] (Checks Port 8000 & Starts Uvicorn Server)
       │
       ▼
 [app/main.py] (FastAPI App Creation & DB Init)
       │
       ▼ (Server is Running)
[User Opens Browser: http://localhost:8000/ui]
       │
       ▼ (HTTP GET /ui)
[Backend: FastAPI Routes - topology.py] 
       │
       ▼ (Returns HTML)
[Frontend: frontend/index.html + CSS + Vanilla JS]
       │
       ▼ (Browser Loads JS: app.js)
[Frontend JS: Fetches Data via HTTP GET /api/topology/data]
       │
       ▼ (HTTP API Request)
[Backend: FastAPI Router -> topology.py]
       │
       ▼ (Dependency Injection for DB & Services)
[app/api/dependencies.py] (Injects DB Session -> Repository -> Service)
       │
       ▼ (Business Logic)
[app/services/topology_service.py] 
       │
       ├────────────────────────────────────────┐
       ▼ (Reads Live Data)                      ▼ (Reads Saved Data via DB)
[Local Docker Daemon]                    [app/repositories/container.py]
       │                                        │
       ▼ (Docker Info)                          ▼ (Queries SQLite)
       │                                 [dockertracer.db]
       │                                        │
       └────────────────┬───────────────────────┘
                        ▼
       (Merges Data into JSON format)
                        │
                        ▼
   [Backend Returns JSON to Frontend app.js]
                        │
                        ▼
   [Frontend JS Renders Graph using vis-network]
```

## 1. Entry Point: `main.py`
When you execute `python main.py`, the following happens:
1. **Port Check**: The script checks if port `8000` is currently in use.
2. **Conflict Resolution**: If the port is busy, it prompts you in the terminal to either automatically find a new open port (e.g., 8001), kill the process currently using the port, or exit.
3. **Server Startup**: Once a free port is secured, it launches the Uvicorn ASGI server programmatically, pointing to the FastAPI application located at `app.main:app`.

## 2. Application Initialization: `app/main.py`
Uvicorn loads the FastAPI instance from `app/main.py`. During this initialization phase:
1. **Database Setup**: It calls `Base.metadata.create_all(bind=engine)`, which connects to the SQLite database (using settings from `app/core/database.py` and `app/core/config.py`) and creates all the tables defined in the SQLAlchemy models if they don't already exist.
2. **FastAPI App Creation**: The `FastAPI` application instance is instantiated.
3. **Static Files**: It mounts the `frontend` directory to the `/static` URL path so that CSS and JS files can be served directly to the browser.
4. **Root Redirect**: It defines a route for `/` that immediately redirects users to `/ui`.
5. **Router Inclusion**: It includes the main API router (`api_router`) which brings in all the routes defined in the `app/api/routes` directory.

## 3. Frontend Layer (`frontend/`)
When the user visits `/ui`, the backend serves `frontend/index.html`. This project does **not** use React; it uses standard Vanilla JavaScript and HTML. 
1. **HTML & CSS**: `index.html` sets up the basic layout and includes a stylesheet (`style.css`).
2. **Library Loading**: It loads the `vis-network` JavaScript library via a CDN, which is used to draw the interactive topology graph.
3. **Application Logic (`app.js`)**: The browser executes `frontend/js/app.js`. This script acts as the "client-side application". It makes an asynchronous HTTP `fetch()` request back to the server at `/api/topology/data`. Once the data is received, it dynamically uses the `vis-network` library to render the network nodes and edges on the screen.

## 4. Routing Layer (`app/api/routes/`)
The routing layer receives incoming HTTP requests and delegates them to the appropriate functions. The `__init__.py` file aggregates the routers:
- **Topology Routes (`topology.py`)**:
  - `GET /ui`: Serves the `frontend/index.html` file as an HTML response. This is the main user interface.
  - `GET /api/topology/data`: An API endpoint that fetches the network topology data (used by the frontend to render the UI).
- **Container Routes (`containers.py`)**:
  - `POST /containers`: An API endpoint to manually register a new container in the database.

## 5. Dependency Injection (`app/api/dependencies.py`)
FastAPI uses dependency injection to provide components to the route handlers. For example, when `/api/topology/data` is called, it depends on `TopologyService`. The dependency system:
1. Creates a database session (`get_db`).
2. Injects the session into a `ContainerRepository`.
3. Injects the repository into the required Service (`TopologyService` or `ContainerService`).

## 6. Business Logic Layer / Services (`app/services/`)
This is where the core logic lives. The route handlers call these services to do the actual work.
- **`TopologyService.get_topology_map()`**:
  1. It connects to the host machine's Docker daemon using the `docker` Python SDK to fetch a list of all currently running ("Live") containers and their network/port mappings.
  2. It then uses the `ContainerRepository` to fetch any manually added containers ("DB") from the SQLite database.
  3. It merges both data sources into a structured dictionary grouped by Docker networks, which is returned as JSON to the frontend.
- **`ContainerService.add_container()`**:
  - Handles the logic for adding a new manual container. It validates that a container with the same name doesn't already exist and cleans up the input before asking the repository to save it.

## 7. Data Access Layer (`app/repositories/` & `app/models/`)
To keep database logic separated from business logic, the repository pattern is used.
- **`ContainerRepository` (`app/repositories/container.py`)**:
  - Encapsulates all SQLAlchemy database operations (like `get_all`, `get_by_name`, and `create`). Services don't write SQL or SQLAlchemy queries directly; they call methods on this repository.
- **`ContainerNode` Model (`app/models/container.py`)**:
  - Defines the database schema using SQLAlchemy's declarative base. It maps the `ContainerNode` Python class to the `containers` table, defining columns like `id`, `name`, `network`, `ip_address`, and `port`, along with constraints.

## Summary Flow Example: Rendering the UI
From beginning to end, here is exactly what happens when a user views the topology map:
1. **User Request**: The user navigates to `http://localhost:8000/ui` in their browser.
2. **UI Served**: The backend Router (`topology.py`) receives the HTTP GET request and returns `frontend/index.html`.
3. **Frontend Execution**: The browser loads the HTML, CSS, and executes `app.js`.
4. **API Call**: `app.js` makes an HTTP request to the backend API (`GET /api/topology/data`).
5. **Backend Processing**:
   - The FastAPI Router intercepts the request.
   - `dependencies.py` spins up a DB session, creates a `ContainerRepository`, and passes it to `TopologyService`.
   - `TopologyService` queries the Docker daemon for live containers, queries the DB for manual containers, and merges the data.
6. **JSON Response**: The backend sends the merged data back as JSON to the frontend `app.js`.
7. **Graph Rendering**: The frontend JavaScript (`app.js`) parses the JSON and feeds it into the `vis-network` library, rendering the visual, interactive network graph on the screen.

---

### Brief Linear Flow Summary

1. **HTTP Request** `->` (Triggered from Browser)
2. **API Routing** `->` (`app/api/routes/topology.py`)
3. **Topology Service** `->` (`app/services/topology_service.py`)
4. **Docker & Database** `->` (Docker Daemon & `app/repositories/container.py` querying `dockertracer.db`)
5. **JSON Response** `->` (Sent back from API)
6. **Frontend Render** `->` (`frontend/js/app.js` renders into `frontend/index.html`)
