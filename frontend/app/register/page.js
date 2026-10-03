"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "../../lib/api";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await register(name, email, password);
            router.replace("/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow sm:p-8">
                <h1 className="text-center text-2xl font-bold text-gray-900">
                    Parking Slot Manager
                </h1>

                <h2 className="mb-6 mt-2 text-xl font-semibold text-gray-900">
                    Create account
                </h2>

                {error && (
                    <div
                        role="alert"
                        className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700"
                    >
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleRegister}
                    className="space-y-4"
                >
                    <div>
                        <label
                            htmlFor="register-name"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Name
                        </label>

                        <input
                            id="register-name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            autoComplete="name"
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="register-email"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>

                        <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            autoComplete="email"
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="register-password"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <input
                            id="register-password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            autoComplete="new-password"
                            minLength={8}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            Password must contain at least 8 characters.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-black py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading
                            ? "Creating account..."
                            : "Register"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-gray-900 underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </main>
    );
}
