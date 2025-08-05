"use client";
export default function Loader() {
  return <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-10">
    <span className="text-2xl text-blue-500 font-semibold">Chargement en cours ...</span>
  </div>;
}
