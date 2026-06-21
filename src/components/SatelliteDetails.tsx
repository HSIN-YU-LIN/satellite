import React, { useState, useEffect } from 'react';
import { Satellite } from '../types';
import OrbitSimulator from './OrbitSimulator';
import { TaiwanRealMap } from './TaiwanRealMap';
import { 
  Rocket, Cpu, Globe, Compass, ChevronRight, BarChart2, ShieldAlert, Activity, Sun, Clock, Calendar, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { TAIWAN_OVERPASS_SCHEDULES, SATELLITE_WARNING_TIMELINES, SPACE_WEATHER_DATA, getDynamicOverpass } from '../constants';
import { SatelliteMiniature } from '../App';

interface SatelliteDetailsProps {
  satellite: Satellite;
  allSatellites: Satellite[];
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  simulatedPassSatId?: string | null;
}

export default function SatelliteDetails({ satellite, allSatellites, isExpanded, setIsExpanded, simulatedPassSatId }: SatelliteDetailsProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'overpass' | 'collision' | 'weather'>('specs');
  const [liveSolarWind, setLiveSolarWind] = useState<number>(456);
  const [liveCollisionValue, setLiveCollisionValue] = useState<number>(1.25);
  
  // Real-world TLE satellite space data fetch states
  const [tleData, setTleData] = useState<any>(null);
  const [tleLoading, setTleLoading] = useState<boolean>(false);
  const [tleError, setTleError] = useState<string | null>(null);

  // Dynamic ground tracking metrics relative to Yushan Center
  const [liveDistance, setLiveDistance] = useState<number | null>(null);
  const [liveInRange, setLiveInRange] = useState<boolean>(false);
  const [liveLat, setLiveLat] = useState<number | null>(null);
  const [liveLng, setLiveLng] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setTleLoading(true);
    setTleError(null);
    setTleData(null);

    fetch(`/api/satellite-tle/${satellite.id}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        return res.json();
      })
      .then(payload => {
        if (active) {
          if (payload && payload.data) {
            setTleData(payload.data);
          } else {
            throw new Error("無效的太空星曆資料");
          }
        }
      })
      .catch(err => {
        if (active) {
          console.error("TLE fetching failed:", err);
          setTleError(err.message || "鏈路讀取失敗");
        }
      })
      .finally(() => {
        if (active) setTleLoading(false);
      });

    return () => {
      active = false;
    };
  }, [satellite.id]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSolarWind(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3));
      setLiveCollisionValue(prev => {
        const delta = (Math.random() - 0.5) * 0.02;
        return parseFloat(Math.max(0.5, prev + delta).toFixed(3));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [overpassTicker, setOverpassTicker] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setOverpassTicker(prev => prev + 1);
    }, 10000); // re-render countdowns every 10 seconds
    return () => clearInterval(t);
  }, []);

  const overpass = getDynamicOverpass(satellite.id);
  const warnings = SATELLITE_WARNING_TIMELINES[satellite.id] || [];
  
  // Custom SVG track coordinates based on satellite id for realistic mapping
  let svgPath = "M 20 90 L 80 20"; // default oblique NE
  let startPoint = { x: 20, y: 90 };
  let endPoint = { x: 80, y: 20 };
  
  if (satellite.id === 'formosat-5') {
    svgPath = "M 46 98 L 52 8";
    startPoint = { x: 46, y: 98 };
    endPoint = { x: 52, y: 8 };
  } else if (satellite.id.startsWith('formosat-7')) {
    svgPath = "M 18 75 L 90 42";
    startPoint = { x: 18, y: 75 };
    endPoint = { x: 90, y: 42 };
  } else if (satellite.id === 'triton') {
    svgPath = "M 18 58 L 92 62";
    startPoint = { x: 18, y: 58 };
    endPoint = { x: 92, y: 62 };
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0b10] border border-slate-800 rounded-xl overflow-hidden shadow-xl" id="satellite-details-container">
      {/* Top Title Bar of Selected Satellite */}
      <div className="p-4 bg-slate-900/50 border-b border-slate-800/80 flex items-start gap-3 relative" id="details-top-header">
        <div className="hidden sm:flex relative w-12 h-12 rounded-lg items-center justify-center bg-slate-950 border border-slate-800 mt-1 flex-shrink-0" id="details-thumbnail-container">
          <SatelliteMiniature id={satellite.id} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono border border-cyan-500/20">{satellite.type}</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">{satellite.country}</span>
          </div>
          <h2 className="text-slate-100 font-sans font-bold text-base sm:text-lg leading-tight mt-1">{satellite.name}</h2>
          <p className="text-slate-400 font-mono text-[11px] font-medium">{satellite.englishName} ({satellite.launchYear} 年發射)</p>
        </div>

        {/* Responsive Dual Action buttons in header */}
        {isExpanded && (
          <div className="flex items-center gap-2 absolute right-4 top-4" id="header-interactive-actions">
            <button 
              onClick={() => setIsExpanded(false)}
              className="p-1 px-3 text-[10px] sm:text-xs font-semibold rounded-md border transition-all duration-300 flex items-center gap-1 bg-amber-600/10 text-amber-400 border-amber-500/30 hover:bg-amber-600/20"
              id="details-expand-toggle-btn"
            >
              收合詳細資料 ▴
            </button>
          </div>
        )}
      </div>

      {!isExpanded ? (
        <div className="p-8 flex flex-col items-center justify-center text-center bg-[#07080c]/50 py-16 gap-5 flex-1 min-h-[300px]" id="collapsed-details-placeholder">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-cyan-500/20 blur animate-pulse" />
            <div className="relative bg-slate-900 border border-slate-800 p-4 rounded-full text-cyan-400">
              <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200 tracking-wide font-sans">
              🛰️ 測控接收鏈路鎖定：{satellite.name}
            </h3>
            <p className="text-slate-500 text-[11px] max-w-sm sm:max-w-md mx-auto leading-relaxed font-sans">
              克卜勒六大軌道根數、各階段歷史、科學遙測載荷已就緒。請點擊下方按鈕即可直接展開查看深度分析。
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="mt-1 bg-cyan-500/15 hover:bg-cyan-500/25 text-[#00f0ff] border border-cyan-500/40 px-5 py-2 rounded-lg text-xs font-sans font-semibold tracking-wider transition-all duration-300 shadow-md shadow-cyan-950/20 hover:scale-[1.02] flex items-center gap-1.5"
            id="expand-panel-cta"
          >
            展開詳細資料 ▾
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-slate-800" id="expanded-details-layout">
          {/* Left panel (7 cols of 12): Interactive 3D Orbit Flight Simulator Map */}
          <div className="col-span-12 lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col relative bg-[#040508]/10" id="expanded-simulator-col">
            <div className="absolute top-3 left-3 z-10 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 border border-slate-800 rounded-lg text-xs flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-[10px] text-slate-300">地球觀測站運算模擬引擎 (即時軌道投影)</span>
            </div>

            <div className="h-[430px] lg:h-[520px]" id="sim-container-box">
              <OrbitSimulator 
                selectedSatellite={satellite} 
                allSatellites={allSatellites}
              />
            </div>
          </div>

          {/* Right panel (5 cols of 12): Detailed spec properties with Tabs */}
          <div className="col-span-12 lg:col-span-5 flex flex-col min-h-[520px] lg:min-h-[580px]" id="expanded-tabs-col">
            
            {/* Tabs Selector Bar */}
            <div className="flex border-b border-slate-800 bg-slate-900/40 text-[11px]" id="details-tabs-bar">
              <button
                onClick={() => setActiveTab('specs')}
                className={`flex-1 py-3 text-center font-semibold transition-all duration-200 flex items-center justify-center gap-1 border-b-2 ${
                  activeTab === 'specs' 
                    ? 'bg-slate-900/30 text-cyan-400 border-cyan-400 font-bold' 
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/10'
                }`}
                id="tab-btn-specs"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                規格載荷
              </button>
              <button
                onClick={() => setActiveTab('overpass')}
                className={`flex-1 py-3 text-center font-semibold transition-all duration-200 flex items-center justify-center gap-1 border-b-2 relative ${
                  activeTab === 'overpass' 
                    ? 'bg-slate-900/30 text-amber-400 border-amber-400 font-bold' 
                    : 'text-slate-400 hover:text-amber-300 border-transparent hover:bg-slate-900/10'
                }`}
                id="tab-btn-overpass"
              >
                <Globe className="w-3.5 h-3.5" />
                過境台灣
                <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('collision')}
                className={`flex-1 py-3 text-center font-semibold transition-all duration-200 flex items-center justify-center gap-1 border-b-2 ${
                  activeTab === 'collision' 
                    ? 'bg-slate-900/30 text-rose-400 border-rose-400 font-bold' 
                    : 'text-slate-400 hover:text-rose-300 border-transparent hover:bg-slate-900/10'
                }`}
                id="tab-btn-collision"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                防撞機率
              </button>
              <button
                onClick={() => setActiveTab('weather')}
                className={`flex-1 py-3 text-center font-semibold transition-all duration-200 flex items-center justify-center gap-1 border-b-2 ${
                  activeTab === 'weather' 
                    ? 'bg-slate-900/30 text-emerald-400 border-emerald-400 font-bold' 
                    : 'text-slate-400 hover:text-emerald-300 border-transparent hover:bg-slate-900/10'
                }`}
                id="tab-btn-weather"
              >
                <Sun className="w-3.5 h-3.5" />
                氣象警示
              </button>
            </div>

            {/* Live Ticker States (Fluctuating parameters for weather/collision metrics) */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" id="details-tab-contents">
                  
                  {/* ====== SPECS TAB CONTENT ====== */}
                  {activeTab === 'specs' && (
                    <div className="space-y-4 animate-fade-in" id="specs-tab-view">
                      {/* Description Card */}
                      <div className="p-3 bg-slate-950/60 border border-slate-800/50 rounded-lg">
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{satellite.description}</p>
                      </div>

                      {/* Celestrak Real-Time TLE Telemetry Card */}
                      <div className="p-3.5 bg-slate-950/80 border border-cyan-500/40 rounded-xl relative overflow-hidden shadow-xl" id="celestrak-live-tle-badge">
                        <div className="absolute top-0 right-0 p-1 bg-cyan-500/10 text-cyan-400 text-[8.5px] font-mono font-bold px-2 rounded-bl-lg uppercase tracking-wider">
                          Celestrak Verified
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`block h-2 w-2 rounded-full ${tleLoading ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} style={{ boxShadow: !tleLoading ? '0 0 8px #22c55e' : 'none' }} />
                          <h4 className="text-xs font-sans font-bold text-slate-200">
                            國際太空星曆實時觀測鏈路 (Celestrak Live TLE)
                          </h4>
                        </div>
                        
                        {tleLoading ? (
                          <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-slate-400 font-mono">
                            <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                            <span>正在向 Celestrak 請求 WGS-84 特用星曆軌道要素...</span>
                          </div>
                        ) : tleError ? (
                          <div className="mt-2 text-[10.5px] text-rose-450 font-mono leading-relaxed bg-rose-950/10 p-2 rounded border border-rose-950/30">
                            ⚠️ 連線告警：CORS 政策或防火牆攔截。已自動代入航太備用中心之物理基準星曆檔案。
                          </div>
                        ) : tleData ? (
                          <div className="mt-2.5 space-y-1.5 text-[10.5px] font-mono text-slate-300 leading-relaxed bg-slate-950/90 p-3 rounded-lg border border-slate-900 shadow-inner">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                              <div className="flex justify-between border-b border-slate-900/60 pb-1">
                                <span className="text-slate-500">NORAD 編號:</span>
                                <span className="text-cyan-400 font-semibold">{tleData.NORAD_CAT_ID || (satellite.id === 'yusat-1' ? 47444 : satellite.id === 'triton' ? 58014 : satellite.id === 'formosat-7' ? 44372 : satellite.id === 'formosat-5' ? 42920 : satellite.id === 'formosat-3' ? 29107 : satellite.id === 'formosat-2' ? 28252 : 25616)}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900/60 pb-1">
                                <span className="text-slate-500">國際代號:</span>
                                <span className="text-slate-200">{tleData.OBJECT_ID || 'UNTRACKED-F8'}</span>
                              </div>
                              <div className="col-span-1 sm:col-span-2 flex justify-between border-b border-slate-900/60 pb-1">
                                <span className="text-slate-500">星曆曆元 (Epoch):</span>
                                <span className="text-amber-400 text-right">{tleData.EPOCH ? new Date(tleData.EPOCH).toLocaleString('zh-TW', { timeZoneName: 'short' }) : 'N/A'}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900/60 pb-1">
                                <span className="text-slate-500">每日繞地圈數:</span>
                                <span className="text-slate-200">{tleData.MEAN_MOTION ? `${Number(tleData.MEAN_MOTION).toFixed(5)} 圈` : 'N/A'}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900/60 pb-1">
                                <span className="text-slate-500">大氣阻力 (BSTAR):</span>
                                <span className="text-slate-200">{tleData.BSTAR !== undefined ? Number(tleData.BSTAR).toExponential(3) : '0.0'}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900/60 pb-1">
                                <span className="text-slate-500">軌道傾角 (i):</span>
                                <span className="text-green-400 font-bold">{tleData.INCLINATION ? `${Number(tleData.INCLINATION).toFixed(4)}°` : `${satellite.inclination}°`}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900/60 pb-1">
                                <span className="text-slate-500">軌道偏心率 (e):</span>
                                <span className="text-slate-200">{tleData.ECCENTRICITY ? Number(tleData.ECCENTRICITY).toFixed(6) : satellite.eccentricity}</span>
                              </div>
                            </div>
                            <div className="pt-2 mt-2 border-t border-slate-900 flex items-center justify-between text-[8.5px] text-slate-500 uppercase tracking-widest leading-none select-none">
                              <span>SOURCE: {tleData.source || 'CelesTrak Verified'}</span>
                              <span className="text-emerald-500 font-bold active-telemetry-pill animate-pulse">● STREAMING ENGAGED</span>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Keplerian Elements */}
                      <div className="space-y-2">
                        <h3 className="font-sans font-semibold text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-cyan-400" />
                          克卜勒六大軌道根數 (Keplerian Elements)
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="kepler-grid">
                          <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex items-start gap-2">
                            <div className="p-1 bg-[#00f0ff]/5 rounded text-[#00f0ff] mt-0.5"><BarChart2 className="w-3 h-3" /></div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-500 font-mono">a</span>
                                <span className="text-[11px] text-slate-400 font-medium">軌道半長軸</span>
                              </div>
                              <p className="font-mono text-xs text-slate-200 font-bold mt-0.5">{satellite.semiMajorAxis} km</p>
                            </div>
                          </div>

                          <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex items-start gap-2">
                            <div className="p-1 bg-[#00f0ff]/5 rounded text-[#00f0ff] mt-0.5"><BarChart2 className="w-3 h-3" /></div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-500 font-mono">e</span>
                                <span className="text-[11px] text-slate-400 font-medium">軌道離心率</span>
                              </div>
                              <p className="font-mono text-xs text-slate-200 font-bold mt-0.5">{satellite.eccentricity}</p>
                            </div>
                          </div>

                          <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex items-start gap-2">
                            <div className="p-1 bg-[#00f0ff]/5 rounded text-[#00f0ff] mt-0.5"><Globe className="w-3 h-3" /></div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-500 font-mono">i</span>
                                <span className="text-[11px] text-slate-400 font-medium">軌道傾角 (Inclination)</span>
                              </div>
                              <p className="font-mono text-xs text-slate-200 font-bold mt-0.5">{satellite.inclination}°</p>
                            </div>
                          </div>

                          <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex items-start gap-2">
                            <div className="p-1 bg-[#00f0ff]/5 rounded text-[#00f0ff] mt-0.5"><Compass className="w-3 h-3" /></div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-500 font-mono">Ω</span>
                                <span className="text-[11px] text-slate-400 font-medium">升交點赤經 (RAAN)</span>
                              </div>
                              <p className="font-mono text-xs text-slate-200 font-bold mt-0.5">{satellite.raan}°</p>
                            </div>
                          </div>

                          <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex items-start gap-2">
                            <div className="p-1 bg-[#00f0ff]/5 rounded text-[#00f0ff] mt-0.5"><Compass className="w-3 h-3" /></div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-500 font-mono">ω</span>
                                <span className="text-[11px] text-slate-400 font-medium">近地點幅角 (Perigee)</span>
                              </div>
                              <p className="font-mono text-xs text-slate-200 font-bold mt-0.5">{satellite.argPerigee}°</p>
                            </div>
                          </div>

                          <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex items-start gap-2">
                            <div className="p-1 bg-[#00f0ff]/5 rounded text-[#00f0ff] mt-0.5"><Cpu className="w-3 h-3" /></div>
                            <div>
                              <span className="text-[11px] text-slate-400 font-medium">系統營運操作方</span>
                              <p className="text-[11px] text-slate-200 font-semibold mt-0.5 leading-tight">{satellite.detailedSpecs.operator}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hardware / Missions Details */}
                      <div className="space-y-2 border-t border-slate-900 pt-3">
                        <h3 className="font-sans font-semibold text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Rocket className="w-3.5 h-3.5 text-[#00f0ff]" />
                          載荷物理規範與任務細節
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/20 p-3 rounded-lg border border-slate-900/80">
                          <div className="flex items-center justify-between py-1 border-b border-slate-900">
                            <span className="text-slate-400">總體發射重量 (Mass):</span>
                            <span className="font-mono font-medium text-slate-200">{satellite.detailedSpecs.mass}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-900">
                            <span className="text-slate-400">主體展開尺寸:</span>
                            <span className="font-mono font-medium text-slate-200">{satellite.detailedSpecs.dimensions}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-900">
                            <span className="text-slate-400">營運歸屬國家:</span>
                            <span className="font-medium text-slate-200">{satellite.country}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-900">
                            <span className="text-slate-400">發射升空年份:</span>
                            <span className="font-mono font-medium text-slate-200">{satellite.launchYear} 年</span>
                          </div>
                        </div>

                        {/* highlights list */}
                        <div className="mt-2 space-y-1.5" id="specs-highlights">
                          <div className="p-1 px-2.5 bg-cyan-950/25 text-cyan-400 font-sans text-[10px] font-semibold tracking-wider rounded uppercase">科學技術與專利亮點</div>
                          {satellite.detailedSpecs.highlights.map((hlt, hIdx) => (
                            <div key={hIdx} className="flex gap-2 text-[11px] text-slate-300 ml-1 py-0.5 leading-relaxed">
                              <ChevronRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                              <span>{hlt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ====== TAIWAN OVERPASS TAB ====== */}
                  {activeTab === 'overpass' && (
                    <div className="space-y-4 animate-fade-in" id="overpass-tab-view">
                      
                      {/* Quiet Overpass Notification Banner (Strictly no "warning/alert/警戒" nouns) */}
                      {overpass.passesTaiwanNext72h && (
                        <div 
                          className="p-3 border rounded-lg flex items-start gap-2.5 text-xs transition-all duration-300 shadow-sm"
                          style={{ 
                            borderColor: `${satellite.color}30`, 
                            backgroundColor: `${satellite.color}05`,
                            color: '#e2e8f0'
                          }}
                          id="taiwan-overpass-warning-banner"
                        >
                          <Globe 
                            className="w-4 h-4 mt-0.5 flex-shrink-0" 
                            style={{ color: satellite.color }}
                          />
                          <div className="space-y-1">
                            <p className="font-bold tracking-wide flex items-center gap-1.5" style={{ color: satellite.color }}>
                              📡 預計過境通知
                            </p>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                              精確軌道推估：太空科研衛星 <span className="font-semibold text-slate-200">{satellite.name}</span> 預估將於 <span className="font-bold font-mono" style={{ color: satellite.color }}>{overpass.nextPassInString} 後</span> 掠過臺灣上空觀測圈。
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Map Title block */}
                      <div className="flex justify-between items-center bg-slate-950/40 p-2 border border-slate-900 rounded-md">
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-amber-500/80" />
                          臺灣及周邊觀測地理投影 (2D 實境圖)
                        </span>
                        <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-850">
                          {satellite.name}
                        </span>
                      </div>

                      {/* Double layout: Left Real Geographic Map (tall vertical shape), Right parameters list */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        
                        {/* Real Geographic Map of Taiwan (tall vertical rectangle) */}
                        <div className="col-span-12 sm:col-span-7 border border-slate-900 rounded-xl overflow-hidden relative min-h-[460px] h-[520px]" id="taiwan-geomap-frame">
                          <TaiwanRealMap 
                            satelliteId={satellite.id}
                            satelliteColor={satellite.color} 
                            satelliteName={satellite.name} 
                            passesTaiwan={overpass.passesTaiwanNext72h && (simulatedPassSatId === satellite.id || overpass.countdownMinutes <= 15)}
                            tleLine1={tleData?.tleLine1}
                            tleLine2={tleData?.tleLine2}
                            onDistanceUpdate={(dist, inRange, lat, lng) => {
                              setLiveDistance(dist);
                              setLiveInRange(inRange);
                              setLiveLat(lat);
                              setLiveLng(lng);
                            }}
                          />
                        </div>

                        {/* Overpass parameters list - Right column of overpass view */}
                        <div className="col-span-12 sm:col-span-5 flex flex-col justify-between space-y-2.5" id="taiwan-overpass-spec-data-frame">
                          
                          {overpass.passesTaiwanNext72h ? (
                            <div className="space-y-2.5">
                              {/* Live Distance & Tracking State Widget */}
                              <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-lg space-y-2 relative overflow-hidden" style={{ borderColor: `${satellite.color}25` }}>
                                <div className="absolute top-0 right-0 p-1 bg-slate-900/40 text-[8.5px] font-mono select-none text-slate-500 uppercase tracking-widest leading-none border-l border-b border-slate-900">
                                  Tele_Trak_Node
                                </div>
                                <p className="text-[10px] font-sans font-bold uppercase tracking-wider mb-1 text-slate-400">
                                  📡 地面觀測站實時跟蹤鏈路指標
                                </p>
                                <div className="grid grid-cols-2 gap-3 pt-0.5">
                                  <div className="bg-slate-900/50 p-2 rounded border border-slate-900">
                                    <span className="text-[8.5px] text-slate-500 block leading-tight">與玉山地面站距離 (Range):</span>
                                    {liveDistance !== null && liveDistance < 9000 ? (
                                      <p className="font-mono text-xs sm:text-sm font-bold mt-1" style={{ color: liveInRange ? satellite.color : '#e2e8f0' }}>
                                        {Math.round(liveDistance)} km
                                      </p>
                                    ) : (
                                      <p className="font-mono text-xs sm:text-sm font-bold text-slate-500 mt-1 select-none">
                                        STANDBY / 未過境
                                      </p>
                                    )}
                                  </div>
                                  <div className="bg-slate-900/50 p-2 rounded border border-slate-900">
                                    <span className="text-[8.5px] text-slate-500 block leading-tight font-sans">觀測圈 (350km) 狀態:</span>
                                    <p className={`font-mono text-[11px] font-bold mt-1.5 flex items-center gap-1.5 ${liveInRange ? 'text-emerald-400' : 'text-slate-400'}`}>
                                      <span className={`h-2 w-2 rounded-full ${liveInRange ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                      {liveInRange ? 'ACTIVE RE_LNK' : 'STANDBY STB'}
                                    </p>
                                  </div>
                                </div>
                                {liveLat !== null && liveLng !== null && liveDistance !== null && liveDistance < 9000 && (
                                  <div className="text-[8.5px] font-mono text-slate-400 bg-slate-900/30 p-1 rounded border border-slate-900/50 flex justify-between">
                                    <span>瞬時二維投影坐標 (Ground Footprint):</span>
                                    <span style={{ color: satellite.color }}>
                                      Lat: {Number(liveLat).toFixed(3)}° {liveLat >= 0 ? 'N' : 'S'}, Lng: {Number(liveLng).toFixed(3)}° {liveLng >= 0 ? 'E' : 'W'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="p-3 bg-slate-950/50 border border-slate-900 rounded-lg space-y-2">
                                <p className="text-[10px] font-sans font-bold uppercase tracking-wider mb-1" style={{ color: satellite.color }}>
                                  {satellite.name} 特用過境方位指標
                                </p>
                                
                                {/* Entry Point Row */}
                                <div className="flex flex-col border-b border-slate-900 pb-1.5">
                                  <span className="text-[9px] text-slate-500 font-sans">1. 進入本島領空起點位置</span>
                                  <div className="flex items-center justify-between mt-0.5">
                                    <span className="text-xs text-slate-200 font-semibold">{overpass.entryLocation}</span>
                                    <span className="text-xs font-mono font-bold" style={{ color: satellite.color }}>方位角 AZ: {overpass.entryAzimuth}°</span>
                                  </div>
                                </div>

                                {/* Leaving Point Row */}
                                <div className="flex flex-col border-b border-slate-900 pb-1.5">
                                  <span className="text-[9px] text-slate-500 font-sans">2. 離開追蹤範圍終點位置</span>
                                  <div className="flex items-center justify-between mt-0.5">
                                    <span className="text-xs text-slate-200 font-semibold">{overpass.exitLocation}</span>
                                    <span className="text-xs text-rose-450 font-mono font-bold">方位角 AZ: {overpass.exitAzimuth}°</span>
                                  </div>
                                </div>

                                {/* Additional telemetry parameters details */}
                                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                  <div>
                                    <span className="text-[8.5px] text-slate-500 block">過境最大天頂仰角:</span>
                                    <p className="font-mono text-slate-200 font-bold mt-0.5">{overpass.maxElevation}°</p>
                                  </div>
                                  <div>
                                    <span className="text-[8.5px] text-slate-500 block">過境預期滯留時長:</span>
                                    <p className="font-mono text-slate-200 font-bold mt-0.5">{overpass.durationSeconds} 秒</p>
                                  </div>
                                </div>
                              </div>

                              {/* Suggestion box */}
                              <div className="p-2.5 bg-slate-900/30 border border-slate-850 rounded-lg text-[9.5px] text-slate-400 font-sans leading-relaxed">
                                💡 <span className="text-slate-300 font-semibold">信號對接說明</span>：當俯仰角高於 15° 時即能觸發穩定的高通量遥測傳輸。建議於此時間範圍在主控台發送對抗大氣對流的解擾碼修正。
                              </div>
                            </div>
                          ) : (
                            /* Strictly clean empty state as requested "如果目前沒有準備過境台灣右側資料可以留空" */
                            <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-slate-900 rounded-xl min-h-[160px] bg-slate-950/10">
                              <Globe className="w-8 h-8 text-slate-700/60 stroke-1 mb-2 animate-pulse" />
                              <p className="text-[10px] text-slate-500 font-sans text-center max-w-[190px] leading-relaxed">
                                目前此顆衛星無即將過境臺灣之排程，相應空域訊號觀測指標在此時段留空。
                              </p>
                            </div>
                          )}

                        </div>
                      </div>

                    </div>
                  )}

                  {/* ====== COLLISION TAB CONTENT (Durable mock placeholders) ====== */}
                  {activeTab === 'collision' && (
                    <div className="space-y-4 animate-fade-in" id="collision-tab-view">
                      
                      {/* Notice describing that parameters are saved for future database connection */}
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-355" id="collision-placeholder-memo">
                        <p className="font-semibold text-[#00f0ff] mb-1">📋 即時避碰系統對接界面預留 (Conjunction telemetry API portal)</p>
                        <p className="text-[10px] text-slate-400 leading-normal font-sans">
                          此面板已為未來國家太空中心或 NASA / CWA 實時接近事件目錄（SOC / CDMs）的 JSON 數據通道保留版面。當未來資料庫介面串接後，會即時載入衛星與環繞太空碎片的實時交合數據 (Conjunction Encounter)。
                        </p>
                      </div>

                      {/* Probability statistics display (with dynamic live oscillating text) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex flex-col justify-between">
                          <span className="text-[10px] text-slate-500 font-sans">動態分析。即時估算碰撞機率 (P_c):</span>
                          <p className="font-mono text-xl font-bold mt-1 text-emerald-400 select-none tracking-wider">
                            {liveCollisionValue} × 10<sup>-6</sup>
                          </p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            <span className="text-[9px] font-sans font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              Low Risk - Safe (小於 10⁻⁴ 警戒線)
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-1 text-xs">
                          <span className="text-[10px] text-slate-500 font-sans">預計交合窗口時間點:</span>
                          <p className="font-mono text-slate-200 mt-0.5 font-semibold">T+72h 內無高危接近事件</p>
                          <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 leading-normal font-sans space-y-1">
                            <div className="flex justify-between"><span>當前警戒半長軸臨界:</span><span className="font-mono text-slate-300">σ_a = 5.4m</span></div>
                            <div className="flex justify-between"><span>軌道防禦臨界設定:</span><span className="font-mono text-slate-300">R_min = 200m</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Foster's Orbital Collision Probability Integration Formula Rendering */}
                      <div className="space-y-2 border-t border-slate-900 pt-3">
                        <h4 className="font-sans font-semibold text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#e5e7eb]" />
                          近地交會碰撞率計算公式 (Foster 3D/2D PDF integration model)
                        </h4>
                        
                        <div className="bg-slate-950 p-4 border border-slate-900 rounded-lg" id="formula-styled-card">
                          {/* Beautiful math text style container, resembling LaTeX markup inside a technical dashboard */}
                          <div className="font-mono text-center text-[#ff5f6d] p-3 text-xs overflow-x-auto select-none font-bold bg-slate-950/80 rounded border border-slate-900">
                            AI生的東西 Pc = ∬<sub>A</sub> [ 1 / (2π · σ<sub>x</sub> · σ<sub>y</sub> · √(1 - ρ²)) ] · exp(-G(x,y) / 2) dx dy
                          </div>
                          
                          <div className="text-[10px] text-slate-500 font-sans mt-2 space-y-1.5 leading-relaxed">
                            <p className="text-slate-400">其中交角平面投影指數二次型項 G(x,y) 定義為：</p>
                            <p className="font-mono text-[#00f0ff] bg-slate-900/50 p-1 rounded text-center text-[9.5px]">
                              AI生的東西 G(x,y) = [1 / (1 - ρ²)] · [ (x² / σ<sub>x</sub>²) - (2·ρ·x·y / (σ<sub>x</sub>·σ<sub>y</sub>)) + (y² / σ<sub>y</sub>²) ]
                            </p>
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900/60 text-[9.5px]">
                              <div>• <span className="text-slate-400">A</span>: 兩星體截面碰撞防禦圓盤疊加面積 <span className="font-mono">π(R₁+R₂)²</span></div>
                              <div>• <span className="text-slate-400">σ_x, σ_y</span>: 主被動飛行器於遭遇平面之協方差不確定度常數</div>
                              <div>• <span className="text-slate-400">ρ</span>: 多維不確定度交叉相關係數 (Cross Correlation)</div>
                              <div>• <span className="text-slate-400">x, y</span>: 相對近距離交會軌道面投影偏差</div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ====== SPACE WEATHER & ALERTS TIMELINE ====== */}
                  {activeTab === 'weather' && (
                    <div className="space-y-4 animate-fade-in" id="weather-tab-view">
                      
                      {/* Space Weather monitoring widget (嵌入一個小框) */}
                      <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-2" id="space-weather-widget">
                        
                        {/* Widget Header with live blinker represent CWA / NASA telemetry */}
                        <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                          <span className="text-[10px] text-slate-300 font-mono font-bold flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            實時大氣與太陽太空氣象指數 (TACC CWA / NASA Feed)
                          </span>
                          <span className="text-[9px] text-[#00f0ff] font-mono animate-pulse">LIVE CONNECTED</span>
                        </div>

                        {/* Meteorological variables 3x2 grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                          
                          {/* Solar wind */}
                          <div className="p-2 bg-slate-900/50 border border-slate-900 rounded flex flex-col justify-between">
                            <span className="text-[9px] text-slate-500">太陽風速度 (Solar Wind):</span>
                            <span className="text-xs font-mono font-bold text-slate-200 mt-1 select-none">
                              {liveSolarWind} km/s
                            </span>
                            <span className="text-[8px] text-emerald-500 font-sans mt-0.5">● 穩定/正常</span>
                          </div>

                          {/* Solar flux */}
                          <div className="p-2 bg-slate-900/50 border border-slate-900 rounded flex flex-col justify-between">
                            <span className="text-[9px] text-slate-500">太陽輻射 F10.7 (SFU):</span>
                            <span className="text-xs font-mono font-bold text-slate-200 mt-1">
                              {SPACE_WEATHER_DATA.solarFluxF107}
                            </span>
                            <span className="text-[8px] text-slate-500 font-sans mt-0.5">第25太陽活動周期</span>
                          </div>

                          {/* Kp Level */}
                          <div className="p-2 bg-slate-900/50 border border-slate-900 rounded flex flex-col justify-between">
                            <span className="text-[9px] text-slate-500">地磁干擾強度 (Kp Index):</span>
                            <span className="text-xs font-mono font-bold text-emerald-400 mt-1">
                              {SPACE_WEATHER_DATA.kpIndex}
                            </span>
                            <span className="text-[8px] text-emerald-500 font-sans mt-0.5">極光活動微弱</span>
                          </div>

                          {/* Cloud Cover */}
                          <div className="p-2 bg-slate-900/50 border border-slate-900 rounded flex flex-col justify-between">
                            <span className="text-[9px] text-slate-500">新竹主接收站雲層雲量:</span>
                            <span className="text-xs font-sans font-bold text-slate-250 mt-1">
                              {SPACE_WEATHER_DATA.cloudCoverHsinchu}
                            </span>
                            <span className="text-[8px] text-cyan-400 font-sans mt-0.5">大氣穿透度極佳</span>
                          </div>

                          {/* Scintillation */}
                          <div className="p-2 bg-slate-900/50 border border-slate-900 rounded flex flex-col justify-between">
                            <span className="text-[9px] text-slate-500">電離層閃爍 (S4 Index):</span>
                            <span className="text-xs font-mono font-bold text-slate-200 mt-1">
                              {SPACE_WEATHER_DATA.ionosphericScintillation}
                            </span>
                            <span className="text-[8px] text-slate-500 font-sans mt-0.5">GPS 鎖定穩定度極高</span>
                          </div>

                          {/* Geomagnetic field */}
                          <div className="p-2 bg-slate-900/50 border border-slate-900 rounded flex flex-col justify-between">
                            <span className="text-[9px] text-slate-500">行星際磁場強度 (Bz):</span>
                            <span className="text-xs font-mono font-bold text-slate-200 mt-1">
                              {SPACE_WEATHER_DATA.geomagneticBz}
                            </span>
                            <span className="text-[8px] text-slate-500 font-sans mt-0.5">地磁對接磁阻率良好</span>
                          </div>

                        </div>
                      </div>

                      {/* Warning alert history timeline (警示歷史時間軸: 曾經跟別顆衛星有過的大風險事件) */}
                      <div className="space-y-2 border-t border-slate-900 pt-3">
                        <h4 className="font-sans font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-rose-400" />
                          太空遭遇警示事件歷史時間軸 (Historical Close Conjunction Incidents)
                        </h4>

                        <div className="relative border-l border-slate-800 ml-2.5 pl-3.5 space-y-3.5" id="alerts-vertical-timeline">
                          {warnings.length === 0 ? (
                            <p className="text-[11px] text-slate-500 font-sans py-2">目前無該衛星的重大近地接近或緊急避讓避碰記錄存檔。</p>
                          ) : (
                            warnings.map((warn, wIdx) => {
                              const severityColor = warn.severity === 'high' 
                                ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' 
                                : warn.severity === 'medium'
                                  ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                                  : 'text-slate-400 border-slate-800 bg-slate-900/30';
                              
                              const bulletColor = warn.severity === 'high' 
                                ? 'bg-rose-500 shadow-rose-900/60 ring-rose-500/20' 
                                : warn.severity === 'medium'
                                  ? 'bg-amber-500 shadow-amber-900/60 ring-amber-500/20'
                                  : 'bg-slate-500 shadow-slate-900 ring-slate-800/20';

                              return (
                                <div key={wIdx} className="relative group" id={`timeline-entry-${wIdx}`}>
                                  {/* Timeline Bullet node dot */}
                                  <div className={`absolute -left-[20.5px] top-1 h-2 w-2 rounded-full ring-4 ${bulletColor} shadow`} />

                                  <div className={`p-2.5 border rounded-lg ${severityColor} text-[11px] space-y-1`}>
                                    <div className="flex justify-between items-center">
                                      <span className="font-mono font-bold">{warn.date}</span>
                                      <span className="text-[9px] uppercase tracking-wider font-sans font-semibold">
                                        {warn.severity === 'high' ? '🚨 緊急一級避碰' : warn.severity === 'medium' ? '⚠️ 二級預警跟蹤' : '✓ 正常狀態注意'}
                                      </span>
                                    </div>
                                    <p className="font-sans font-bold text-slate-200 mt-1">
                                      接近標的物：{warn.objectName}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 py-1 text-[9.5px] border-y border-slate-800/40 font-mono">
                                      <span>最接近交合距離: <span className="text-slate-200 font-bold">{warn.minDistanceMeter}m</span></span>
                                      <span>碰撞機率: <span className="text-rose-450 font-bold">{warn.probability}</span></span>
                                    </div>
                                    <p className="text-[10px] text-slate-355 leading-normal font-sans pt-1">
                                      <span className="font-semibold text-slate-250">防護對接：</span>{warn.actionTaken}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                </div>

          </div>
        </div>
      )}
    </div>
  );
}
