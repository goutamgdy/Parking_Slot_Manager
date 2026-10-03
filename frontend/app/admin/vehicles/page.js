"use client";
import { useEffect, useState } from "react";
import { getAdminVehicles } from "../../../lib/api";

export default function AdminVehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        getAdminVehicles().then(setVehicles).catch(e => setError(e.message));
    }, []);

    return <div>
        <h1 className="text-3xl font-bold">Vehicles</h1>
        {error && <p className="mt-4 rounded bg-red-100 p-3 text-red-700">{error}</p>}
        <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow">
            <table className="min-w-full"><thead><tr className="border-b text-left">
                <th className="px-4 py-3">ID</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Owner</th>
            </tr></thead><tbody>
                {vehicles.map(v => <tr key={v.id} className="border-b">
                    <td className="px-4 py-3">{v.id}</td><td className="px-4 py-3">{v.vehicle_number}</td><td className="px-4 py-3">{v.vehicle_type}</td><td className="px-4 py-3">{v.user_name || v.user_id}</td>
                </tr>)}
            </tbody></table>
        </div>
    </div>;
}
