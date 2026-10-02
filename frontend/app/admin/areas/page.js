"use client";

import { useEffect, useState } from "react";

import {
    getAdminAreas,
    getAdminFacilities,
    createArea,
    updateArea,
    updateAreaStatus
} from "../../../lib/api";


export default function AdminAreasPage() {

    const [areas, setAreas] = useState([]);
    const [facilities, setFacilities] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [facilityId, setFacilityId] = useState("");
    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState("");


    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                areasData,
                facilitiesData
            ] = await Promise.all([
                getAdminAreas(),
                getAdminFacilities()
            ]);

            setAreas(areasData);
            setFacilities(facilitiesData);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadData();

    }, []);


    const resetForm = () => {

        setEditingId(null);
        setFacilityId("");
        setName("");
        setCapacity("");

    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        if (!editingId && !facilityId) {

            setError("Please select a facility");
            return;

        }

        if (!name.trim()) {

            setError("Area name is required");
            return;

        }

        if (
            !capacity ||
            Number(capacity) <= 0
        ) {

            setError(
                "Capacity must be greater than zero"
            );

            return;

        }


        try {

            setActionLoading(true);
            setError("");
            setSuccess("");

            let result;

            if (editingId) {

                result = await updateArea(
                    editingId,
                    name,
                    Number(capacity)
                );

                setAreas((current) =>
                    current.map((item) =>
                        item.id === editingId
                            ? {
                                ...item,
                                ...result
                            }
                            : item
                    )
                );

                setSuccess(
                    "Parking area updated successfully"
                );

            } else {

                result = await createArea(
                    Number(facilityId),
                    name,
                    Number(capacity)
                );

                const selectedFacility =
                    facilities.find(
                        (facility) =>
                            facility.id === Number(facilityId)
                    );

                setAreas((current) => [
                    ...current,
                    {
                        ...result,
                        facility_name:
                            selectedFacility?.name || "-"
                    }
                ]);

                setSuccess(
                    "Parking area created successfully"
                );

            }

            resetForm();

        } catch (err) {

            setError(err.message);

        } finally {

            setActionLoading(false);

        }

    };


    const handleEdit = (area) => {

        setEditingId(area.id);
        setFacilityId(String(area.facility_id));
        setName(area.name);
        setCapacity(String(area.capacity));

        setError("");
        setSuccess("");

    };


    const handleStatusChange = async (area) => {

        const newStatus =
            area.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        try {

            setActionLoading(true);
            setError("");
            setSuccess("");

            const updated =
                await updateAreaStatus(
                    area.id,
                    newStatus
                );

            setAreas((current) =>
                current.map((item) =>
                    item.id === area.id
                        ? {
                            ...item,
                            ...updated
                        }
                        : item
                )
            );

            setSuccess(
                `${updated.name} is now ${updated.status}`
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setActionLoading(false);

        }

    };


    return (

        <div>

            <div className="mb-6">

                <h2 className="text-2xl font-bold text-gray-900">
                    Parking Areas
                </h2>

                <p className="mt-1 text-gray-600">
                    Manage areas inside parking facilities.
                </p>

            </div>


            {error && (

                <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>

            )}


            {success && (

                <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-4 text-green-700">
                    {success}
                </div>

            )}


            {/* Form */}

            <div className="mb-8 rounded-lg bg-white p-6 shadow">

                <h3 className="mb-4 text-lg font-semibold">

                    {editingId
                        ? "Edit Area"
                        : "Create Area"}

                </h3>


                <form
                    onSubmit={handleSubmit}
                    className="grid gap-4 md:grid-cols-3"
                >

                    {!editingId && (

                        <div>

                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Facility
                            </label>

                            <select
                                value={facilityId}
                                onChange={(event) =>
                                    setFacilityId(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-md border px-3 py-2"
                            >

                                <option value="">
                                    Select facility
                                </option>

                                {facilities
                                    .filter(
                                        (facility) =>
                                            facility.status === "ACTIVE"
                                    )
                                    .map((facility) => (

                                        <option
                                            key={facility.id}
                                            value={facility.id}
                                        >
                                            {facility.name}
                                        </option>

                                    ))}

                            </select>

                        </div>

                    )}


                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Area Name
                        </label>

                        <input
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="e.g. Basement 1"
                            className="w-full rounded-md border px-3 py-2"
                        />

                    </div>


                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Capacity
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={capacity}
                            onChange={(event) =>
                                setCapacity(event.target.value)
                            }
                            placeholder="e.g. 20"
                            className="w-full rounded-md border px-3 py-2"
                        />

                    </div>


                    <div className="flex gap-3 md:col-span-3">

                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="rounded-md bg-black px-5 py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {actionLoading
                                ? "Saving..."
                                : editingId
                                ? "Update Area"
                                : "Create Area"}
                        </button>


                        {editingId && (

                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-md border px-5 py-2 font-semibold hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                        )}

                    </div>

                </form>

            </div>


            {/* Areas */}

            <div className="overflow-hidden rounded-lg bg-white shadow">

                {loading ? (

                    <div className="p-8 text-center text-gray-600">
                        Loading areas...
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="border-b bg-gray-50">

                                <tr>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        ID
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Facility
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Area
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Capacity
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Slots
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Occupied
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y">

                                {areas.map((area) => (

                                    <tr
                                        key={area.id}
                                        className="hover:bg-gray-50"
                                    >

                                        <td className="px-6 py-4 text-sm">
                                            {area.id}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {area.facility_name}
                                        </td>

                                        <td className="px-6 py-4 font-medium">
                                            {area.name}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {area.capacity}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {area.slot_count ?? 0}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {area.occupied_slot_count ?? 0}
                                        </td>

                                        <td className="px-6 py-4">

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    area.status === "ACTIVE"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {area.status}
                                            </span>

                                        </td>

                                        <td className="px-6 py-4">

                                            <div className="flex gap-2">

                                                <button
                                                    type="button"
                                                    disabled={actionLoading}
                                                    onClick={() =>
                                                        handleEdit(area)
                                                    }
                                                    className="rounded-md border px-3 py-2 text-xs font-semibold hover:bg-gray-100 disabled:opacity-50"
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    type="button"
                                                    disabled={actionLoading}
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            area
                                                        )
                                                    }
                                                    className="rounded-md border px-3 py-2 text-xs font-semibold hover:bg-gray-100 disabled:opacity-50"
                                                >
                                                    {area.status === "ACTIVE"
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );

}