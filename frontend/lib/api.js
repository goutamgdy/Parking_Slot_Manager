const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const handleApiResponse = async (response, defaultMessage) => {
    const data = await response.json();

    if (!response.ok) {
        const error = new Error(
            data.error || defaultMessage
        );

        error.status = response.status;

        throw error;
    }

    return data;
};

export const getParkingSlots = async () => {
    const response = await fetch(
        `${API_BASE_URL}/api/parking-slots`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch parking slots");
    }

    return response.json();
};

export const getVehicles = async () => {
    const response = await fetch(
        `${API_BASE_URL}/api/vehicles`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
    }

    return response.json();
};

export const getActiveParkingSessions = async () => {
    const response = await fetch(
        `${API_BASE_URL}/api/parking-sessions`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch active parking sessions");
    }

    return response.json();
};

export const getParkingSessionHistory = async () => {
    const response = await fetch(
        `${API_BASE_URL}/api/parking-sessions/history`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch parking session history");
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

    return handleApiResponse(
        response,
        "Failed to create parking session"
    );
};

export const exitParkingSession = async (sessionId) => {
    const response = await fetch(
        `${API_BASE_URL}/api/parking-sessions/${sessionId}/exit`,
        {
            method: "POST"
        }
    );

    return handleApiResponse(
        response,
        "Failed to exit parking session"
    );
};