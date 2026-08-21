function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, danger = true }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-gray-600">{message}</p>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 rounded-lg font-medium text-white ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-black'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;