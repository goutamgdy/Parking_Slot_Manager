"use client";
import { useEffect, useState } from "react";
import { createParkingSlot, getAdminAreas, getAdminParkingSlots, updateParkingSlotStatus } from "../../../lib/api";

export default function AdminSlotsPage() {
    const [slots, setSlots] = useState([]);
    const [areas, setAreas] = useState([]);
    const [areaId, setAreaId] = useState("");
    const [slotNumber, setSlotNumber] = useState("");
    const [slotType, setSlotType] = useState("CAR");
    const [error, setError] = useState("");
    const load = async () => { try { setSlots(await getAdminParkingSlots()); setAreas(await getAdminAreas()); } catch(e) { setError(e.message); } };
    useEffect(() => { load(); }, []);

    const create = async (e) => {
        e.preventDefault(); setError("");
        try { await createParkingSlot(Number(areaId), slotNumber, slotType); setSlotNumber(""); await load(); }
        catch(e) { setError(e.message); }
    };

    const toggle = async (slot) => {
        try { await updateParkingSlotStatus(slot.id, slot.status === "AVAILABLE" ? "INACTIVE" : "AVAILABLE"); await load(); }
        catch(e) { setError(e.message); }
    };

    return <div>
        <h1 className="text-3xl font-bold">Parking Slots</h1>
        {error && <p className="mt-4 rounded bg-red-100 p-3 text-red-700">{error}</p>}
        <form onSubmit={create} className="mt-6 grid gap-3 rounded-lg bg-white p-5 shadow md:grid-cols-4">
            <select value={areaId} onChange={e=>setAreaId(e.target.value)} required className="rounded border px-3 py-2">
                <option value="">Select area</option>{areas.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input value={slotNumber} onChange={e=>setSlotNumber(e.target.value)} placeholder="Slot number" required className="rounded border px-3 py-2"/>
            <select value={slotType} onChange={e=>setSlotType(e.target.value)} className="rounded border px-3 py-2"><option>CAR</option><option>BIKE</option></select>
            <button className="rounded bg-black px-4 py-2 font-semibold text-white">Add Slot</button>
        </form>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
            {slots.map(s=><div key={s.id} className="rounded-lg bg-white p-5 shadow">
                <p className="font-bold">{s.slot_number}</p><p className="text-sm">{s.facility_name} / {s.area_name}</p><p className="text-sm">Type: {s.slot_type}</p><p className="text-sm">Status: {s.status}</p>
                <button onClick={()=>toggle(s)} disabled={s.status==="OCCUPIED"} className="mt-3 rounded border px-3 py-1 disabled:opacity-50">{s.status==="AVAILABLE" ? "Disable" : "Enable"}</button>
            </div>)}
        </div>
    </div>;
}
