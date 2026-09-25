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

## 6. Project Status

Current phase:

```text
Database initialization
```

Completed:

- PostgreSQL 17.10 verified
- PostgreSQL administrative user verified
- Application database design established

Next:

- Create database schema
- Create application database user
- Add tables and constraints
- Create consolidated SQL initialization script