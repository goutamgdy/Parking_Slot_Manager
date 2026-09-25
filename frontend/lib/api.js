const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getParkingSlots = async () => {
    const response = await fetch(
        `${API_BASE_URL}/api/parking-slots`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch parking slots");
    }

    return response.json();
};


export const createParkingSession = async (vehicleId, slotId) => {
    const response = await fetch(
        `${API_BASE_URL}/api/parking-sessions`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                vehicleId,
                slotId
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to create parking session");
    }

    return data;
};