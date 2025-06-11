# VLEI Explorer

VLEI Explorer is a web-based application for visualizing and executing vLEI (verifiable Legal Entity Identifier) workflows. It provides an interactive interface to create, manage, and monitor vLEI credentials and their relationships in the GLEIF ecosystem.

## Features

- Interactive visualization of vLEI workflows
- Real-time workflow execution monitoring
- Support for both single-signature and multi-signature operations
- Integration with KERI (Key Event Receipt Infrastructure)
- Support for various credential types (QVI, LE, ECR)
- ESM module system for modern JavaScript compatibility

## Prerequisites

Before running VLEI Explorer, ensure you have the following dependencies installed:

1. Node.js (v18 or higher)
2. Docker and Docker Compose

And following services to be running:
1. KERIA (KERI Agent)
2. vLEI server(https://github.com/WebOfTrust/vLEI (version 0.2.0))
3. vLEI Verifier(https://github.com/GLEIF-IT/vlei-verifier (version 1.1.0))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/vlei-explorer.git
cd vlei-explorer
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

## Setting up Dependencies

The project includes a `docker-compose.yaml` file that sets up all required services:

- KERIA (KERI Agent) - ports 3901-3903
- vLEI server - port 7723
- vLEI Verifier - port 7676
- Witness network - ports 5642-5644

Start all services using:

```bash
# Build and start all services
docker-compose up -d

# Wait for all services to be healthy
docker-compose up deps
```

To verify all services are running properly:

```bash
# Check service status
docker-compose ps

# Check service logs
docker-compose logs -f [service-name]
```

Available services:
- `keria` - KERI Agent
- `vlei-server` - vLEI Schema Server
- `vlei-verifier` - vLEI Verifier
- `witness-demo` - KERI Witness Network

To stop all services:
```bash
docker-compose down
```

## Running VLEI Explorer

1. Start the backend server:
```bash
cd backend
npm run dev
```

The backend will run on port 3001 by default.

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Configuration

### Backend Configuration

The backend configuration is managed through environment variables:

- `PORT`: Backend server port (default: 3001)
- `KERIA_URL`: URL of the KERIA service (default: http://localhost:3901)
- `VERIFIER_URL`: URL of the VLEI Verifier service (default: http://localhost:7676)

### Frontend Configuration

The frontend configuration can be modified in `vite.config.ts`:

- Server port
- Allowed hosts
- Environment variables
- Module aliases

## Supported Workflow Steps

The VLEI Explorer supports the following workflow step types:

1. **AID Creation Steps**
   - `create_aid`: Creates a basic Autonomic Identifier (AID)
   - `create_aid_kli`: Creates an AID using KERI Command Line Interface (KLI)

2. **Credential Management Steps**
   - `issue_credential`: Issues a new credential with specified attributes
   - `revoke_credential`: Revokes a previously issued credential

3. **Client Management Steps**
   - `create_client`: Creates a new client entity
   - `create_registry`: Creates a new registry for credential management

Each step type supports specific attributes and configurations that can be defined in the workflow configuration files (YAML or JSON format).

### Step Attributes

Common attributes across steps:
- `id`: Unique identifier for the step
- `type`: Type of the workflow step
- `agent_name`: Name of the agent executing the step
- `aid`: Autonomic Identifier reference
- `description`: Human-readable description of the step

Additional attributes for credential steps:
- `issuer_aid`: AID of the credential issuer
- `issuee_aid`: AID of the credential recipient
- `credential`: Credential identifier or reference
- `credential_source`: Source of the credential information

## Workflow Configuration Files

The application uses YAML or JSON configuration files to define workflows. Example configurations are available in the `config` directory:

1. `configuration-singlesig-aid.json`: Single-signature AID configuration
2. `configuration-create-aid-kli.json`: KLI-based AID creation
3. `configuration-multisig-single-user.json`: Multi-signature setup
4. `configuration-singlesig-single-user-light.json`: Lightweight single-user configuration

## Architecture

The application follows a client-server architecture:

### Frontend
- React-based UI
- Real-time workflow visualization
- Event-driven updates using Server-Sent Events
- Material-UI components
- ReactFlow for graph visualization

### Backend
- Express.js server
- ESM modules
- Integration with VLEI Verifier
- Workflow execution engine
- Real-time event streaming


## Troubleshooting

Common issues and solutions:

1. **Module Import Issues**
   - Ensure Node.js version is compatible with ESM
   - Check tsconfig.json module settings
   - Verify import/export syntax

2. **Workflow Execution Errors**
   - Verify KERIA connection (`curl http://localhost:3901/status`)
   - Check VLEI Verifier status (`curl http://localhost:7676/health`)
   - Validate workflow configuration

3. **Connection Issues**
   - Check service health status (`docker-compose ps`)
   - View service logs (`docker-compose logs -f <service-name>`)
   - Verify all required ports are available and not blocked

4. **Docker Issues**
   - Ensure all services are healthy (`docker-compose up deps`)
   - Check resource usage (`docker stats`)
   - Review service configurations in docker-compose.yaml

## License

This project is licensed under the Apache-2.0 License - see the LICENSE file for details.

## Related Projects

- [VLEI Verifier](https://github.com/GLEIF-IT/vlei-verifier)
- [VLEI QVI](https://github.com/GLEIF-IT/vlei-qvi)
- [KERIA](https://github.com/WebOfTrust/keria)
- [VLEI Verifier Workflows](https://github.com/GLEIF-IT/vlei-verifier-workflows)
