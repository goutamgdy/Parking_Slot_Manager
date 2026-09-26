"use client";

import { useEffect, useState } from "react";

import {
    getParkingSlots,
    getActiveParkingSessions,
    getParkingSessionHistory,
    getVehicles,
    createParkingSession,
    exitParkingSession
} from "../lib/api";

export default function Home() {
    const [parkingSlots, setParkingSlots] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [sessionHistory, setSessionHistory] = useState([]);
    const [vehicles, setVehicles] = useState([]);   

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [vehicleId, setVehicleId] = useState("");
    const [slotId, setSlotId] = useState("");
    const [creatingSession, setCreatingSession] = useState(false);
    const [exitingSessionId, setExitingSessionId] = useState(null);

    const [successMessage, setSuccessMessage] = useState("");
    const [exitMessage, setExitMessage] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [
                    slots,
                    activeSessions,
                    history,
                    vehicles
                ] = await Promise.all([
                    getParkingSlots(),
                    getActiveParkingSessions(),
                    getParkingSessionHistory(),
                    getVehicles()
                ]);

                setParkingSlots(slots);
                setActiveSessions(activeSessions);
                setSessionHistory(history);
                setVehicles(vehicles);

            } catch (error) {
                setError({
                    message: error.message,
                    status: error.status
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const totalSlots = parkingSlots.length;

    const availableSlots = parkingSlots.filter(
        (slot) => slot.status === "AVAILABLE"
    ).length;

    const occupiedSlots = parkingSlots.filter(
        (slot) => slot.status === "OCCUPIED"
    ).length;

    const handleCreateParkingSession = async (event) => {
        event.preventDefault();

        setError(null);
        setSuccessMessage("");
        setExitMessage("");
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

            const [updatedSlots, updatedSessions, updatedHistory] =
                await Promise.all([
                    getParkingSlots(),
                    getActiveParkingSessions(),
                    getParkingSessionHistory()
                ]);

            setParkingSlots(updatedSlots);
            setActiveSessions(updatedSessions);
            setSessionHistory(updatedHistory);

        } catch (error) {
            setError({
                message: error.message,
                status: error.status
            });

        } finally {
            setCreatingSession(false);
        }
    };

    const handleExitParkingSession = async (sessionId) => {
        setError(null);
        setSuccessMessage("");
        setExitMessage("");
        setExitingSessionId(sessionId);

        try {
            const session = await exitParkingSession(sessionId);

            setExitMessage(
                `Parking session ${session.id} completed successfully. Parking fee: ₹${session.parking_fee}`
            );

            const [updatedSlots, updatedSessions, updatedHistory] =
                await Promise.all([
                    getParkingSlots(),
                    getActiveParkingSessions(),
                    getParkingSessionHistory()
                ]);

            setParkingSlots(updatedSlots);
            setActiveSessions(updatedSessions);
            setSessionHistory(updatedHistory);

        } catch (error) {
            setError({
                message: error.message,
                status: error.status
            });

        } finally {
            setExitingSessionId(null);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">

            <div className="mx-auto max-w-6xl">

                <h1 className="text-3xl font-bold text-gray-900">
                    Parking Slot Manager
                </h1>

                <p className="mt-2 text-gray-600">
                    Parking management dashboard
                </p>

                {loading && (
                    <p className="mt-6 text-gray-600">
                        Loading parking data...
                    </p>
                )}

                {error && (
                    <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">

                        <div className="flex items-start justify-between gap-4">

                            <div>

                                <p className="font-semibold text-red-800">
                                    {error.status === 409
                                        ? "Unable to complete operation"
                                        : "Something went wrong"}
                                </p>

                                <p className="mt-1 text-red-700">
                                    {error.message}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() => setError(null)}
                                className="font-semibold text-red-700"
                            >
                                ×
                            </button>

                        </div>

                    </div>
                )}

                {!loading && (
                    <>

                        {/* Dashboard Statistics */}

                        <div className="mt-8 grid gap-6 md:grid-cols-3">

                            <div className="rounded-lg bg-white p-6 shadow">

                                <h2 className="text-lg font-semibold text-gray-800">
                                    Total Slots
                                </h2>

                                <p className="mt-3 text-3xl font-bold text-gray-900">
                                    {totalSlots}
                                </p>

                            </div>

                            <div className="rounded-lg bg-white p-6 shadow">

                                <h2 className="text-lg font-semibold text-gray-800">
                                    Available
                                </h2>

                                <p className="mt-3 text-3xl font-bold text-green-600">
                                    {availableSlots}
                                </p>

                            </div>

                            <div className="rounded-lg bg-white p-6 shadow">

                                <h2 className="text-lg font-semibold text-gray-800">
                                    Occupied
                                </h2>

                                <p className="mt-3 text-3xl font-bold text-red-600">
                                    {occupiedSlots}
                                </p>

                            </div>

                        </div>

                        {/* Park Vehicle */}

                        <div className="mt-10 rounded-lg bg-white p-6 shadow">

                            <h2 className="text-xl font-semibold text-gray-800">
                                Park Vehicle
                            </h2>

                            <form
                                onSubmit={handleCreateParkingSession}
                                className="mt-6 grid gap-4 md:grid-cols-3"
                            >

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Vehicle
                                    </label>

                                    <select
                                        value={vehicleId}
                                        onChange={(event) =>
                                            setVehicleId(event.target.value)
                                        }
                                        className="mt-2 w-full rounded-md border border-gray-300 p-2"
                                    >
                                        <option value="">
                                            Select a vehicle
                                        </option>

                                        {vehicles.map((vehicle) => (
                                            <option
                                                key={vehicle.id}
                                                value={vehicle.id}
                                            >
                                                {vehicle.vehicle_number} - {vehicle.vehicle_type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        Slot ID
                                    </label>

                                    <input
                                        type="number"
                                        value={slotId}
                                        onChange={(event) =>
                                            setSlotId(event.target.value)
                                        }
                                        placeholder="Example: 1"
                                        className="mt-2 w-full rounded-md border border-gray-300 p-2"
                                    />

                                </div>

                                <div className="flex items-end">

                                    <button
                                        type="submit"
                                        disabled={creatingSession}
                                        className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                                    >
                                        {creatingSession
                                            ? "Parking..."
                                            : "Park Vehicle"}
                                    </button>

                                </div>

                            </form>

                            {successMessage && (
                                <p className="mt-4 text-green-600">
                                    {successMessage}
                                </p>
                            )}

                        </div>

                        {/* Vehicles */}

                        <div className="mt-10 rounded-lg bg-white p-6 shadow">

                            <h2 className="text-xl font-semibold text-gray-800">
                                Vehicles
                            </h2>

                            {vehicles.length === 0 ? (

                                <p className="mt-4 text-gray-600">
                                    No vehicles found.
                                </p>

                            ) : (

                                <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">

                                    {vehicles.map((vehicle) => (

                                        <div
                                            key={vehicle.id}
                                            className="rounded-lg border border-gray-200 p-4"
                                        >

                                            <p className="font-semibold text-gray-900">
                                                {vehicle.vehicle_number}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                Type: {vehicle.vehicle_type}
                                            </p>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                        {/* Active Parking Sessions */}

                        <div className="mt-10 rounded-lg bg-white p-6 shadow">

                            <h2 className="text-xl font-semibold text-gray-800">
                                Active Parking Sessions
                            </h2>

                            {activeSessions.length === 0 ? (
                                <p className="mt-4 text-gray-600">
                                    No active parking sessions.
                                </p>
                            ) : (
                                <div className="mt-6 space-y-4">

                                    {activeSessions.map((session) => (

                                        <div
                                            key={session.id}
                                            className="rounded-lg border border-gray-200 p-4"
                                        >

                                            <div className="grid gap-4 md:grid-cols-4">

                                                <div>

                                                    <p className="text-sm text-gray-500">
                                                        Vehicle
                                                    </p>

                                                    <p className="font-semibold text-gray-900">
                                                        {session.vehicle_number}
                                                    </p>

                                                </div>

                                                <div>

                                                    <p className="text-sm text-gray-500">
                                                        Slot
                                                    </p>

                                                    <p className="font-semibold text-gray-900">
                                                        {session.slot_number}
                                                    </p>

                                                </div>

                                                <div>

                                                    <p className="text-sm text-gray-500">
                                                        Entry Time
                                                    </p>

                                                    <p className="font-semibold text-gray-900">
                                                        {new Date(
                                                            session.entry_time
                                                        ).toLocaleString()}
                                                    </p>

                                                </div>

                                                <div className="flex items-end">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleExitParkingSession(
                                                                session.id
                                                            )
                                                        }
                                                        disabled={
                                                            exitingSessionId ===
                                                            session.id
                                                        }
                                                        className="w-full rounded-md bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                                                    >
                                                        {exitingSessionId ===
                                                        session.id
                                                            ? "Exiting..."
                                                            : "Exit Vehicle"}
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                </div>
                            )}

                            {exitMessage && (
                                <p className="mt-4 text-green-600">
                                    {exitMessage}
                                </p>
                            )}

                        </div>

                        {/* Parking Session History */}

                        <div className="mt-10 rounded-lg bg-white p-6 shadow">

                            <h2 className="text-xl font-semibold text-gray-800">
                                Parking Session History
                            </h2>

                            {sessionHistory.length === 0 ? (
                                <p className="mt-4 text-gray-600">
                                    No completed parking sessions.
                                </p>
                            ) : (
                                <div className="mt-6 overflow-x-auto">

                                    <table className="min-w-full border-collapse">

                                        <thead>

                                            <tr className="border-b border-gray-200 text-left">

                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                                    Vehicle
                                                </th>

                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                                    Slot
                                                </th>

                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                                    Entry Time
                                                </th>

                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                                    Exit Time
                                                </th>

                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                                    Fee
                                                </th>

                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                                    Status
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {sessionHistory.map((session) => (

                                                <tr
                                                    key={session.id}
                                                    className="border-b border-gray-100"
                                                >

                                                    <td className="px-4 py-3 font-medium text-gray-900">
                                                        {session.vehicle_number}
                                                    </td>

                                                    <td className="px-4 py-3 text-gray-700">
                                                        {session.slot_number}
                                                    </td>

                                                    <td className="px-4 py-3 text-gray-700">
                                                        {new Date(
                                                            session.entry_time
                                                        ).toLocaleString()}
                                                    </td>

                                                    <td className="px-4 py-3 text-gray-700">
                                                        {new Date(
                                                            session.exit_time
                                                        ).toLocaleString()}
                                                    </td>

                                                    <td className="px-4 py-3 font-semibold text-gray-900">
                                                        ₹{session.parking_fee}
                                                    </td>

                                                    <td className="px-4 py-3">

                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                                            {session.status}
                                                        </span>

                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>
                            )}

                        </div>

                        {/* Parking Slots */}

                        <div className="mt-10 rounded-lg bg-white p-6 shadow">

                            <h2 className="text-xl font-semibold text-gray-800">
                                Parking Slots
                            </h2>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-5">

                                {parkingSlots.map((slot) => (

                                    <div
                                        key={slot.id}
                                        className={`rounded-lg border p-4 ${
                                            slot.status === "AVAILABLE"
                                                ? "border-green-200 bg-green-50"
                                                : "border-red-200 bg-red-50"
                                        }`}
                                    >

                                        <p className="font-semibold">
                                            {slot.slot_number}
                                        </p>

                                        <p className="mt-1 text-sm">
                                            {slot.status}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-600">
                                            Type: {slot.slot_type}
                                        </p>

                                    </div>

                                ))}

                            </div>

                        </div>

                    </>
                )}

            </div>

        </main>
    );
}