"use client";

interface FeedbackDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  actionLabel?: string;
}

export default function FeedbackDialog({
  open,
  title,
  message,
  onClose,
  actionLabel = "OK",
}: FeedbackDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-xl p-6">
        <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
