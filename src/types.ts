export interface Satellite {
  id: string;
  name: string;
  englishName: string;
  type: string; // 近地軌道 (LEO), 中地球軌道 (MEO), 地球靜止軌道 (GEO), 高橢圓軌道 (HEO)...
  purpose: string;
  imageUrl: string;
  description: string;
  semiMajorAxis: number; // a in km
  eccentricity: number;  // e (0 to 1)
  inclination: number;   // i in degrees (0 to 180)
  raan: number;          // Ω (Right Ascension of Ascending Node) in degrees (0 to 360)
  argPerigee: number;    // ω (Argument of Perigee) in degrees (0 to 360)
  color: string;         // RGB hex color for visualization
  launchYear: number;
  country: string;
  detailedSpecs: {
    operator: string;
    mass: string;
    dimensions: string;
    highlights: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface OrbitState {
  currentAnomaly: number;  // True Anomaly in degrees
  altitude: number;        // km
  speed: number;           // km/s
  period: number;          // minutes
}
