"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {

    const router = useRouter();
    const [user, setUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {

        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.replace("/login");
            return;
        }

        try {

            const parsedUser = JSON.parse(storedUser);

            if (parsedUser.role !== "ADMIN") {
                router.replace("/dashboard");
                return;
            }

            setUser(parsedUser);
            setCheckingAuth(false);

        } catch {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            router.replace("/login");
        }

    }, [router]);


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.replace("/login");
    };


    if (checkingAuth) {
        return (
            <main className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-600">
                    Checking authentication...
                </p>
            </main>
        );
    }


    return (
        <main className="min-h-screen bg-gray-100">

            {/* Header */}

            <header className="border-b bg-white">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                    <div>

                        <h1 className="text-xl font-bold text-gray-900">
                            Parking Slot Manager
                        </h1>

                        <p className="text-sm text-gray-500">
                            Administration Portal
                        </p>

                    </div>


                    <div className="flex items-center gap-4">

                        {user && (
                            <div className="text-right">

                                <p className="font-medium text-gray-900">
                                    {user.name}
                                </p>

                                <p className="text-sm text-gray-500">
                                    ADMIN
                                </p>

                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-md bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800"
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </header>


            <div className="mx-auto flex max-w-7xl">

                {/* Sidebar */}

                <aside className="min-h-[calc(100vh-81px)] w-60 border-r bg-white p-4">

                    <nav className="space-y-2">

                        <button
                            onClick={() => router.push("/admin")}
                            className="w-full rounded-md bg-gray-100 px-4 py-3 text-left font-medium text-gray-900"
                        >
                            Dashboard
                        </button>


                        <button
                            onClick={() => router.push("/admin/users")}
                            className="w-full rounded-md px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Users
                        </button>


                        <button
                            onClick={() => router.push("/admin/vehicles")}
                            className="w-full rounded-md px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Vehicles
                        </button>


                        <button
                            onClick={() => router.push("/admin/facilities")}
                            className="w-full rounded-md px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Facilities
                        </button>


                        <button
                            onClick={() => router.push("/admin/areas")}
                            className="w-full rounded-md px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Areas
                        </button>


                        <button
                            onClick={() => router.push("/admin/slots")}
                            className="w-full rounded-md px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Slots
                        </button>


                        <button
                            onClick={() => router.push("/admin/sessions")}
                            className="w-full rounded-md px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Parking Sessions
                        </button>

                    </nav>

                </aside>


                {/* Main Content */}

                <section className="flex-1 p-8">

                    <h2 className="text-2xl font-bold text-gray-900">
                        Admin Dashboard
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Manage users, vehicles, parking facilities,
                        areas, slots and parking sessions.
                    </p>


                    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                        <div className="rounded-lg bg-white p-6 shadow">

                            <h3 className="text-lg font-semibold">
                                Users
                            </h3>

                            <p className="mt-2 text-sm text-gray-600">
                                View and manage registered users.
                            </p>

                            <button
                                onClick={() => router.push("/admin/users")}
                                className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
                            >
                                Manage Users
                            </button>

                        </div>


                        <div className="rounded-lg bg-white p-6 shadow">

                            <h3 className="text-lg font-semibold">
                                Vehicles
                            </h3>

                            <p className="mt-2 text-sm text-gray-600">
                                View vehicles and their owners.
                            </p>

                            <button
                                onClick={() => router.push("/admin/vehicles")}
                                className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
                            >
                                View Vehicles
                            </button>

                        </div>


                        <div className="rounded-lg bg-white p-6 shadow">

                            <h3 className="text-lg font-semibold">
                                Facilities
                            </h3>

                            <p className="mt-2 text-sm text-gray-600">
                                Manage parking facilities.
                            </p>

                            <button
                                onClick={() => router.push("/admin/facilities")}
                                className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
                            >
                                Manage Facilities
                            </button>

                        </div>


                        <div className="rounded-lg bg-white p-6 shadow">

                            <h3 className="text-lg font-semibold">
                                Areas
                            </h3>

                            <p className="mt-2 text-sm text-gray-600">
                                Manage areas inside parking facilities.
                            </p>

                            <button
                                onClick={() => router.push("/admin/areas")}
                                className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
                            >
                                Manage Areas
                            </button>

                        </div>


                        <div className="rounded-lg bg-white p-6 shadow">

                            <h3 className="text-lg font-semibold">
                                Parking Slots
                            </h3>

                            <p className="mt-2 text-sm text-gray-600">
                                Add and manage individual parking slots.
                            </p>

                            <button
                                onClick={() => router.push("/admin/slots")}
                                className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
                            >
                                Manage Slots
                            </button>

                        </div>


                        <div className="rounded-lg bg-white p-6 shadow">

                            <h3 className="text-lg font-semibold">
                                Parking Sessions
                            </h3>

                            <p className="mt-2 text-sm text-gray-600">
                                Monitor and manage all parking sessions.
                            </p>

                            <button
                                onClick={() => router.push("/admin/sessions")}
                                className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
                            >
                                Manage Sessions
                            </button>

                        </div>

                    </div>

                </section>

            </div>

        </main>
    );
}
