"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

type DashboardDesign = {
  _id: string;
  title?: string;
  roomWidthFeet?: number;
  roomHeightFeet?: number;
  furniture?: Array<{ id: string }>;
  createdAt?: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [designs, setDesigns] = useState<DashboardDesign[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDesignIds, setSelectedDesignIds] = useState<string[]>([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setName(user.displayName || user.email?.split('@')[0] || "User");

      try {
        const token = await user.getIdToken();

        const res = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        
        setName(data.name);
        setRole(data.role);
        setStatus(data.status);

        const designRes = await fetch("/api/designs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (designRes.ok) {
          const designData = await designRes.json();
          setDesigns(designData);
        }

        setLoading(false);
      } catch {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const toggleDesignSelection = (designId: string) => {
    setSelectedDesignIds((prev) =>
      prev.includes(designId)
        ? prev.filter((id) => id !== designId)
        : [...prev, designId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedDesignIds.length === 0) return;

    try {
      setDeleting(true);
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const token = await user.getIdToken();

      const results = await Promise.all(
        selectedDesignIds.map(async (id) => {
          const res = await fetch(`/api/designs/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          return { id, ok: res.ok };
        })
      );

      const failed = results.filter((item) => !item.ok);
      if (failed.length > 0) {
        alert("Some designs could not be deleted. Please try again.");
        return;
      }

      setDesigns((prev) =>
        prev.filter((design) => !selectedDesignIds.includes(design._id))
      );
      setSelectedDesignIds([]);
      setSelectionMode(false);
      setShowDeletePopup(false);
    } catch (error) {
      console.error("Delete designs error:", error);
      alert("Failed to delete selected designs.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-emerald-600 font-bold animate-pulse">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden font-sans p-6 md:p-10">
      {/* Soft Background Accents */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome, <span className="text-emerald-700 capitalize">{name}</span>
            </h1>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Saved designs: {designs.length}
            </span>

            {/* USERS BUTTON (Superadmin only) */}
            {role === "superadmin" && (
              <button
                onClick={() => router.push("/users")}
                className="bg-white/80 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-bold text-sm shadow-sm hover:shadow-md hover:text-emerald-600 hover:border-emerald-200 transition-all backdrop-blur-md active:scale-95"
              >
                Users
              </button>
            )}
          </div>

          {/* LOGOUT BUTTON */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectionMode((prev) => !prev);
                setSelectedDesignIds([]);
              }}
              className="bg-white/80 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-bold text-sm shadow-sm hover:shadow-md hover:text-emerald-600 hover:border-emerald-200 transition-all backdrop-blur-md active:scale-95"
            >
              {selectionMode ? "Cancel Select" : "Select"}
            </button>
            <button
              onClick={() => setShowDeletePopup(true)}
              disabled={!selectionMode || selectedDesignIds.length === 0}
              className="bg-white/80 border border-red-200 text-red-600 px-6 py-2.5 rounded-full font-bold text-sm shadow-sm hover:shadow-md hover:bg-red-50 transition-all backdrop-blur-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete ({selectedDesignIds.length})
            </button>
            <button
              onClick={handleLogout}
              className="bg-white/80 border border-gray-200 text-gray-700 px-8 py-2.5 rounded-full font-bold text-sm shadow-sm hover:shadow-md hover:text-red-600 hover:border-red-200 transition-all backdrop-blur-md active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>

        {/* PENDING NOTICE */}
        {role === "designer" && status !== "active" && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-800 shadow-sm w-fit">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">⚠️</div>
            <p className="font-bold text-sm">Your account is pending admin approval.</p>
          </div>
        )}

        {/* DESIGN GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">

          {/* NEW DESIGN TILE */}
          <button
            onClick={() => router.push("/editor")}
            className="group aspect-square flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-[2rem] bg-white/30 hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer backdrop-blur-sm"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
              <svg className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-lg font-bold text-gray-500 group-hover:text-emerald-700 transition-colors">
              New Design
            </span>
          </button>

          {designs.map((design) => (
            <button
              key={design._id}
              type="button"
              onClick={() =>
                selectionMode
                  ? toggleDesignSelection(design._id)
                  : router.push(`/editor?designId=${design._id}`)
              }
              className={`aspect-square bg-white/80 border backdrop-blur-md rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all hover:-translate-y-1 p-5 flex flex-col justify-between text-left ${
                selectedDesignIds.includes(design._id)
                  ? "border-red-300 ring-2 ring-red-200"
                  : "border-white/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center w-fit gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                  Saved Design
                </div>
                {selectionMode && (
                  <span
                    className={`h-5 w-5 rounded-full border-2 ${
                      selectedDesignIds.includes(design._id)
                        ? "bg-red-500 border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-gray-900 leading-tight line-clamp-2">
                  {design.title?.trim() || "Untitled Design"}
                </h3>
                <p className="text-sm font-semibold text-gray-500">
                  {design.roomWidthFeet ?? "-"}ft x {design.roomHeightFeet ?? "-"}ft
                </p>
                <p className="text-xs font-medium text-gray-400">
                  Items: {design.furniture?.length ?? 0}
                </p>
                <p className="text-xs font-medium text-gray-400">
                  Saved:{" "}
                  {design.createdAt
                    ? new Date(design.createdAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </button>
          ))}

          {designs.length === 0 && (
            <div className="col-span-full rounded-[2rem] border-2 border-dashed border-gray-200 bg-white/40 p-12 text-center">
              <p className="text-gray-500 font-semibold">
                No saved designs yet. Create your first design.
              </p>
            </div>
          )}

        </div>

        {showDeletePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-xl p-6">
              <h3 className="text-lg font-extrabold text-gray-900">
                Delete selected designs?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                You selected {selectedDesignIds.length} design(s). This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeletePopup(false)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 font-semibold hover:bg-red-100 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
