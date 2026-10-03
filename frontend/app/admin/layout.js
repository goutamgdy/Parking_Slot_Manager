"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser } from "../../lib/api";

const navigation = [
    {
        label: "Overview",
        items: [
            { label: "Dashboard", path: "/admin" }
        ]
    },
    {
        label: "Parking Management",
        items: [
            { label: "Facilities", path: "/admin/facilities" },
            { label: "Areas", path: "/admin/areas" },
            { label: "Slots", path: "/admin/slots" },
            { label: "Parking Sessions", path: "/admin/sessions" }
        ]
    },
    {
        label: "People & Vehicles",
        items: [
            { label: "Users", path: "/admin/users" },
            { label: "Vehicles", path: "/admin/vehicles" }
        ]
    }
];

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

    const handleLogout = async () => {
        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );
        } finally {
            localStorage.removeItem("user");
            router.replace("/login");
        }
    };

    const isActive = (path) => {
        if (path === "/admin") {
            return pathname === "/admin";
        }

        return pathname.startsWith(path);
    };

    const getNavClass = (active) =>
        "whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium md:w-full md:px-4 md:py-3 " +
        (active
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100");

    if (checkingAuth) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-gray-600">Checking authentication...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100">
            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Parking Slot Manager
                        </h1>
                        <p className="text-sm text-gray-500">
                            Administration Portal
                        </p>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        {user && (
                            <div className="hidden text-right sm:block">
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
                            className="rounded-md bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
                <aside className="border-b bg-white md:min-h-[calc(100vh-81px)] md:w-60 md:border-b-0 md:border-r">
                    <nav
                        aria-label="Administration navigation"
                        className="flex gap-1 overflow-x-auto p-3 md:block md:space-y-5 md:p-4"
                    >
                        {navigation.map((group) => (
                            <div key={group.label} className="shrink-0">
                                <p className="hidden px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 md:block">
                                    {group.label}
                                </p>

                                <div className="flex gap-1 md:block md:space-y-1">
                                    {group.items.map((item) => (
                                        <button
                                            key={item.path}
                                            type="button"
                                            onClick={() => router.push(item.path)}
                                            aria-current={
                                                isActive(item.path)
                                                    ? "page"
                                                    : undefined
                                            }
                                            className={getNavClass(
                                                isActive(item.path)
                                            )}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                <section className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </section>
            </div>
        </main>
    );
}