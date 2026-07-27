import toast from "react-hot-toast";

export function confirmToast(message, { confirmLabel = "Delete", cancelLabel = "Cancel" } = {}) {
  return new Promise((resolve) => {
    const id = toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-sm w-full bg-white border border-[#D8CFBC] rounded-md shadow-lg p-4 flex flex-col gap-3`}
        >
          <p className="text-sm text-[#202A22]">{message}</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(false);
              }}
              className="px-3 py-1.5 text-xs font-medium text-[#6B6558] bg-[#F2ECE0] border border-[#D8CFBC] rounded-md hover:bg-[#E7DFCE] transition"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(true);
              }}
              className="px-3 py-1.5 text-xs font-medium text-[#F2ECE0] bg-[#A23B3B] rounded-md hover:bg-[#8B3232] transition"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  });
}
