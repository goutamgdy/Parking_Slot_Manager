"use client";

import { useEffect, useState } from "react";
import {
    getAdminUsers,
    updateUserRole,
    updateUserStatus
} from "../../../lib/api";


export default function AdminUsersPage() {

    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            return;
        }

        try {
            setUser(JSON.parse(storedUser));
        } catch {
            setUser(null);
        }
    }, []);


    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        const fetchUsers = async () => {

            try {

                setLoading(true);
                setError("");

                const data = await getAdminUsers();

                setUsers(data);

            } catch (err) {

                setError(err.message);

            } finally {

                setLoading(false);

            }

        };

        fetchUsers();

    }, []);


    const handleRoleChange = async (
        userId,
        currentRole
    ) => {

        const newRole =
            currentRole === "ADMIN"
                ? "USER"
                : "ADMIN";

        try {

            setActionLoading(`role-${userId}`);
            setError("");
            setSuccess("");

            const updatedUser =
                await updateUserRole(
                    userId,
                    newRole
                );

            setUsers((currentUsers) =>
                currentUsers.map((item) =>
                    item.id === userId
                        ? updatedUser
                        : item
                )
            );

            setSuccess(
                `${updatedUser.name}'s role changed to ${updatedUser.role}`
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setActionLoading(null);

        }

    };


    const handleStatusChange = async (
        userId,
        currentStatus
    ) => {

        const newStatus =
            currentStatus === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        try {

            setActionLoading(`status-${userId}`);
            setError("");
            setSuccess("");

            const updatedUser =
                await updateUserStatus(
                    userId,
                    newStatus
                );

            setUsers((currentUsers) =>
                currentUsers.map((item) =>
                    item.id === userId
                        ? updatedUser
                        : item
                )
            );

            setSuccess(
                `${updatedUser.name}'s status changed to ${updatedUser.status}`
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setActionLoading(null);

        }

    };





    return (
        <div>
        <div className="mb-6">

            <h2 className="text-2xl font-bold text-gray-900">
                User Management
            </h2>

            <p className="mt-1 text-gray-600">
                View users and manage their roles and account status.
            </p>

        </div>


        {/* Error */}

        {error && (

            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">

                {error}

            </div>

        )}


        {/* Success */}

        {success && (

            <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-4 text-green-700">

                {success}

            </div>

        )}


        {/* Loading */}

        {loading ? (

            <div className="rounded-lg bg-white p-8 text-center shadow">

                <p className="text-gray-600">
                    Loading users...
                </p>

            </div>

        ) : (

            <div className="overflow-hidden rounded-lg bg-white shadow">

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead className="border-b bg-gray-50">

                            <tr>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    ID
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Name
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Email
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Role
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody className="divide-y">

                            {users.map((item) => (

                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50"
                                >

                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {item.id}
                                    </td>


                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {item.name}
                                    </td>


                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {item.email}
                                    </td>


                                    <td className="px-6 py-4">

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                item.role === "ADMIN"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-blue-100 text-blue-700"
                                            }`}
                                        >
                                            {item.role}
                                        </span>

                                    </td>


                                    <td className="px-6 py-4">

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                item.status === "ACTIVE"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {item.status}
                                        </span>

                                    </td>


                                    <td className="px-6 py-4">

                                        <div className="flex flex-wrap gap-2">

                                            <button
                                                type="button"
                                                disabled={
                                                    actionLoading !== null ||
                                                    item.id === user.userId ||
                                                    item.id === user.id
                                                }
                                                onClick={() =>
                                                    handleRoleChange(
                                                        item.id,
                                                        item.role
                                                    )
                                                }
                                                className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {actionLoading ===
                                                `role-${item.id}`
                                                    ? "Updating..."
                                                    : item.role === "ADMIN"
                                                    ? "Make User"
                                                    : "Make Admin"}
                                            </button>


                                            <button
                                                type="button"
                                                disabled={
                                                    actionLoading !== null ||
                                                    item.id === user.userId ||
                                                    item.id === user.id
                                                }
                                                onClick={() =>
                                                    handleStatusChange(
                                                        item.id,
                                                        item.status
                                                    )
                                                }
                                                className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {actionLoading ===
                                                `status-${item.id}`
                                                    ? "Updating..."
                                                    : item.status === "ACTIVE"
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

            </div>

        )}


        </div>
    );
}
