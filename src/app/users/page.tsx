"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

interface IUser {
  _id: string;
  name: string;
  email: string;
  status: "pending" | "active" | "inactive";
}

type TabType = "pending" | "active" | "inactive";

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<IUser[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (token: string) => {
    try {
      const res = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.status === 403) {
        router.push("/dashboard");
        return;
      }

      const data = await res.json();

      if (res.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: TabType) => {
    try {
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch("/api/users/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, status }),
      });

      if (res.ok && token) {
        fetchUsers(token);
      }
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const token = await user.getIdToken();
      fetchUsers(token);
    });

    return () => unsubscribe();
  }, [router]);

  const filteredUsers = users.filter((user) => user.status === activeTab);

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden font-sans p-8">
      <div className="relative z-10 max-w-5xl mx-auto">

        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                User Management
              </h1>
              <p className="text-gray-500 font-medium mt-2">
                Review registration requests and manage designers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center justify-center gap-2 bg-white/80 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-bold text-sm shadow-sm hover:shadow-md hover:text-emerald-600 hover:border-emerald-200 transition-all backdrop-blur-md active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </header>

        {/* TABS */}
        <div className="flex p-1.5 gap-2 mb-8 bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl w-fit shadow-sm">

          {["pending", "active", "inactive"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm capitalize transition-all ${
                activeTab === tab
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-gray-500 hover:bg-white/80"
              }`}
            >
              {tab === "inactive" ? "Deactivated" : tab}
            </button>
          ))}

        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-emerald-600 font-bold animate-pulse">
              Loading users...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white/40 border border-dashed border-gray-300 rounded-3xl p-20 text-center">
            <p className="text-gray-400 font-medium text-lg">
              No users found in this category.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white/70 border border-white/60 backdrop-blur-md p-6 rounded-3xl flex justify-between items-center shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                    {user.name.charAt(0)}
                  </div>

                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                {activeTab === "pending" && (
                  <button
                    onClick={() => updateUserStatus(user._id, "active")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
                  >
                    Activate
                  </button>
                )}

                {activeTab === "active" && (
                  <button
                    onClick={() => updateUserStatus(user._id, "inactive")}
                    className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold px-5 py-2.5 rounded-xl border border-red-100"
                  >
                    Deactivate
                  </button>
                )}

                {activeTab === "inactive" && (
                  <button
                    onClick={() => updateUserStatus(user._id, "active")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
