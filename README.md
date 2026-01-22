# Slush VC Analyst Agent

A "senior VC analyst" agent that interview founders to grade their company / idea in the current form based on product, traction, and unique advantage, give constructive feedback on what to improve and prepare for Slush, and save structured assessment into a PostgreSQL database.

**Deployed demo:** https://slush-app-1082867883608.europe-north2.run.app/

Note: public registration is disabled. Please use the following pre-seeded account:
email: demo@slush.org
password: slushdemo

## Overview

This project uses agentic workflow with LangChain to enable the following capacities for the agent:

1. Reasoning: The developed agent retains memory of previous conversation and keeps interviewing users until it gets enough information about the company (currently `product`, `traction`, and `unique advantage`) to continue with assessment.

2. Tool usage: When the agent collects enough information, it calls the `submit_evaluation` tool to save its assessment in the database.

**User flow:** User Login -> Start-up Assess Loop (User initiate chat -> Agent ask questions <-> Agent determine whether enough information has been collected -> Agent calls tool and return assessment to user) <-> User continue chat (update previous company or start new assessment) or check previous assessments

## Architecture

The frontend and the backend are located in separate folders and can be run separately during development.

For deployment, these are combined into one docker image by extracting the frontend build folder `dist` into the backend `public/dist` and served by the backend. The live demo of this application is deployed on GCP using Cloud Run.

### Tech Stack

- **Frontend:** React(Vite), TailwindCSS, ShadcnUI, Tanstack Query, zod, React Router
- **Backend:** Express, JWT, LangChain
- **Database:** PostgreSQL with Kysely
- **Infrastructure:** Docker, GCP

### Key Design Decisions

**1. Server-side memory:**

    The agent uses LangChain with its built-in `MemorySaver` checkpointer.
    By doing this, the conversation thread is preserved in the backend, without the need for the frontend to save and send conversation history which saves bandwidth and also reduce the risk of history manipulation.

**2. Secure context injection:**

    When the agent calls `submit_evaluation` tool, it injects userId, which is needed to write into the database, from LangChain's RunnableConfig.
    This prevents the model from hallucinating or misreading the id from chat history and prevent chat manipulation. The id is strictly passed through JWT middleware -> agent -> tool.

**3. Kysely over ORM**

    The backend uses a query builder instead of a full ORM.
    Kysely infers types directly from SQL schema interfaces (this project uses `kysely-codegen` to automatically generate types), keep the database safe from injection, while saving the runtime overhead of ORMs.

### Trade-off and Limitations

- **Memory persistance:** The agent uses in-memory MemorySaver, which is cleared when the server is restarted. Possible improvement can be to save the conversation thread in PostgreSQL.
- **Auth:** Only a simple JWT is implemented with local storage. In production environment, it is better to use solutions like `better-auth` to enable SSO and comply with GDPR.
- **Registration:** No sign-up flow was implemented. The agentic workflow was prioritised over this.
- **Streaming:** The standard request-response was used for simplicity. Possible improvement can be using WebSocket.

### Testing

The test suites uses Vitest, React Testing Library, and Supertest.

- Backend integration test: mock the service layer to test routes, controllers, and auth middleware.
- Service test: mock the database layer and LangChain to test business logic and tool usage.
- Frontend test: verify form validation and integration.

## Usage

### Prerequisites

- Node 22+

### Local Development

**1. Environment Setup:**

Create a `.env` in the server root

```
NODE_ENV=development
PORT=3000
HOST=localhost
JET_LOGGER_MODE=console
JET_LOGGER_FILEPATH=jet-logger.log
JET_LOGGER_TIMESTAMP=true
JET_LOGGER_FORMAT=line

DATABASE_URL=
SALT=
JWT_SECRET=
```

Create a `.env` in the client root

```
VITE_BACKEND_URL=http://localhost:3000/api
```

**2. Database setup:**

Install all dependencies and migrate database

```sh
cd server
npm install
npm run migrate:latest
npm run seed:run
cd ../client
npm install
```

**3. Start servers:**

Start backend and frontend server

```sh
cd server
npm run dev
```

```sh
cd client
npm run dev
```

**4. tests:**

```sh
cd server
npm run test
```

```sh
cd client
npm run test
```
