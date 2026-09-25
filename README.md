# Parking Slot Manager

## 1. Project Overview

Parking Slot Manager is a simple three-tier web application built for learning and demonstrating modern application deployment and DevOps practices.

The application will use:

- Next.js — Frontend
- Node.js / Express — Backend REST API
- PostgreSQL — Database

The primary focus of this project is not complex business functionality. The project will be used as a practical DevOps learning environment covering application development, containerization, CI/CD, Kubernetes, observability, and security.

---

## 2. Initial Architecture

```text
Browser
   |
   v
Next.js Frontend
   |
   | HTTP / REST
   v
Node.js Backend
   |
   | PostgreSQL
   v
PostgreSQL Database
```

---

## 3. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Node.js / Express |
| Database | PostgreSQL |
| Database Client | pgAdmin |
| Source Control | Git / GitHub |
| Containerization | To be decided |
| CI/CD | GitHub Actions |
| Orchestration | Kubernetes |
| Packaging | Helm |
| Monitoring | Prometheus / Grafana |
| Logging | To be added |

---

## 4. Development Environment

### Database

PostgreSQL version:

```text
PostgreSQL 17.10
```

Platform:

```text
Windows
```

Architecture:

```text
x86_64
```

Current PostgreSQL administrative user:

```text
postgres
```

---

## 5. Database Setup

### 5.1 Create Application Database

The default PostgreSQL `postgres` database is used for administration.

A separate database was created for the Parking Slot Manager application:

```sql
CREATE DATABASE parking_slot_manager;
```

Application database:

```text
parking_slot_manager
```

### 5.2 Database Verification

After connecting to the application database, verify the active database:

```sql
SELECT current_database();
```

Expected result:

```text
parking_slot_manager
```


### 5.3 Database Schema

The Parking Slot Manager database contains four initial tables:

| Table | Purpose |
|---|---|
| `users` | Stores parking system users |
| `vehicles` | Stores vehicles registered by users |
| `parking_slots` | Stores physical parking slots |
| `parking_sessions` | Stores vehicle parking transactions |

### 5.4 Entity Relationship

```text
users
  |
  | 1:N
  v
vehicles
  |
  | 1:N
  v
parking_sessions
  |
  | N:1
  v
parking_slots
```

### 5.5 Database Constraints

The schema includes:

- Primary keys
- Foreign keys
- Unique constraints
- NOT NULL constraints
- CHECK constraints
- Indexes

Vehicle types currently supported:

```text
CAR
BIKE
```

Parking slot statuses:

```text
AVAILABLE
OCCUPIED
```

Parking session statuses:

```text
ACTIVE
COMPLETED
```

### 5.6 Initial Parking Slots

The initial database contains:

- 5 car parking slots
- 5 bike parking slots

Total:

```text
10 parking slots
```

### 5.7 Database Initialization Script

The complete database schema and initial parking-slot data are maintained in:

```text
database/parking_slot_manager.sql
```

The SQL file is intended to provide a reproducible database initialization process.


## 5.8 Database Application User

The application does not connect to PostgreSQL using the default `postgres` superuser.

A dedicated PostgreSQL role was created for the application:

```text
parking_manager
```

The purpose of this user is to follow the principle of least privilege.

### Administrative User

```text
postgres
```

Used for:

- Database administration
- Role management
- Permission management
- Administrative operations

### Application User

```text
parking_manager
```

Used by:

- Node.js backend

The application user is **not a superuser**.

### Application Permissions

The application user has:

```text
CONNECT
USAGE on public schema
SELECT
INSERT
UPDATE
DELETE
```

The user also has the required permissions on PostgreSQL sequences used by `BIGSERIAL` columns.

### Security Principle

The application should never connect to PostgreSQL using the `postgres` superuser.

The application follows the principle of least privilege by using a dedicated database account with only the permissions required by the application.

### Verification

The application user was verified using:

```sql
SELECT rolname, rolcanlogin, rolsuper
FROM pg_roles
WHERE rolname = 'parking_manager';
```

Expected:

```text
rolcanlogin = true
rolsuper = false
```

### Important

The database password must not be committed to Git.

For local development it will eventually be supplied through environment variables.

For containerized/Kubernetes deployment it will eventually be managed using appropriate secret-management mechanisms.
---

## 6. Backend Setup

### 6.1 Node.js Backend

The backend is implemented using Node.js and Express.

The backend exposes REST APIs that communicate with the PostgreSQL database.

Backend port:

```text
5000
```

Base URL:

```text
http://localhost:5000
```

### 6.2 Environment Configuration

Database connection details are stored in a `.env` file.

Example:

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parking_slot_manager
DB_USER=parking_manager
DB_PASSWORD=<password>
PORT=5000
```

The `.env` file is excluded from Git using `.gitignore`.

Database credentials are therefore not stored in source code or committed to the repository.

---

### 6.3 Database Connectivity

The Node.js application uses the PostgreSQL `pg` package to communicate with PostgreSQL.

A connection pool is created in:

```text
backend/src/db.js
```

The application connects using the dedicated:

```text
parking_manager
```

database user rather than the PostgreSQL `postgres` superuser.

---

### 6.4 Health Check API

Endpoint:

```text
GET /api/health
```

Purpose:

Verify that the Node.js backend can successfully communicate with PostgreSQL.

Example response:

```json
{
  "status": "UP",
  "database": "CONNECTED"
}
```

---

### 6.5 Parking Slots API

Endpoint:

```text
GET /api/parking-slots
```

Purpose:

Retrieve parking-slot information from PostgreSQL.

The API executes a query against:

```text
parking_slots
```

and returns the records as JSON.

Example:

```json
[
  {
    "id": "1",
    "slot_number": "CAR-001",
    "slot_type": "CAR",
    "status": "AVAILABLE"
  }
]
```

---

### 6.6 Backend Architecture

The backend follows a layered structure:

```text
HTTP Request
     |
     v
Route
     |
     v
Controller
     |
     v
Service
     |
     v
PostgreSQL
```

#### Routes

Routes define the API endpoints and map incoming requests to controllers.

Location:

```text
backend/src/routes/
```

#### Controllers

Controllers handle HTTP requests and responses.

Location:

```text
backend/src/controllers/
```

#### Services

Services contain application/business logic and database operations.

Location:

```text
backend/src/services/
```

#### Database

PostgreSQL connectivity is centralized through the connection pool.

Location:

```text
backend/src/db.js
```

---

### 6.7 Backend Directory Structure

Current structure:

```text
backend/
│
├── src/
│   ├── server.js
│   ├── db.js
│   │
│   ├── routes/
│   │   └── parkingSlotRoutes.js
│   │
│   ├── controllers/
│   │   └── parkingSlotController.js
│   │
│   └── services/
│       └── parkingSlotService.js
│
├── .env
├── .gitignore
├── package.json
└── package-lock.json
```

---

### 6.8 First End-to-End Backend Flow

The first complete application data flow was successfully implemented:

```text
Browser
   |
   | GET /api/parking-slots
   v
Express Route
   |
   v
Parking Slot Controller
   |
   v
Parking Slot Service
   |
   v
PostgreSQL
   |
   v
parking_slots table
   |
   v
JSON Response
```

This confirms that the Node.js application can successfully retrieve data from PostgreSQL through the API layer.

## 6.9 Parking Session API

The next backend functionality implemented was the parking entry operation.

### API Endpoint

```text
POST /api/parking-sessions
```

### Request

```json
{
  "vehicleId": 1,
  "slotId": 2
}
```

### Backend Flow

```text
Client
   |
   | POST /api/parking-sessions
   v
Parking Session Route
   |
   v
Parking Session Controller
   |
   v
Parking Session Service
   |
   v
PostgreSQL Transaction
   |
   +-- Verify vehicle
   |
   +-- Verify parking slot
   |
   +-- Check slot availability
   |
   +-- Check vehicle/slot type
   |
   +-- Create parking session
   |
   +-- Mark slot OCCUPIED
   |
   v
COMMIT
   |
   v
JSON Response
```

### Validation

The parking session service performs the following validations:

1. Verify that the vehicle exists.
2. Verify that the parking slot exists.
3. Verify that the parking slot is available.
4. Verify that the vehicle type matches the parking slot type.
5. Create the parking session.
6. Change the parking slot status from `AVAILABLE` to `OCCUPIED`.

### Database Transaction

Creating a parking session involves two related database operations:

```text
Create parking session
        +
Update parking slot
```

Both operations must succeed together.

Therefore, a PostgreSQL transaction is used:

```text
BEGIN
   |
   +-- INSERT parking session
   |
   +-- UPDATE parking slot
   |
COMMIT
```

If an operation fails:

```text
BEGIN
   |
   +-- Operation fails
   |
ROLLBACK
```

This prevents an inconsistent state where a parking session is created but the parking slot remains available.

### Row-Level Locking

The parking slot is selected using:

```sql
FOR UPDATE
```

This locks the selected parking slot row during the transaction.

This is important for concurrent requests because two requests should not be able to successfully assign the same parking slot at the same time.

### Successful Test

The following request was successfully tested:

```json
{
  "vehicleId": 1,
  "slotId": 2
}
```

The API returned an `ACTIVE` parking session.

Example response:

```text
id              : 1
vehicle_id      : 1
parking_slot_id : 2
entry_time      : <timestamp>
exit_time       :
parking_fee     :
status          : ACTIVE
```

The corresponding parking slot was changed to:

```text
status = OCCUPIED
```

### Files Added

```text
backend/
└── src/
    ├── routes/
    │   └── parkingSessionRoutes.js
    ├── controllers/
    │   └── parkingSessionController.js
    └── services/
        └── parkingSessionService.js
```

---

## 6.10 Parking Exit API

After implementing the parking entry operation, the parking exit operation was implemented.

The exit operation completes an active parking session, calculates the parking fee, and makes the parking slot available again.

### API Endpoint

```text
POST /api/parking-sessions/:id/exit
```

Example:

```text
POST /api/parking-sessions/1/exit
```

Here, `1` represents the parking session ID.

### Backend Flow

```text
Client
   |
   | POST /api/parking-sessions/1/exit
   v
Parking Session Route
   |
   v
Parking Session Controller
   |
   v
Parking Session Service
   |
   v
PostgreSQL Transaction
   |
   +-- Find active parking session
   |
   +-- Lock session row
   |
   +-- Calculate parking duration
   |
   +-- Calculate parking fee
   |
   +-- Complete parking session
   |
   +-- Mark parking slot AVAILABLE
   |
   v
COMMIT
   |
   v
JSON Response
```

### Parking Fee Calculation

For the initial implementation, a simple fixed parking rate is used:

```text
₹20 per hour
```

The parking duration is calculated using the difference between the current time and the session entry time.

A minimum charge of one hour is applied.

Example:

```text
Less than 1 hour
      |
      v
₹20

1-2 hours
      |
      v
₹40

2-3 hours
      |
      v
₹60
```

### Transaction Handling

The exit operation modifies both the parking session and parking slot.

These operations are executed inside one PostgreSQL transaction:

```text
BEGIN
   |
   +-- Find active session
   |
   +-- Calculate parking fee
   |
   +-- Update session
   |      status = COMPLETED
   |      exit_time = current time
   |      parking_fee = calculated fee
   |
   +-- Update parking slot
   |      status = AVAILABLE
   |
COMMIT
```

If any operation fails:

```text
ROLLBACK
```

This prevents an inconsistent state such as:

```text
Parking session = COMPLETED
        BUT
Parking slot = OCCUPIED
```

### Successful Test

The following API was successfully tested:

```text
POST /api/parking-sessions/1/exit
```

The API returned:

```text
id              : 1
vehicle_id      : 1
parking_slot_id : 2
entry_time      : 2026-09-25T08:38:05.396Z
exit_time       : 2026-09-25T08:50:31.599Z
parking_fee     : 20.00
status          : COMPLETED
```

The parking session was successfully changed from:

```text
ACTIVE
```

to:

```text
COMPLETED
```

The parking slot was changed from:

```text
OCCUPIED
```

back to:

```text
AVAILABLE
```

### Exit Validation

The API validates that:

- The parking session exists.
- The parking session is currently `ACTIVE`.
- A completed parking session cannot be exited again.

### DevOps / SRE Concepts Learned

The parking entry and exit workflows introduced several important backend and production concepts:

- PostgreSQL transactions
- `BEGIN`
- `COMMIT`
- `ROLLBACK`
- Row-level locking using `FOR UPDATE`
- Connection pooling
- Concurrent request handling
- Atomic state changes
- Data consistency
- Failure handling

---

## 6.11 Complete Parking Lifecycle

With both parking entry and exit operations implemented, the application now supports the complete basic parking lifecycle.

```text
                    VEHICLE ENTRY
                         |
                         v
             POST /api/parking-sessions
                         |
                         v
                Create ACTIVE Session
                         |
                         v
                  Slot = OCCUPIED
                         |
                         |
                      PARKED
                         |
                         |
                         v
                    VEHICLE EXIT
                         |
                         v
          POST /api/parking-sessions/:id/exit
                         |
                         v
                Calculate Parking Fee
                         |
                         v
               Session = COMPLETED
                         |
                         v
                  Slot = AVAILABLE
```

### Current Backend Flow

```text
Client
   |
   +-----------------------------+
   |                             |
   v                             v
GET /api/parking-slots    POST /api/parking-sessions
                                  |
                                  v
                         Parking Session Service
                                  |
                                  v
                             PostgreSQL
                                  |
                                  v
                         parking_sessions
                                  |
                                  v
                         parking_slots
                                  |
                                  v
                       Slot = OCCUPIED
                                  |
                                  |
                                  v
                    POST /api/parking-sessions/:id/exit
                                  |
                                  v
                         Session = COMPLETED
                                  |
                                  v
                         Slot = AVAILABLE
```

At this point, the backend supports the basic parking lifecycle:

```text
AVAILABLE
    |
    | Vehicle Entry
    v
OCCUPIED
    |
    | Vehicle Exit
    v
AVAILABLE
```

The next phase will focus on making the backend more production-like before starting the frontend.


## 6.12 Centralized Error Handling Middleware

As the backend grows, handling errors separately inside every controller can lead to duplicated code and inconsistent API responses.

To improve the backend structure, centralized error-handling middleware was introduced.

### Previous Approach

Initially, each controller handled errors independently:

```text
Controller
   |
   +-- try
   |
   +-- catch
        |
        +-- console.error()
        |
        +-- res.status(...)
```

This approach works for a small application but becomes repetitive as the number of APIs increases.

### New Approach

The backend now uses a centralized Express error-handling middleware:

```text
Request
   |
   v
Express Route
   |
   v
Controller
   |
   v
Service
   |
   +------ Success ------> Response
   |
   +------ Error -------> next(error)
                              |
                              v
                     Error Handler Middleware
                              |
                              v
                         JSON Response
```

### Error Handler

The middleware is located at:

```text
backend/src/middleware/errorHandler.js
```

The middleware is responsible for:

- Logging the error
- Determining the HTTP status code
- Returning a consistent JSON error response

Example response:

```json
{
  "error": "Parking session is already completed"
}
```

### Controller Error Handling

Controllers now pass errors to Express using:

```js
next(error);
```

Instead of creating the error response directly inside every controller.

Example:

```js
try {
    const session = await parkingSessionService.exitParkingSession(
        sessionId
    );

    res.status(200).json(session);

} catch (error) {
    next(error);
}
```

### Middleware Registration

The centralized error handler is registered after the application routes:

```js
app.use("/api/parking-slots", parkingSlotRoutes);
app.use("/api/parking-sessions", parkingSessionRoutes);

app.use(errorHandler);
```

Express processes middleware in order, so the error handler is placed after the routes.

### Testing

The parking session with ID `1` was already completed.

Calling:

```text
POST /api/parking-sessions/1/exit
```

again correctly generated:

```json
{
  "error": "Parking session is already completed"
}
```

The backend terminal also logs the error.

### Backend Structure

The backend now contains a dedicated middleware layer:

```text
backend/
└── src/
    ├── server.js
    ├── db.js
    ├── middleware/
    │   └── errorHandler.js
    ├── routes/
    ├── controllers/
    └── services/
```

### Why Centralized Error Handling Matters

Centralized error handling provides:

- Consistent API error responses
- Less duplicated code
- Easier maintenance
- Centralized logging
- A clear place for future error classification
- Better preparation for production observability

This pattern will also be useful later when integrating centralized logging and monitoring.


## 6.13 Request Validation Middleware

As the backend grows, incoming API requests should be validated before they reach the controller and service layers.

Without request validation, invalid data could travel deeper into the application:

```text
Client
   |
   v
Controller
   |
   v
Service
   |
   v
PostgreSQL
```

To improve the request flow, validation middleware was introduced.

### New Request Flow

The backend now follows:

```text
Client
   |
   v
Request
   |
   v
Validation Middleware
   |
   | Valid
   v
Controller
   |
   v
Service
   |
   v
PostgreSQL
```

If the request is invalid:

```text
Client
   |
   v
Validation Middleware
   |
   X
   |
   v
400 Bad Request
```

This prevents invalid input from reaching the business logic.

### Validation Middleware

The validation middleware is located at:

```text
backend/src/middleware/validation.js
```

Two validation functions were introduced:

```text
validateCreateParkingSession
validateSessionId
```

### Parking Session Request Validation

The following request is validated before creating a parking session:

```text
POST /api/parking-sessions
```

Required fields:

```json
{
  "vehicleId": 1,
  "slotId": 2
}
```

The middleware verifies:

- `vehicleId` is present
- `slotId` is present
- Both values are integers
- Both values are greater than zero

Invalid example:

```json
{
  "vehicleId": "hello",
  "slotId": "xyz"
}
```

The API returns:

```json
{
  "error": "vehicleId and slotId must be integers"
}
```

with HTTP status:

```text
400 Bad Request
```

### Session ID Validation

The following endpoint also validates the session ID:

```text
POST /api/parking-sessions/:id/exit
```

For example:

```text
POST /api/parking-sessions/abc/exit
```

is rejected by the validation middleware.

Response:

```json
{
  "error": "Session ID must be a positive integer"
}
```

with HTTP status:

```text
400 Bad Request
```

### Middleware and Controller Separation

The route now connects validation middleware and the controller:

```js
router.post(
    "/",
    validateCreateParkingSession,
    parkingSessionController.createParkingSession
);
```

The request therefore follows:

```text
POST /api/parking-sessions
        |
        v
validateCreateParkingSession
        |
        | Valid
        v
createParkingSession
        |
        v
parkingSessionService
```

For the exit API:

```js
router.post(
    "/:id/exit",
    validateSessionId,
    parkingSessionController.exitParkingSession
);
```

### Validation vs Business Logic

Request validation and business validation are intentionally kept separate.

Request validation checks whether the input has the correct basic format:

```text
Is vehicleId present?
Is vehicleId an integer?
Is vehicleId greater than zero?
```

Business logic checks application-specific rules:

```text
Does the vehicle exist?
Does the parking slot exist?
Is the slot available?
Does the vehicle type match the slot type?
```

Therefore:

```text
Validation Middleware
        |
        +-- Input format
        +-- Required fields
        +-- Data type
        +-- Basic value constraints
        |
        v
Controller
        |
        v
Service
        |
        +-- Business rules
        +-- Database operations
```

This separation keeps the backend easier to maintain and extend.

### Testing

The following validation scenarios were tested successfully:

1. Valid parking session request
2. Missing `vehicleId` and `slotId`
3. Non-integer `vehicleId` and `slotId`
4. Zero/negative IDs
5. Invalid session ID

All invalid requests returned HTTP `400 Bad Request` as expected.

### Current Backend Structure

```text
backend/
└── src/
    ├── server.js
    ├── db.js
    ├── middleware/
    │   ├── errorHandler.js
    │   └── validation.js
    ├── routes/
    │   ├── parkingSlotRoutes.js
    │   └── parkingSessionRoutes.js
    ├── controllers/
    │   ├── parkingSlotController.js
    │   └── parkingSessionController.js
    └── services/
        ├── parkingSlotService.js
        └── parkingSessionService.js
```

Request validation is now handled before controller execution, while business validation remains inside the service layer.

## 6.14 Application Logging

As the backend grows, application logs become important for troubleshooting, monitoring, and production support.

Initially, the application used direct `console.log()` and `console.error()` statements.

A reusable logging utility was introduced to provide consistent application logs.

### Why Application Logging Matters

In a production environment, an application may run inside multiple containers or Kubernetes pods:

```text
                    Kubernetes
                        |
          +-------------+-------------+
          |             |             |
       Pod #1         Pod #2        Pod #3
       Backend        Backend       Backend
          |             |             |
        logs          logs          logs
```

Logs help identify:

- What operation was performed
- When the operation happened
- Whether the operation succeeded or failed
- Which API/request caused an error
- Where troubleshooting should begin

### Logger Utility

A reusable logger was created at:

```text
backend/src/utils/logger.js
```

The logger currently supports three log levels:

```text
INFO
WARN
ERROR
```

Example:

```text
2026-09-25T18:34:50.218Z INFO Server started on http://localhost:5000
```

The logger automatically adds an ISO timestamp to each message.

### Logger Architecture

```text
Application
    |
    +---- logger.info()
    |
    +---- logger.warn()
    |
    +---- logger.error()
              |
              v
        utils/logger.js
              |
              v
        stdout / stderr
```

This provides a single place to control application logging.

### Server Logging

The server now logs important application events.

Example:

```text
INFO Server started on http://localhost:5000
```

The root API also logs requests:

```text
INFO GET / - API root requested
```

The health endpoint logs successful database connectivity:

```text
INFO GET /api/health - Database connected
```

### Centralized Error Logging

The centralized error handler now uses the logger:

```text
backend/src/middleware/errorHandler.js
```

Example:

```text
ERROR POST /api/parking-sessions/1/exit - Parking session is already completed
```

This provides:

- HTTP method
- API endpoint
- Error message
- Timestamp
- Error severity

### Parking Session Creation Logging

The parking session service logs important business operations.

Successful flow:

```text
INFO Parking session creation started
INFO Vehicle validated
INFO Parking slot validated
INFO Parking session created
INFO Parking slot marked OCCUPIED
INFO Parking session creation completed
```

Example:

```text
INFO Parking session creation started vehicleId=1 slotId=5
INFO Vehicle validated vehicleId=1 vehicleType=CAR
INFO Parking slot validated slotId=5 slotType=CAR status=AVAILABLE
INFO Parking session created sessionId=2
INFO Parking slot marked OCCUPIED slotId=5
INFO Parking session creation completed sessionId=2
```

### Parking Session Creation Failure

If a parking slot is already occupied, the service logs the failure.

Example:

```text
INFO Parking session creation started vehicleId=1 slotId=4
INFO Vehicle validated vehicleId=1 vehicleType=CAR
INFO Parking slot validated slotId=4 slotType=CAR status=OCCUPIED
ERROR Parking session creation failed vehicleId=1 slotId=4 error=Parking slot is already occupied
ERROR POST /api/parking-sessions - Parking slot is already occupied
```

This demonstrates that application-level logging and centralized HTTP error logging work together.

### Parking Session Exit Logging

The exit operation also logs important business events.

Successful flow:

```text
INFO Parking session exit started
INFO Parking session validated
INFO Parking fee calculated
INFO Parking session marked COMPLETED
INFO Parking slot marked AVAILABLE
INFO Parking session exit completed
```

Example:

```text
INFO Parking session exit started sessionId=2
INFO Parking session validated sessionId=2 status=ACTIVE slotId=5
INFO Parking fee calculated sessionId=2 hours=1 fee=20
INFO Parking session marked COMPLETED sessionId=2
INFO Parking slot marked AVAILABLE slotId=5
INFO Parking session exit completed sessionId=2 fee=20
```

### Parking Session Exit Failure

Attempting to exit an already completed session generates an error log.

Example:

```text
INFO Parking session exit started sessionId=2
INFO Parking session validated sessionId=2 status=COMPLETED slotId=5
ERROR Parking session exit failed sessionId=2 error=Parking session is already completed
ERROR POST /api/parking-sessions/2/exit - Parking session is already completed
```

### PowerShell Commands Used

The backend was started using:

```powershell
cd backend
npm run dev
```

The logger was tested independently using:

```powershell
node -e "const logger=require('./src/utils/logger'); logger.info('Test info message'); logger.warn('Test warning message'); logger.error('Test error message');"
```

The root endpoint was tested using:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/"
```

The health endpoint was tested using:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/health"
```

The parking-slot endpoint was used to identify available parking slots:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/parking-slots"
```

A successful parking-session creation was tested using:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/parking-sessions" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"vehicleId":1,"slotId":5}'
```

An occupied-slot failure was tested using:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/parking-sessions" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"vehicleId":1,"slotId":4}'
```

A successful parking-session exit was tested using:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/parking-sessions/2/exit" `
  -Method POST
```

The session ID should be replaced with the actual active session ID.

The completed-session failure path was tested by executing the same exit request again:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/parking-sessions/2/exit" `
  -Method POST
```

### Logging and Sensitive Information

Application logs should contain useful operational information but must not expose sensitive information.

The application should not log:

```text
Database passwords
Access tokens
JWT tokens
Authorization headers
Secrets
Private credentials
```

### Future Logging Improvements

The current logger is intentionally simple.

Later, when the application is containerized and deployed to Kubernetes, logging can be extended to support:

- JSON structured logs
- Request IDs / correlation IDs
- Log aggregation
- Loki
- Grafana
- Kubernetes log collection
- Centralized searching and filtering
- Log retention

The current implementation provides a simple foundation for these future improvements.


## 6.15 Graceful Shutdown

### Why Graceful Shutdown?

A backend application should not terminate abruptly when it receives a shutdown signal.

A graceful shutdown allows the application to:

1. Stop accepting new HTTP requests.
2. Allow existing requests to finish.
3. Close the HTTP server.
4. Close the PostgreSQL connection pool.
5. Exit with an appropriate status code.

This is especially important in containerized and Kubernetes environments because Kubernetes normally sends a `SIGTERM` signal before terminating a container.

The shutdown flow is:

```text
Shutdown Signal
      ↓
Stop accepting new requests
      ↓
Existing requests finish
      ↓
HTTP server closes
      ↓
PostgreSQL connection pool closes
      ↓
Application exits
```

### Implementation

The HTTP server is stored in a variable:

```js
const server = app.listen(PORT, () => {
    logger.info(`Server started on http://localhost:${PORT}`);
});
```

A shutdown function handles the cleanup:

```js
const shutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
        logger.info("HTTP server closed");

        try {
            await pool.end();

            logger.info("Database connection pool closed");

            process.exit(0);

        } catch (error) {

            logger.error(
                `Error closing database pool: ${error.message}`
            );

            process.exit(1);
        }
    });
};
```

The application handles both `SIGTERM` and `SIGINT`:

```js
process.on("SIGTERM", () => {
    shutdown("SIGTERM");
});

process.on("SIGINT", () => {
    shutdown("SIGINT");
});
```

### Why SIGINT?

`SIGINT` is commonly generated when the developer presses:

```text
Ctrl + C
```

during local development.

### Why SIGTERM?

`SIGTERM` is commonly used by container orchestration systems such as Kubernetes when requesting that an application terminate gracefully.

### Shutdown Order

The HTTP server is closed before the PostgreSQL pool:

```text
HTTP Server
    ↓
Stop new requests
    ↓
Finish existing requests
    ↓
Close HTTP Server
    ↓
Close PostgreSQL Pool
```

The database pool is therefore not closed while an existing HTTP request may still require database access.

### PowerShell Commands Used

Start the backend:

```powershell
cd backend
npm run dev
```

After the server starts, press:

```text
Ctrl + C
```

Expected shutdown logs:

```text
INFO SIGINT received. Starting graceful shutdown...
INFO HTTP server closed
INFO Database connection pool closed
```

### Important Production Consideration

In Kubernetes, graceful shutdown works together with Kubernetes termination behavior and the pod's termination grace period.

The application should complete its cleanup before the container is forcefully terminated.

A shutdown timeout can be added later as part of Kubernetes hardening if required.

### Security / Logging Note

Shutdown logs should contain operational information only.

Do not log:

- Database passwords
- Access tokens
- API keys
- Connection strings containing credentials
- Other sensitive information

### Future Improvements

Potential future improvements include:

- Configurable shutdown timeout
- Kubernetes `terminationGracePeriodSeconds`
- Readiness changes during shutdown
- Structured JSON logging
- Request correlation IDs
- Centralized log collection
- Prometheus/Grafana monitoring
- Loki-based log aggregation

## 6.16 Health & Readiness Endpoints

Health endpoints are important for monitoring and container orchestration.

The Parking Slot Manager backend now exposes separate endpoints for application liveness and application readiness.

### Liveness

Endpoint:

```text
GET /api/health/live
```

Purpose:

> Is the Node.js application process alive and responding?

The liveness endpoint does not access PostgreSQL.

Implementation:

```js
app.get("/api/health/live", (req, res) => {
    logger.info("GET /api/health/live - Application is alive");

    res.status(200).json({
        status: "UP"
    });
});
```

Successful response:

```json
{
    "status": "UP"
}
```

### Readiness

Endpoint:

```text
GET /api/health/ready
```

Purpose:

> Is the application ready to serve traffic?

The readiness endpoint checks PostgreSQL by executing:

```sql
SELECT 1;
```

Implementation:

```js
app.get("/api/health/ready", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        logger.info(
            "GET /api/health/ready - Application is ready"
        );

        res.status(200).json({
            status: "READY",
            database: "CONNECTED"
        });

    } catch (error) {

        logger.error(
            `GET /api/health/ready - Application is not ready: ${error.message}`
        );

        res.status(503).json({
            status: "NOT_READY",
            database: "NOT_CONNECTED"
        });
    }
});
```

Successful response:

```json
{
    "status": "READY",
    "database": "CONNECTED"
}
```

If PostgreSQL is unavailable:

```json
{
    "status": "NOT_READY",
    "database": "NOT_CONNECTED"
}
```

The readiness endpoint returns HTTP `503 Service Unavailable` when the application cannot communicate with PostgreSQL.

### Existing Health Endpoint

The existing endpoint remains:

```text
GET /api/health
```

It performs a PostgreSQL query and returns database connectivity information along with the database server time.

Example successful response:

```json
{
    "status": "UP",
    "database": "CONNECTED",
    "time": "..."
}
```

### Liveness vs Readiness

The two endpoints have different responsibilities.

```text
                    Application
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
          Liveness              Readiness
              │                     │
       Process running?      Can serve traffic?
              │                     │
           Node.js              PostgreSQL
              │                     │
              ↓                     ↓
          "I'm alive"          "I'm ready"
```

### Why Liveness Should Not Depend on PostgreSQL

If PostgreSQL temporarily becomes unavailable, the Node.js application may still be running correctly.

Therefore:

```text
PostgreSQL DOWN
      ↓
Liveness  → UP
Readiness → NOT_READY
```

This prevents a temporary dependency failure from automatically being treated as an application-process failure.

### Why Readiness Returns HTTP 503

HTTP `503 Service Unavailable` indicates that the service is temporarily unable to handle requests.

This is appropriate for readiness because the application should not receive normal application traffic while a required dependency is unavailable.

### Kubernetes Relevance

These endpoints will later be used by Kubernetes probes.

Conceptually:

```text
Kubernetes
    │
    ├── Liveness Probe
    │       ↓
    │   /api/health/live
    │
    └── Readiness Probe
            ↓
        /api/health/ready
```

A liveness failure can cause Kubernetes to restart the container.

A readiness failure can cause Kubernetes to remove the pod from service traffic without necessarily restarting the application.

### PowerShell Commands Used

Start the backend:

```powershell
cd backend
npm run dev
```

Test liveness:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/health/live" `
  -Method GET
```

Expected:

```text
status
------
UP
```

Test readiness while PostgreSQL is running:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/health/ready" `
  -Method GET
```

Expected:

```text
status     database
------     --------
READY      CONNECTED
```

For failure-path testing:

1. Stop the backend.
2. Stop PostgreSQL from Windows Services.
3. Start the backend again.
4. Execute the readiness request.

```powershell
cd backend
npm run dev
```

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/health/ready" `
  -Method GET
```

Expected response body:

```json
{
    "status": "NOT_READY",
    "database": "NOT_CONNECTED"
}
```

The HTTP status is:

```text
503 Service Unavailable
```

After restarting PostgreSQL, run the readiness command again:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/health/ready" `
  -Method GET
```

Expected:

```text
status     database
------     --------
READY      CONNECTED
```

### Important Design Principle

Liveness answers:

> Is the application alive?

Readiness answers:

> Can the application currently serve traffic?

Keeping these responsibilities separate is important when the application is deployed to Kubernetes.

## 6.17 Configuration Cleanup

### Why Centralize Configuration?

Application configuration was initially accessed directly through `process.env` in different files.

For example:

```js
process.env.DB_HOST
process.env.DB_PORT
process.env.DB_NAME
process.env.PORT
```

As an application grows, accessing environment variables throughout multiple files can make configuration harder to maintain.

The configuration was therefore centralized into:

```text
backend/src/config.js
```

The configuration flow is now:

```text
.env
  ↓
dotenv
  ↓
config.js
  ↓
Application components
```

### Configuration File

File:

```text
backend/src/config.js
```

Current implementation:

```js
const config = {
    server: {
        port: Number(process.env.PORT) || 5000
    },

    database: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    }
};

module.exports = config;
```

### Server Configuration

`server.js` imports the centralized configuration:

```js
const config = require("./config");
```

The application port is then obtained from:

```js
const PORT = config.server.port;
```

### Database Configuration

`db.js` imports the same configuration:

```js
const config = require("./config");
```

The PostgreSQL connection pool uses:

```js
const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password
});
```

### Why Convert Ports to Numbers?

Environment variables are loaded as strings.

For example:

```text
PORT=5000
```

is initially available through Node.js as:

```js
process.env.PORT
```

with the value:

```text
"5000"
```

The configuration converts it to a number:

```js
Number(process.env.PORT)
```

The same approach is used for:

```js
Number(process.env.DB_PORT)
```

This keeps numeric configuration values explicitly typed as numbers inside the application.

### Current Environment Configuration

The local `.env` contains values similar to:

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parking_slot_manager
DB_USER=parking_manager
DB_PASSWORD=<local-password>
PORT=5000
```

The actual database password must never be committed to Git.

### Secret Protection

The `.gitignore` file contains:

```text
node_modules/
.env
npm-debug.log*
```

Therefore `.env` is excluded from Git.

Important rule:

```text
.env
  ↓
Local machine only

Git
  ↓
Never commit .env
```

Production secrets will later be handled using appropriate mechanisms such as Kubernetes Secrets or an external secrets management solution.

### Future Environment Model

The configuration approach prepares the application for multiple environments:

```text
Local
  ↓
.env

Development
  ↓
Kubernetes ConfigMap + Secret

QA
  ↓
Kubernetes ConfigMap + Secret

Production
  ↓
Kubernetes ConfigMap + Secret
```

The application code can continue using:

```js
config.database.host
config.database.port
config.database.name
```

without scattering environment-variable access throughout the codebase.

### PowerShell Commands Used

Start the backend:

```powershell
cd backend
npm run dev
```

Test the liveness endpoint:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/health/live" `
  -Method GET
```

Expected:

```text
status
------
UP
```

Test the readiness endpoint:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/health/ready" `
  -Method GET
```

Expected:

```text
status     database
------     --------
READY      CONNECTED
```

### Result

Configuration is now centralized and separated from application logic.

The backend is now ready for the next major stage:

```text
Git / GitHub
```
## 7. Git and GitHub

The Parking Slot Manager source code is maintained using Git and hosted on GitHub.

Git provides version control for the project, while GitHub provides the remote repository.

### Git Workflow

The basic workflow is:

```text
Working Directory
      ↓
git status
      ↓
git add
      ↓
git commit
      ↓
git push
      ↓
GitHub
```

### Repository

GitHub repository:

```text
Parking_Slot_Manager
```

The repository contains the application source code and project documentation.

### Important Files Excluded from Git

The project uses `.gitignore` to prevent local and generated files from being committed.

Current `.gitignore`:

```text
node_modules/
.env
npm-debug.log*
```

The `.env` file is especially important because it contains local database configuration and credentials.

The application must never commit:

```text
.env
```

or any file containing:

- Database passwords
- GitHub Personal Access Tokens
- API keys
- Access tokens
- Private keys
- Other credentials

### Local Git Repository

Git was initialized in the project directory and the application files were added to version control.

The repository was then connected to the GitHub remote repository.

### PowerShell Commands Used

Check the Git version:

```powershell
git --version
```

Initialize Git in the project directory:

```powershell
git init
```

Check repository status:

```powershell
git status
```

Review ignored files:

```powershell
git status --ignored
```

Add project files:

```powershell
git add .
```

Review staged files:

```powershell
git status
```

Create the initial commit:

```powershell
git commit -m "Initial project setup"
```

Check configured remotes:

```powershell
git remote -v
```

Push the project to GitHub:

```powershell
git push -u origin main
```

### GitHub Result

The source code is now available in the GitHub repository:

```text
Parking_Slot_Manager
```

This repository will become the source repository for the future CI/CD pipeline.

### Future Git Workflow

After the initial push, normal development will follow:

```text
Make changes
    ↓
git status
    ↓
git add
    ↓
git commit
    ↓
git push
    ↓
GitHub
    ↓
GitHub Actions
```

GitHub Actions will later automatically build, test, scan, and eventually deploy the application.

### DevOps Importance

Git is the starting point for the project's future CI/CD workflow.

The eventual architecture will be:

```text
Developer
    ↓
Git
    ↓
GitHub
    ↓
GitHub Actions
    ↓
Build
    ↓
Test
    ↓
Security Scan
    ↓
Container Image
    ↓
Container Registry
    ↓
Kubernetes
```
## 8. Frontend Setup

The frontend of the Parking Slot Manager is built using Next.js.

### 8.1 Frontend Technology

The frontend uses:

- Next.js 16.3.6
- React
- JavaScript
- Tailwind CSS
- ESLint
- App Router

TypeScript is not used in the initial version of the project. The frontend is intentionally kept simple so that the main learning focus remains on DevOps, CI/CD, containers, Kubernetes, observability, and security.

### 8.2 Create the Next.js Application

From the project root:

```powershell
npx create-next-app@latest frontend
```

The following options were selected during project creation:

```text
TypeScript: No
Linter: ESLint
React Compiler: No
Tailwind CSS: Yes
src/ directory: No
App Router: Yes
Import alias: Default @/*
AGENTS.md: No
```

This created the frontend application under:

```text
frontend/
```

### 8.3 Run the Frontend Locally

Navigate to the frontend directory:

```powershell
cd frontend
```

Start the Next.js development server:

```powershell
npm run dev
```

The application is available at:

```text
http://localhost:3000
```

The frontend will eventually communicate with the backend API running on:

```text
http://localhost:5000
```

### 8.4 Initial Frontend Architecture

The current high-level application flow is:

```text
Browser
   |
   v
Next.js Frontend
   |
   v
Node.js + Express Backend
   |
   v
PostgreSQL
```

The frontend will provide the user interface for:

- Viewing parking slots
- Viewing slot availability
- Creating parking sessions
- Exiting parking sessions
- Viewing parking session information

Application functionality will remain intentionally simple. The primary project objective is to demonstrate an enterprise-style DevOps lifecycle around the application.

### 8.5 Verify Frontend Startup

After creating the Next.js application, the development server was started using:

```powershell
cd frontend
npm run dev
```

The application was successfully accessible at:

```text
http://localhost:3000
```

The default Next.js page was displayed successfully in the browser.

This confirms that the Next.js frontend was created and can run locally.

To stop the development server:

```text
Ctrl + C
```

### 8.6 Inspect the Generated Frontend Structure

From the `frontend` directory:

```powershell
Get-ChildItem
```

Inspect the App Router directory:

```powershell
Get-ChildItem app
```

Important generated files/directories include:

```text
frontend/
├── app/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── public/
├── package.json
├── package-lock.json
└── ...
```

`app/page.js` is the current homepage of the application.

`app/layout.js` provides the root layout for the application.

`app/globals.css` contains global styling.

The `public/` directory is used for static assets.

The generated Next.js page will later be replaced with the Parking Slot Manager dashboard.

### 8.8 Create Initial Parking Dashboard

The default Next.js starter page was replaced with an initial Parking Slot Manager dashboard.

The homepage is implemented in:

```text
frontend/app/page.js
```

The initial dashboard contains:

- Application title
- Total parking slot count
- Available slot count
- Occupied slot count
- Parking slot cards
- Basic responsive layout using Tailwind CSS

At this stage, the dashboard uses static sample values.

The data is intentionally not connected to the backend yet.

The current architecture is:

```text
Browser
   |
   v
Next.js Dashboard
   |
   v
Static sample data
```

The next step will replace the static data with real data from the backend API:

```text
Browser
   |
   v
Next.js Dashboard
   |
   | HTTP API request
   v
Node.js + Express
   |
   v
PostgreSQL
```

### 8.9 Run the Frontend

From the frontend directory:

```powershell id="h7g3j2"
npm run dev
```

The dashboard can be accessed at:

```text
http://localhost:3000
```

### 8.10 Verify Backend API Before Frontend Integration

Before connecting the Next.js frontend to the backend, the backend API was verified independently.

Start the backend:

```powershell id="r4o8jy"
cd backend
npm run dev
```

From another PowerShell terminal, test the parking slot API:

```powershell id="e5b3yt"
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/parking-slots" `
  -Method GET
```

The endpoint:

```text
GET http://localhost:5000/api/parking-slots
```

returns parking slot information retrieved from PostgreSQL.

The intended architecture is:

```text
PostgreSQL
    ↑
    |
Node.js + Express
    ↑
    |
Next.js Frontend
    ↑
    |
Browser
```

The frontend communicates with the backend API and does not connect directly to PostgreSQL.

This separation is an important part of the 3-tier architecture.

### 8.11 Connect Next.js Frontend to Backend API

The backend parking slot API was verified independently before frontend integration.

The frontend now retrieves parking slot information from:

```text
GET http://localhost:5000/api/parking-slots
```

The frontend homepage is implemented in:

```text
frontend/app/page.js
```

The frontend uses the browser `fetch()` API to communicate with the backend.

The data flow is:

```text
Browser
   |
   v
Next.js
   |
   | GET /api/parking-slots
   v
Node.js + Express
   |
   v
PostgreSQL
```

The frontend no longer uses hard-coded parking slot data.

The dashboard calculates:

- Total slots
- Available slots
- Occupied slots

from the response returned by the backend API.

### 8.12 Run Backend and Frontend Together

Start the backend in one PowerShell terminal:

```powershell id="v5t1r7"
cd backend
npm run dev
```

Start the frontend in another PowerShell terminal:

```powershell id="u7w2p9"
cd frontend
npm run dev
```

Open the frontend:

```text
http://localhost:3000
```

The frontend calls:

```text
http://localhost:5000/api/parking-slots
```

and displays the parking slot data returned by the backend.

### 8.13 Frontend State Management

The initial frontend uses React state:

```text
parkingSlots
loading
error
```

`useEffect()` is used to request parking slot data when the page loads.

The application follows this basic flow:

```text
Page loads
    |
    v
useEffect()
    |
    v
fetch()
    |
    v
Backend API
    |
    v
JSON response
    |
    v
setParkingSlots()
    |
    v
React re-renders dashboard
```

At this stage, the frontend uses the browser `fetch()` API directly. No additional HTTP client library has been introduced.

### 8.14 CORS Configuration

During frontend-to-backend integration, the browser initially blocked the API request because the frontend and backend were running on different origins.

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:5000
```

The browser reported:

```text
Access to fetch at 'http://localhost:5000/api/parking-slots'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

#### Install CORS Middleware

From the backend directory:

```powershell id="z9a2m1"
npm install cors
```

This adds the `cors` package to the backend dependencies.

#### Configure CORS

The backend imports the CORS middleware:

```js id="x4w8p2"
const cors = require("cors");
```

CORS is configured to allow requests from the local Next.js frontend:

```js id="j7v3q1"
app.use(
    cors({
        origin: "http://localhost:3000"
    })
);
```

The backend therefore explicitly allows the development frontend origin.

The resulting request flow is:

```text
Browser
   |
   | http://localhost:3000
   v
Next.js Frontend
   |
   | HTTP request
   v
Express Backend
   |
   | Database query
   v
PostgreSQL
```

CORS is enforced by the browser. The backend must provide the appropriate CORS response headers for browser-based cross-origin requests.

For local development, only `http://localhost:3000` is allowed.

In a later deployment, the frontend origin should be supplied through environment/configuration rather than hard-coded.

#### Start Backend

```powershell id="q3s6k8"
cd backend
npm run dev
```

#### Start Frontend

From another PowerShell terminal:

```powershell id="n2f7r4"
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

The frontend should now be able to retrieve parking slot data from:

```text
GET http://localhost:5000/api/parking-slots
```

### 8.15 Frontend API Configuration

After successfully connecting the Next.js frontend to the Express backend, the frontend initially contained the backend URL directly in the React component:

```js
fetch("http://localhost:5000/api/parking-slots")
```

Although this works locally, hard-coding environment-specific URLs inside application code is not ideal.

The backend URL should be configurable so that the same frontend code can be used across different environments.

For example:

```text
Development → http://localhost:5000
Docker       → Backend container/service
Kubernetes   → Kubernetes Service
Production   → Production API URL
```

Next.js supports environment variables for this purpose.

Browser-accessible environment variables must use the `NEXT_PUBLIC_` prefix.

The planned configuration is:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

The frontend can then construct API requests using the environment variable:

```js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

fetch(`${API_BASE_URL}/api/parking-slots`);
```

This separates application logic from environment-specific configuration.

#### PowerShell Command

From the frontend directory:

```powershell
cd frontend
```

Create the local environment file:

```powershell
New-Item .env.local -ItemType File
```

Add:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

The `.env.local` file should not be committed to Git when it contains environment-specific or sensitive configuration.

Verify the file:

```powershell
Get-Content .env.local
```

Expected:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

The frontend API code can then use:

```js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
```

and:

```js
fetch(`${API_BASE_URL}/api/parking-slots`);
```

This approach prepares the application for containerization and Kubernetes, where environment-specific configuration can be supplied without modifying application source code.

#### Important

`NEXT_PUBLIC_` variables are exposed to browser-side JavaScript.

Therefore:

- API URLs are suitable for `NEXT_PUBLIC_` variables.
- Passwords, database credentials, API secrets, tokens, and other sensitive values must NOT be stored in `NEXT_PUBLIC_` variables.


#### Update Frontend API Code

The hard-coded backend URL was removed from `frontend/app/page.js`.

Previously:

```js
const response = await fetch(
    "http://localhost:5000/api/parking-slots"
);
```

The frontend now reads the API base URL from the environment:

```js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
```

The API request is then constructed as:

```js
const response = await fetch(
    `${API_BASE_URL}/api/parking-slots`
);
```

This creates the following configuration flow:

```text
page.js
   |
   | process.env.NEXT_PUBLIC_API_BASE_URL
   ↓
.env.local
   |
   | http://localhost:5000
   ↓
Express Backend
```

#### Restart Frontend

After changing environment configuration, restart the Next.js development server.

Stop the server:

```powershell
Ctrl+C
```

Start it again:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

Verify that the dashboard still displays the live parking slot information.

Expected current state:

```text
Total Slots = 10
Available = 9
Occupied = 1
```

This confirms that the frontend is successfully reading its API endpoint from environment configuration rather than using a hard-coded backend URL.


### 8.16 Frontend API Layer

As the frontend grows, keeping HTTP API calls directly inside React components can make the components difficult to maintain.

The initial implementation performed the backend request directly inside:

```text
frontend/app/page.js
```

The frontend will therefore introduce a small API layer.

New structure:

```text
frontend/
├── app/
│   └── page.js
└── lib/
    └── api.js
```

The responsibility will be separated as follows:

```text
page.js
   |
   | Request parking slot data
   ↓
lib/api.js
   |
   | HTTP request
   ↓
Express Backend
   |
   ↓
PostgreSQL
```

The React page will focus primarily on UI and state management, while `lib/api.js` will contain frontend API communication logic.

#### Create API Layer Directory

From the frontend directory:

```powershell
cd frontend
New-Item -ItemType Directory lib
```

Create the API file:

```powershell
New-Item lib\api.js -ItemType File
```

Verify:

```powershell
Get-ChildItem lib
```

Expected:

```text
api.js
```

The API implementation will be added in the next step.

This separation prepares the frontend for additional backend APIs without putting all HTTP communication logic inside the page component.


#### Implement Parking Slot API Function

The frontend API layer was implemented in:

```text
frontend/lib/api.js
```

The file contains the backend API communication logic for retrieving parking slots.

Implementation:

```js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getParkingSlots = async () => {
    const response = await fetch(
        `${API_BASE_URL}/api/parking-slots`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch parking slots");
    }

    return response.json();
};
```

The API layer is responsible for:

1. Reading the backend URL from environment configuration.
2. Sending the HTTP request.
3. Checking whether the HTTP response was successful.
4. Converting the response into JSON.
5. Returning the parking slot data to the caller.

The React page does not need to know the implementation details of the HTTP request.

The planned frontend flow is:

```text
page.js
   |
   | getParkingSlots()
   ↓
lib/api.js
   |
   | fetch()
   ↓
Express Backend
   |
   ↓
PostgreSQL
```

No additional HTTP library such as Axios was introduced because the browser's built-in `fetch()` API is sufficient for the current application.

#### Verify API Layer File

From the frontend directory:

```powershell
Get-Content lib\api.js
```

This confirms that the API communication function has been created.

The next step is to update `page.js` to use `getParkingSlots()` instead of directly calling `fetch()`.

#### Integrate API Layer with `page.js`

After implementing `getParkingSlots()` in `lib/api.js`, the React page was updated to use the API layer.

The following import was added:

```js
import { getParkingSlots } from "../lib/api";
```

The API URL configuration was removed from `page.js`:

```js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
```

The direct `fetch()` implementation was also removed.

Previously, `page.js` contained:

```js
const response = await fetch(
    `${API_BASE_URL}/api/parking-slots`
);

if (!response.ok) {
    throw new Error("Failed to fetch parking slots");
}

const data = await response.json();
```

The page now uses:

```js
const data = await getParkingSlots();

setParkingSlots(data);
```

The resulting separation is:

```text
React Component
      |
      | getParkingSlots()
      ↓
frontend/lib/api.js
      |
      | fetch()
      ↓
Express Backend
      |
      ↓
PostgreSQL
```

This keeps the React component focused on:

- UI rendering
- React state
- Loading state
- Error state
- Display calculations

The API layer is responsible for:

- API URL configuration
- HTTP communication
- Response validation
- JSON parsing

#### Verify Frontend

The Next.js development server can be started with:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

Verify the dashboard still displays live database information.

Expected:

```text
Total Slots = 10
Available = 9
Occupied = 1
```

The API layer is now successfully integrated with the dashboard.

### 8.17 Parking Session API Layer

The backend already provides an API for creating a parking session:

```text
POST /api/parking-sessions
```

The frontend API layer was extended to communicate with this endpoint.

The function added to:

```text
frontend/lib/api.js
```

is:

```js
export const createParkingSession = async (vehicleId, slotId) => {
    const response = await fetch(
        `${API_BASE_URL}/api/parking-sessions`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                vehicleId,
                slotId
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to create parking session");
    }

    return data;
};
```

The function sends:

```json
{
    "vehicleId": 1,
    "slotId": 1
}
```

to:

```text
POST /api/parking-sessions
```

The frontend API layer now contains:

```text
getParkingSlots()
        ↓
GET /api/parking-slots

createParkingSession(vehicleId, slotId)
        ↓
POST /api/parking-sessions
```

The backend handles the database transaction.

For a successful parking operation, the backend:

1. Validates the vehicle.
2. Locks and validates the parking slot.
3. Checks whether the slot is available.
4. Checks vehicle/slot type compatibility.
5. Creates the parking session.
6. Marks the slot as `OCCUPIED`.
7. Commits the transaction.

The frontend does not implement this database logic. It only communicates with the backend API.

#### Verify API Layer

From the frontend directory:

```powershell
Get-Content lib\api.js
```

The next step is to connect `createParkingSession()` to a frontend form.

#### Add Parking Session Form

The frontend was extended to allow a user to create a parking session.

The form accepts:

- Vehicle ID
- Parking Slot ID

The UI calls:

```text
POST /api/parking-sessions
```

through the frontend API layer.

New frontend state:

```js
const [vehicleId, setVehicleId] = useState("");
const [slotId, setSlotId] = useState("");
const [creatingSession, setCreatingSession] = useState(false);
const [successMessage, setSuccessMessage] = useState("");
```

The form submission is handled by:

```js
const handleCreateParkingSession = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setCreatingSession(true);

    try {
        const session = await createParkingSession(
            Number(vehicleId),
            Number(slotId)
        );

        setSuccessMessage(
            `Parking session ${session.id} created successfully`
        );

        setVehicleId("");
        setSlotId("");

        const updatedSlots = await getParkingSlots();
        setParkingSlots(updatedSlots);

    } catch (error) {
        setError(error.message);

    } finally {
        setCreatingSession(false);
    }
};
```

The frontend does not directly update the parking slot status.

The backend remains responsible for the parking transaction:

```text
Frontend
   |
   | POST /api/parking-sessions
   ↓
Backend
   |
   | Database transaction
   ↓
parking_sessions
   +
parking_slots
   |
   ↓
Frontend refreshes slot data
```

This maintains the backend/database as the source of truth.

The frontend also provides a loading state while the parking request is being processed.

Example:

```text
Park Vehicle
     ↓
Parking...
     ↓
Parking session created successfully
```

For testing, use the existing test vehicle:

```text
Vehicle ID = 1
```

The selected parking slot must be:

```text
AVAILABLE
```

and must have:

```text
slot_type = CAR
```

because the test vehicle is a CAR.

After successful creation, the frontend refreshes the parking-slot API and the dashboard reflects the new slot status.

Expected state after successfully parking one additional vehicle:

```text
Total Slots = 10
Available   = 8
Occupied    = 2
```

The exact slot ID should be selected based on the current available CAR slot shown by the dashboard.

#### Parking Session UI

The parking-session API was connected to the Next.js dashboard.

The frontend now contains a **Park Vehicle** form with:

- Vehicle ID
- Parking Slot ID
- Park Vehicle button
- Request loading state
- Success message
- Error message

The form is handled by:

```js
const handleCreateParkingSession = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setCreatingSession(true);

    try {
        const session = await createParkingSession(
            Number(vehicleId),
            Number(slotId)
        );

        setSuccessMessage(
            `Parking session ${session.id} created successfully`
        );

        setVehicleId("");
        setSlotId("");

        const updatedSlots = await getParkingSlots();
        setParkingSlots(updatedSlots);

    } catch (error) {
        setError(error.message);

    } finally {
        setCreatingSession(false);
    }
};
```

The complete request flow is now:

```text
User
  |
  | Vehicle ID + Slot ID
  ↓
Next.js page.js
  |
  | createParkingSession()
  ↓
frontend/lib/api.js
  |
  | POST /api/parking-sessions
  ↓
Express Backend
  |
  | Transaction
  ↓
PostgreSQL
  |
  ├── Create parking session
  └── Mark slot OCCUPIED
  |
  ↓
Next.js
  |
  | GET /api/parking-slots
  ↓
Updated Dashboard
```

The frontend does not directly modify the database.

The backend remains responsible for business rules and transaction management.

### PowerShell Commands

Start the frontend from the frontend directory:

```powershell
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

Verify that the **Park Vehicle** section is displayed and the existing dashboard data still loads correctly.
### 8.18 Verify Parking Session from Frontend

The frontend now supports creating a parking session through the backend API.

The complete flow is:

```text
Browser
   ↓
Next.js Parking Dashboard
   ↓
POST /api/parking-sessions
   ↓
Node.js + Express
   ↓
Parking Session Service
   ↓
PostgreSQL Transaction
   ↓
Parking Slot becomes OCCUPIED
```

Before testing, identify an available CAR slot using pgAdmin:

```sql
SELECT
    id,
    slot_number,
    slot_type,
    status
FROM parking_slots
WHERE slot_type = 'CAR'
  AND status = 'AVAILABLE'
ORDER BY id;
```

Use:

```text
Vehicle ID = 1
Slot ID = ID of an available CAR slot
```

The frontend sends the request through:

```text
frontend/lib/api.js
```

using:

```text
POST /api/parking-sessions
```

The backend validates the vehicle and parking slot, starts a PostgreSQL transaction, creates the parking session, marks the slot as `OCCUPIED`, and commits the transaction.

After a successful request, the frontend calls `getParkingSlots()` again so that the dashboard reflects the latest backend state.

Expected dashboard state after parking one additional vehicle:

```text
Total      10
Available   8
Occupied    2
```

The frontend does not directly modify the database. The backend remains the source of truth.

#### PowerShell command used to start the frontend

```powershell
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

#### Verification checklist

- [ ] Park Vehicle section is visible
- [ ] Dashboard loads parking slots
- [ ] Available CAR slot identified
- [ ] Vehicle ID 1 entered
- [ ] Available CAR slot ID entered
- [ ] Parking session created successfully
- [ ] Success message displayed
- [ ] Selected slot becomes OCCUPIED
- [ ] Available count decreases by 1
- [ ] Occupied count increases by 1
- [ ] Backend remains the source of truth