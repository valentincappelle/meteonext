"use client";
import { useState, useEffect } from "react";

export default function Forecast({ data }) {

  const [daysMap, setDaysMap] = useState({});
  const [days, setDays] = useState([]);

  useEffect(() => {
    if (!data?.list) return;
    const tempDaysMap = {};
    data.list.forEach(item => {
      // Formatage côté client uniquement
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString("fr-FR", { weekday: "long" });
      if (!tempDaysMap[day]) {
        tempDaysMap[day] = {
          min: item.main.temp_min,
          max: item.main.temp_max,
          icon: item.weather[0].icon.replace("n", "d"),
          descriptions: [item.weather[0].description],
        };
      } else {
        tempDaysMap[day].min = Math.min(tempDaysMap[day].min, item.main.temp_min);
        tempDaysMap[day].max = Math.max(tempDaysMap[day].max, item.main.temp_max);
        tempDaysMap[day].descriptions.push(item.weather[0].description);
      }
    });
    setDaysMap(tempDaysMap);
    setDays(Object.keys(tempDaysMap).slice(0, 5));
  }, [data]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {days.map(day => (
        <div
          key={day}
          className="bg-[#b4b4b4]/30 rounded-xl p-4 m-2 text-white shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition hover:bg-white/40 flex flex-col items-center justify-center min-h-[110px]"
        >
          <h3 className="font-semibold text-base md:text-lg mb-2 text-center w-full truncate">{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
          <img
            src={`https://openweathermap.org/img/wn/${daysMap[day]?.icon}@2x.png`}
            alt="Météo"
            className="w-10 md:w-12 mb-1"
          />
          <p className="text-sm md:text-base text-center w-full">{Math.round(daysMap[day]?.min)}°C / {Math.round(daysMap[day]?.max)}°C</p>
        </div>
      ))}
    </div>
  );
}