"use client";

import { useEffect, useState } from "react";
import {
    getParkingSlots,
    createParkingSession
} from "../lib/api";

export default function Home() {
    const [parkingSlots, setParkingSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [vehicleId, setVehicleId] = useState("");
    const [slotId, setSlotId] = useState("");
    const [creatingSession, setCreatingSession] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchParkingSlots = async () => {
            try {
                const data = await getParkingSlots();

                setParkingSlots(data);

            } catch (error) {
                setError(error.message);

            } finally {
                setLoading(false);
            }
        };

        fetchParkingSlots();
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
                        Loading parking slots...
                    </p>
                )}

                {error && (
                    <p className="mt-6 text-red-600">
                        Error: {error}
                    </p>
                )}

                {!loading && !error && (
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
                                        Vehicle ID
                                    </label>

                                    <input
                                        type="number"
                                        value={vehicleId}
                                        onChange={(event) =>
                                            setVehicleId(event.target.value)
                                        }
                                        placeholder="Example: 1"
                                        className="mt-2 w-full rounded-md border border-gray-300 p-2"
                                    />
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
