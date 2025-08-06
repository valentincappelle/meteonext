"use client";
import { Suspense } from "react";
import WeatherClientComponent from "../components/WeatherClientComponent";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center mt-10 text-gray-600">Chargement météo...</div>}>
      <WeatherClientComponent />
    </Suspense>
  );
}
