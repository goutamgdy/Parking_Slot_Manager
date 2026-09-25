-- ============================================================
-- Parking Slot Manager
-- Database Schema
-- PostgreSQL 17
-- ============================================================

-- ============================================================
-- TABLE: users
-- Stores parking system users / vehicle owners
-- ============================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE: vehicles
-- Stores vehicles registered by users
-- ============================================================

CREATE TABLE vehicles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vehicle_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_vehicle_type
        CHECK (vehicle_type IN ('CAR', 'BIKE'))
);


-- ============================================================
-- TABLE: parking_slots
-- Stores physical parking slots
-- ============================================================

CREATE TABLE parking_slots (
    id BIGSERIAL PRIMARY KEY,
    slot_number VARCHAR(20) NOT NULL UNIQUE,
    slot_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT chk_slot_type
        CHECK (slot_type IN ('CAR', 'BIKE')),

    CONSTRAINT chk_slot_status
        CHECK (status IN ('AVAILABLE', 'OCCUPIED'))
);


-- ============================================================
-- TABLE: parking_sessions
-- Stores every parking transaction
-- ============================================================

CREATE TABLE parking_sessions (
    id BIGSERIAL PRIMARY KEY,

    vehicle_id BIGINT NOT NULL,
    parking_slot_id BIGINT NOT NULL,

    entry_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMPTZ,

    parking_fee NUMERIC(10,2),

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT fk_session_vehicle
        FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(id),

    CONSTRAINT fk_session_slot
        FOREIGN KEY (parking_slot_id)
        REFERENCES parking_slots(id),

    CONSTRAINT chk_session_status
        CHECK (status IN ('ACTIVE', 'COMPLETED')),

    CONSTRAINT chk_exit_time
        CHECK (
            exit_time IS NULL
            OR exit_time >= entry_time
        ),

    CONSTRAINT chk_parking_fee
        CHECK (
            parking_fee IS NULL
            OR parking_fee >= 0
        )
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_vehicles_user_id
    ON vehicles(user_id);

CREATE INDEX idx_parking_sessions_vehicle_id
    ON parking_sessions(vehicle_id);

CREATE INDEX idx_parking_sessions_slot_id
    ON parking_sessions(parking_slot_id);

CREATE INDEX idx_parking_sessions_status
    ON parking_sessions(status);

CREATE INDEX idx_parking_sessions_entry_time
    ON parking_sessions(entry_time);


-- ============================================================
-- INITIAL PARKING SLOTS
-- ============================================================

INSERT INTO parking_slots (slot_number, slot_type)
VALUES
    ('CAR-001', 'CAR'),
    ('CAR-002', 'CAR'),
    ('CAR-003', 'CAR'),
    ('CAR-004', 'CAR'),
    ('CAR-005', 'CAR'),
    ('BIKE-001', 'BIKE'),
    ('BIKE-002', 'BIKE'),
    ('BIKE-003', 'BIKE'),
    ('BIKE-004', 'BIKE'),
    ('BIKE-005', 'BIKE');