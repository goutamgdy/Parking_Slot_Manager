"use client";

import { useEffect, useState } from "react";

import {
    getAdminFacilities,
    createFacility,
    updateFacility,
    updateFacilityStatus
} from "../../../lib/api";


export default function AdminFacilitiesPage() {

    const [facilities, setFacilities] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [name, setName] = useState("");
    const [location, setLocation] = useState("");


    const loadFacilities = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getAdminFacilities();

            setFacilities(data);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadFacilities();

    }, []);


    const resetForm = () => {

        setEditingId(null);
        setName("");
        setLocation("");

    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        if (!name.trim()) {

            setError("Facility name is required");
            return;

        }

        try {

            setActionLoading(true);
            setError("");
            setSuccess("");

            let result;

            if (editingId) {

                result = await updateFacility(
                    editingId,
                    name,
                    location
                );

                setSuccess(
                    "Parking facility updated successfully"
                );

            } else {

                result = await createFacility(
                    name,
                    location
                );

                setSuccess(
                    "Parking facility created successfully"
                );

            }

            setFacilities((current) => {

                if (editingId) {

                    return current.map((item) =>
                        item.id === editingId
                            ? result
                            : item
                    );

                }

                return [...current, result];

            });

            resetForm();

        } catch (err) {

            setError(err.message);

        } finally {

            setActionLoading(false);

        }

    };


    const handleEdit = (facility) => {

        setEditingId(facility.id);
        setName(facility.name);
        setLocation(facility.location || "");

        setError("");
        setSuccess("");

    };


    const handleStatusChange = async (facility) => {

        const newStatus =
            facility.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        try {

            setActionLoading(true);
            setError("");
            setSuccess("");

            const updated =
                await updateFacilityStatus(
                    facility.id,
                    newStatus
                );

            setFacilities((current) =>
                current.map((item) =>
                    item.id === facility.id
                        ? updated
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
                    Parking Facilities
                </h2>

                <p className="mt-1 text-gray-600">
                    Create and manage parking facilities.
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
                        ? "Edit Facility"
                        : "Create Facility"}

                </h3>


                <form
                    onSubmit={handleSubmit}
                    className="grid gap-4 md:grid-cols-2"
                >

                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Facility Name
                        </label>

                        <input
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="e.g. Phoenix Mall Parking"
                            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                        />

                    </div>


                    <div>

                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Location
                        </label>

                        <input
                            value={location}
                            onChange={(event) =>
                                setLocation(event.target.value)
                            }
                            placeholder="e.g. Pune"
                            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                        />

                    </div>


                    <div className="flex gap-3 md:col-span-2">

                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="rounded-md bg-black px-5 py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {actionLoading
                                ? "Saving..."
                                : editingId
                                ? "Update Facility"
                                : "Create Facility"}
                        </button>


                        {editingId && (

                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-md border px-5 py-2 font-semibold text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                        )}

                    </div>

                </form>

            </div>


            {/* Facilities */}

            <div className="overflow-hidden rounded-lg bg-white shadow">

                {loading ? (

                    <div className="p-8 text-center text-gray-600">
                        Loading facilities...
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
                                        Name
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Location
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

                                {facilities.map((facility) => (

                                    <tr
                                        key={facility.id}
                                        className="hover:bg-gray-50"
                                    >

                                        <td className="px-6 py-4 text-sm">
                                            {facility.id}
                                        </td>

                                        <td className="px-6 py-4 font-medium">
                                            {facility.name}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {facility.location || "-"}
                                        </td>

                                        <td className="px-6 py-4">

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    facility.status === "ACTIVE"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {facility.status}
                                            </span>

                                        </td>

                                        <td className="px-6 py-4">

                                            <div className="flex gap-2">

                                                <button
                                                    type="button"
                                                    disabled={actionLoading}
                                                    onClick={() =>
                                                        handleEdit(facility)
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
                                                            facility
                                                        )
                                                    }
                                                    className="rounded-md border px-3 py-2 text-xs font-semibold hover:bg-gray-100 disabled:opacity-50"
                                                >
                                                    {facility.status === "ACTIVE"
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