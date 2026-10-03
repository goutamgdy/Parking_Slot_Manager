"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    getAdminFacilities,
    getAdminAreas,
    getAdminParkingSlots,
    getAdminUsers,
    getAdminParkingSessions
} from "../../lib/api";

const managementGroups = [
    {
        title: "Parking Management",
        description: "Manage the physical parking structure from facility to individual slot.",
        items: [
            {
                title: "Facilities",
                description: "Create and manage parking facilities.",
                buttonText: "Manage Facilities",
                href: "/admin/facilities"
            },
            {
                title: "Areas",
                description: "Create areas inside active parking facilities and manage their capacity.",
                buttonText: "Manage Areas",
                href: "/admin/areas"
            },
            {
                title: "Parking Slots",
                description: "Create and manage individual CAR and BIKE parking slots.",
                buttonText: "Manage Slots",
                href: "/admin/slots"
            },
            {
                title: "Parking Sessions",
                description: "Monitor active and completed parking sessions across the system.",
                buttonText: "Manage Sessions",
                href: "/admin/sessions"
            }
        ]
    },
    {
        title: "People & Vehicles",
        description: "View users and the vehicles registered in the system.",
        items: [
            {
                title: "Users",
                description: "View registered users and their account information.",
                buttonText: "Manage Users",
                href: "/admin/users"
            },
            {
                title: "Vehicles",
                description: "View vehicles and their owners.",
                buttonText: "View Vehicles",
                href: "/admin/vehicles"
            }
        ]
    }
];

const statCards = [
    {
        key: "facilities",
        label: "Facilities",
        href: "/admin/facilities"
    },
    {
        key: "areas",
        label: "Areas",
        href: "/admin/areas"
    },
    {
        key: "slots",
        label: "Total Slots",
        href: "/admin/slots"
    },
    {
        key: "availableSlots",
        label: "Available",
        href: "/admin/slots"
    },
    {
        key: "occupiedSlots",
        label: "Occupied",
        href: "/admin/slots"
    },
    {
        key: "users",
        label: "Users",
        href: "/admin/users"
    },
    {
        key: "activeSessions",
        label: "Active Parking",
        href: "/admin/sessions"
    }
];

const initialStats = {
    facilities: 0,
    activeFacilities: 0,
    areas: 0,
    activeAreas: 0,
    slots: 0,
    availableSlots: 0,
    occupiedSlots: 0,
    disabledSlots: 0,
    users: 0,
    activeSessions: 0
};

export default function AdminDashboard() {
    const [stats, setStats] = useState(initialStats);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    facilities,
                    areas,
                    slots,
                    users,
                    sessions
                ] = await Promise.all([
                    getAdminFacilities(),
                    getAdminAreas(),
                    getAdminParkingSlots(),
                    getAdminUsers(),
                    getAdminParkingSessions()
                ]);

                setStats({
                    facilities: facilities.length,
                    activeFacilities: facilities.filter(
                        (item) => item.status === "ACTIVE"
                    ).length,
                    areas: areas.length,
                    activeAreas: areas.filter(
                        (item) => item.status === "ACTIVE"
                    ).length,
                    slots: slots.length,
                    availableSlots: slots.filter(
                        (item) => item.status === "AVAILABLE"
                    ).length,
                    occupiedSlots: slots.filter(
                        (item) => item.status === "OCCUPIED"
                    ).length,
                    disabledSlots: slots.filter(
                        (item) => item.status === "INACTIVE"
                    ).length,
                    users: users.length,
                    activeSessions: sessions.filter(
                        (item) => item.status === "ACTIVE"
                    ).length
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Admin Dashboard
                </h1>
                <p className="mt-2 max-w-3xl text-gray-600">
                    Manage the parking system using the hierarchy:
                    Facility → Area → Slot.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700"
                >
                    {error}
                </div>
            )}

            <section className="mb-10">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        System Overview
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Current parking-system state from the backend.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <Link
                            key={card.key}
                            href={card.href}
                            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-400 hover:shadow"
                        >
                            <p className="text-sm font-medium text-gray-600">
                                {card.label}
                            </p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {loading ? "—" : stats[card.key]}
                            </p>
                        </Link>
                    ))}
                </div>

                {!loading && (
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <StatusSummary
                            label="Facilities"
                            active={stats.activeFacilities}
                            total={stats.facilities}
                        />
                        <StatusSummary
                            label="Areas"
                            active={stats.activeAreas}
                            total={stats.areas}
                        />
                        <StatusSummary
                            label="Slots"
                            active={stats.availableSlots}
                            total={stats.slots}
                            activeLabel="available"
                        />
                    </div>
                )}
            </section>

            <div className="space-y-10">
                {managementGroups.map((group) => (
                    <section key={group.title}>
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {group.title}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                {group.description}
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {group.items.map((item) => (
                                <AdminCard key={item.href} {...item} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

function StatusSummary({
    label,
    active,
    total,
    activeLabel = "active"
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                    {label}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                    {active} / {total}
                </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
                {active} {activeLabel}
            </p>
        </div>
    );
}

function AdminCard({
    title,
    description,
    buttonText,
    href
}) {
    return (
        <article className="flex min-h-44 flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div>
                <h3 className="text-lg font-bold text-gray-900">
                    {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                    {description}
                </p>
            </div>

            <Link
                href={href}
                className="mt-6 inline-flex w-fit rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
                {buttonText}
            </Link>
        </article>
    );
}
