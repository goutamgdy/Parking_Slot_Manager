"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../lib/api";

export default function LoginPage() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await login(
                email,
                password
            );

            localStorage.setItem(
                "token",
                response.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.user)
            );

            if (response.user.role === "ADMIN") {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);
        }
    };


    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">

                <h1 className="text-2xl font-bold text-center mb-6">
                    Parking Slot Manager
                </h1>

                <h2 className="text-xl font-semibold mb-4">
                    Login
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleLogin}
                    className="space-y-4"
                >

                    <div>
                        <label className="block mb-1 font-medium">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            className="w-full border rounded px-3 py-2"
                            placeholder="Enter email"
                            required
                        />
                    </div>


                    <div>
                        <label className="block mb-1 font-medium">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            className="w-full border rounded px-3 py-2"
                            placeholder="Enter password"
                            required
                        />
                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p className="mt-6 text-center text-sm">
                    Don't have an account?{" "}
                    <a
                        href="/register"
                        className="font-semibold underline"
                    >
                        Register
                    </a>
                </p>

            </div>

        </main>
    );
}
