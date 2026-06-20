import React, { useState, useEffect } from 'react';
import { Satellite, ChatMessage } from '../types';
import OrbitSimulator from './OrbitSimulator';
import { 
  Rocket, ShieldAlert, Cpu, Globe, Calendar, Send, Sparkles, Compass, 
  ChevronRight, RefreshCw, BarChart2, MessageSquare, Info, Edit3, Image
} from 'lucide-react';

interface SatelliteDetailsProps {
  satellite: Satellite;
  allSatellites: Satellite[];
  onUpdateImage: (id: string, newUrl: string) => void;
  isClicked: boolean;
}

export default function SatelliteDetails({ satellite, allSatellites, onUpdateImage, isClicked }: SatelliteDetailsProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'ai-report' | 'ai-chat'>('specs');
  
  // Sync with card selection click
  useEffect(() => {
    if (isClicked) {
      setIsExpanded(true);
    }
  }, [isClicked, satellite.id]);

  // Custom image editing state
  const [isEditingImage, setIsEditingImage] = useState<boolean>(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>('');

  // AI Analysis Report state
  const [report, setReport] = useState<string>('');
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [reportSatId, setReportSatId] = useState<string>(''); // keep track of which sat’s report is loaded

  // AI Chat state
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Sync temp image URL with chosen satellite
  useEffect(() => {
    setTempImageUrl(satellite.imageUrl);
    setIsEditingImage(false);
  }, [satellite]);

  // Request AI Mission Analysis Report from Gemini via our backend
  const handleFetchReport = async (forceRefetch = false) => {
    if (!forceRefetch && reportSatId === satellite.id && report) {
      return; // Already loaded for this satellite
    }

    setIsLoadingReport(true);
    setReport('');
    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ satellite })
      });
      const data = await response.json();
      if (data.report) {
        setReport(data.report);
        setReportSatId(satellite.id);
      } else {
        setReport('⚠️ 無法解析科學報告，後端回覆格式不正確。');
      }
    } catch (err: any) {
      console.error('Fetch AI report failed:', err);
      setReport(`❌ 與太空中心連線超時：${err.message || '請確認伺服器已正常啟動並連線。'}`);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Trigger report fetch when switching to the tab
  useEffect(() => {
    if (activeTab === 'ai-report') {
      handleFetchReport();
    }
  }, [activeTab, satellite.id]);

  // Handle image customizer submission
  const handleSaveImage = () => {
    if (tempImageUrl.trim()) {
      onUpdateImage(satellite.id, tempImageUrl.trim());
      setIsEditingImage(false);
    }
  };

  // Simple clean markdown-like text formatter to HTML blocks
  const renderFormattedReport = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-semibold text-cyan-400 mt-5 mb-2 flex items-center gap-1.5 border-b border-cyan-950/40 pb-1 font-sans">
            <Sparkles className="w-4 h-4 text-[#00f0ff]" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-bold text-slate-100 mt-6 mb-3 font-sans">{line.replace('## ', '')}</h3>;
      }
      // Bold text highlighting inside lists or paragraphs
      let renderedLine: React.ReactNode = line;
      if (line.includes('**')) {
        const parts = line.split('**');
        renderedLine = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-cyan-300 font-semibold">{part}</strong> : part);
      }

      // Check bullet lists
      if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        const cleanContent = line.replace(/^[\s*-]+/, '');
        return (
          <div key={idx} className="flex gap-2 text-xs text-slate-300 ml-2 my-1 leading-relaxed">
            <span className="text-[#00f0ff]">•</span>
            <span>{cleanContent}</span>
          </div>
        );
      }

      if (line.trim() === '') return <div key={idx} className="h-2" />;

      return <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-1.5 font-sans">{renderedLine}</p>;
    });
  };

  // Send message to Astra AI Chatbot
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };

    const currentHistory = chatHistory[satellite.id] || [];
    const updatedHistory = [...currentHistory, userMsg];

    setChatHistory(prev => ({
      ...prev,
      [satellite.id]: updatedHistory
    }));
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          satelliteName: satellite.name
        })
      });
      
      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.content || '對不起，我暫時無法解密遙測信號，請稍後重試。',
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => ({
        ...prev,
        [satellite.id]: [...updatedHistory, botMsg]
      }));
    } catch (err) {
      console.error('Chat AI failed:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: '📡 與太空地面通訊站信號斷線。請確認您的伺服器及 GEMINI_API_KEY 已正確運行。',
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => ({
        ...prev,
        [satellite.id]: [...updatedHistory, errorMsg]
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  const activeChatList = chatHistory[satellite.id] || [
    {
      id: 'welcome',
      role: 'model',
      content: `你好！我是航天測控中心的助理導航專家「Astra」。很高興為您指引有關 **${satellite.name}** 的技術細節。我可以為您解析包括克卜勒三大定律、大氣衰變阻力或其軌道的特定物理特性，要聊點什麼太空話題嗎？`,
      timestamp: 'SYSTEM'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0b10] border border-slate-800 rounded-xl overflow-hidden shadow-xl" id="satellite-details-container">
      {/* Top Title Bar of Selected Satellite */}
      <div className="p-4 bg-slate-900/50 border-b border-slate-800/80 flex items-start gap-3 relative" id="details-top-header">
        <div className="hidden sm:block relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700 mt-1 flex-shrink-0" id="details-thumbnail-container">
          <img 
            src={satellite.imageUrl} 
            alt={satellite.name} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
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
        <div className="flex items-center gap-2 absolute right-4 top-4" id="header-interactive-actions">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 px-3 text-[10px] sm:text-xs font-semibold rounded-md border transition-all duration-300 flex items-center gap-1 ${
              isExpanded 
                ? 'bg-amber-600/10 text-amber-400 border-amber-500/30 hover:bg-amber-600/20' 
                : 'bg-emerald-600/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/25 animate-pulse'
            }`}
            id="details-expand-toggle-btn"
          >
            {isExpanded ? '收合詳細遙測 ▴' : '展開詳細遙測 ▾'}
          </button>
          
          <button 
            onClick={() => {
              setIsEditingImage(!isEditingImage);
              setTempImageUrl(satellite.imageUrl);
            }}
            className="hidden sm:flex p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-sans border border-slate-700 rounded-md transition items-center gap-1"
            id="custom-img-trigger"
          >
            <Edit3 className="w-3.5 h-3.5" /> 自訂卡片
          </button>
        </div>
      </div>

      {/* Editing Image Customizer Modal (Inline) */}
      {isEditingImage && (
        <div className="p-4 bg-slate-950 border-b border-amber-500/20 text-xs animate-fade-in" id="image-customization-drawer">
          <div className="flex items-center gap-1.5 text-amber-400 font-medium tracking-wide mb-2">
            <Image className="w-3.5 h-3.5" />
            <span>自訂模擬照片卡片</span>
          </div>
          <p className="text-slate-400 text-[11px] mb-2 leading-relaxed">
            您可以貼上任何外部圖片連結（例如 Unsplash 的圖片，以模擬對應的衛星外觀），點擊保存即可立即套用至卡片與詳細檢視中：
          </p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={tempImageUrl}
              onChange={(e) => setTempImageUrl(e.target.value)}
              placeholder="請貼上圖片網址 https://..."
              className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
              id="image-url-input"
            />
            <button
              onClick={handleSaveImage}
              className="px-3 bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium rounded hover:bg-amber-500/30 transition text-[11px]"
              id="image-save-btn"
            >
              保存套用
            </button>
            <button
              onClick={() => setIsEditingImage(false)}
              className="px-2 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 transition text-[11px]"
              id="image-cancel-btn"
            >
              取消
            </button>
          </div>
        </div>
      )}

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
              克卜勒六大軌道根數、各階段歷史、科學遙測載荷，以及 Gemini 3D 太空遙測智慧諮詢模組已就緒。請點擊下方按鈕或本條目右上角按鈕即可直接展開查看深度分析。
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="mt-1 bg-cyan-500/15 hover:bg-cyan-500/25 text-[#00f0ff] border border-cyan-500/40 px-5 py-2 rounded-lg text-xs font-sans font-semibold tracking-wider transition-all duration-300 shadow-md shadow-cyan-950/20 hover:scale-[1.02] flex items-center gap-1.5"
            id="expand-panel-cta"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> 展開詳細軌道規格 & AI 專家諮詢對話 ▾
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

          {/* Right panel (5 cols of 12): Detailed spec properties tabs + AI ground specialist */}
          <div className="col-span-12 lg:col-span-5 flex flex-col min-h-[480px]" id="expanded-tabs-col">
            {/* Action Tabs Menu */}
          <div className="flex border-b border-slate-800 bg-slate-900/20 text-xs" id="details-tabs-bar">
            <button
              onClick={() => setActiveTab('specs')}
          className={`flex-1 py-3 text-center font-medium transition flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === 'specs' 
              ? 'bg-slate-900/40 text-[#00f0ff] border-[#00f0ff]' 
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/10'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          軌道規格與載荷
        </button>
        <button
          onClick={() => setActiveTab('ai-report')}
          className={`flex-1 py-3 text-center font-medium transition flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === 'ai-report' 
              ? 'bg-slate-900/40 text-[#00f0ff] border-[#00f0ff]' 
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI 太空專家報告
        </button>
        <button
          onClick={() => setActiveTab('ai-chat')}
          className={`flex-1 py-3 text-center font-medium transition flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === 'ai-chat' 
              ? 'bg-slate-900/40 text-[#00f0ff] border-[#00f0ff]' 
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/10'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          太空領航員 (Astra)
        </button>
      </div>

      {/* Tab Contents Frame */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" id="details-tab-contents">
        
        {/* SPECIFICATIONS TAB */}
        {activeTab === 'specs' && (
          <div className="space-y-4 animate-fade-in" id="specs-tab-view">
            {/* Quick description */}
            <div className="p-3 bg-slate-950/60 border border-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{satellite.description}</p>
            </div>

            {/* Standard Keplerian Parameters Visual List */}
            <div className="space-y-2">
              <h3 className="font-sans font-semibold text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                克卜勒軌道根數 (Keplerian Elements)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="kepler-grid">
                {/* Semi major axis */}
                <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex items-start gap-2 group hover:border-[#00f0ff]/20 transition">
                  <div className="p-1 bg-[#00f0ff]/5 rounded text-[#00f0ff] mt-0.5"><BarChart2 className="w-3 h-3" /></div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500 font-mono">a</span>
                      <span className="text-[11px] text-slate-400 font-medium">軌道半長軸</span>
                    </div>
                    <p className="font-mono text-xs text-slate-200 font-bold mt-0.5">{satellite.semiMajorAxis} km</p>
                    <p className="text-[9px] text-slate-500 font-sans mt-0.5 opacity-0 group-hover:opacity-100 transition duration-300">地球中心至軌道橢圓最長處平均半徑</p>
                  </div>
                </div>

                {/* Eccentricity */}
                <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex items-start gap-2 group hover:border-[#00f0ff]/20 transition">
                  <div className="p-1 bg-[#00f0ff]/5 rounded text-[#00f0ff] mt-0.5"><BarChart2 className="w-3 h-3" /></div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500 font-mono">e</span>
                      <span className="text-[11px] text-slate-400 font-medium">軌道離心率 (偏心率)</span>
                    </div>
                    <p className="font-mono text-xs text-slate-200 font-bold mt-0.5">{satellite.eccentricity}</p>
                    <p className="text-[9px] text-slate-500 font-sans mt-0.5 opacity-0 group-hover:opacity-100 transition duration-300">偏離正圓程度 (e=0 為正圓，e趨於1極端橢圓)</p>
                  </div>
                </div>

                {/* Inclination */}
                <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex items-start gap-2 group hover:border-[#00f0ff]/20 transition">
                  <div className="p-1 bg-[#00f0ff]/5 rounded text-[#00f0ff] mt-0.5"><Globe className="w-3 h-3" /></div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500 font-mono">i</span>
                      <span className="text-[11px] text-slate-400 font-medium">軌道傾角 (Inclination)</span>
                    </div>
                    <p className="font-mono text-xs text-slate-200 font-bold mt-0.5">{satellite.inclination}°</p>
                    <p className="text-[9px] text-slate-500 font-sans mt-0.5 opacity-0 group-hover:opacity-100 transition duration-300">與地球赤道平面的夾角偏角</p>
                  </div>
                </div>

                {/* RAAN */}
                <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex items-start gap-2 group hover:border-[#00f0ff]/20 transition">
                  <div className="p-1 bg-[#00f0ff]/5 rounded text-[#00f0ff] mt-0.5"><Compass className="w-3 h-3" /></div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500 font-mono">Ω</span>
                      <span className="text-[11px] text-slate-400 font-medium">升交點赤經 (RAAN)</span>
                    </div>
                    <p className="font-mono text-xs text-slate-200 font-bold mt-0.5">{satellite.raan}°</p>
                    <p className="text-[9px] text-slate-500 font-sans mt-0.5 opacity-0 group-hover:opacity-100 transition duration-300">春分點向東量至升交點的夾角</p>
                  </div>
                </div>

                {/* Argument of Perigee */}
                <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex items-start gap-2 group hover:border-[#00f0ff]/20 transition">
                  <div className="p-1 bg-[#00f0ff]/5 rounded text-[#00f0ff] mt-0.5"><Compass className="w-3 h-3" /></div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500 font-mono">ω</span>
                      <span className="text-[11px] text-slate-400 font-medium">近地點幅角 (Perigee)</span>
                    </div>
                    <p className="font-mono text-xs text-slate-200 font-bold mt-0.5">{satellite.argPerigee}°</p>
                    <p className="text-[9px] text-slate-500 font-sans mt-0.5 opacity-0 group-hover:opacity-100 transition duration-300">升交點量度至近地點的夾角</p>
                  </div>
                </div>

                {/* Satellite operator info */}
                <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg flex items-start gap-2">
                  <div className="p-1 bg-[#00f0ff]/5 rounded text-[#00f0ff] mt-0.5"><Cpu className="w-3 h-3" /></div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400 font-medium">系統營運操作方</span>
                    </div>
                    <p className="text-xs text-slate-200 font-semibold mt-0.5 leading-tight">{satellite.detailedSpecs.operator}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Satellite Physical Specifications details */}
            <div className="space-y-2 border-t border-slate-900 pt-3">
              <h3 className="font-sans font-semibold text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-[#00f0ff]" />
                酬載載荷與任務細節
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/20 p-3 rounded-lg border border-slate-900">
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

              {/* Specific highlights */}
              <div className="mt-2 space-y-1.5" id="specs-highlights">
                <div className="p-1 px-2.5 bg-cyan-950/20 text-cyan-400 font-sans text-[10px] font-semibold tracking-wider rounded uppercase">科學與遙測技術亮點 (Telemetry highlights)</div>
                {satellite.detailedSpecs.highlights.map((hlt, hIdx) => (
                  <div key={hIdx} className="flex gap-2 text-xs text-slate-300 ml-1 py-0.5 leading-relaxed">
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400/80 mt-0.5 flex-shrink-0" />
                    <span>{hlt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI TELEMETRY REPORT TAB */}
        {activeTab === 'ai-report' && (
          <div className="space-y-4 animate-fade-in" id="ai-report-tab-view">
            {isLoadingReport ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4" id="ai-report-loading">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-800/80 border-t-[#00f0ff] animate-spin"></div>
                  <Sparkles className="w-5 h-5 text-[#00f0ff] absolute top-3.5 left-3.5 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs text-[#00f0ff] font-mono tracking-wider animate-pulse">正在透過地面控制台解鎖 telemetry 封包協定...</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">協同 Gemini-3.5 完成克卜勒天體物理軌道推算</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 prose prose-invert max-w-none text-xs" id="ai-report-content">
                <div className="flex justify-between items-center bg-slate-950/40 p-2 border border-slate-900 rounded-lg mb-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <Compass className="w-3.5 h-3.5 text-[#00f0ff]" />
                    <span>航太控制組：Astra 連線生成</span>
                  </div>
                  <button
                    onClick={() => handleFetchReport(true)}
                    title="重新整理 AI 報告"
                    className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-300 overflow-hidden leading-relaxed custom-markdown-styles" id="rendered-report">
                  {renderFormattedReport(report)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI PILOT CHAT TAB */}
        {activeTab === 'ai-chat' && (
          <div className="flex flex-col h-[350px] sm:h-[400px] animate-fade-in border border-slate-850 bg-slate-950/50 rounded-lg" id="ai-chat-tab-view">
            {/* Messages Scrollbox */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar" id="chat-messages-container">
              {activeChatList.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-lg p-2.5 text-xs ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600/20 text-cyan-200 border border-cyan-500/30 font-sans' 
                      : 'bg-slate-900 border border-slate-800/80 text-slate-200 leading-relaxed font-sans'
                  }`}>
                    {/* Role Tag & Time */}
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono mb-1 border-b border-slate-800/40 pb-0.5">
                      <span className={msg.role === 'user' ? 'text-cyan-400' : 'text-emerald-400 font-bold'}>
                        {msg.role === 'user' ? '☄️ 使用者' : '🛰️ Astra 太空領航員'}
                      </span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    {/* Message content formatted lightly */}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs flex items-center gap-2 text-slate-400">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] font-mono">地面天線接收電波數據中...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-2 border-t border-slate-900 bg-slate-950 flex gap-2" id="chat-input-bar">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                placeholder={`向航天專家提問關於 ${satellite.name.split(' (')[0]}...`}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 font-sans"
                id="chat-user-textbox"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isChatLoading}
                className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 disabled:hover:bg-cyan-500/10 disabled:opacity-40 p-2.5 rounded transition"
                id="chat-send-btn"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
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
