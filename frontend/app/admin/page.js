"use client";

import Link from "next/link";

export default function AdminDashboard() {
    return (
        <div>
            <h1
                style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    marginBottom: "10px"
                }}
            >
                Admin Dashboard
            </h1>

            <p
                style={{
                    color: "#4b6380",
                    fontSize: "18px",
                    marginBottom: "30px"
                }}
            >
                Manage users, vehicles, parking facilities, areas, slots
                and parking sessions.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(3, minmax(0, 1fr))",
                    gap: "28px"
                }}
            >
                <AdminCard
                    title="Users"
                    description="View and manage registered users."
                    buttonText="Manage Users"
                    href="/admin/users"
                />

                <AdminCard
                    title="Vehicles"
                    description="View vehicles and their owners."
                    buttonText="View Vehicles"
                    href="/admin/vehicles"
                />

                <AdminCard
                    title="Facilities"
                    description="Manage parking facilities."
                    buttonText="Manage Facilities"
                    href="/admin/facilities"
                />

                <AdminCard
                    title="Areas"
                    description="Manage areas inside parking facilities."
                    buttonText="Manage Areas"
                    href="/admin/areas"
                />

                <AdminCard
                    title="Parking Slots"
                    description="Add and manage individual parking slots."
                    buttonText="Manage Slots"
                    href="/admin/slots"
                />

                <AdminCard
                    title="Parking Sessions"
                    description="Monitor and manage all parking sessions."
                    buttonText="Manage Sessions"
                    href="/admin/sessions"
                />
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
        <div
            style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "30px",
                minHeight: "170px",
                boxShadow:
                    "0 2px 8px rgba(0, 0, 0, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
            }}
        >
            <div>
                <h2
                    style={{
                        fontSize: "22px",
                        fontWeight: "700",
                        marginBottom: "14px"
                    }}
                >
                    {title}
                </h2>

                <p
                    style={{
                        color: "#4b6380",
                        fontSize: "16px",
                        lineHeight: "1.5",
                        marginBottom: "20px"
                    }}
                >
                    {description}
                </p>
            </div>

            <Link
                href={href}
                style={{
                    display: "inline-block",
                    width: "fit-content",
                    background: "#000000",
                    color: "#ffffff",
                    padding: "11px 18px",
                    borderRadius: "7px",
                    fontWeight: "700",
                    textDecoration: "none"
                }}
            >
                {buttonText}
            </Link>
        </div>
    );
}