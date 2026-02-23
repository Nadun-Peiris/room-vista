"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function FurniturePage() {
  // Modal & Selection State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedbackPopup, setFeedbackPopup] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: "", message: "" });

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [widthInches, setWidthInches] = useState("");
  const [depthInches, setDepthInches] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [furnitureList, setFurnitureList] = useState<any[]>([]);

  const router = useRouter();

  // --- Data Fetching ---
  const fetchFurniture = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/furniture", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setFurnitureList(data);
    } catch (error) {
      console.error("Fetch error", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      if (data.role !== "superadmin") {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    fetchFurniture();
  }, []);

  // --- Handlers ---
  const resetForm = () => {
    setName("");
    setCategory("");
    setWidthInches("");
    setDepthInches("");
    setHeightFeet("");
    setModelFile(null);
    setThumbnailFile(null);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setName(item.name);
    setCategory(item.category);
    setWidthInches(item.widthInches?.toString() || "");
    setDepthInches(item.depthInches?.toString() || "");
    setHeightFeet(item.heightFeet?.toString() || "");
    // Note: Files can't be pre-populated due to browser security, 
    // you would typically show the existing images/names here.
    setModelFile(null); 
    setThumbnailFile(null);
    setEditingId(item._id);
    setIsModalOpen(true);
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openFeedbackPopup = (title: string, message: string) => {
    setFeedbackPopup({ open: true, title, message });
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;

    try {
      setDeleting(true);
      const token = await auth.currentUser?.getIdToken();
      const ids = Array.from(selectedItems);

      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch("/api/furniture", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
          });
          return res.ok;
        })
      );

      if (results.some((ok) => !ok)) {
        openFeedbackPopup(
          "Delete Incomplete",
          "Some items could not be deleted. Please try again."
        );
        return;
      }

      setSelectedItems(new Set());
      setSelectionMode(false);
      setShowDeletePopup(false);
      fetchFurniture();
    } catch (error) {
      console.error("Delete furniture error:", error);
      openFeedbackPopup(
        "Delete Failed",
        "Failed to delete selected furniture."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden font-sans p-6 md:p-10">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Furniture Library</h1>
              <p className="text-sm font-medium text-gray-500">{furnitureList.length} items in inventory</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectionMode((prev) => !prev);
                setSelectedItems(new Set());
              }}
              className="bg-white/80 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:text-emerald-600 hover:border-emerald-200 transition-all active:scale-95"
            >
              {selectionMode ? "Cancel Select" : "Select"}
            </button>
            <button
              onClick={() => setShowDeletePopup(true)}
              disabled={!selectionMode || selectedItems.size === 0}
              className="bg-white/80 border border-red-200 text-red-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete ({selectedItems.size})
            </button>
            <button
              onClick={openAddModal}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              Add Furniture
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white/80 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-bold text-sm shadow-sm hover:shadow-md hover:text-emerald-600 hover:border-emerald-200 transition-all backdrop-blur-md active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* FURNITURE GRID */}
        {furnitureList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white/40 border-2 border-dashed border-gray-200 rounded-[2rem]">
            <p className="text-gray-500 font-medium">No furniture found. Click "Add Furniture" to start building your library.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {furnitureList.map((item) => (
              <div
                key={item._id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (selectionMode) {
                    toggleSelect(item._id);
                    return;
                  }
                  openEditModal(item);
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  if (selectionMode) {
                    toggleSelect(item._id);
                    return;
                  }
                  openEditModal(item);
                }}
                className={`relative bg-white rounded-xl shadow p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all ${
                  selectionMode && selectedItems.has(item._id)
                    ? "ring-2 ring-red-200 border border-red-300"
                    : "border border-transparent"
                }`}
              >
                {selectionMode && (
                  <span
                    className={`absolute h-5 w-5 rounded-full border-2 top-3 right-3 ${
                      selectedItems.has(item._id)
                        ? "bg-red-500 border-red-500"
                        : "border-gray-300 bg-white"
                    }`}
                  />
                )}
                <img
                  src={item.thumbnailUrl}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />

                <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.category}</p>

                {!selectionMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(item);
                    }}
                    className="absolute bottom-3 right-3 p-2 bg-white/90 text-gray-700 rounded-lg shadow-sm border border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                    aria-label="Edit furniture"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-xl p-6">
            <h3 className="text-lg font-extrabold text-gray-900">
              Delete selected furniture?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              You selected {selectedItems.size} item(s). This action cannot be undone.
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

      {feedbackPopup.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-xl p-6">
            <h3 className="text-lg font-extrabold text-gray-900">
              {feedbackPopup.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {feedbackPopup.message}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setFeedbackPopup({ open: false, title: "", message: "" })
                }
                className="px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={resetForm} />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white/90 border border-white backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-200 scrollbar-hide">
            
            <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-md border-b border-gray-100">
              <h2 className="text-2xl font-extrabold text-gray-900">
                {editingId ? "Edit Furniture" : "Add New Furniture"}
              </h2>
              <button onClick={resetForm} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8">
              <form className="space-y-8">
                {/* General Info Section */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Furniture Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Modern Sofa" className="w-full p-3.5 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium" />
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full p-3.5 rounded-2xl bg-white border border-gray-200 text-gray-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium cursor-pointer">
                        <option value="" disabled>Select a category...</option>
                        <option value="seating">Seating</option>
                        <option value="tables">Tables</option>
                        <option value="storage">Storage</option>
                        <option value="beds">Beds</option>
                        <option value="decor">Decor</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dimensions Section */}
                <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Physical Dimensions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1.5 w-full relative">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Width</label>
                      <input type="number" value={widthInches} onChange={(e) => setWidthInches(e.target.value)} required className="w-full p-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-semibold pr-10" />
                      <span className="absolute right-4 bottom-3 text-xs font-bold text-gray-400 pointer-events-none">in</span>
                    </div>
                    <div className="flex flex-col gap-1.5 w-full relative">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Depth</label>
                      <input type="number" value={depthInches} onChange={(e) => setDepthInches(e.target.value)} required className="w-full p-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-semibold pr-10" />
                      <span className="absolute right-4 bottom-3 text-xs font-bold text-gray-400 pointer-events-none">in</span>
                    </div>
                    <div className="flex flex-col gap-1.5 w-full relative">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Height</label>
                      <input type="number" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} required className="w-full p-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-semibold pr-10" />
                      <span className="absolute right-4 bottom-3 text-xs font-bold text-gray-400 pointer-events-none">ft</span>
                    </div>
                  </div>
                </div>

                {/* File Uploads Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">3D Model (.glb)</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl bg-white/40 hover:bg-emerald-50 hover:border-emerald-400 cursor-pointer transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className={`w-6 h-6 mb-2 ${modelFile ? 'text-emerald-500' : 'text-gray-400 group-hover:text-emerald-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        {modelFile ? (
                          <p className="text-xs font-bold text-emerald-600 truncate px-4 max-w-full">{modelFile.name}</p>
                        ) : (
                          <p className="text-xs text-gray-500 font-bold">Upload new .GLB</p>
                        )}
                      </div>
                      <input type="file" accept=".glb" onChange={(e) => setModelFile(e.target.files ? e.target.files[0] : null)} className="hidden" />
                    </label>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Thumbnail</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl bg-white/40 hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className={`w-6 h-6 mb-2 ${thumbnailFile ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {thumbnailFile ? (
                           <p className="text-xs font-bold text-blue-600 truncate px-4 max-w-full">{thumbnailFile.name}</p>
                        ) : (
                          <p className="text-xs text-gray-500 font-bold">Upload new image</p>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files ? e.target.files[0] : null)} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setLoading(true);

                        const token = await auth.currentUser?.getIdToken();

                        let modelUrl = "";
                        let thumbnailUrl = "";

                        // If new upload
                        if (modelFile && thumbnailFile) {
                          const formData = new FormData();
                          formData.append("model", modelFile);
                          formData.append("thumbnail", thumbnailFile);

                          const uploadRes = await fetch("/api/furniture/upload", {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                            body: formData,
                          });

                          const uploadData = await uploadRes.json();
                          modelUrl = uploadData.modelUrl;
                          thumbnailUrl = uploadData.thumbnailUrl;
                        }

                        if (editingId) {
                          // UPDATE
                          await fetch("/api/furniture/update", {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              id: editingId,
                              name,
                              category,
                              widthInches: Number(widthInches),
                              depthInches: Number(depthInches),
                              heightFeet: Number(heightFeet),
                              modelUrl,
                              thumbnailUrl,
                            }),
                          });

                          openFeedbackPopup(
                            "Furniture Updated",
                            "Furniture updated successfully."
                          );
                        } else {
                          // CREATE
                          await fetch("/api/furniture", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              name,
                              category,
                              widthInches: Number(widthInches),
                              depthInches: Number(depthInches),
                              heightFeet: Number(heightFeet),
                              modelUrl,
                              thumbnailUrl,
                            }),
                          });

                          openFeedbackPopup(
                            "Furniture Saved",
                            "Furniture saved successfully."
                          );
                        }

                        resetForm();
                        fetchFurniture();
                      } catch (error) {
                        console.error(error);
                        openFeedbackPopup(
                          "Save Failed",
                          "Something went wrong while saving furniture."
                        );
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold p-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/25 active:scale-[0.98]"
                  >
                    {loading ? "Processing..." : editingId ? "Update Furniture" : "Save to Library"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
