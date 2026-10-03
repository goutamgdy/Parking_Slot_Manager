"use client";
import { useEffect, useState } from "react";
import { getAdminParkingSessions, exitAdminParkingSession } from "../../../lib/api";

export default function AdminSessionsPage() {
    const [sessions, setSessions] = useState([]);
    const [error, setError] = useState("");
    const load = () => getAdminParkingSessions().then(setSessions).catch(e => setError(e.message));
    useEffect(load, []);

    const exit = async (id) => {
        setError("");
        try { await exitAdminParkingSession(id); load(); } catch (e) { setError(e.message); }
    };

    return <div>
        <h1 className="text-3xl font-bold">Parking Sessions</h1>
        {error && <p className="mt-4 rounded bg-red-100 p-3 text-red-700">{error}</p>}
        <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow">
            <table className="min-w-full"><thead><tr className="border-b text-left">
                <th className="px-4 py-3">ID</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Slot</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th>
            </tr></thead><tbody>
                {sessions.map(s => <tr key={s.id} className="border-b">
                    <td className="px-4 py-3">{s.id}</td><td className="px-4 py-3">{s.vehicle_number || s.vehicle_id}</td><td className="px-4 py-3">{s.slot_number || s.parking_slot_id}</td><td className="px-4 py-3">{s.status}</td>
                    <td className="px-4 py-3">{s.status === "ACTIVE" && <button onClick={() => exit(s.id)} className="rounded bg-red-600 px-3 py-1 text-white">Exit</button>}</td>
                </tr>)}
            </tbody></table>
        </div>
    </div>;
}
