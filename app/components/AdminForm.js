"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { BriefcaseIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/outline';
import { ClipLoader } from "react-spinners"; 

export default function AdminForm() {
    const router = useRouter();
    const [adminName, setAdminName] = useState('');
    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); 
        const loadingToast = toast.loading("Registering admin...");

        try {
            const response = await fetch("/api/admin/", {
                method: "POST",
                body: JSON.stringify({ adminName, email, companyName, password }),
                headers: { "Content-Type": "application/json" },
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("Admin registered successfully!", { id: loadingToast });
                setAdminName('');
                setEmail('');
                setCompanyName('');
                setPassword('');
                router.push("/success");
            } else {
                // Pass the error message to the failure page
                toast.error(`Failed to register admin: ${result.error}`, { id: loadingToast });
                router.push(`/failure?message=${encodeURIComponent(result.error)}`);
            }
        } catch (error) {
            toast.error("An unexpected error occurred!", { id: loadingToast });
            router.push("/failure?message=An unexpected error occurred");
        } finally {
            setLoading(false); 
          }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-1000 h-full flex flex-col items-center justify-center bg-white rounded-xl shadow-lg backdrop-blur-md p-10">
                <h2 className="text-4xl font-bold text-gray-700 mb-6 text-center">
                    <UserIcon className="h-8 w-8 inline-block text-blue-500 mr-2" />
                    Admin Registration
                </h2>
                <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-6">
                    <div className="flex flex-wrap -mx-4">
                        <div className="flex-1 px-4">
                            <label className="block text-lg font-medium text-gray-600 mb-1">Admin Name</label>
                            <input
                                type="text"
                                value={adminName}
                                onChange={(e) => setAdminName(e.target.value)}
                                required
                                placeholder="Enter your name"
                                className="w-full py-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            />
                        </div>
                        <div className="flex-1 px-4">
                            <label className="block text-lg font-medium text-gray-600 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                                className="w-full py-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap -mx-4">
                        <div className="flex-1 px-4">
                            <label className="block text-lg font-medium text-gray-600 mb-1">Company Name</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                required
                                placeholder="Enter company name"
                                className="w-full py-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            />
                        </div>
                        <div className="flex-1 px-4">
                            <label className="block text-lg font-medium text-gray-600 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                                className="w-full py-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                            />
                        </div>
                    </div>
                    <div className="flex justify-center">
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
                        disabled={loading} 
                         >
                        {loading ? <ClipLoader color="#fff" size={25} /> : "Register"}
                    </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
