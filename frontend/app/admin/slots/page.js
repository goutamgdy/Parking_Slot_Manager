"use client";

import { useEffect, useState } from "react";
import {
    createParkingSlot,
    getAdminAreas,
    getAdminParkingSlots,
    updateParkingSlotStatus
} from "../../../lib/api";

export default function AdminSlotsPage() {
    const [slots, setSlots] = useState([]);
    const [areas, setAreas] = useState([]);
    const [areaId, setAreaId] = useState("");
    const [slotNumber, setSlotNumber] = useState("");
    const [slotType, setSlotType] = useState("CAR");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const load = async () => {
        try {
            setLoading(true);
            setError("");

            const [slotData, areaData] = await Promise.all([
                getAdminParkingSlots(),
                getAdminAreas()
            ]);

            setSlots(slotData);
            setAreas(areaData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const resetForm = () => {
        setAreaId("");
        setSlotNumber("");
        setSlotType("CAR");
    };

    const create = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!areaId) {
            setError("Please select an area");
            return;
        }

        if (!slotNumber.trim()) {
            setError("Slot number is required");
            return;
        }

        try {
            setActionLoading(true);

            await createParkingSlot(
                Number(areaId),
                slotNumber.trim().toUpperCase(),
                slotType
            );

            resetForm();
            setSuccess("Parking slot created successfully");
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const toggle = async (slot) => {
        const newStatus =
            slot.status === "AVAILABLE"
                ? "INACTIVE"
                : "AVAILABLE";

        setError("");
        setSuccess("");

        try {
            setActionLoading(true);

            await updateParkingSlotStatus(
                slot.id,
                newStatus
            );

            setSuccess(
                newStatus === "INACTIVE"
                    ? `${slot.slot_number} has been disabled`
                    : `${slot.slot_number} is available again`
            );

            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const activeAreas = areas.filter(
        (area) => area.status === "ACTIVE"
    );

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Parking Slots
                </h1>
                <p className="mt-1 text-gray-600">
                    Create and manage slots inside parking areas.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-700"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="mb-4 rounded-md border border-green-200 bg-green-50 p-4 text-green-700"
                >
                    {success}
                </div>
            )}

            <div className="rounded-lg bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                    Add Parking Slot
                </h2>

                {activeAreas.length === 0 ? (
                    <p className="mt-3 rounded-md bg-gray-50 p-4 text-sm text-gray-600">
                        No active parking areas are available. Create or activate
                        an area before adding a slot.
                    </p>
                ) : (
                    <form
                        onSubmit={create}
                        className="mt-4 grid gap-4 md:grid-cols-4"
                    >
                        <div>
                            <label
                                htmlFor="slot-area"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Area
                            </label>
                            <select
                                id="slot-area"
                                value={areaId}
                                onChange={(event) =>
                                    setAreaId(event.target.value)
                                }
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="">Select area</option>
                                {activeAreas.map((area) => (
                                    <option
                                        key={area.id}
                                        value={area.id}
                                    >
                                        {area.facility_name
                                            ? `${area.facility_name} / ${area.name}`
                                            : area.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="slot-number"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Slot Number
                            </label>
                            <input
                                id="slot-number"
                                value={slotNumber}
                                onChange={(event) =>
                                    setSlotNumber(
                                        event.target.value.toUpperCase()
                                    )
                                }
                                placeholder="CAR-001"
                                maxLength={20}
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="slot-type"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Slot Type
                            </label>
                            <select
                                id="slot-type"
                                value={slotType}
                                onChange={(event) =>
                                    setSlotType(event.target.value)
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="CAR">CAR</option>
                                <option value="BIKE">BIKE</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full rounded-md bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                                {actionLoading
                                    ? "Saving..."
                                    : "Add Slot"}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm">
                {loading ? (
                    <div className="p-8 text-center text-gray-600">
                        Loading parking slots...
                    </div>
                ) : slots.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">
                        No parking slots found.
                    </div>
                ) : (
                    <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                        {slots.map((slot) => {
                            const isOccupied = slot.status === "OCCUPIED";
                            const isAvailable = slot.status === "AVAILABLE";

                            return (
                                <article
                                    key={slot.id}
                                    className="rounded-lg border border-gray-200 p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="font-bold text-gray-900">
                                                {slot.slot_number}
                                            </h2>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {slot.facility_name} / {slot.area_name}
                                            </p>
                                        </div>

                                        <span
                                            className={
                                                "rounded-full px-2.5 py-1 text-xs font-semibold " +
                                                (isAvailable
                                                    ? "bg-green-100 text-green-700"
                                                    : isOccupied
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-gray-100 text-gray-700")
                                            }
                                        >
                                            {slot.status}
                                        </span>
                                    </div>

                                    <p className="mt-4 text-sm text-gray-600">
                                        Type:{" "}
                                        <span className="font-medium text-gray-900">
                                            {slot.slot_type}
                                        </span>
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => toggle(slot)}
                                        disabled={
                                            actionLoading ||
                                            isOccupied
                                        }
                                        title={
                                            isOccupied
                                                ? "Occupied slots cannot be manually disabled"
                                                : undefined
                                        }
                                        className="mt-4 rounded-md border px-3 py-2 text-sm font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isAvailable
                                            ? "Disable Slot"
                                            : "Enable Slot"}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
