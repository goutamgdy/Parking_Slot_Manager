"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser } from "../../lib/api";

export default function AdminLayout({ children }) {

    const router = useRouter();
    const pathname = usePathname();

    const [user, setUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);


    useEffect(() => {
        let cancelled = false;

        const verifyAdmin = async () => {
            try {
                const response = await getCurrentUser();
                const currentUser = response.user;

                if (currentUser.role !== "ADMIN") {
                    router.replace("/dashboard");
                    return;
                }

                if (!cancelled) {
                    setUser(currentUser);
                    setCheckingAuth(false);
                }
            } catch {
                if (!cancelled) {
                    setCheckingAuth(false);
                }
            }
        };

        verifyAdmin();

        return () => {
            cancelled = true;
        };
    }, [router]);


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.replace("/login");

    };


    const isActive = (path) => {

        if (path === "/admin") {
            return pathname === "/admin";
        }

        return pathname.startsWith(path);

    };


    if (checkingAuth) {

        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">

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
                            onClick={() =>
                                router.push("/admin")
                            }
                            className={`w-full rounded-md px-4 py-3 text-left font-medium ${
                                isActive("/admin")
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Dashboard
                        </button>


                        <button
                            onClick={() =>
                                router.push("/admin/users")
                            }
                            className={`w-full rounded-md px-4 py-3 text-left font-medium ${
                                isActive("/admin/users")
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Users
                        </button>


                        <button
                            onClick={() =>
                                router.push("/admin/vehicles")
                            }
                            className={`w-full rounded-md px-4 py-3 text-left font-medium ${
                                isActive("/admin/vehicles")
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Vehicles
                        </button>


                        <button
                            onClick={() =>
                                router.push("/admin/facilities")
                            }
                            className={`w-full rounded-md px-4 py-3 text-left font-medium ${
                                isActive("/admin/facilities")
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Facilities
                        </button>


                        <button
                            onClick={() =>
                                router.push("/admin/areas")
                            }
                            className={`w-full rounded-md px-4 py-3 text-left font-medium ${
                                isActive("/admin/areas")
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Areas
                        </button>


                        <button
                            onClick={() =>
                                router.push("/admin/slots")
                            }
                            className={`w-full rounded-md px-4 py-3 text-left font-medium ${
                                isActive("/admin/slots")
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Slots
                        </button>


                        <button
                            onClick={() =>
                                router.push("/admin/sessions")
                            }
                            className={`w-full rounded-md px-4 py-3 text-left font-medium ${
                                isActive("/admin/sessions")
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Parking Sessions
                        </button>

                    </nav>

                </aside>


                {/* Page */}

                <section className="min-w-0 flex-1 p-8">

                    {children}

                </section>

            </div>

        </main>

    );
}