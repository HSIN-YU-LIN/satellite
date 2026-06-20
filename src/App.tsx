import React, { useState, useEffect } from 'react';
import { SATELLITES_DATA, DEFAULT_YOUTUBE_URLS } from './constants';
import { Satellite } from './types';
import OrbitSimulator from './components/OrbitSimulator';
import SatelliteDetails from './components/SatelliteDetails';
import { 
  Compass, Globe, Satellite as SatIcon, Eye, Radio, Play, Pause, 
  Settings, Clock, ChevronRight, HelpCircle, ExternalLink, RefreshCw, Youtube
} from 'lucide-react';

export default function App() {
  // Satellites list state (allows updating individual satellite images in local memory!)
  const [satellites, setSatellites] = useState<Satellite[]>(() => {
    // Attempt local storage load for persistence if cache is hot, fallback to default constants
    try {
      const cached = localStorage.getItem('SPACE_TRACKER_STATS');
      return cached ? JSON.parse(cached) : SATELLITES_DATA;
    } catch {
      return SATELLITES_DATA;
    }
  });

  const [selectedSatId, setSelectedSatId] = useState<string>('formosat-7');
  const [hasClickedSatellite, setHasClickedSatellite] = useState<boolean>(false);
  
  // YouTube Live stream state
  const [youtubeInputUrl, setYoutubeInputUrl] = useState<string>(DEFAULT_YOUTUBE_URLS[1].url);
  const [activeYoutubeUrl, setActiveYoutubeUrl] = useState<string>(DEFAULT_YOUTUBE_URLS[1].url);

  // Dynamic real-time ticking clock states
  const [utcTime, setUtcTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save state updates of satellites (like custom photos saved on each satellite card)
  const handleUpdateSatelliteImage = (id: string, newUrl: string) => {
    setSatellites(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, imageUrl: newUrl } : s);
      try {
        localStorage.setItem('SPACE_TRACKER_STATS', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to cache custom images:', err);
      }
      return updated;
    });
  };

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
    setYoutubeInputUrl(url);
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
                <h1 className="text-sm font-bold tracking-widest text-slate-100 uppercase font-sans">台灣自主衛星軌道追蹤與遙測控制中心</h1>
                <span className="text-[9px] bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 px-1 py-0.2 rounded font-mono uppercase tracking-wide">Taiwan Space Center Live</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Taiwan Satellite Systems Orbital Mechanics & Real-time AI Assistant</p>
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
                <div className="text-[9px] text-slate-500 font-mono uppercase">時間代碼 (格林威治 / UTC)</div>
                <div className="font-mono text-slate-300 font-semibold tracking-wider text-xs">{formatUtcTime(utcTime)}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Core View Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 flex flex-col gap-6 relative z-10" id="main-content-layout">
        
        {/* HOMEPAGE SATELLITE SELECTOR: 2 Rows x 4 Columns Grid of Upright Rectangles (上下各四個直矩形) */}
        <section className="w-full bg-[#0c0d14]/60 p-4 border border-slate-900 rounded-xl backdrop-blur-md" id="taiwanese-satellites-selector-grid">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h2 className="text-xs font-semibold uppercase text-slate-300 tracking-wider">
                航太級追蹤核心（8 顆國造/科研核心衛星陣容）
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-medium tracking-wide">地面追蹤站信號連接正常</span>
            </div>
          </div>

          {/* 2x4 responsive grid of beautiful tall vertical cards (aspect-[3/4.2]) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4" id="satellite-upright-cards-layout">
            {satellites.slice(0, 8).map((sat) => {
              const isSelected = sat.id === selectedSatId;
              return (
                <div
                  key={sat.id}
                  onClick={() => {
                    setSelectedSatId(sat.id);
                    setHasClickedSatellite(true);
                  }}
                  style={{ '--hover-color': sat.color } as React.CSSProperties}
                  className={`group relative flex flex-col justify-between rounded-xl border cursor-pointer overflow-hidden transition-all duration-300 aspect-[3/4.2] ${
                    isSelected 
                      ? 'bg-slate-950/90 border border-slate-700 shadow-xl shadow-cyan-950/20' 
                      : 'bg-slate-950/30 border-slate-900/80 hover:border-slate-800/80 hover:bg-slate-950/50'
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

                  {/* Top Image Box */}
                  <div className="relative w-full h-[58%] overflow-hidden bg-slate-900 flex-shrink-0" id={`pic-container-${sat.id}`}>
                    <img 
                      src={sat.imageUrl} 
                      alt={sat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    
                    {/* Shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent"></div>

                    {/* Left vertical color indicator stripe */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300"
                      style={{ backgroundColor: sat.color }}
                    />

                    {/* Launch Year overlay tag */}
                    <div className="absolute left-2 bottom-1.5 bg-slate-950/80 text-slate-400 text-[8px] font-mono px-2 py-0.5 rounded border border-slate-850">
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
                      <h3 className="text-xs font-bold leading-tight line-clamp-2 text-slate-100 transition group-hover:text-cyan-400">
                        {sat.name.replace(/\s*\(FORMOSAT-\d+\)/i, '')}
                      </h3>
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
          <div className="col-span-12 lg:col-span-4 bg-[#0a0b10]/90 border border-slate-900 rounded-xl p-5 flex flex-col justify-between shadow-xl" id="youtube-customizer-box">
            <div>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-900">
                <Youtube className="w-4 h-4 text-red-500 animate-pulse" />
                <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest font-sans">
                  太空即時遙測影像控制台
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-sans">
                本控制台為太空影像鏈路之中繼工作站。請於下方<strong>直接複製貼上 YouTube 直播與影片網址</strong>，系統將即時接載地面遙測通訊，並投放至左側高清螢幕：
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">地面通訊載波網址</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={youtubeInputUrl}
                    onChange={(e) => setYoutubeInputUrl(e.target.value)}
                    placeholder="貼上 YouTube 網址..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-red-500 font-mono focus:ring-1 focus:ring-red-500/20"
                    id="yt-url-textbox"
                  />
                  <button 
                    onClick={() => setActiveYoutubeUrl(youtubeInputUrl)}
                    className="bg-red-655/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 px-3.5 py-1.5 font-sans font-semibold text-xs rounded transition flex-shrink-0"
                    id="link-stream-btn"
                  >
                    載入
                  </button>
                </div>
              </div>

              {/* Fast switch links */}
              <div className="pt-3 border-t border-slate-900 flex flex-col gap-2">
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">國家太空中心 & 氣象署鏈路與歷史</div>
                <div className="flex flex-col gap-1.5">
                  {DEFAULT_YOUTUBE_URLS.map((feed, fIdx) => (
                    <button
                      key={fIdx}
                      onClick={() => handleSwapYoutubeFeed(feed.url)}
                      className={`w-full text-left px-3 py-1.5 rounded text-xs font-sans font-medium border transition duration-300 flex items-center justify-between ${
                        activeYoutubeUrl === feed.url 
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 font-semibold' 
                          : 'bg-slate-950/60 text-slate-400 border-slate-900 hover:border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{feed.name.split(' (')[0].replace(' TASA 國家太空中心官方頻道直播/精采重溫', ' TASA太空官方重溫').replace(' ISS 國際太空站地球即時高畫質直播', ' ISS國際太空站直播').replace(' 氣象署衛星氣象雲圖與天氣現場動態', ' 氣象署天氣監管')}</span>
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Row 3: Comprehensive detailed specifications (collapsed by default, expands on click) */}
        <section className="w-full flex flex-col" id="specs-tabs-display">
          <SatelliteDetails 
            satellite={selectedSatellite} 
            allSatellites={satellites}
            onUpdateImage={handleUpdateSatelliteImage}
            isClicked={hasClickedSatellite}
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
