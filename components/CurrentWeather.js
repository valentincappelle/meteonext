"use client";
export default function CurrentWeather({ data }) {
  if (!data) return null;
  return (
    <div className="text-center text-gray-900">
      <h2 className="text-2xl font-bold mb-4">{data.name}</h2>
      <img
        src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
        alt={data.weather[0].description}
        className="mx-auto my-4 w-20"
      />
      <p className="text-xl mb-2">{data.main.temp.toFixed(1)}°C</p>
      <p className="mb-2">{data.weather[0].description}</p>
      <p className="mb-1">Vent : {data.wind.speed} m/s</p>
      <p className="mb-1">Humidité : {data.main.humidity} %</p>
    </div>
  );
}
