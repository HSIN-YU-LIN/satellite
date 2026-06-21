import React, { useState, useEffect } from 'react';
import { SATELLITES_DATA, DEFAULT_YOUTUBE_URLS, TAIWAN_OVERPASS_SCHEDULES, getDynamicOverpass } from './constants';
import { Satellite } from './types';
import OrbitSimulator from './components/OrbitSimulator';
import SatelliteDetails from './components/SatelliteDetails';
import { 
  Compass, Globe, Satellite as SatIcon, Eye, Radio, Play, Pause, 
  Settings, Clock, ChevronRight, HelpCircle, ExternalLink, RefreshCw, Youtube, Lock
} from 'lucide-react';

export function SatelliteMiniature({ id }: { id: string }) {
  const lowerId = id.toLowerCase();
  
  if (lowerId === 'formosat-5') {
    return (
      <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-[0_0_6px_rgba(234,179,8,0.65)]">
        {/* Solar arrays */}
        <rect x="2" y="27" width="16" height="10" rx="1" fill="#1e293b" stroke="#eab308" strokeWidth="1" />
        <line x1="6" y1="27" x2="6" y2="37" stroke="#eab308" opacity="0.3" strokeWidth="0.5" />
        <line x1="10" y1="27" x2="10" y2="37" stroke="#eab308" opacity="0.3" strokeWidth="0.5" />
        <line x1="14" y1="27" x2="14" y2="37" stroke="#eab308" opacity="0.3" strokeWidth="0.5" />
        
        <rect x="46" y="27" width="16" height="10" rx="1" fill="#1e293b" stroke="#eab308" strokeWidth="1" />
        <line x1="50" y1="27" x2="50" y2="37" stroke="#eab308" opacity="0.3" strokeWidth="0.5" />
        <line x1="54" y1="27" x2="54" y2="37" stroke="#eab308" opacity="0.3" strokeWidth="0.5" />
        <line x1="58" y1="27" x2="58" y2="37" stroke="#eab308" opacity="0.3" strokeWidth="0.5" />
        
        {/* Connection strut */}
        <line x1="18" y1="32" x2="46" y2="32" stroke="#94a3b8" strokeWidth="2.5" />
        
        {/* Body hexagon */}
        <polygon points="24,20 40,20 44,32 40,44 24,44 20,32" fill="#eab308" stroke="#fef08a" strokeWidth="1" />
        <rect x="27" y="25" width="10" height="14" fill="#a16207" rx="0.5" opacity="0.4" />
        
        {/* Lens */}
        <rect x="28" y="44" width="8" height="6" fill="#1e293b" stroke="#eab308" strokeWidth="1" />
        <circle cx="32" cy="50" r="2.5" fill="#06b6d4" />
        
        {/* Antenna */}
        <line x1="32" y1="20" x2="32" y2="10" stroke="#fef08a" strokeWidth="1.5" />
        <circle cx="32" cy="9" r="1.5" fill="#fef08a" />
      </svg>
    );
  }
  
  if (lowerId.startsWith('formosat-7')) {
    return (
      <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-[0_0_6px_rgba(6,182,212,0.65)]">
        {/* Symmetric flat solar wings */}
        <rect x="2" y="28" width="16" height="8" rx="1" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
        <line x1="2" y1="32" x2="18" y2="32" stroke="#06b6d4" strokeWidth="0.8" />
        <line x1="7" y1="28" x2="7" y2="36" stroke="#06b6d4" strokeWidth="0.5" opacity="0.4" />
        <line x1="13" y1="28" x2="13" y2="36" stroke="#06b6d4" strokeWidth="0.5" opacity="0.4" />
        
        <rect x="46" y="28" width="16" height="8" rx="1" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
        <line x1="46" y1="32" x2="62" y2="32" stroke="#06b6d4" strokeWidth="0.8" />
        <line x1="51" y1="28" x2="51" y2="36" stroke="#06b6d4" strokeWidth="0.5" opacity="0.4" />
        <line x1="57" y1="28" x2="57" y2="36" stroke="#06b6d4" strokeWidth="0.5" opacity="0.4" />
        
        <line x1="18" y1="32" x2="46" y2="32" stroke="#cbd5e1" strokeWidth="2" />
        
        {/* Main central cube body */}
        <rect x="24" y="21" width="16" height="22" rx="1.5" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
        
        {/* Constellation Antenna circular sensors */}
        <circle cx="28" cy="26" r="1.2" fill="#06b6d4" />
        <circle cx="36" cy="26" r="1.2" fill="#06b6d4" />
        <circle cx="32" cy="32" r="2" fill="#22d3ee" />
        
        {/* Tri-band payload mast */}
        <line x1="32" y1="43" x2="32" y2="52" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="27" y1="52" x2="37" y2="52" stroke="#06b6d4" strokeWidth="1" />
      </svg>
    );
  }
  
  if (lowerId === 'triton') {
    return (
      <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-[0_0_6px_rgba(168,85,247,0.65)]">
        {/* Asymmetric left wing */}
        <rect x="2" y="21" width="20" height="10" rx="1" fill="#130a1c" stroke="#a855f7" strokeWidth="1" />
        <line x1="2" y1="26" x2="22" y2="26" stroke="#a855f7" strokeWidth="0.8" />
        <line x1="8" y1="21" x2="8" y2="31" stroke="#a855f7" strokeWidth="0.5" opacity="0.4" />
        <line x1="14" y1="21" x2="14" y2="31" stroke="#a855f7" strokeWidth="0.5" opacity="0.4" />
        
        <line x1="22" y1="26" x2="28" y2="26" stroke="#cbd5e1" strokeWidth="2" />
        
        {/* Triangular/prism core body */}
        <polygon points="28,21 39,16 43,29 32,34" fill="#64748b" stroke="#a855f7" strokeWidth="1" />
        <polygon points="32,34 43,29 41,41 30,45" fill="#475569" stroke="#a855f7" strokeWidth="1" />
        
        {/* Reflector dish antenna */}
        <ellipse cx="36" cy="46" rx="9" ry="3" fill="#3b0764" stroke="#c084fc" strokeWidth="1" />
        <line x1="36" y1="41" x2="36" y2="45" stroke="#c084fc" strokeWidth="1" />
        
        <circle cx="36" cy="46" r="1.5" fill="#e9d5ff" />
      </svg>
    );
  }
  
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow-[0_0_4px_rgba(148,163,184,0.4)]">
      <circle cx="32" cy="32" r="10" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
      <line x1="16" y1="32" x2="48" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="10" y="28" width="6" height="8" rx="0.5" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.5" />
      <rect x="48" y="28" width="6" height="8" rx="0.5" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.5" />
    </svg>
  );
}

// Kepler's Third Law constant calculation: Deriving exact Semi-major axis 'a' from TLE Mean Motion 'n'
function calculateSemiMajorAxis(meanMotion: number): number {
  const MU = 398600.4418; // km^3/s^2 (Earth's Keplerian standard gravitational parameter)
  // Convert mean motion (revolutions/day) to angular rate (radians/second)
  const radsPerSec = (meanMotion * 2 * Math.PI) / 86400;
  // Kepler's Third Law: a^3 = MU / (n^2) => a = (MU / n^2)^(1/3)
  const semiMajorAxis = Math.pow(MU / (radsPerSec * radsPerSec), 1 / 3);
  return parseFloat(semiMajorAxis.toFixed(4));
}

export default function App() {
  // Satellites list state (safely locked to static, read-only configuration data)
  const [satellites, setSatellites] = useState<Satellite[]>(SATELLITES_DATA);

  const handleUpdateSatellite = (id: string, updatedParams: Partial<Satellite>, sourceInfo: string) => {
    setSatellites(prev => prev.map(sat => {
      if (sat.id === id) {
        return {
          ...sat,
          ...updatedParams
        };
      }
      return sat;
    }));
  };

  const handleUpdateAllSatellites = (updatedList: Satellite[], sourceMap: Record<string, string>) => {
    setSatellites(updatedList);
  };

  const [selectedSatId, setSelectedSatId] = useState<string>('formosat-5');
  const [isDetailsExpanded, setIsDetailsExpanded] = useState<boolean>(false);
  const [simulatedPassSatId, setSimulatedPassSatId] = useState<string | null>(null);
  
  // YouTube Live stream state
  const [activeYoutubeUrl, setActiveYoutubeUrl] = useState<string>(DEFAULT_YOUTUBE_URLS[0].url);

  // Dynamic real-time ticking clock states
  const [utcTime, setUtcTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Background Automatic Synchronization of Celestrak TLE parameters
  useEffect(() => {
    let active = true;
    
    const triggerSync = async () => {
      const newList = [...satellites];
      let didUpdate = false;

      for (const sat of satellites) {
        if (!active) return;
        try {
          const response = await fetch(`/api/satellite-tle/${sat.id}`);
          if (!response.ok) continue;
          const result = await response.json();
          
          if (result && result.data && active) {
            const tle = result.data;
            const derivedSemiAx = calculateSemiMajorAxis(Number(tle.MEAN_MOTION));
            
            const idx = newList.findIndex(item => item.id === sat.id);
            if (idx !== -1) {
              newList[idx] = {
                ...newList[idx],
                semiMajorAxis: derivedSemiAx,
                eccentricity: Number(tle.ECCENTRICITY),
                inclination: Number(tle.INCLINATION),
                raan: Number(tle.RA_OF_ASC_NODE),
                argPerigee: Number(tle.ARG_OF_PERICENTER),
              };
              didUpdate = true;
            }
          }
        } catch (err) {
          console.warn(`Background TLE sync failed for ${sat.id}:`, err);
        }
      }

      if (active && didUpdate) {
        setSatellites(newList);
      }
    };

    triggerSync();

    const timer = setInterval(() => {
      triggerSync();
    }, 120000); // sync every 2 minutes

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [satellites.length]);

  const selectedSatellite = satellites.find(s => s.id === selectedSatId) || satellites[0];

  // Format Helper: Converts normal watch/live YouTube URL to strict /embed format
  const getEmbedUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    const cleanUrl = rawUrl.trim();
    
    // If it is already in embedded form, return directly
    if (cleanUrl.includes('youtube.com/embed/')) {
      return cleanUrl;
    }

    // Capture standard YouTube video ID extraction patterns:
    // Watch URL: youtube.com/watch?v=XXXX
    // Short URL: youtu.be/XXXX
    // Live stream link: youtube.com/live/XXXX
    const watchMatch = cleanUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) {
      // autoplay & mute default to fit as a high-fidelity continuous dashboard background feed
      return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&mute=1&playlist=${watchMatch[1]}&loop=1`;
    }

    return cleanUrl;
  };

  // Quick switch YouTube feed handler
  const handleSwapYoutubeFeed = (url: string) => {
    setActiveYoutubeUrl(url);
  };

  // Convert dates
  const formatTpeTime = (d: Date) => {
    return d.toLocaleString('zh-TW', {
      timeZone: 'Asia/Taipei',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatUtcTime = (d: Date) => {
    return d.toLocaleString('en-US', {
      timeZone: 'UTC',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' UTC';
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 flex flex-col relative overflow-x-hidden font-sans" id="space-dashboard-root">
      
      {/* Background celestial visual grid flares */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-950/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-12 right-1/4 w-[600px] h-[600px] bg-indigo-950/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Main Bar: Responsive tech Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 py-3" id="main-header">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Title section */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500/25 to-blue-600/10 border border-cyan-500/30 rounded-lg text-[#00f0ff] shadow-lg shadow-cyan-950/30">
              <SatIcon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-widest text-slate-100 uppercase font-sans">台灣自主衛星軌道追蹤</h1>
                <span className="text-[9px] bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 px-1 py-0.2 rounded font-mono uppercase tracking-wide">Taiwan Space Center Live</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Taiwan Satellite Systems Orbital Mechanics</p>
            </div>
          </div>

          {/* Precision clocks panel */}
          <div className="flex items-center flex-wrap gap-4 bg-slate-900/40 px-3.5 py-1.5 border border-slate-800/80 rounded-lg text-xs" id="header-clocks">
            {/* Taipei local time */}
            <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <div>
                <div className="text-[9px] text-slate-500 font-mono uppercase">國家時間 (臺北 / UTC+8)</div>
                <div className="font-mono text-cyan-200 font-semibold tracking-wider text-xs">{formatTpeTime(utcTime)}</div>
              </div>
            </div>
            
            {/* Greenwich Standard flight time */}
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#e50914]" />
              <div>
                <div className="text-[9px] text-slate-500 font-mono uppercase">標準時間 (格林威治 / UTC)</div>
                <div className="font-mono text-slate-300 font-semibold tracking-wider text-xs">{formatUtcTime(utcTime)}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Core View Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 flex flex-col gap-6 relative z-10" id="main-content-layout">
        
        {(() => {
          // Calculate dynamically if any satellite overpass is within 15 minutes
          const alertSatellites = Object.keys(TAIWAN_OVERPASS_SCHEDULES)
            .map(id => {
              const sched = getDynamicOverpass(id);
              const satInfo = satellites.find(s => s.id === id);
              return {
                id,
                name: satInfo?.name || id,
                color: satInfo?.color || '#00f0ff',
                countdownMinutes: sched.countdownMinutes,
                entryLocation: sched.entryLocation,
                maxElevation: sched.maxElevation,
                durationSeconds: sched.durationSeconds,
                passesTaiwanNext72h: sched.passesTaiwanNext72h
              };
            })
            .filter(item => item.passesTaiwanNext72h && item.countdownMinutes <= 15);

          // Mix in current simulated overpass if applicable
          if (simulatedPassSatId) {
            const simSat = satellites.find(s => s.id === simulatedPassSatId);
            if (simSat && !alertSatellites.some(a => a.id === simSat.id)) {
              alertSatellites.push({
                id: simSat.id,
                name: simSat.name,
                color: simSat.color,
                countdownMinutes: 0,
                entryLocation: '高雄梓官海域 (SIMULATED ACTIVE)',
                maxElevation: 68,
                durationSeconds: 340,
                passesTaiwanNext72h: true,
              });
            }
          }

          if (alertSatellites.length === 0) return null;

          return (
            <div className="w-full bg-red-950/40 border border-red-500/40 rounded-xl p-4 backdrop-blur-md shadow-lg shadow-red-950/20 relative overflow-hidden transition-all duration-300" id="overpass-notification-banner">
              <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 mt-0.5 flex-shrink-0">
                    <Radio className="w-5 h-5 animate-ping" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] bg-red-650 text-white font-mono font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
                        CRITICAL OVERPASS ALERT
                      </span>
                      <strong className="text-xs font-bold text-red-200 tracking-wide font-sans">
                        台灣領空衛星即將過境警告
                      </strong>
                    </div>
                    <div className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                      {alertSatellites.map((sat, index) => {
                        const isActive = sat.countdownMinutes === 0;
                        return (
                          <span key={sat.id}>
                            {index > 0 && "、"}
                            國家太空追蹤系統測算：自主造物{" "}
                            <strong className="font-extrabold underline" style={{ color: sat.color }}>
                              {sat.name.split(' (')[0]}
                            </strong>
                            {" "}
                            {isActive ? (
                              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20 animate-pulse font-sans">
                                [ 正在安全過境台灣上空 ACTIVE OVERPASS ]
                              </span>
                            ) : (
                              <>將在 <strong className="text-white font-mono">{sat.countdownMinutes} 分鐘內</strong> 過境台灣！</>
                            )}
                            {" "}掠過玉山 350km 半徑。預估最大仰角 {sat.maxElevation}°，與地面接收站激光對直窗口時長約 {sat.durationSeconds} 秒。
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <button 
                    onClick={() => {
                      const firstAlert = alertSatellites[0];
                      setSelectedSatId(firstAlert.id);
                      setIsDetailsExpanded(true);
                      // Custom smooth scroll towards details layout
                      const detailsEl = document.getElementById('selected-satellite-view-section');
                      if (detailsEl) detailsEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-lg shadow-red-950/40 whitespace-nowrap"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    切換至實時追蹤
                  </button>
                  {simulatedPassSatId && (
                    <button 
                      onClick={() => setSimulatedPassSatId(null)}
                      className="bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 text-[10px] font-semibold py-1.5 px-3 rounded-lg transition"
                    >
                      取消模擬
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* HOMEPAGE SATELLITE SELECTOR: 2 Rows x 4 Columns Grid of Upright Rectangles (上下各四個直矩形) */}
        <section 
          className="w-full p-5 border rounded-2xl backdrop-blur-xl transition-all duration-700 ease-out relative overflow-hidden" 
          id="taiwanese-satellites-selector-grid"
          style={{
            background: selectedSatellite ? `radial-gradient(circle at 50% 50%, ${selectedSatellite.color}0c, #0c0d14)` : 'rgba(12, 13, 20, 0.6)',
            boxShadow: selectedSatellite ? `0 0 65px -8px ${selectedSatellite.color}25, inset 0 0 16px 2px ${selectedSatellite.color}08` : 'none',
            borderColor: selectedSatellite ? `${selectedSatellite.color}45` : '#1e293b'
          }}
        >
          {/* Subtle Backglow Decorative Layer */}
          {selectedSatellite && (
            <div 
              className="absolute -inset-10 opacity-35 blur-[130px] rounded-full pointer-events-none transition-all duration-1000 ease-in-out"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${selectedSatellite.color}, transparent 65%)`
              }}
            />
          )}
 
          {/* Responsive grid of beautiful tall vertical cards (aspect-[3/4.2]) */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" id="satellite-upright-cards-layout">
            {satellites.map((sat) => {
              const isSelected = sat.id === selectedSatId;
              return (
                <div
                  key={sat.id}
                  onClick={() => {
                    setSelectedSatId(sat.id);
                    setIsDetailsExpanded(true);
                    setTimeout(() => {
                      const element = document.getElementById('specs-tabs-display');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 80);
                  }}
                  style={{ 
                    '--hover-color': sat.color,
                    borderColor: isSelected ? sat.color : undefined,
                    boxShadow: isSelected ? `0 15px 40px -10px ${sat.color}40` : undefined 
                  } as React.CSSProperties}
                  className={`group relative flex flex-col justify-between rounded-xl border cursor-pointer overflow-hidden transition-all duration-[450ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] aspect-[3/4.2] transform hover:scale-[1.055] hover:-translate-y-1.5 hover:shadow-2xl ${
                    isSelected 
                      ? 'bg-slate-950/95 border-2 shadow-2xl scale-[1.025]' 
                      : 'bg-slate-950/30 border-slate-900/80 hover:border-slate-700/60 hover:bg-slate-950/50'
                  }`}
                  id={`sat-vertical-card-${sat.id}`}
                >
                  {/* Selected accent glowing outline & label */}
                  {isSelected && (
                    <>
                      <div 
                        className="absolute inset-0 border-[1.5px] rounded-xl pointer-events-none z-20"
                        style={{ borderColor: sat.color }}
                      />
                      <div className="absolute right-2 top-2 z-20 bg-slate-950/90 border text-[8px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider uppercase" style={{ color: sat.color, borderColor: sat.color + '40' }}>
                        Active Trace
                      </div>
                    </>
                  )}
 
                  {/* Top Space-grid Box (Sleek High-tech Aerospace Vector Core) */}
                  <div className="relative w-full h-[58%] overflow-hidden bg-[#07080d] border-b border-slate-950/50 flex-shrink-0 flex items-center justify-center group/panel" id={`pic-container-${sat.id}`}>
                    {/* Decorative Sci-fi Sub-grid lines (fully vector and stylish) */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(51,65,85,0.1)_0%,transparent_75%)]" />
                    
                    {/* Concentric rings to symbolize orbit planes */}
                    <div className="absolute w-24 h-24 border border-slate-800/20 rounded-full flex items-center justify-center">
                      <div className="absolute w-14 h-14 border border-dashed border-slate-800/30 rounded-full" />
                    </div>

                    {/* Faint grid mesh coordinates */}
                    <div className="absolute top-2 left-2 font-mono text-[6px] text-slate-600/60 select-none">
                      LAT: {(sat.inclination * 0.25).toFixed(2)}N / ALT: {(sat.semiMajorAxis - 6378.1).toFixed(0)}km
                    </div>
                    <div className="absolute top-2 right-2 font-mono text-[7px] text-slate-600/60 select-none">
                      ECC: {sat.eccentricity.toFixed(4)}
                    </div>

                    {/* Centered Large glowing physical satellite miniature vector model illustration */}
                    <div className="relative transform scale-140 transition-all duration-500 ease-out group-hover:scale-155 group-hover:rotate-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center">
                      <div className="absolute inset-x-0 w-20 h-20 rounded-full bg-cyan-950/15 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <SatelliteMiniature id={sat.id} />
                    </div>

                    {/* Left vertical color indicator stripe */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300"
                      style={{ backgroundColor: sat.color }}
                    />
 
                    {/* Launch Year overlay tag */}
                    <div className="absolute left-3 bottom-3 bg-slate-950/80 text-slate-400 text-[8px] font-mono px-2 py-0.5 rounded border border-slate-850">
                      {sat.launchYear} 年發射
                    </div>
                  </div>
 
                  {/* Bottom Text Card Segment */}
                  <div className="p-3 flex-1 flex flex-col justify-between bg-slate-900/10" id={`desc-container-${sat.id}`}>
                    <div className="space-y-1">
                      {/* Sub-label and orbit type */}
                      <div className="flex items-center justify-between text-[8px] font-mono text-slate-500">
                        <span className="font-semibold uppercase tracking-wider" style={{ color: isSelected ? sat.color : '#94a3b8' }}>
                          {sat.type.split(' ')[0]}
                        </span>
                        <span className="truncate max-w-[65px]">{sat.country.slice(5, 11)}</span>
                      </div>
 
                      {/* Satellite Name (displayed beautifully inside human-readable label) */}
                      <h3 className="text-xs font-bold leading-tight line-clamp-2 text-slate-100 transition duration-300 group-hover:text-cyan-400">
                        {sat.name.replace(/\s*\(FORMOSAT-\d+\)/i, '')}
                      </h3>
 
                      {(() => {
                        const ovp = getDynamicOverpass(sat.id);
                        const showSim = simulatedPassSatId === sat.id;
                        return ovp && (ovp.passesTaiwanNext72h || showSim) ? (
                          <div className={`flex items-center gap-1.5 mt-1 border text-[9px] px-1.5 py-0.5 rounded font-sans font-medium ${
                            showSim ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border border-amber-500/20 text-[#f59e0b]'
                          }`}>
                            <span className={`h-1 w-1 rounded-full ${showSim ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                            <span>過境: {showSim ? '8 分鐘 (模擬中)' : `${ovp.nextPassInString} 後`}</span>
                          </div>
                        ) : null;
                      })()}
                    </div>
 
                    {/* Brief primary Keplerian elements displayed compactly */}
                    <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[8px] font-mono text-slate-400">
                      <span>e: {sat.eccentricity}</span>
                      <span className="text-[9px]" style={{ color: sat.color }}>i: {sat.inclination}°</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
 
        {/* Row 2: YouTube Live tracker and input customizer (獨立顯示, 恆常可見) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="live-telemetry-yt-row">
          
          {/* Premium Embedded YouTube player (Left 8 cols) */}
          <div className="col-span-12 lg:col-span-8 bg-slate-950/45 border border-slate-900 rounded-xl overflow-hidden shadow-2xl relative group hover:border-red-500/20 transition" id="right-bottom-livefeed-frame">
            {/* Telemetry live beacon sticker */}
            <div className="absolute right-3 top-3 bg-red-600/90 text-white font-mono text-[9px] font-bold uppercase py-0.5 px-2.5 rounded-full tracking-wider flex items-center gap-1 shadow-md z-10 animate-pulse">
              <span className="h-1.5 w-1.5 bg-white rounded-full"></span>
              LIVE FEED SIGNAL
            </div>
            
            <div className="w-full h-[320px] sm:h-[380px] lg:h-[410px]" id="stream-iframe-container">
              {activeYoutubeUrl ? (
                <iframe
                  src={getEmbedUrl(activeYoutubeUrl)}
                  title="Taiwan Space Ground Feed"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                  id="yt-live-iframe"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4 text-center text-slate-655">
                  <Youtube className="w-8 h-8 text-slate-800 mb-2" />
                  <p className="text-xs text-slate-500">地面中繼通訊中斷，請選取通訊點</p>
                </div>
              )}
            </div>
          </div>

          {/* Controller interface (Right 4 cols) */}
          <div className="col-span-12 lg:col-span-4 bg-[#0a0b10]/95 border border-slate-900 rounded-xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden" id="youtube-customizer-box">
            {/* Locked badge */}
            <div className="absolute top-0 right-0 p-3 flex items-center gap-1 opacity-40">
              <Lock className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[8px] font-mono text-emerald-400 tracking-wider">安全中繼已鎖定</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-900">
                <Youtube className="w-4 h-4 text-red-500 animate-pulse" />
                <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest font-sans">
                  太空即時遙測訊號主控台
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-sans">
                本遙測監測台已由地面觀測站<strong>硬體鎖定 (Hardware-Locked)</strong>，禁止一般使用者變更或寫入外部鏈路。本系統僅提供內部專屬部署、經安全認證之即時中繼訊號源：
              </p>
            </div>

            <div className="space-y-4">
              {/* Currently Active channel status card */}
              <div className="bg-slate-950/80 border border-slate-900 rounded-lg p-3 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">目前接收通道</div>
                  <div className="text-xs font-bold text-slate-200 truncate mt-0.5">
                    {DEFAULT_YOUTUBE_URLS.find(f => f.url === activeYoutubeUrl)?.name.split(' (')[0].replace(' TASA 國家太空中心官方頻道直播/精采重溫', 'TASA 國家太空中心').replace(' ISS 國際太空站地球即時高畫質直播', 'ISS 國際太空站').replace(' 氣象署衛星氣象雲圖與天氣現場動態', '氣象署氣象與天氣監測') || '未選擇接收通道'}
                  </div>
                </div>
              </div>

              {/* Station links switchboard list */}
              <div className="space-y-2">
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">唯讀安全中繼通道選擇</div>
                <div className="flex flex-col gap-2">
                  {DEFAULT_YOUTUBE_URLS.map((feed, fIdx) => {
                    const isSelected = activeYoutubeUrl === feed.url;
                    return (
                      <button
                        key={fIdx}
                        onClick={() => handleSwapYoutubeFeed(feed.url)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-sans font-medium border transition-all duration-300 flex items-center justify-between ${
                          isSelected 
                            ? 'bg-red-500/5 text-red-400 border-red-500/30 font-semibold shadow-inner' 
                            : 'bg-slate-950/50 text-slate-400 border-slate-900 hover:border-slate-800 hover:bg-slate-900/40 hover:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`} />
                          <span className="truncate">
                            {feed.name.split(' (')[0]
                              .replace(' TASA 國家太空中心官方頻道直播/精采重溫', ' TASA太空官方重溫')
                              .replace(' ISS 國際太空站地球即時高畫質直播', ' ISS國際太空站直播')
                              .replace(' 氣象署衛星氣象雲圖與天氣現場動態', ' 氣象署天氣與衛星')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          {isSelected ? (
                            <span className="text-[9px] px-1.5 py-0.5 bg-red-500/10 rounded text-red-400 border border-red-500/20 font-mono flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> ONLINE
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 rounded text-slate-500 border border-slate-850 font-mono">
                              STANDBY
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Row 4: Comprehensive detailed specifications (collapsed by default, expands on click) */}
        <section className="w-full flex flex-col" id="specs-tabs-display">
          <SatelliteDetails 
            satellite={selectedSatellite} 
            allSatellites={satellites}
            isExpanded={isDetailsExpanded}
            setIsExpanded={setIsDetailsExpanded}
            simulatedPassSatId={simulatedPassSatId}
          />
        </section>
      </main>

      {/* Clean elegant background footer with national acknowledgements */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-3 text-center text-slate-600 text-[10px] font-mono select-none" id="dashboard-metadata-credits">
        TASA NATIONAL SPACE REGISTRY • SIMULATOR COORDINATED IN COMPLIANCE WITH KEPLERIAN MOTION MODEL v2.5
      </footer>
    </div>
  );
}
