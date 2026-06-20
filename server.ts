import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } else {
    console.warn("WARNING: GEMINI_API_KEY environment variable is missing.");
  }
} catch (err) {
  console.error("Failed to initialize Gemini client:", err);
}

// 1. Analyze Satellite telemetry
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { satellite } = req.body;
    if (!satellite) {
      return res.status(400).json({ error: "Missing satellite data" });
    }

    if (!ai) {
      return res.json({
        report: `#### 🛰️ 軌道力學動態分析 (本機基礎模型)\n此軌道設計為 **${satellite.type}**，其半長軸為 **${satellite.semiMajorAxis} km**，離心率為 **${satellite.eccentricity}**，軌道傾角為 **${satellite.inclination}°**。\n\n- **高度特性**：離地面的平均高度約為 ${satellite.semiMajorAxis - 6378} 公里，這使其符合其任務宗旨。\n- **軌道週期**：依據克卜勒第三定律，此衛星的軌道週期精算約為 **${(2 * Math.PI * Math.sqrt(Math.pow(satellite.semiMajorAxis, 3) / 398600.44) / 60).toFixed(2)} 分鐘**。\n- **分析限制**：未檢測到與後台連線的 \`GEMINI_API_KEY\`。請在系統設置中配置金鑰，解鎖由 AI 航太專家專為本載具撰寫的深層任務背景、發射受拉限制與極限宇宙天氣擾動分析報告！`
      });
    }

    const prompt = `您是一位精通天體物理學、古典力學與軌道力學的資深太空飛行控制與導航工程組組長 (Flight Dynamic Lead)。
請針對以下衛星/太空載具的軌道設計及太空任務提供一份專業、科學化且富含教育性的中文分析報告：

【衛星基本資料】
* 名稱：${satellite.name} (${satellite.englishName})
* 軌道類型：${satellite.type}
* 任務目的：${satellite.purpose}
* 軌道傾角 (i)：${satellite.inclination} 度
* 離心率 (e)：${satellite.eccentricity} (偏心率)
* 半長軸 (a)：${satellite.semiMajorAxis} km
* 升交點赤經 (RAAN, Ω)：${satellite.raan} 度
* 近地點幅角 (ω)：${satellite.argPerigee} 度
* 發射年份：${satellite.launchYear} 年
* 營運/主導國：${satellite.country}

【特殊任務背景】
${satellite.description}

請以下列格式產出結構化的繁體中文 (zh-TW) 報告，語氣要嚴謹、專業而充滿太空探索的情懷：

### 🛰️ 軌道力學動態分析
(請運用物理知識，解釋此傾角、離心率、與高度對其任務意圖的完美契合度。例如：為何向日葵9號能固定於東經140.7度？為何閃電衛星的橢圓軌道具有如此高離心率？福七的24度低傾角如何針對颱風提供氣象預報？列出核心軌道物理算式成果（如軌道週期、速差）。)

### 🚀 太空任務環境與系統挑戰
(分析該軌道高度或環境會面臨的系統工程挑戰。例如：LEO (ISS, 韋伯等) 面的大氣阻力、JWST 的超低溫需求與 L2 重力暈輪穩定性、GPS 面臨的相對論時間效應偏離校正、Molniya 的高輻射帶防護。)

### 🌌 台灣太空未來展望或科研對策
(特別針對福七展示台灣的氣象光芒，或其他衛星技術對於本土太空科學（如 TASA 國家太空中心、探空火箭、氣象預測自主化）在國際上的科研合作啟示。)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    res.json({ report: response.text });
  } catch (error: any) {
    console.error("Gemini Analyze Error:", error);
    res.status(500).json({ error: error.message || "Gemini API internally failed" });
  }
});

// 2. Chat with Astra AI space navigator
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, satelliteName } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    if (!ai) {
      return res.json({
        content: "你好！我是太空探測導航員 Astra。目前偵測到您的開發環境中沒有配置 \`GEMINI_API_KEY\`，我先切換為航天自動應答機。等您在 **Settings > Secrets** 設置金鑰後，我就能為您計算克卜勒方程式、重力助推軌道或進行深海衛星連線分析囉！"
      });
    }

    // Convert chat history to Gemini standard contents format
    const contents: any[] = [];
    for (const msg of messages.slice(-8)) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    const satelliteContext = satelliteName ? `目前使用者正在觀察並選取的衛星對象為：${satelliteName}。` : "";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: `您是國立太空軌道科學研究中心 (TASA/NSPO 專家) 的資深太空飛控導航科學家，名字叫「Astra」 (阿斯特拉)。
您熱愛天體物理學、重力彈弓效應、開普勒三大定律、地磁風暴與太空任務設計。
您的任務是用繁體中文 (zh-TW) 友善、熱情而極致專業地解答航太科學、軌道力學或該應用中 8 星軌道物理疑問。
${satelliteContext}
問答中請簡要、精緻、排版清晰，可以使用 Markdown 表格或項目符號，也可以引用著名公式如 $F = G(Mm)/r^2$ 或 $v = \\sqrt{\\mu(2/r - 1/a)}$，增加專業對話張力。`
      }
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "Gemini API internally failed" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Statically serving production dist from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server actively running on http://localhost:${PORT}`);
  });
}

startServer();
