export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
        <p className="text-navy-800 font-medium text-sm">Loading...</p>
      </div>
    </div>
  );
}
