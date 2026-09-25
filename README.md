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