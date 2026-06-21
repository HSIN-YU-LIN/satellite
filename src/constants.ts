import { Satellite } from './types';

export const SATELLITES_DATA: Satellite[] = [
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
    id: 'formosat-7-fm1',
    name: '福衛七號一號星 (FORMOSAT-7 FM1)',
    englishName: 'FORMOSAT-7 FM1',
    type: '近地軌道 (LEO - 氣象星群)',
    purpose: '精密雙頻氣象遙測與電離層觀測',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    description: '福爾摩沙衛星七號星座一號星。台美合作的第二代低軌道氣象群之一，引領全球利用 GPS 和 GLONASS 的「無線電掩星」技術，收集大氣溫度、濕度及電離層電子密度，特別能大幅提升颱風、強降雨與梅雨預報的準確度。',
    semiMajorAxis: 6928, // 550 km altitude + 6378 km Earth radius
    eccentricity: 0.001,
    inclination: 24.0,  // 24 degree low inclination orbit
    raan: 0.0,
    argPerigee: 45.0,
    color: '#00F0FF', // Cyan
    launchYear: 2019,
    country: '中華民國 (台灣) & 美國 (NOAA) 共同運營',
    detailedSpecs: {
      operator: '國家太空中心 (TASA) / NOAA',
      mass: '約 278 kg',
      dimensions: '1.2m x 1.0m x 1.25m (結構箱狀太陽能板展開)',
      highlights: [
        '使用雙頻無線電掩星觀測技術對熱帶與中低緯區域大氣進行精密掃描',
        '將台灣及鄰近洋區颱風與梅雨預報路徑演變預測準確度提升',
        '攜帶精細電離層速度計 (IVM) 以偵測太空天氣對無線電通訊的干擾'
      ]
    }
  },
  {
    id: 'formosat-7-fm2',
    name: '福衛七號二號星 (FORMOSAT-7 FM2)',
    englishName: 'FORMOSAT-7 FM2',
    type: '近地軌道 (LEO - 氣象星群)',
    purpose: '精密雙頻氣象遙測與電離層觀測',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    description: '福爾摩沙衛星七號星座二號星。部署於中低傾角（24度）軌道。屬於台灣現役太空天氣與地球氣象的核心量測星，每天提供高精度垂直密度剖面數據，被公認為「太空最精準的溫度計」二代。',
    semiMajorAxis: 6928,
    eccentricity: 0.001,
    inclination: 24.0,
    raan: 60.0,
    argPerigee: 105.0,
    color: '#0e7490', // Deep Cyan
    launchYear: 2019,
    country: '中華民國 (台灣) & 美國 (NOAA) 共同運營',
    detailedSpecs: {
      operator: '國家太空中心 (TASA) / NOAA',
      mass: '約 278 kg',
      dimensions: '1.2m x 1.0m x 1.25m',
      highlights: [
        '多顆分布的微衛星星座，縮減單一區域的觀測盲角',
        '提供超高解析度三維電離層結構觀測，回報即時太空天氣變動影響',
        '提升中緯度及赤道洋區大氣垂直剖面資料，填補氣象雷達的海上探測盲區'
      ]
    }
  },
  {
    id: 'formosat-7-fm3',
    name: '福衛七號三號星 (FORMOSAT-7 FM3)',
    englishName: 'FORMOSAT-7 FM3',
    type: '近地軌道 (LEO - 氣象星群)',
    purpose: '精密雙頻氣象遙測與電離層觀測',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    description: '福爾摩沙衛星七號星座三號星。本星群每天可提供全球約 4,000 筆在中低緯度地區精細、高密度的氣象大氣和電離層數據，是大氣邊界層量測的黃金裝備。',
    semiMajorAxis: 6928,
    eccentricity: 0.001,
    inclination: 24.0,
    raan: 120.0,
    argPerigee: 165.0,
    color: '#06b6d4', // Bright Cyan-Blue
    launchYear: 2019,
    country: '中華民國 (台灣) & 美國 (NOAA) 共同運營',
    detailedSpecs: {
      operator: '國家太空中心 (TASA) / NOAA',
      mass: '約 278 kg',
      dimensions: '1.2m x 1.0m x 1.25m',
      highlights: [
        '搭載最新型 TGRS 三頻接收器接收 GPS 及 GLONASS 全球導航微波',
        '在惡劣雲霧雨雪條件下進行全天候垂直高度水氣、壓力感測',
        '支援氣象署與各大研究所之氣候暖化學術研究與短時預報'
      ]
    }
  },
  {
    id: 'formosat-7-fm4',
    name: '福衛七號四號星 (FORMOSAT-7 FM4)',
    englishName: 'FORMOSAT-7 FM4',
    type: '近地軌道 (LEO - 氣象星群)',
    purpose: '精密雙頻氣象遙測與電離層觀測',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    description: '福爾摩沙衛星七號星座四號星。部署於星群中交錯的特定夾角，與同儕星構成完美網格，實現低緯度海上劇烈天氣變化之不間斷精密觀測。',
    semiMajorAxis: 6928,
    eccentricity: 0.001,
    inclination: 24.0,
    raan: 180.0,
    argPerigee: 225.0,
    color: '#22d3ee', // Light Cyan
    launchYear: 2019,
    country: '中華民國 (台灣) & 美國 (NOAA) 共同運營',
    detailedSpecs: {
      operator: '國家太空中心 (TASA) / NOAA',
      mass: '約 278 kg',
      dimensions: '1.2m x 1.0m x 1.25m',
      highlights: [
        '透過精密掩星相位差運算法，推算出萬米高空的大氣層阻抗變化',
        '將熱帶與中低緯洋面氣象分析精度大幅拉升，颱風預報誤差降低',
        '成功應用於西南氣流、大豪雨與副熱帶高壓移動之氣象診斷'
      ]
    }
  },
  {
    id: 'formosat-7-fm5',
    name: '福衛七號五號星 (FORMOSAT-7 FM5)',
    englishName: 'FORMOSAT-7 FM5',
    type: '近地軌道 (LEO - 氣象星群)',
    purpose: '精密雙頻氣象遙測與電離層觀測',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    description: '福爾摩沙衛星七號星座五號星。本系列衛星搭載先進高靈敏度三頻導航接收端，提供全球首屈一指的大氣層水氣剖析，是高空大氣垂直探空的重要太空節點。',
    semiMajorAxis: 6928,
    eccentricity: 0.001,
    inclination: 24.0,
    raan: 240.0,
    argPerigee: 285.0,
    color: '#38bdf8', // Light Blue
    launchYear: 2019,
    country: '中華民國 (台灣) & 美國 (NOAA) 共同運營',
    detailedSpecs: {
      operator: '國家太空中心 (TASA) / NOAA',
      mass: '約 278 kg',
      dimensions: '1.2m x 1.0m x 1.25m',
      highlights: [
        '利用折射路徑計算對大氣溫度特徵和氣壓密度進行高速反向求解',
        '每天定點回傳關鍵的電離層電子含量 (TEC) 地圖',
        '加強保障台灣周邊定位追蹤、民用航空航線通訊保障安全'
      ]
    }
  },
  {
    id: 'formosat-7-fm6',
    name: '福衛七號六號星 (FORMOSAT-7 FM6)',
    englishName: 'FORMOSAT-7 FM6',
    type: '近地軌道 (LEO - 氣象星群)',
    purpose: '精密雙頻氣象遙測與電離層觀測',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    description: '福爾摩沙衛星七號星座六號星。完成 6 顆群星交織的完整部署。結合尖端微型推進噴氣閥與軌道偏置技術，能不間斷將中低緯度的水氣含量回傳至氣象主控中心。',
    semiMajorAxis: 6928,
    eccentricity: 0.001,
    inclination: 24.0,
    raan: 300.0,
    argPerigee: 345.0,
    color: '#0891b2', // Cyan Teal
    launchYear: 2019,
    country: '中華民國 (台灣) & 美國 (NOAA) 共同運營',
    detailedSpecs: {
      operator: '國家太空中心 (TASA) / NOAA',
      mass: '約 278 kg',
      dimensions: '1.2m x 1.0m x 1.25m',
      highlights: [
        '極佳的星座軌道間隔調校，確保在同一個觀測點的短間隔連續採樣',
        '配合各國氣象系統，將豪大雨及颱風路徑預報精度大幅提升',
        '完全防禦太陽黑子和電離層氣泡對地空通信所造成的干擾'
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
        '能在劇烈熱帶氣旋發育時穿透密集厚雲霧，直接量測狂風風速',
        '與福衛七號精密大氣層溫度剖面數據互為表裡，合組亞熱帶氣象觀測神經網'
      ]
    }
  },
  {
    id: 'formosat-8',
    name: '福爾摩沙衛星八號 (FORMOSAT-8)',
    englishName: 'FORMOSAT-8',
    type: '太陽同步軌道 (SSO)',
    purpose: '次米級高解析度光學遙測與全自主科研項目',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    description: '福爾摩沙衛星八號群為國家太空中心自研之新一代大氣與光學遙測星群。其承接自福衛五號技術藍圖，目標為達成次高精度（次米級）全彩和多光譜影像觀測，形成全面、精確的國土控管與防災減災自主數據庫。',
    semiMajorAxis: 6938, // ~560 km altitude
    eccentricity: 0.00018,
    inclination: 97.6,
    raan: 110.0,
    argPerigee: 180.0,
    color: '#f97316', // Vibrant Orange
    launchYear: 2025,
    country: '中華民國 (台灣) 自主研製以及整合',
    detailedSpecs: {
      operator: '國家太空中心 (TASA) 全程主控',
      mass: '約 320 kg',
      dimensions: '1.25m x 1.25m x 3.0m (先進自組輕量載台)',
      highlights: [
        '承傳福五完全國產化精神，大幅度提升光學遙測相機之感測晶片畫質',
        '設計目標解像力全面優於 1.0 公尺（次米級），可探測地面最精細之民生動態',
        '構成高度時間解析率之重訪星座，每日多次往返於同一個對台偵感帶',
        '支持完全自主設計之關鍵匯流排、高壓配電控制器及反作用輪控制電路'
      ]
    }
  }
];

export interface TaiwanOverpassInfo {
  passesTaiwanNext72h: boolean;
  nextPassInString: string;
  countdownMinutes: number;
  entryLocation: string;
  entryAzimuth: number;
  exitLocation: string;
  exitAzimuth: number;
  maxElevation: number;
  durationSeconds: number;
}

export interface WarningHistory {
  date: string;
  objectName: string;
  minDistanceMeter: number;
  probability: string;
  actionTaken: string;
  severity: 'low' | 'medium' | 'high';
}

export const TAIWAN_OVERPASS_SCHEDULES: Record<string, TaiwanOverpassInfo> = {
  'formosat-5': {
    passesTaiwanNext72h: true,
    nextPassInString: '18 小時 40 分鐘',
    countdownMinutes: 1120,
    entryLocation: '屏東恆春半島',
    entryAzimuth: 185,
    exitLocation: '基隆鼻頭角',
    exitAzimuth: 5,
    maxElevation: 76,
    durationSeconds: 410
  },
  'formosat-7': {
    passesTaiwanNext72h: true,
    nextPassInString: '5 小時 55 分鐘',
    countdownMinutes: 355,
    entryLocation: '台南安平漁港',
    entryAzimuth: 250,
    exitLocation: '台東三仙台',
    exitAzimuth: 70,
    maxElevation: 31,
    durationSeconds: 290
  },
  'triton': {
    passesTaiwanNext72h: true,
    nextPassInString: '22 小時 05 分鐘',
    countdownMinutes: 1325,
    entryLocation: '金門翟山外海',
    entryAzimuth: 280,
    exitLocation: '台東蘭嶼外海',
    exitAzimuth: 100,
    maxElevation: 64,
    durationSeconds: 380
  },
  'formosat-8': {
    passesTaiwanNext72h: true,
    nextPassInString: '12 小時 15 分鐘',
    countdownMinutes: 735,
    entryLocation: '澎湖花嶼海域',
    entryAzimuth: 195,
    exitLocation: '宜蘭龜山島外海',
    exitAzimuth: 15,
    maxElevation: 82,
    durationSeconds: 430
  }
};

const APP_BOOT_TIME = Date.now();

export function getDynamicOverpass(satelliteId: string): TaiwanOverpassInfo {
  let staticOvp = TAIWAN_OVERPASS_SCHEDULES[satelliteId];
  let staggerOffset = 0;
  
  if (!staticOvp && satelliteId.startsWith('formosat-7-fm')) {
    staticOvp = TAIWAN_OVERPASS_SCHEDULES['formosat-7'];
    // Stagger FM1 to FM6 by staggered orbit slots (spaced by 16.3 minutes)
    const fmIndex = parseInt(satelliteId.replace('formosat-7-fm', ''), 10) || 1;
    staggerOffset = (fmIndex - 1) * 16.3; 
  }
  
  if (!staticOvp) {
    staticOvp = TAIWAN_OVERPASS_SCHEDULES['formosat-5'];
  }
  
  const elapsedMs = Date.now() - APP_BOOT_TIME;
  const elapsedMinutes = elapsedMs / 60000;
  
  // Stagger base countdown by offset
  let remainingMinutes = (staticOvp.countdownMinutes + staggerOffset) - elapsedMinutes;
  
  // orbit cycle definition: LEO is approx 98 mins
  const orbitPeriod = 98; // average minutes for LEO/SSO
  if (remainingMinutes < 0) {
    const timesPassed = Math.floor(Math.abs(remainingMinutes) / orbitPeriod) + 1;
    remainingMinutes += timesPassed * orbitPeriod;
  }
  
  while (remainingMinutes < 0) {
    remainingMinutes += orbitPeriod;
  }
  
  const totalMinutes = Math.floor(remainingMinutes);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  let formattedString = '';
  if (hours > 0) {
    formattedString = `${hours} 小時 ${mins} 分鐘`;
  } else {
    formattedString = `${mins} 分鐘`;
  }
  
  // Stagger entry points/elevation details for each FM key
  let entryLocation = staticOvp.entryLocation;
  let exitLocation = staticOvp.exitLocation;
  let maxElevation = staticOvp.maxElevation;
  
  if (satelliteId.startsWith('formosat-7-fm')) {
    const fmnum = parseInt(satelliteId.replace('formosat-7-fm', ''), 10) || 1;
    const locations = [
      { enter: '台南安平漁港', exit: '台東三仙台', elev: 31 },
      { enter: '屏東恆春半島', exit: '花蓮磯崎海岸', elev: 45 },
      { enter: '高雄梓官海域', exit: '宜蘭蘇澳軍港', elev: 62 },
      { enter: '彰化芳苑外海', exit: '台東成功漁港', elev: 28 },
      { enter: '澎湖馬公風櫃', exit: '新北三貂角', elev: 54 },
      { enter: '苗栗後龍海岸', exit: '花蓮石梯坪', elev: 39 },
    ];
    const loc = locations[(fmnum - 1) % locations.length];
    entryLocation = loc.enter;
    exitLocation = loc.exit;
    maxElevation = loc.elev;
  }
  
  return {
    ...staticOvp,
    countdownMinutes: totalMinutes,
    nextPassInString: formattedString,
    entryLocation,
    exitLocation,
    maxElevation
  };
}

export const SATELLITE_WARNING_TIMELINES: Record<string, WarningHistory[]> = {
  'formosat-5': [
    {
      date: '2023-12-08',
      objectName: 'Cosmos 1408 ASAT debris clouds (#50201)',
      minDistanceMeter: 34,
      probability: '4.12e-4',
      actionTaken: '偵測到高風險交會。緊急下載精密GNSS數據，利用太陽能板阻力氣動煞車進行軌道微調。',
      severity: 'high'
    },
    {
      date: '2020-05-18',
      objectName: 'Starlink-1342 (#45981)',
      minDistanceMeter: 115,
      probability: '2.50e-5',
      actionTaken: '與 SpaceX 控制中心完成自動化安全防避撞軌道信號交換，地面天線防波增益監測。',
      severity: 'medium'
    }
  ],
  'formosat-7-fm1': [
    {
      date: '2024-03-12',
      objectName: 'SL-8 Debris (#23145)',
      minDistanceMeter: 145,
      probability: '2.44e-5',
      actionTaken: '啟動地面測控站進行高解析度追蹤，確認過境夾角無安全碰撞風險。',
      severity: 'low'
    }
  ],
  'triton': [
    {
      date: '2024-01-30',
      objectName: 'CZ-4B rocket stage fragments (#43110)',
      minDistanceMeter: 112,
      probability: '3.42e-5',
      actionTaken: '自主導航模組安全驗證。發射1級地面監視跟隨信號，一切運轉正常。',
      severity: 'medium'
    }
  ]
};

export interface SpaceWeatherMetric {
  solarWindSpeed: string;
  solarFluxF107: string;
  kpIndex: string;
  geomagneticBz: string;
  cloudCoverHsinchu: string;
  ionosphericScintillation: string;
}

export const SPACE_WEATHER_DATA: SpaceWeatherMetric = {
  solarWindSpeed: '456 km/s',
  solarFluxF107: '168.4 SFU',
  kpIndex: '2+ (綠色正常)',
  geomagneticBz: '-3.2 nT (偏南向)',
  cloudCoverHsinchu: '12% / 滿天星斗',
  ionosphericScintillation: '0.12 S4 (極低干擾)'
};

export const DEFAULT_YOUTUBE_URLS = [
  {
    name: '測試的直播畫面',
    url: 'https://www.youtube.com/watch?v=aCgmzh9eUqM'
  }
];
