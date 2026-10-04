import React, { useEffect, useState } from 'react';
import { CloudFog, CloudLightning, CloudRain, CloudSun, Snowflake, Sun } from './icons';
import { cx } from './ui';

interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
}

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=21.0245&longitude=105.8412&current_weather=true';

const describe = (code: number) => {
  if (code <= 1) return { Icon: Sun, label: 'Trời quang', tone: 'text-gold-500' };
  if (code <= 3) return { Icon: CloudSun, label: 'Ít mây', tone: 'text-gold-500' };
  if (code <= 48) return { Icon: CloudFog, label: 'Sương mù', tone: 'text-muted' };
  if (code <= 67 || (code >= 80 && code <= 82)) return { Icon: CloudRain, label: 'Có mưa', tone: 'text-brand-500' };
  if (code <= 77) return { Icon: Snowflake, label: 'Lạnh', tone: 'text-brand-400' };
  if (code >= 95) return { Icon: CloudLightning, label: 'Dông', tone: 'text-flame-500' };
  return { Icon: CloudSun, label: 'Nhiều mây', tone: 'text-gold-500' };
};

/** Hà Nội weather + clock. The clock ticks every 20s (minute precision) instead of every second. */
export const WeatherWidget: React.FC<{ className?: string }> = ({ className }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 20_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchWeather = () =>
      fetch(WEATHER_URL, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setWeather(data.current_weather ?? null))
        .catch(() => undefined);
    fetchWeather();
    const timer = window.setInterval(fetchWeather, 30 * 60 * 1000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);

  const info = weather ? describe(weather.weathercode) : null;
  const Icon = info?.Icon ?? CloudSun;

  return (
    <div
      className={cx('shrink-0 items-center gap-3 border-line pr-5 text-[13px] lg:border-r', className)}
      title={weather ? `${info?.label} · Gió ${weather.windspeed} km/h` : undefined}
    >
      <span className={cx('grid size-9 place-items-center rounded-full bg-surface', info?.tone ?? 'text-muted')}>
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <div className="font-semibold text-ink">
          Hà Nội <span className="ml-1 text-flame-600">{weather ? `${Math.round(weather.temperature)}°C` : '--°C'}</span>
        </div>
        <div className="text-[12px] text-muted tabular-nums">
          {now.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })} ·{' '}
          {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
      </div>
    </div>
  );
};
