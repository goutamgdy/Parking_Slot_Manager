"use client";

import Link from "next/link";

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

export default function AdminDashboard() {
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