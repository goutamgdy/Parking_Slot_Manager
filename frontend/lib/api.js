const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem("token");
};

const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : {};

    if (!response.ok) {
        if (response.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                window.location.replace("/login");
            }
        }

        const error = new Error(
            data.error || "Something went wrong"
        );
        error.status = response.status;
        throw error;
    }

    return data;
};


export const login = async (email, password) => {
    return apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password
        })
    });
};


export const register = async (
    name,
    email,
    password
) => {
    return apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
            name,
            email,
            password
        })
    });
};


export const getParkingSlots = async () => {
    return apiRequest("/parking-slots");
};


export const getActiveParkingSessions = async () => {
    return apiRequest("/parking-sessions");
};


export const getParkingSessionHistory = async () => {
    return apiRequest("/parking-sessions/history");
};


export const getVehicles = async () => {
    return apiRequest("/vehicles");
};


export const createParkingSession = async (
    vehicleId,
    slotId
) => {
    return apiRequest("/parking-sessions", {
        method: "POST",
        body: JSON.stringify({
            vehicleId,
            slotId
        })
    });
};


export const exitParkingSession = async (
    sessionId
) => {
    return apiRequest(
        `/parking-sessions/${sessionId}/exit`,
        {
            method: "POST"
        }
    );
};

export const getAdminUsers = async () => {
    return apiRequest("/admin/users");
};


export const getAdminUser = async (userId) => {
    return apiRequest(`/admin/users/${userId}`);
};


export const updateUserRole = async (
    userId,
    role
) => {
    return apiRequest(
        `/admin/users/${userId}/role`,
        {
            method: "PATCH",
            body: JSON.stringify({
                role
            })
        }
    );
};


export const updateUserStatus = async (
    userId,
    status
) => {
    return apiRequest(
        `/admin/users/${userId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status
            })
        }
    );
};

// ================================
// ADMIN FACILITIES
// ================================

export const getAdminFacilities = async () => {
    return apiRequest("/parking-facilities");
};


export const getAdminFacility = async (facilityId) => {
    return apiRequest(
        `/parking-facilities/${facilityId}`
    );
};


export const createFacility = async (
    name,
    location
) => {
    return apiRequest("/parking-facilities", {
        method: "POST",
        body: JSON.stringify({
            name,
            location
        })
    });
};


export const updateFacility = async (
    facilityId,
    name,
    location
) => {
    return apiRequest(
        `/parking-facilities/${facilityId}`,
        {
            method: "PUT",
            body: JSON.stringify({
                name,
                location
            })
        }
    );
};


export const updateFacilityStatus = async (
    facilityId,
    status
) => {
    return apiRequest(
        `/parking-facilities/${facilityId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status
            })
        }
    );
};


// ================================
// ADMIN AREAS
// ================================

export const getAdminAreas = async () => {
    return apiRequest("/parking-areas");
};


export const getAdminArea = async (areaId) => {
    return apiRequest(
        `/parking-areas/${areaId}`
    );
};


export const createArea = async (
    facilityId,
    name,
    capacity
) => {
    return apiRequest("/parking-areas", {
        method: "POST",
        body: JSON.stringify({
            facilityId,
            name,
            capacity
        })
    });
};


export const updateArea = async (
    areaId,
    name,
    capacity
) => {
    return apiRequest(
        `/parking-areas/${areaId}`,
        {
            method: "PUT",
            body: JSON.stringify({
                name,
                capacity
            })
        }
    );
};


export const updateAreaStatus = async (
    areaId,
    status
) => {
    return apiRequest(
        `/parking-areas/${areaId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({
                status
            })
        }
    );
};