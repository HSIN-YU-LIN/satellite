import { Satellite } from './types';

export const SATELLITES_DATA: Satellite[] = [
  {
    id: 'formosat-1',
    name: '福爾摩沙衛星一號 (FORMOSAT-1)',
    englishName: 'FORMOSAT-1',
    type: '近地軌道 (LEO)',
    purpose: '海洋與電離層探測科學任務',
    imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=600&auto=format&fit=crop',
    description: '台灣首枚科學衛星，於1999年順利升空，寫下台灣太空史新頁。其攜帶海洋色相儀、電離層電漿電動效應儀及通訊實驗酬載，主要研究大氣電離層的三維結構與南海波浪色相分布，完成多項國際領先的太空物理觀測研究，已於2004年圓滿卸任。',
    semiMajorAxis: 6978, // 600 km altitude + 6378 km radius
    eccentricity: 0.001,
    inclination: 35.0,
    raan: 40.0,
    argPerigee: 15.0,
    color: '#38bdf8', // Sky Blue
    launchYear: 1999,
    country: '中華民國 (台灣)',
    detailedSpecs: {
      operator: '國家太空中心 (TASA) / 國家科學及技術委員會',
      mass: '約 401 kg',
      dimensions: '1.2m x 1.1m (底圓直徑，主體六角柱型)',
      highlights: [
        '台灣自主操作與科研遙測的歷史性起點衛星',
        '電離層量測儀成功提供低緯度太空天氣關鍵數據',
        '海洋色相感測涵蓋東海與南海大範圍葉綠素演變',
        '奠定台灣本土地面任務太空站控制系統與軌道計算實力'
      ]
    }
  },
  {
    id: 'formosat-2',
    name: '福爾摩沙衛星二號 (FORMOSAT-2)',
    englishName: 'FORMOSAT-2',
    type: '太陽同步軌道 (SSO)',
    purpose: '高解析度大地遙測與極光高空觀測',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    description: '台灣首顆高解析度遙測影像觀測衛星（2004年發射）。其最大特色是具備「每日再訪」的獨特軌道編排，能每日定時掠過台灣與全球指定熱區上空。攜帶高解析度相機與高空大氣閃電觀測儀（ISUAL），為防災制圖、農業林業、國土規劃及紅色精靈閃電科學研究做出卓越貢獻。',
    semiMajorAxis: 7269, // 891 km altitude
    eccentricity: 0.0001,
    inclination: 99.1,
    raan: 155.0,
    argPerigee: 90.0,
    color: '#22c55e', // Bright Green
    launchYear: 2004,
    country: '中華民國 (台灣)',
    detailedSpecs: {
      operator: '國家太空中心 (TASA)',
      mass: '735 kg (包含推進機組燃料)',
      dimensions: '1.6m x 2.4m (呈圓筒型推進器展開狀)',
      highlights: [
        '創下每日定時精準再訪同一點觀測的黃金軌道設計',
        '全球首次對高空「紅色精靈」與「藍色噴流」進行長期連續觀測',
        '莫拉克風災及國際重大震災中，提供最即時的救災航拍影像',
        '運轉長達12年（原設計5年），提供超過250萬張珍貴高清地球照片'
      ]
    }
  },
  {
    id: 'formosat-3',
    name: '福爾摩沙衛星三號 (FORMOSAT-3)',
    englishName: 'FORMOSAT-3 / COSMIC-1',
    type: '近地軌道 (LEO - 氣象微群)',
    purpose: '全球大氣無線電掩星多點觀測',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=600&auto=format&fit=crop',
    description: '由 6 顆微衛星組成的劃時代氣象觀測星群，於2006年發射部署。利用GPS「無線電掩星」原理，在訊號穿透地球大氣與電離層時產生的偏折與延遲，推算大氣溫度、濕度及電子密度。其觀測精度高、穿透雲層限制，被國際公認為「最準確的太空溫度計」之一。',
    semiMajorAxis: 7178, // 800 km altitude
    eccentricity: 0.0005,
    inclination: 72.0,
    raan: 80.0,
    argPerigee: 120.0,
    color: '#f43f5e', // Rose Pink
    launchYear: 2006,
    country: '中華民國 (台灣) & 美國 NOAA 聯手',
    detailedSpecs: {
      operator: '國家太空中心 (TASA) / 氣象署',
      mass: '單顆衛星約 62 kg (六合一發射)',
      dimensions: '直徑 103 cm x 厚 16 cm (飛碟圓盤狀結構)',
      highlights: [
        '世界上首個大氣觀測「GPS無線電掩星」微衛星星座群',
        '每日提供全球超過 2,500 筆深海與高原盲區的大氣垂直剖面數據',
        '將台灣及歐美中央氣象局24小時預報準確度大幅提升',
        '科學界研究全球季風、強梅雨、電離層電漿泡和太空天氣之基礎儀器'
      ]
    }
  },
  {
    id: 'formosat-5',
    name: '福爾摩沙衛星五號 (FORMOSAT-5)',
    englishName: 'FORMOSAT-5',
    type: '太陽同步軌道 (SSO)',
    purpose: '自主智慧土地遥測與太空科學觀測',
    imageUrl: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=600&auto=format&fit=crop',
    description: '台灣首顆「百分之百自主研發」的光學遙測衛星，於2017年由美國 SpaceX 獵鷹九號火箭發射成功。其搭載了完全國產的先進「線性CMOS影像感測器」與大地遙測相機，以及自主開發之電離層探針。這顆指標性衛星向全世界證明了台灣擁有完全獨立研製與掌控太空重器的非凡實力。',
    semiMajorAxis: 7098, // 720 km altitude
    eccentricity: 0.0001,
    inclination: 98.28,
    raan: 285.0,
    argPerigee: 0.0,
    color: '#eab308', // Beautiful Amber Gold
    launchYear: 2017,
    country: '中華民國 (台灣) 自主研製',
    detailedSpecs: {
      operator: '國家太空中心 (TASA) 全程主控',
      mass: '約 475 kg',
      dimensions: '直徑 1.18m x 高 2.8m (柱狀折疊結構體)',
      highlights: [
        '首個由台灣工程師完成系統設計、整合測試與關鍵零組件製造的國造巨擘',
        '自主開發黑白 2 公尺、彩色 4 公尺之光學感測相機系統',
        '搭載電離層先進探針 (AIP)，解析度領先全球，用於地磁與強震前兆剖析',
        '提供台灣國土規劃、防災重建及國家安全最關鍵的自主即時全彩影像'
      ]
    }
  },
  {
    id: 'formosat-7',
    name: '福爾摩沙衛星七號 (FORMOSAT-7)',
    englishName: 'FORMOSAT-7 / COSMIC-2',
    type: '近地軌道 (LEO)',
    purpose: '精密雙頻氣象遙測與電離層暴量測',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    description: '台美合作的第二代低軌道氣象群。包含 6 顆高精密微衛星，部署於中低傾角（24度）軌道。其利用全球導航衛星系統（GNSS）的「無線電掩星」技術，收集大氣溫度、濕度及電離層電子密度，特別能大幅提升台灣及鄰近洋區颱風、強降雨與梅雨預報的準確度，是低緯度「最精準的太空氣象太空站」。',
    semiMajorAxis: 6928, // 550 km altitude + 6378 km Earth radius
    eccentricity: 0.001,
    inclination: 24.0,  // 24 degree low inclination orbit
    raan: 15.0,
    argPerigee: 45.0,
    color: '#00F0FF', // Cyan
    launchYear: 2019,
    country: '中華民國 (台灣) & 美國 (NOAA) 共同運營',
    detailedSpecs: {
      operator: '國家太空中心 (TASA) / NOAA',
      mass: '約 278 kg (單顆衛星體)',
      dimensions: '1.2m x 1.0m x 1.25m (結構箱狀太陽能板展開)',
      highlights: [
        '使用多發射器無線電掩星技術對熱帶與中低緯大氣層進行超精準掃描',
        '每天提供中緯度約 4,000 筆深層高階熱力大氣與風速分析數據',
        '極大改善南海與太平洋颱風初期形成和路徑演變預測',
        '攜帶精細電離層速度計 (IVM) 以偵測太空磁暴對通訊的干擾'
      ]
    }
  },
  {
    id: 'triton',
    name: '獵風者衛星 (TRITON)',
    englishName: 'TRITON / FORMOSAT-7R',
    type: '太陽同步軌道 (SSO)',
    purpose: '海洋風速觀測與颱風發展前兆量測',
    imageUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?q=80&w=600&auto=format&fit=crop',
    description: '台灣首顆「自主研發的氣象觀測微衛星」，於2023年成功發射。獵風者搭載了自主研發的主動酬載「全球導航衛星系統反射訊號接收器 (GNSS-R)」。其原理是接收被海面反射的回波訊號，利用電磁學反推海面粗糙度，進而精算出海面風速。該技術特別擅長穿透暴雨，觀測颱風最核心的風場結構。',
    semiMajorAxis: 6982, // 604 km altitude
    eccentricity: 0.0005,
    inclination: 97.8,
    raan: 195.0,
    argPerigee: 270.0,
    color: '#a855f7', // Mystic Purple
    launchYear: 2023,
    country: '中華民國 (台灣) 國核心自主開發',
    detailedSpecs: {
      operator: '國家太空中心 (TASA)',
      mass: '約 250 kg (搭載台灣自主設計衛星匯流排)',
      dimensions: '1.0m x 1.0m x 1.1m (立方結構主體)',
      highlights: [
        '全機台灣本土零件自產率高達 82% 以上，航太關鍵科技自主化的重要里程碑',
        '搭載反射訊號接收器，直接捕捉 GPS 訊號撞擊海面反射出的強弱，運算狂風特徵',
        '能在劇烈熱帶氣旋發育時穿透濃厚厚雲霧，直接量測狂風風速',
        '與福衛七號精密大氣層溫度剖面數據互為表裡，合組亞熱帶氣象觀測神經網'
      ]
    }
  },
  {
    id: 'formosat-8',
    name: '福爾摩沙衛星八號 (FORMOSAT-8)',
    englishName: 'FORMOSAT-8 Series',
    type: '太陽同步軌道 (SSO - 新代自主級)',
    purpose: '亞米級超高光學遙測與國土安全監測',
    imageUrl: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=600&auto=format&fit=crop',
    description: '規劃中的新一代高解析度光學遙測星座（預計自2025年起陸續發射）。作為福衛五號的接班人，福八計畫由 6 顆先導與現役光學遙測星群組成，最大解析度提升至「亞米級」 (即小於 1 公尺，能清晰拍到一輛車的輪廓)，同時配合大傾角動態機動編隊，為國家提供全天候防汛、國土變遷及國防高空哨兵服務。',
    semiMajorAxis: 6938, // 560 km altitude (Sun Synchronous Orbit)
    eccentricity: 0.0003,
    inclination: 97.6,
    raan: 110.0,
    argPerigee: 180.0,
    color: '#ffedd5', // Pearl Ivory Orange
    launchYear: 2025,
    country: '中華民國 (台灣)',
    detailedSpecs: {
      operator: '國家太空中心 (TASA)',
      mass: '約 300 kg / 顆 (星座集群計劃)',
      dimensions: '直徑 1.25m x 高 2.5m (高精密模組化光學箱)',
      highlights: [
        '全新國造亞米級反射式太空變焦相機，地面解析度達黑白0.7公尺',
        '多顆微衛星串聯組成高覆蓋率集群，降低單點觀測等待期至數小時',
        '加入高度整合人工智慧影像校正，自動排除雲塊陰影干擾',
        '提升對崩塌斷裂、土石流與山林墾殖變化的微米級感知精準度'
      ]
    }
  },
  {
    id: 'yusat-1',
    name: '玉山微衛星 (YUSAT-1)',
    englishName: 'YUSAT-1 CubeSat',
    type: '近地軌道 (LEO - 立方衛星)',
    purpose: '自動船舶識別(AIS)與陸地車輛追蹤測試',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    description: '台灣首批自主研發運作的 1.5U 立方衛星（CubeSat），於2021年成功發射部署於 525 公里的近地軌道。本計畫旨在推動大專院校與研發機構共同培養新世代微型航太人才。主要搭載「自動船舶識別系統（AIS）」與「自動封包回報系統（APRS）」，用於全球航道船隻追蹤與陸地車輛安全調度測試。',
    semiMajorAxis: 6903, // 525 km altitude
    eccentricity: 0.003,
    inclination: 97.5,
    raan: 220.0,
    argPerigee: 300.0,
    color: '#f97316', // Bold Orange
    launchYear: 2021,
    country: '中華民國 (台灣) 學研界代表自主研製',
    detailedSpecs: {
      operator: '國家太空中心 (TASA) / 國立海洋大學等產學合力',
      mass: '僅約 2.0 kg (1.5U 超微型立方體)',
      dimensions: '10cm x 10cm x 15cm (極致小巧，手掌可握)',
      highlights: [
        '台灣立方衛星的重要教學與技術驗證先發機型',
        '高敏感度天線接收器全天候記錄公海船隻發射的 AIS 航行電波安全信標',
        '驗證利用極微小無線電功率 (LoRa-like) 進行跨洋定位封包傳輸',
        '開創高CP值多通道立方星座未來商業運行的寶貴先期成果'
      ]
    }
  }
];

export const DEFAULT_YOUTUBE_URLS = [
  {
    name: 'TASA 國家太空中心官方頻道直播/精采重溫',
    url: 'https://www.youtube.com/watch?v=3SWSgbyV074'
  },
  {
    name: 'ISS 國際太空站地球即時高畫質直播 (宇宙視角)',
    url: 'https://www.youtube.com/watch?v=O9mYwRlucZY'
  },
  {
    name: '氣象署衛星氣象雲圖與天氣現場動態',
    url: 'https://www.youtube.com/watch?v=21X5lGlDOfg'
  }
];
