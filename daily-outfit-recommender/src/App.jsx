import { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000/api";

function App() {
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [selectedProvinsi, setSelectedProvinsi] = useState("");
  const [selectedKota, setSelectedKota] = useState("");

  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchProvinsi = async () => {
      try {
        const res = await fetch(`${API_BASE}/provinsi`);
        const data = await res.json();
        setProvinsiList(data);
      } catch (err) {
        console.error("Gagal ambil provinsi:", err);
      }
    };
    fetchProvinsi();
  }, []);

  useEffect(() => {
    if (!selectedProvinsi) {
      setKotaList([]);
      setSelectedKota("");
      return;
    }
    const fetchKota = async () => {
      try {
        const res = await fetch(`${API_BASE}/kota?provinsi_id=${selectedProvinsi}`);
        const data = await res.json();
        setKotaList(data);
        setSelectedKota("");
        setLocation(null);
        setWeather(null);
        setRecommendations([]);
      } catch (err) {
        console.error("Gagal ambil kota:", err);
      }
    };
    fetchKota();
  }, [selectedProvinsi]);

  const generateRecommendation = (temperature, precipitation, uvIndex, windSpeed) => {
    const result = [];
    if (temperature < 20) result.push("Gunakan jaket atau sweater untuk menghangatkan tubuh");
    else if (temperature < 30) result.push("Gunakan pakaian casual yang nyaman");
    else result.push("Gunakan pakaian berbahan tipis dan menyerap keringat");
    if (precipitation > 50) result.push("Bawa payung atau jas hujan sebagai antisipasi");
    if (uvIndex > 7) result.push("Gunakan sunscreen dan topi untuk melindungi kulit");
    if (windSpeed > 20) result.push("Kenakan outer untuk melindungi dari angin kencang");
    setRecommendations(result);
  };

  const getWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=precipitation_probability,uv_index`
      );
      const data = await response.json();
      const weatherData = {
        temperature: data.current?.temperature_2m ?? 0,
        windSpeed: data.current?.wind_speed_10m ?? 0,
        precipitation: data.hourly?.precipitation_probability?.[0] ?? 0,
        uvIndex: data.hourly?.uv_index?.[0] ?? 0,
      };
      setWeather(weatherData);
      generateRecommendation(
        weatherData.temperature,
        weatherData.precipitation,
        weatherData.uvIndex,
        weatherData.windSpeed
      );
    } catch (error) {
      console.error("Gagal mengambil cuaca:", error);
    }
  };

  const handleKotaChange = (e) => {
    const kotaId = e.target.value;
    setSelectedKota(kotaId);
    if (!kotaId) {
      setLocation(null);
      setWeather(null);
      setRecommendations([]);
      return;
    }
    const kota = kotaList.find((k) => String(k.id) === String(kotaId));
    if (!kota) return;
    const latitude = parseFloat(kota.latitude);
    const longitude = parseFloat(kota.longitude);
    setLocation({ name: kota.nama_kota, latitude, longitude });
    getWeather(latitude, longitude);
  };

  // Deskripsi kondisi berdasar suhu
  const getWeatherLabel = (temp) => {
    if (temp < 20) return "Sejuk";
    if (temp < 27) return "Nyaman";
    if (temp < 32) return "Hangat";
    return "Panas";
  };

  const formatDate = () => {
    const d = new Date();
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #eef2f7;
          color: #0f172a;
          -webkit-font-smoothing: antialiased;
        }

        .app {
          min-height: 100vh;
          background:
            radial-gradient(1200px 600px at 50% -200px, #dbe7f5 0%, transparent 60%),
            linear-gradient(180deg, #eef2f7 0%, #e2e8f0 100%);
          padding: 40px 20px 60px;
        }

        .container {
          max-width: 760px;
          margin: 0 auto;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 28px;
          padding: 0 4px;
        }
        .brand {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.3px;
        }
        .brand-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          margin-right: 8px;
          vertical-align: middle;
        }
        .date {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        /* Card base */
        .card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 16px;
          box-shadow:
            0 1px 2px rgba(15, 23, 42, 0.04),
            0 8px 24px rgba(15, 23, 42, 0.04);
        }

        .card-title {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 18px;
        }

        /* Form */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 560px) {
          .form-grid { grid-template-columns: 1fr; }
        }

        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 8px;
          letter-spacing: 0.2px;
        }

        .select {
          width: 100%;
          padding: 12px 14px;
          font-size: 14px;
          font-family: inherit;
          font-weight: 500;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          background: #f8fafc;
          color: #0f172a;
          outline: none;
          cursor: pointer;
          transition: all 0.15s;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 40px;
        }
        .select:hover:not(:disabled) {
          border-color: #94a3b8;
          background: #ffffff;
        }
        .select:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .select:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          background: #f1f5f9;
        }

        /* Hero weather card */
        .hero {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border: 1px solid #1e293b;
          border-radius: 24px;
          padding: 32px;
          color: #fff;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 1px 2px rgba(15, 23, 42, 0.1),
            0 20px 40px rgba(15, 23, 42, 0.15);
        }
        .hero::before {
          content: "";
          position: absolute;
          top: -80px;
          right: -80px;
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(96, 165, 250, 0.25) 0%, transparent 70%);
          border-radius: 50%;
        }
        .hero-content {
          position: relative;
          z-index: 1;
        }
        .hero-location {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          font-weight: 500;
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }
        .hero-location svg {
          width: 14px;
          height: 14px;
          stroke: rgba(255,255,255,0.65);
        }
        .hero-city {
          font-size: 22px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 24px;
          letter-spacing: -0.4px;
        }
        .hero-temp-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .hero-temp {
          font-size: 88px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: -3px;
          color: #fff;
        }
        .hero-temp-unit {
          font-size: 32px;
          font-weight: 300;
          color: rgba(255,255,255,0.6);
          margin-left: 4px;
        }
        .hero-label {
          text-align: right;
        }
        .hero-condition {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }
        .hero-coord {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          font-family: 'SFMono-Regular', 'Menlo', monospace;
        }

        /* Weather stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (max-width: 560px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
        .stat {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px;
        }
        .stat-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .stat-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
        }
        .stat-icon svg { width: 16px; height: 16px; }
        .stat-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }
        .stat-value {
          font-size: 26px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .stat-unit {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          margin-left: 3px;
        }
        .stat-bar {
          margin-top: 12px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }
        .stat-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        /* Recommendations */
        .rec-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .rec-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: border-color 0.15s, background 0.15s;
        }
        .rec-item:hover {
          border-color: #cbd5e1;
          background: #ffffff;
        }
        .rec-check {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #dbeafe;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
        }
        .rec-check svg { width: 12px; height: 12px; }
        .rec-text {
          font-size: 14px;
          color: #1e293b;
          line-height: 1.5;
          font-weight: 500;
        }

        /* Empty state */
        .empty {
          text-align: center;
          padding: 48px 20px;
          color: #94a3b8;
        }
        .empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: #94a3b8;
        }
        .empty-icon svg { width: 24px; height: 24px; }
        .empty-title {
          font-size: 15px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 4px;
        }
        .empty-desc {
          font-size: 13px;
          color: #94a3b8;
        }
      `}</style>

      <div className="app">
        <div className="container">
          <div className="header">
            <div className="brand">
              <span className="brand-dot" />
              Weather Outfit
            </div>
            <div className="date">{formatDate()}</div>
          </div>

          <div className="card">
            <div className="card-title">Pilih Lokasi</div>
            <div className="form-grid">
              <div>
                <label className="form-label">Provinsi</label>
                <select
                  className="select"
                  value={selectedProvinsi}
                  onChange={(e) => setSelectedProvinsi(e.target.value)}
                >
                  <option value="">Pilih provinsi</option>
                  {provinsiList.map((p) => (
                    <option key={p.id} value={p.id}>{p.nama_provinsi}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Kota / Kabupaten</label>
                <select
                  className="select"
                  value={selectedKota}
                  onChange={handleKotaChange}
                  disabled={!selectedProvinsi || kotaList.length === 0}
                >
                  <option value="">Pilih kota</option>
                  {kotaList.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama_kota}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!location && (
            <div className="card">
              <div className="empty">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="empty-title">Belum ada lokasi dipilih</div>
                <div className="empty-desc">Silakan pilih provinsi dan kota untuk melihat cuaca</div>
              </div>
            </div>
          )}

          {location && weather && (
            <div className="hero">
              <div className="hero-content">
                <div className="hero-location">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Lokasi saat ini
                </div>
                <div className="hero-city">{location.name}</div>
                <div className="hero-temp-row">
                  <div className="hero-temp">
                    {Math.round(weather.temperature)}<span className="hero-temp-unit">°C</span>
                  </div>
                  <div className="hero-label">
                    <div className="hero-condition">{getWeatherLabel(weather.temperature)}</div>
                    <div className="hero-coord">{location.latitude}, {location.longitude}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {weather && (
            <div className="card">
              <div className="card-title">Detail Cuaca</div>
              <div className="stats-grid">
                <div className="stat">
                  <div className="stat-header">
                    <div className="stat-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/>
                        <path d="M8 19v1"/><path d="M8 14v1"/>
                        <path d="M16 19v1"/><path d="M16 14v1"/>
                        <path d="M12 21v1"/><path d="M12 16v1"/>
                      </svg>
                    </div>
                    <span className="stat-label">Peluang Hujan</span>
                  </div>
                  <div className="stat-value">
                    {weather.precipitation}<span className="stat-unit">%</span>
                  </div>
                  <div className="stat-bar">
                    <div className="stat-bar-fill" style={{ width: `${Math.min(weather.precipitation, 100)}%` }} />
                  </div>
                </div>

                <div className="stat">
                  <div className="stat-header">
                    <div className="stat-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4"/>
                        <path d="M12 2v2"/><path d="M12 20v2"/>
                        <path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/>
                        <path d="M2 12h2"/><path d="M20 12h2"/>
                        <path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/>
                      </svg>
                    </div>
                    <span className="stat-label">Indeks UV</span>
                  </div>
                  <div className="stat-value">{weather.uvIndex}</div>
                  <div className="stat-bar">
                    <div className="stat-bar-fill" style={{ width: `${Math.min((weather.uvIndex / 11) * 100, 100)}%` }} />
                  </div>
                </div>

                <div className="stat">
                  <div className="stat-header">
                    <div className="stat-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
                        <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
                        <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
                      </svg>
                    </div>
                    <span className="stat-label">Kecepatan Angin</span>
                  </div>
                  <div className="stat-value">
                    {Math.round(weather.windSpeed)}<span className="stat-unit"> km/j</span>
                  </div>
                  <div className="stat-bar">
                    <div className="stat-bar-fill" style={{ width: `${Math.min((weather.windSpeed / 40) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="card">
              <div className="card-title">Rekomendasi Outfit</div>
              <div className="rec-list">
                {recommendations.map((item, index) => (
                  <div key={index} className="rec-item">
                    <div className="rec-check">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <div className="rec-text">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;