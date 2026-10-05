import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, CloudSun, Wind, Thermometer, CloudLightning } from 'lucide-react';

interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
}

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch real weather for Hanoi using Open-Meteo (free, no auth)
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=21.0245&longitude=105.8412&current_weather=true');
        const data = await res.json();
        setWeather(data.current_weather);
      } catch (error) {
        console.error('Failed to fetch weather', error);
      }
    };
    fetchWeather();
    // Refresh every 30 minutes
    const weatherTimer = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherTimer);
  }, []);

  // Map WMO Weather codes to icons
  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="w-5 h-5 text-[#ff9900]" />;
    if (code === 2 || code === 3) return <CloudSun className="w-5 h-5 text-[#ff9900]" />;
    if (code >= 45 && code <= 48) return <Cloud className="w-5 h-5 text-gray-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (code >= 71 && code <= 77) return <Cloud className="w-5 h-5 text-blue-200" />;
    if (code >= 95 && code <= 99) return <CloudLightning className="w-5 h-5 text-purple-500" />;
    return <CloudSun className="w-5 h-5 text-orange-400" />;
  };

  return (
    <div className="relative group cursor-default flex flex-col text-black text-[11px] font-bold shrink-0 border-r border-black/20 pr-3 sm:pr-4 justify-center gap-1">
      <div className="flex items-center gap-2">
        <span className="text-[#0052cc] font-black tracking-wide">HÀ NỘI</span>
        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
        <div className="flex items-center gap-1.5">
          {weather ? (
            <>
              <span className="text-[#e63946] font-black text-xs">{Math.round(weather.temperature)}°C</span>
              {getWeatherIcon(weather.weathercode)}
            </>
          ) : (
            <>
              <span className="text-gray-500 animate-pulse text-xs">--°C</span>
              <CloudSun className="w-5 h-5 text-gray-300" />
            </>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-gray-600 font-mono font-medium">
        <span>{currentTime.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}</span>
        <div className="w-1 h-1 rounded-full bg-gray-200 mx-1"></div>
        <span className="text-black font-bold">{currentTime.toLocaleTimeString('vi-VN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div>
      
      {/* Tooltip for extra info on hover */}
      {weather && (
        <div className="absolute top-[120%] left-0 w-48 bg-white border border-[#0052cc] shadow-[0_10px_30px_rgba(0,48,135,0.15)] p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] rounded-sm transform translate-y-2 group-hover:translate-y-0">
          <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-[#0052cc] rotate-45"></div>
          <h4 className="text-[10px] font-black text-[#0052cc] mb-2 border-b border-gray-100 pb-1.5 uppercase tracking-wider relative z-10">Thời tiết hiện tại</h4>
          <div className="flex flex-col gap-2 text-xs font-medium relative z-10">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-600"><Thermometer className="w-3.5 h-3.5 text-red-500" /> Nhiệt độ</span>
              <span className="font-bold text-black">{weather.temperature}°C</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-600"><Wind className="w-3.5 h-3.5 text-blue-500" /> Sức gió</span>
              <span className="font-bold text-black">{weather.windspeed} km/h</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
