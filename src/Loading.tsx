export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-4">
      <div className="w-12 h-12 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      <p className="text-lg font-semibold text-gray-200">Loading...</p>
    </div>
  );
}
