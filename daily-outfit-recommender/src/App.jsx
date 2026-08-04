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

  // Load daftar provinsi saat pertama kali render
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

  // Saat provinsi dipilih, load daftar kota
  useEffect(() => {
    if (!selectedProvinsi) {
      setKotaList([]);
      setSelectedKota("");
      return;
    }

    const fetchKota = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/kota?provinsi_id=${selectedProvinsi}`
        );
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

  const generateRecommendation = (
    temperature,
    precipitation,
    uvIndex,
    windSpeed
  ) => {
    const result = [];

    if (temperature < 20) {
      result.push("🧥 Gunakan jaket atau sweater");
    } else if (temperature < 30) {
      result.push("👕 Gunakan outfit casual yang nyaman");
    } else {
      result.push("👕 Gunakan pakaian tipis dan adem");
    }

    if (precipitation > 50) {
      result.push("☔ Bawa payung atau jas hujan");
    }

    if (uvIndex > 7) {
      result.push("🧴 Gunakan sunscreen dan topi");
    }

    if (windSpeed > 20) {
      result.push("💨 Gunakan outer untuk melindungi dari angin");
    }

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

  // Saat kota dipilih, ambil koordinat dari data kota lalu fetch cuaca
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

    setLocation({
      name: kota.nama_kota,
      latitude,
      longitude,
    });

    getWeather(latitude, longitude);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Daily Outfit & Gear Recommender</h1>

      <div style={{ marginBottom: "12px" }}>
        <label style={{ marginRight: "8px" }}>Provinsi:</label>
        <select
          value={selectedProvinsi}
          onChange={(e) => setSelectedProvinsi(e.target.value)}
        >
          <option value="">-- Pilih Provinsi --</option>
          {provinsiList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama_provinsi}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label style={{ marginRight: "8px" }}>Kota:</label>
        <select
          value={selectedKota}
          onChange={handleKotaChange}
          disabled={!selectedProvinsi || kotaList.length === 0}
        >
          <option value="">-- Pilih Kota --</option>
          {kotaList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama_kota}
            </option>
          ))}
        </select>
      </div>

      {location && (
        <div>
          <h3>Lokasi Ditemukan</h3>
          <p>Nama Kota: {location.name}</p>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
        </div>
      )}

      {weather && (
        <div>
          <h3>Data Cuaca</h3>
          <p>🌡️ Suhu: {weather.temperature}°C</p>
          <p>🌧️ Peluang Hujan: {weather.precipitation}%</p>
          <p>☀️ UV Index: {weather.uvIndex}</p>
          <p>💨 Kecepatan Angin: {weather.windSpeed} km/h</p>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h3>Rekomendasi Outfit & Gear</h3>
          {recommendations.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;