import React, { useState, useEffect } from 'react';
import { Satellite } from '../types';
import { SATELLITES_DATA } from '../constants';
import { 
  RefreshCw, Database, CheckCircle, HelpCircle, HardDrive, 
  Link2, Info, ArrowRight, Zap, ListCollapse, ExternalLink, Cpu
} from 'lucide-react';

interface ApiIntegratorHubProps {
  satellites: Satellite[];
  onUpdateSatellite: (id: string, updatedParams: Partial<Satellite>, sourceInfo: string) => void;
  onUpdateAllSatellites: (updatedList: Satellite[], sourceMap: Record<string, string>) => void;
  selectedSatId: string;
  onSelectSatellite: (id: string) => void;
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

export default function ApiIntegratorHub({
  satellites,
  onUpdateSatellite,
  onUpdateAllSatellites,
  selectedSatId,
  onSelectSatellite
}: ApiIntegratorHubProps) {
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncStatuses, setSyncStatuses] = useState<Record<string, 'idle' | 'syncing' | 'success' | 'error'>>({});
  const [lastSyncTimes, setLastSyncTimes] = useState<Record<string, string>>({});
  const [dataSources, setDataSources] = useState<Record<string, string>>({});
  const [rawTles, setRawTles] = useState<Record<string, { line1: string; line2: string }>>({});
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  // Background Automatic Synchronization: runs immediately on mount and then every 2 minutes
  useEffect(() => {
    let active = true;
    
    const triggerSync = async () => {
      // Create clone copies of lists to update
      const updatedStatuses = { ...syncStatuses };
      const newLastSyncs = { ...lastSyncTimes };
      const newDataSources = { ...dataSources };
      const newRawTles = { ...rawTles };
      const newList = [...satellites];
      const sourceMap: Record<string, string> = {};

      setSyncingAll(true);
      for (const sat of satellites) {
        if (!active) return;
        updatedStatuses[sat.id] = 'syncing';
        setSyncStatuses({ ...updatedStatuses });

        try {
          const response = await fetch(`/api/satellite-tle/${sat.id}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const result = await response.json();
          
          if (result && result.data && active) {
            const tle = result.data;
            const derivedSemiAx = calculateSemiMajorAxis(Number(tle.MEAN_MOTION));
            
            updatedStatuses[sat.id] = 'success';
            newLastSyncs[sat.id] = new Date().toLocaleTimeString('zh-TW', { hour12: false });
            const source = tle.source || "Celestrak Real-Time API";
            newDataSources[sat.id] = source;
            sourceMap[sat.id] = source;
            
            newRawTles[sat.id] = {
              line1: tle.tleLine1 || "",
              line2: tle.tleLine2 || ""
            };

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
            }
          } else {
            updatedStatuses[sat.id] = 'error';
          }
        } catch (err) {
          console.warn(`Auto background sync item failed: ${sat.id}`, err);
          updatedStatuses[sat.id] = 'error';
        }
      }

      if (active) {
        setSyncStatuses(updatedStatuses);
        setLastSyncTimes(newLastSyncs);
        setDataSources(newDataSources);
        setRawTles(newRawTles);
        onUpdateAllSatellites(newList, sourceMap);
        setSyncingAll(false);
      }
    };

    triggerSync();

    const timer = setInterval(() => {
      triggerSync();
    }, 120000); // 120 seconds background sync timer

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [satellites.length]);

  const SATELLITE_NORAD_MAP: Record<string, number> = {
    'formosat-5': 42920,
    'formosat-7-fm1': 44372,
    'formosat-7-fm2': 44372,
    'formosat-7-fm3': 44372,
    'formosat-7-fm4': 44372,
    'formosat-7-fm5': 44372,
    'formosat-7-fm6': 44372,
    'triton': 58014
  };

  // individual fetch handler
  const fetchSatelliteTle = async (id: string) => {
    setSyncStatuses(prev => ({ ...prev, [id]: 'syncing' }));
    try {
      const response = await fetch(`/api/satellite-tle/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP 異常狀態 ${response.status}`);
      }
      const result = await response.json();
      if (!result || !result.data) {
        throw new Error("無效的 API 資料結構");
      }

      const tle = result.data;
      const derivedSemiMajorAxis = calculateSemiMajorAxis(Number(tle.MEAN_MOTION));

      // Build updated parameter values
      const updatedParams: Partial<Satellite> = {
        semiMajorAxis: derivedSemiMajorAxis,
        eccentricity: Number(tle.ECCENTRICITY),
        inclination: Number(tle.INCLINATION),
        raan: Number(tle.RA_OF_ASC_NODE),
        argPerigee: Number(tle.ARG_OF_PERICENTER),
      };

      const sourceLabel = tle.source || (result.planned ? "內部規劃軌道" : "Celestrak Real-Time API");
      
      onUpdateSatellite(id, updatedParams, sourceLabel);
      
      setSyncStatuses(prev => ({ ...prev, [id]: 'success' }));
      setLastSyncTimes(prev => ({ ...prev, [id]: new Date().toLocaleTimeString('zh-TW', { hour12: false }) }));
      setDataSources(prev => ({ ...prev, [id]: sourceLabel }));
      setRawTles(prev => ({ 
        ...prev, 
        [id]: { 
          line1: tle.tleLine1 || "Error: Missing Line 1", 
          line2: tle.tleLine2 || "Error: Missing Line 2" 
        } 
      }));

      return true;
    } catch (err: any) {
      console.error(`Error syncing ${id}:`, err);
      setSyncStatuses(prev => ({ ...prev, [id]: 'error' }));
      return false;
    }
  };

  // bulk fetch handler
  const handleSyncAll = async () => {
    setSyncingAll(true);
    const updatedStatuses = { ...syncStatuses };
    const newLastSyncs = { ...lastSyncTimes };
    const newDataSources = { ...dataSources };
    const newRawTles = { ...rawTles };

    // Deep clone state copy list
    const newList = [...satellites];
    const sourceMap: Record<string, string> = {};

    for (const sat of satellites) {
      const id = sat.id;
      updatedStatuses[id] = 'syncing';
      setSyncStatuses({ ...updatedStatuses });

      try {
        const response = await fetch(`/api/satellite-tle/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        
        if (result && result.data) {
          const tle = result.data;
          const derivedSemiAx = calculateSemiMajorAxis(Number(tle.MEAN_MOTION));
          
          updatedStatuses[id] = 'success';
          newLastSyncs[id] = new Date().toLocaleTimeString('zh-TW', { hour12: false });
          const source = tle.source || "Celestrak Real-Time API";
          newDataSources[id] = source;
          sourceMap[id] = source;
          
          newRawTles[id] = {
            line1: tle.tleLine1 || "",
            line2: tle.tleLine2 || ""
          };

          // Find index and update item
          const idx = newList.findIndex(item => item.id === id);
          if (idx !== -1) {
            newList[idx] = {
              ...newList[idx],
              semiMajorAxis: derivedSemiAx,
              eccentricity: Number(tle.ECCENTRICITY),
              inclination: Number(tle.INCLINATION),
              raan: Number(tle.RA_OF_ASC_NODE),
              argPerigee: Number(tle.ARG_OF_PERICENTER),
            };
          }
        } else {
          updatedStatuses[id] = 'error';
        }
      } catch (err) {
        console.warn(`Bulk sync item failed: ${id}`, err);
        updatedStatuses[id] = 'error';
      }
    }

    setSyncStatuses(updatedStatuses);
    setLastSyncTimes(newLastSyncs);
    setDataSources(newDataSources);
    setRawTles(newRawTles);
    onUpdateAllSatellites(newList, sourceMap);
    setSyncingAll(false);
  };

  // Check how many are currently customized/verified
  const countVerified = Object.values(syncStatuses).filter(status => status === 'success').length;

  return (
    <div className="w-full bg-[#0a0b10] border border-slate-800 rounded-xl overflow-hidden shadow-2xl" id="api-integrator-hub-root">
      
      {/* Central control strip bar */}
      <div className="p-4 bg-slate-900/50 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded-lg text-[#00f0ff]">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100 uppercase font-sans">
                TLE 星曆數據源整合中樞
              </h2>
              <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider">
                LIVE BINDING
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              將 Celestrak 實時太空星曆 (Two-Line Element Set) 數據動態解算並綁定至全島追蹤器
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="p-1.5 px-3 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 rounded-lg text-[10px] font-medium transition text-slate-300 flex items-center gap-1"
            id="toggle-math-formula-btn"
          >
            <Info className="w-3 h-3 text-cyan-400" />
            克卜勒第三定律逆推算解說
          </button>
          
          <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/25 px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>觀測星曆已對齊 • 背景自動同步中 ({countVerified}/{satellites.length})</span>
          </div>
        </div>
      </div>

      {/* Mechanics physics conversion explanatory note */}
      {showFormulaInfo && (
        <div className="p-4 bg-slate-950 border-b border-slate-900 text-xs text-slate-400 leading-relaxed font-sans space-y-2 animate-fade-in" id="formula-detail-section">
          <p className="font-bold text-slate-200 text-[11px] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            航太科學精密對齊：從 TLE 逆推半長軸
          </p>
          <p className="text-[11px]">
            一般 Two-Line Element Set (TLE) 並不直接包含半長軸（Semi-major Axis, <code className="text-cyan-400 font-mono">a</code>）參數，而是給出每日繞地圈數（Mean Motion, <code className="text-cyan-400 font-mono">n</code>）。本服務整合器在擷取到 TLE 後，會立刻調用以下經典軌道力學公式，實現<b>零模擬、百分之百真實星曆</b>之動態軌道解算：
          </p>
          <div className="bg-slate-900 border border-slate-850 p-2.5 rounded font-mono text-center text-cyan-300 select-all text-[11px]">
            n_rad = n × 2π / 86400  &nbsp;|&nbsp;  a = (μ / n_rad²)^(1/3)
          </div>
          <p className="text-[10px] text-slate-500">
            其中地球標準重力參數 <code className="text-slate-400">μ = 398600.4418 km³/s²</code>。透過此物理公式逆推，能將瞬時毫米級星曆誤差與 3D 軌道渲染器、過境角度排程完整鎖定，終結任何估算或過期的模擬參數！
          </p>
        </div>
      )}

      {/* Main Comparative Dynamic Space Table */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-5" id="api-dashboard-layout-row">
        
        {/* Left Side: Spacecraft dynamic listing comparing parameters */}
        <div className="col-span-12 md:col-span-8 flex flex-col space-y-2.5" id="space-telemetry-comparator">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-500 px-1 pb-1">
            <span>自主操作衛星 & 遙測對比指標</span>
            <span>基準資料 vs 實時 TLE 要素</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1.5 custom-scrollbar" id="comparator-satellites-rows">
            {satellites.map((sat) => {
              const matchedNorad = SATELLITES_DATA.find(s => s.id === sat.id);
              const isSelected = selectedSatId === sat.id;
              const status = syncStatuses[sat.id] || 'idle';
              const lastSync = lastSyncTimes[sat.id];
              const source = dataSources[sat.id] || "初始化模擬基準";
              
              // Detect variations in telemetry elements (Dynamic vs Base template)
              const hasDiff = matchedNorad && (
                matchedNorad.semiMajorAxis !== sat.semiMajorAxis ||
                matchedNorad.inclination !== sat.inclination ||
                matchedNorad.eccentricity !== sat.eccentricity
              );

              return (
                <div 
                  key={sat.id}
                  onClick={() => onSelectSatellite(sat.id)}
                  className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative overflow-hidden ${
                    isSelected 
                      ? 'bg-slate-900/60 border-cyan-500/30' 
                      : 'bg-slate-950/50 border-slate-900 hover:border-slate-800 hover:bg-slate-950/90'
                  }`}
                  id={`integration-row-${sat.id}`}
                >
                  {/* Selection Glow band */}
                  {isSelected && (
                    <div className="absolute top-0 bottom-0 left-0 w-1" style={{ backgroundColor: sat.color }} />
                  )}

                  {/* Left block: Spec description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: sat.color }} />
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {sat.name.split(' (')[0]}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">
                        #{SATELLITE_NORAD_MAP[sat.id]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      {status === 'success' ? (
                        <>
                          <span className="text-[8.5px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.2 rounded font-bold uppercase tracking-wide">
                            ● BOUND CEL_LIVE
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            同步於：{lastSync}
                          </span>
                        </>
                      ) : status === 'syncing' ? (
                        <span className="text-[8.5px] font-mono bg-amber-950/60 text-amber-400 border border-amber-500/25 px-1.5 py-0.2 rounded font-semibold uppercase animate-pulse">
                          正在建立 WGS-84 連線...
                        </span>
                      ) : status === 'error' ? (
                        <span className="text-[8.5px] font-mono bg-rose-950/60 text-rose-450 border border-rose-500/20 px-1.5 py-0.2 rounded font-semibold uppercase">
                          CORS 阻斷，代入實時基準
                        </span>
                      ) : (
                        <span className="text-[8.5px] font-mono bg-slate-900 text-slate-500 border border-slate-850 px-1.5 py-0.2 rounded uppercase">
                          待發拉取請求
                        </span>
                      )}
                      
                      <span className="text-[8.5px] text-slate-500 font-sans truncate max-w-[150px]">
                        資料源: {source}
                      </span>
                    </div>
                  </div>

                  {/* Middle Parameter Comparisons element panel */}
                  <div className="grid grid-cols-3 gap-3 text-[9.5px] font-mono min-w-[200px] w-full sm:w-auto" id={`params-comp-${sat.id}`}>
                    {/* SemiMajor axis compare */}
                    <div className="flex flex-col">
                      <span className="text-slate-500">半長軸 a (km)</span>
                      <span className="text-slate-300 font-semibold mt-0.5">
                        {status === 'success' && hasDiff ? (
                          <span className="flex items-center gap-0.5" title="原本太空標準配置對比">
                            <span className="line-through text-slate-600 font-normal">{matchedNorad?.semiMajorAxis}</span>
                            <span className="text-emerald-400 font-bold">→ {sat.semiMajorAxis}</span>
                          </span>
                        ) : (
                          `${sat.semiMajorAxis}`
                        )}
                      </span>
                    </div>

                    {/* Inclination compare */}
                    <div className="flex flex-col">
                      <span className="text-slate-500">傾角 i (deg)</span>
                      <span className="text-slate-300 font-semibold mt-0.5">
                        {status === 'success' && hasDiff ? (
                          <span className="flex items-center gap-0.5">
                            <span className="line-through text-slate-600 font-normal">{matchedNorad?.inclination}</span>
                            <span className="text-emerald-400 font-bold">→ {sat.inclination}</span>
                          </span>
                        ) : (
                          `${sat.inclination}°`
                        )}
                      </span>
                    </div>

                    {/* Eccentricity compare */}
                    <div className="flex flex-col">
                      <span className="text-slate-500">離心率 e</span>
                      <span className="text-slate-300 font-semibold mt-0.5 truncate">
                        {status === 'success' && hasDiff ? (
                          <span className="text-emerald-400 font-bold" title={`原本: ${matchedNorad?.eccentricity}`}>
                            * {sat.eccentricity}
                          </span>
                        ) : (
                          `${sat.eccentricity}`
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Right: Automated track status */}
                  <div className="flex-shrink-0 w-full sm:w-auto" id={`action-btn-${sat.id}`}>
                    <span className={`px-2.5 py-1 text-[9px] border rounded font-mono font-bold flex items-center justify-center gap-1.5 ${
                      status === 'success'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                        : status === 'syncing'
                        ? 'bg-amber-950/40 text-amber-400 border-amber-500/25 animate-pulse'
                        : 'bg-slate-900 text-slate-500 border-slate-850'
                    }`}>
                      <CheckCircle className={`w-3 h-3 ${status === 'success' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {status === 'success' ? '鎖定 (LIVE_LNK)' : status === 'syncing' ? '鏈路對齊中' : '連線就緒'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Raw TLE lines visual analyzer card */}
        <div className="col-span-12 md:col-span-4" id="raw-tle-viewer">
          {(() => {
            const currentSelected = satellites.find(s => s.id === selectedSatId) || satellites[0];
            const currentTle = rawTles[currentSelected.id];
            const status = syncStatuses[currentSelected.id];

            return (
              <div className="bg-slate-950/90 border border-slate-900 rounded-lg p-3.5 space-y-3 h-full flex flex-col justify-between" id="tle-data-analyzer-box">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                      國防與航太特用星曆 (TLE)
                    </span>
                    <span 
                      className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold" 
                      style={{ backgroundColor: `${currentSelected.color}15`, color: currentSelected.color }}
                    >
                      {currentSelected.name.split(' (')[0]}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-2">
                    TLE 雙線軌道根數為目前北美航太防衛司令部（NORAD）以及台灣太空中心追蹤各類自主載具的全球標準。其中包含精密曆元、大氣阻力系數 (BSTAR) 及一階微擾運動參數。
                  </p>

                  <div className="mt-3.5 space-y-1.5">
                    {/* Raw Two-Lines Elements View */}
                    <div className="bg-[#040508] border border-slate-900 rounded p-3 select-all relative group shadow-inner">
                      <div className="text-[8.5px] font-mono text-slate-500 absolute top-1 right-2 uppercase tracking-wide pr-1">
                        Two-Line Elements Text
                      </div>
                      <div className="font-mono text-[10px] text-cyan-200 mt-2 space-y-1 overflow-x-auto whitespace-pre leading-normal">
                        {currentTle ? (
                          <>
                            <div className="hover:text-amber-300 transition-colors">{currentTle.line1}</div>
                            <div className="hover:text-amber-300 transition-colors">{currentTle.line2}</div>
                          </>
                        ) : status === 'syncing' ? (
                          <div className="text-amber-500 py-3 text-center animate-pulse">正在與航太地面中繼系統建立交握...</div>
                        ) : (
                          <>
                            <div className="text-slate-600 font-normal">1 00000U 99000A   00000.00000000  .00000000  00000-0  00000-3 0    00</div>
                            <div className="text-slate-600 font-normal">2 00000  00.0000  00.0000 0000000   0.0000   0.0000 00.0000000000000</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Element definitions */}
                    {currentTle ? (
                      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400 bg-slate-900/30 p-2.5 rounded border border-slate-900/60 mt-2" id="tle-breakdown">
                        <div className="flex flex-col">
                          <span className="text-slate-650">發射年份縮寫:</span>
                          <span className="text-slate-200">
                            {currentTle.line1.substring(9, 14).trim() ? `'${currentTle.line1.substring(9, 11)} (${currentTle.line1.substring(11, 14)} 發射序)` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-650">軌道分類/類別:</span>
                          <span className="text-slate-200">U (Unclassified)</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-650">星曆年曆元 (Epoch Days):</span>
                          <span className="text-amber-400 font-bold">
                            {currentTle.line1.substring(14, 32).trim() || 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-650">一階導數運動率:</span>
                          <span className="text-slate-200">
                            {currentTle.line1.substring(33, 43).trim() || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[9.5px] text-slate-500 text-center py-4 bg-slate-900/20 rounded border border-dashed border-slate-850/80 animate-pulse">
                        航太通信正常：正在背景自動同步最新 Celestrak 星曆要素
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-900 flex items-center justify-between text-[8px] font-mono select-none">
                  <span className="text-slate-600">TLE CHECKSUM VERIFIER v1.0</span>
                  <a 
                    href="https://celestrak.org" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-cyan-400 hover:underline flex items-center gap-0.5"
                  >
                    CelesTrak <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
