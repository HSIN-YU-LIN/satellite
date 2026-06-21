import React, { useRef, useEffect, useState } from 'react';
import { Satellite } from '../types';
import { Play, Pause, RotateCcw, Orbit, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { SatelliteMiniature } from '../App';

interface OrbitSimulatorProps {
  selectedSatellite: Satellite;
  allSatellites: Satellite[];
}

interface CachedPolygon {
  isTaiwan: boolean;
  vertices: {
    lon: number;
    lat: number;
    cosLat: number;
    sinLat: number;
  }[];
}

interface ContinentLabel {
  name: string;
  lat: number;
  lon: number;
  color: string;
  isTaiwan?: boolean;
}

const CONTINENT_LABELS: ContinentLabel[] = [
  { name: '亞洲 (Asia)', lat: 38.0, lon: 95.0, color: 'rgba(255, 255, 255, 0.85)' },
  { name: '歐洲 (Europe)', lat: 50.0, lon: 15.0, color: 'rgba(255, 255, 255, 0.85)' },
  { name: '非洲 (Africa)', lat: 5.0, lon: 20.0, color: 'rgba(255, 255, 255, 0.85)' },
  { name: '北美洲 (N. America)', lat: 45.0, lon: -100.0, color: 'rgba(255, 255, 255, 0.85)' },
  { name: '南美洲 (S. America)', lat: -15.0, lon: -60.0, color: 'rgba(255, 255, 255, 0.85)' },
  { name: '大洋洲 (Oceania)', lat: -25.0, lon: 135.0, color: 'rgba(255, 255, 255, 0.85)' },
  { name: '南極洲 (Antarctica)', lat: -78.0, lon: 45.0, color: 'rgba(148, 163, 184, 0.7)' },
  { name: '臺灣 (Taiwan)', lat: 23.6, lon: 120.96, color: '#facc15', isTaiwan: true }
];

export default function OrbitSimulator({ selectedSatellite, allSatellites }: OrbitSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag / camera tracking options
  const [pitch, setPitch] = useState<number>(-0.4); 
  const [yaw, setYaw] = useState<number>(0.8);    
  const [zoom, setZoom] = useState<number>(1.0);   
  const [canvasStyleWidth, setCanvasStyleWidth] = useState<number>(550);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeMultiplier, setTimeMultiplier] = useState<number>(100); 
  const [showAllOrbits, setShowAllOrbits] = useState<boolean>(true);
  const [showEquatorPlane, setShowEquatorPlane] = useState<boolean>(true);

  // Refs to prevent canvas renderLoop useEffect teardown and recreation during interactive movements (fixes lagginess and stuttering!)
  const pitchRef = useRef(pitch);
  const yawRef = useRef(yaw);
  const zoomRef = useRef(zoom);
  const isPlayingRef = useRef(isPlaying);
  const timeMultiplierRef = useRef(timeMultiplier);
  const showAllOrbitsRef = useRef(showAllOrbits);
  const showEquatorPlaneRef = useRef(showEquatorPlane);

  // Synchronize refs
  useEffect(() => { pitchRef.current = pitch; }, [pitch]);
  useEffect(() => { yawRef.current = yaw; }, [yaw]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { timeMultiplierRef.current = timeMultiplier; }, [timeMultiplier]);
  useEffect(() => { showAllOrbitsRef.current = showAllOrbits; }, [showAllOrbits]);
  useEffect(() => { showEquatorPlaneRef.current = showEquatorPlane; }, [showEquatorPlane]);

  // Store simulation elapsed time in seconds to accumulate smoothly
  const elapsedOffsetSecRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  // Mouse drag states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startAngles = useRef({ pitch: 0, yaw: 0 });

  // Real-time TLE data from API
  const [tleData, setTleData] = useState<any>(null);
  const tleDataRef = useRef(tleData);
  useEffect(() => { tleDataRef.current = tleData; }, [tleData]);

  // Pre-cached continental geojson polygons
  const [cachedPolygons, setCachedPolygons] = useState<CachedPolygon[]>([]);
  const cachedPolygonsRef = useRef<CachedPolygon[]>([]);
  useEffect(() => {
    cachedPolygonsRef.current = cachedPolygons;
  }, [cachedPolygons]);

  useEffect(() => {
    let active = true;
    fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        const polygons: CachedPolygon[] = [];

        if (data && data.features) {
          data.features.forEach((feature: any) => {
            const isTaiwan = feature.properties?.name === "Taiwan" || 
                             feature.properties?.NAME === "Taiwan" || 
                             feature.properties?.adm0_a3 === "TWN" || 
                             feature.properties?.iso_a3 === "TWN" ||
                             feature.id === "TWN";

            const geom = feature.geometry;
            if (!geom) return;

            const processPolygon = (ring: number[][]) => {
              if (ring.length < 4) return;

              // Filter out tiny islands to save huge drawing overhead (unless it is Taiwan)
              if (!isTaiwan) {
                let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
                for (let i = 0; i < ring.length; i++) {
                  const pt = ring[i];
                  if (pt[1] < minLat) minLat = pt[1];
                  if (pt[1] > maxLat) maxLat = pt[1];
                  if (pt[0] < minLon) minLon = pt[0];
                  if (pt[0] > maxLon) maxLon = pt[0];
                }
                const latSpan = maxLat - minLat;
                const lonSpan = maxLon - minLon;
                // If the outline is extremely small, skip storing it
                if (latSpan < 2.5 && lonSpan < 2.5) {
                  return;
                }
              }

              // Downsample to keep 1 of every 5 coordinates for continents to gain a 500% performance boost
              const factor = isTaiwan ? 1 : 5;
              const downsampled: number[][] = [];
              for (let i = 0; i < ring.length; i++) {
                if (i === 0 || i === ring.length - 1 || i % factor === 0) {
                  downsampled.push(ring[i]);
                }
              }

              const vertices = downsampled.map(coord => {
                const lon = coord[0];
                const lat = coord[1];
                const rad = lat * Math.PI / 180;
                return {
                  lon,
                  lat,
                  cosLat: Math.cos(rad),
                  sinLat: Math.sin(rad)
                };
              });
              polygons.push({ isTaiwan, vertices });
            };

            if (geom.type === "Polygon") {
              geom.coordinates.forEach((ring: number[][]) => {
                processPolygon(ring);
              });
            } else if (geom.type === "MultiPolygon") {
              geom.coordinates.forEach((poly: any) => {
                poly.forEach((ring: number[][]) => {
                  processPolygon(ring);
                });
              });
            }
          });
        }
        setCachedPolygons(polygons);
      })
      .catch(err => {
        console.warn('Failed to load earth map GeoJSON:', err);
      });
    return () => {
      active = false;
    };
  }, []);

  const EARTH_RADIUS = 6378.1; // km
  const MU = 398600.4418; // km^3/s^2

  // Register non-passive wheel listener directly on canvas to block parent page scrolling when scrolling inside the simulator canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); // Lock parent page scroll!
      setZoom(prev => Math.max(0.18, Math.min(5.5, prev - e.deltaY * 0.0006)));
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Fetch TLE dynamically whenever local satellite selection is adjusted
  useEffect(() => {
    let active = true;
    const fetchTle = async () => {
      try {
        const res = await fetch(`/api/satellite-tle/${selectedSatellite.id}`);
        const json = await res.json();
        if (active && json && json.data) {
          setTleData(json.data);
        }
      } catch (err) {
        console.warn('Failed to fetch real TLE for 3D simulator map:', err);
      }
    };
    fetchTle();
    return () => {
      active = false;
    };
  }, [selectedSatellite]);

  // Readjust camera zoom comfortably based on satellite orbital boundaries
  useEffect(() => {
    if (selectedSatellite) {
      if (selectedSatellite.id === 'himawari-9') {
        setZoom(0.25);
      } else if (selectedSatellite.id === 'gps-block3' || selectedSatellite.id === 'molniya-1') {
        setZoom(0.35);
      } else {
        setZoom(1.0); // Perfect close zoom for Formosat 5/7, 8 and Triton LEOs
      }
    }
  }, [selectedSatellite]);

  // Dragging event callbacks (using non-reactive ref mutations during dragging for ultra-smooth rendering)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    startAngles.current = { pitch: pitchRef.current, yaw: yawRef.current };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const newYaw = startAngles.current.yaw + dx * 0.007;
    const newPitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, startAngles.current.pitch - dy * 0.007));
    yawRef.current = newYaw;
    pitchRef.current = newPitch;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setYaw(yawRef.current);
    setPitch(pitchRef.current);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      startAngles.current = { pitch: pitchRef.current, yaw: yawRef.current };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;
    const newYaw = startAngles.current.yaw + dx * 0.01;
    const newPitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, startAngles.current.pitch - dy * 0.01));
    yawRef.current = newYaw;
    pitchRef.current = newPitch;
  };

  const handleResetCamera = () => {
    setPitch(-0.4);
    setYaw(0.8);
    pitchRef.current = -0.4;
    yawRef.current = 0.8;
    if (selectedSatellite.id === 'himawari-9') {
      setZoom(0.25);
    } else if (selectedSatellite.id === 'gps-block3' || selectedSatellite.id === 'molniya-1') {
      setZoom(0.35);
    } else {
      setZoom(1.0);
    }
  };

  // Highly-precise orbit propagator (ECI orbital coordinates)
  const propagateSatellite = (sat: Satellite, simSecOffset: number) => {
    let inclination = sat.inclination;
    let eccentricity = sat.eccentricity;
    let raan = sat.raan;
    let argPerigee = sat.argPerigee;
    let a = sat.semiMajorAxis;
    let meanAnomalyDeg = 0;
    let epochTimeMs = Date.now() - 3600000;

    const isSelected = sat.id === selectedSatellite.id;
    if (isSelected && tleDataRef.current) {
      inclination = tleDataRef.current.INCLINATION;
      eccentricity = tleDataRef.current.ECCENTRICITY;
      raan = tleDataRef.current.RA_OF_ASC_NODE;
      argPerigee = tleDataRef.current.ARG_OF_PERICENTER;
      meanAnomalyDeg = tleDataRef.current.MEAN_ANOMALY || 0;
      if (tleDataRef.current.EPOCH) {
        epochTimeMs = new Date(tleDataRef.current.EPOCH).getTime();
      }
      
      const GM = 398600.4418;
      const nRadsSec = (tleDataRef.current.MEAN_MOTION * 2 * Math.PI) / 86400;
      a = Math.pow(GM / (nRadsSec * nRadsSec), 1 / 3);
    } else {
      // Deterministic offset to staggered orbits
      const hCode = sat.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      epochTimeMs = Date.now() - (hCode % 100) * 86400000; 
      meanAnomalyDeg = (hCode * 45) % 360;
    }

    const elapsedFromEpoch = (Date.now() - epochTimeMs) / 1000;
    const totalSec = elapsedFromEpoch + simSecOffset;

    // Mean Orbit motion rate
    const n = Math.sqrt(MU / Math.pow(a, 3)); 

    // Mean anomaly step
    const m0Rad = meanAnomalyDeg * Math.PI / 180;
    let mNow = (m0Rad + n * totalSec) % (2 * Math.PI);
    if (mNow < 0) mNow += 2 * Math.PI;

    // Solver for Eccentric Anomaly using Kepler's equation
    let ENow = mNow;
    for (let iter = 0; iter < 4; iter++) {
      ENow = ENow - (ENow - eccentricity * Math.sin(ENow) - mNow) / (1 - eccentricity * Math.cos(ENow));
    }

    // True Anomaly
    const tanNu2 = Math.sqrt((1 + eccentricity) / (1 - eccentricity)) * Math.tan(ENow / 2);
    let nu = 2 * Math.atan(tanNu2);
    if (nu < 0) nu += 2 * Math.PI;

    // Radial distance equation
    const r = (a * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(nu));
    
    // Convert out to ECI xyz-vector
    const iRad = inclination * Math.PI / 180;
    const omega = argPerigee * Math.PI / 180;
    const Ω = raan * Math.PI / 180;
    const u = omega + nu; 

    const x = r * (Math.cos(Ω) * Math.cos(u) - Math.sin(Ω) * Math.sin(u) * Math.cos(iRad));
    const y = r * (Math.sin(Ω) * Math.cos(u) + Math.cos(Ω) * Math.sin(u) * Math.cos(iRad));
    const z = r * (Math.sin(u) * Math.sin(iRad));

    return { 
      x, y, z, 
      distance: r, 
      trueAnomalyDegrees: (nu * 180) / Math.PI, 
      semiMajorAxis: a, 
      eccentricity, 
      inclination, 
      argPerigee, 
      raan 
    };
  };

  // Main Canvas & Physics Loop Context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    lastTimeRef.current = performance.now();

    const resizeCanvas = () => {
      // Scale based on the outer simulator container for uniform and centered gutters
      const parent = containerRef.current?.parentElement;
      const rect = parent?.getBoundingClientRect();
      const parentWidth = rect?.width || 800;
      // Create substantial gutters on left and right (96px total on desktop, 48px on mobile)
      const gutter = parentWidth > 640 ? 96 : 48;
      const targetWidth = Math.max(280, parentWidth - gutter);

      setCanvasStyleWidth(targetWidth);

      canvas.width = targetWidth * window.devicePixelRatio;
      canvas.height = (rect?.height || 550) * window.devicePixelRatio;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    };
    
    resizeCanvas();
    const observer = new ResizeObserver(() => resizeCanvas());
    if (containerRef.current) observer.observe(containerRef.current);

    const renderLoop = (timeNow: number) => {
      const dt = (timeNow - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = timeNow;

      if (isPlayingRef.current) {
        elapsedOffsetSecRef.current += dt * timeMultiplierRef.current;
      }

      const width = canvas.width;
      const height = canvas.height;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const scaleFactor = (Math.min(width, height) / (2.2 * EARTH_RADIUS)) * zoomRef.current; 

      const cosP = Math.cos(pitchRef.current);
      const sinP = Math.sin(pitchRef.current);
      const cosY = Math.cos(yawRef.current);
      const sinY = Math.sin(yawRef.current);

      // Projects 3D vectors to 2D UI screen
      const project = (X: number, Y: number, Z: number) => {
        const x1 = X * cosY - Y * sinY;
        const y1 = X * sinY + Y * cosY;
        const z1 = Z;

        const x2 = x1;
        const y2 = y1 * cosP - z1 * sinP;
        const z2 = y1 * sinP + z1 * cosP; 

        const screenX = centerX + x2 * scaleFactor;
        const screenY = centerY - z2 * scaleFactor; 
        
        return { x: screenX, y: screenY, depth: y2 };
      };

      // Draw Starfield Background
      ctx.fillStyle = '#ffffff';
      for (let sSec = 0; sSec < 50; sSec++) {
        const starYaw = Math.sin(sSec * 41.59) * Math.PI;
        const starPitch = Math.cos(sSec * 15.33) * (Math.PI / 2.2);
        const starR = 50000; 
        const sX = starR * Math.cos(starPitch) * Math.cos(starYaw);
        const sY = starR * Math.cos(starPitch) * Math.sin(starYaw);
        const sZ = starR * Math.sin(starPitch);

        const star2d = project(sX, sY, sZ);
        const size = (Math.sin(sSec * 1235.1) + 1.2) * 0.7 * dpr;
        const opacity = (Math.cos(sSec * 142.1) + 1) / 2 * 0.4 + 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(star2d.x, star2d.y, size, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw Equatorial Grid Plane (Z = 0)
      if (showEquatorPlaneRef.current) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.lineWidth = 1 * dpr;
        for (let rEq = 5000; rEq <= 35000; rEq += 10000) {
          ctx.beginPath();
          for (let thEq = 0; thEq <= 360; thEq += 10) {
            const radEq = thEq * Math.PI / 180;
            const eqP = project(rEq * Math.cos(radEq), rEq * Math.sin(radEq), 0);
            if (thEq === 0) ctx.moveTo(eqP.x, eqP.y);
            else ctx.lineTo(eqP.x, eqP.y);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Draw Orbit Trace lines
      allSatellites.forEach(sat => {
        const isSelected = sat.id === selectedSatellite.id;
        if (!isSelected && !showAllOrbitsRef.current) return;

        ctx.lineWidth = isSelected ? 2.5 * dpr : 1.0 * dpr;
        ctx.strokeStyle = isSelected ? sat.color : 'rgba(148, 163, 184, 0.22)';
        
        ctx.beginPath();
        for (let thetaStep = 0; thetaStep <= 360; thetaStep += 3.0) {
          
          // Recompute position at this theta step parameter
          let omega = sat.argPerigee;
          let incl = sat.inclination;
          let ran = sat.raan;
          let SM = sat.semiMajorAxis;
          let ecc = sat.eccentricity;

          if (isSelected && tleDataRef.current) {
            incl = tleDataRef.current.INCLINATION;
            ecc = tleDataRef.current.ECCENTRICITY;
            ran = tleDataRef.current.RA_OF_ASC_NODE;
            omega = tleDataRef.current.ARG_OF_PERICENTER;
            const GM = 398600.4418;
            const nRadsSec = (tleDataRef.current.MEAN_MOTION * 2 * Math.PI) / 86400;
            SM = Math.pow(GM / (nRadsSec * nRadsSec), 1 / 3);
          }

          const thRad = thetaStep * Math.PI / 180;
          const rL = (SM * (1 - ecc * ecc)) / (1 + ecc * Math.cos(thRad));
          const iRad = incl * Math.PI / 180;
          const omRad = omega * Math.PI / 180;
          const ΩRad = ran * Math.PI / 180;
          const uRad = omRad + thRad;

          const pX = rL * (Math.cos(ΩRad) * Math.cos(uRad) - Math.sin(ΩRad) * Math.sin(uRad) * Math.cos(iRad));
          const pY = rL * (Math.sin(ΩRad) * Math.cos(uRad) + Math.cos(ΩRad) * Math.sin(uRad) * Math.cos(iRad));
          const pZ = rL * (Math.sin(uRad) * Math.sin(iRad));

          const pt2d = project(pX, pY, pZ);
          if (thetaStep === 0) ctx.moveTo(pt2d.x, pt2d.y);
          else ctx.lineTo(pt2d.x, pt2d.y);
        }
        ctx.stroke();

        // Highlight Perigee & Apogee nodes for the selection
        if (isSelected) {
          let omega = sat.argPerigee;
          let incl = sat.inclination;
          let ran = sat.raan;
          let SM = sat.semiMajorAxis;
          let ecc = sat.eccentricity;

          if (tleDataRef.current) {
            incl = tleDataRef.current.INCLINATION;
            ecc = tleDataRef.current.ECCENTRICITY;
            ran = tleDataRef.current.RA_OF_ASC_NODE;
            omega = tleDataRef.current.ARG_OF_PERICENTER;
            const GM = 398600.4418;
            const nRadsSec = (tleDataRef.current.MEAN_MOTION * 2 * Math.PI) / 86400;
            SM = Math.pow(GM / (nRadsSec * nRadsSec), 1 / 3);
          }

          const getPositionForAnomaly = (thStep: number) => {
            const thRad = thStep * Math.PI / 180;
            const rL = (SM * (1 - ecc * ecc)) / (1 + ecc * Math.cos(thRad));
            const iRad = incl * Math.PI / 180;
            const omRad = omega * Math.PI / 180;
            const ΩRad = ran * Math.PI / 180;
            const uRad = omRad + thRad;
            return project(
              rL * (Math.cos(ΩRad) * Math.cos(uRad) - Math.sin(ΩRad) * Math.sin(uRad) * Math.cos(iRad)),
              rL * (Math.sin(ΩRad) * Math.cos(uRad) + Math.cos(ΩRad) * Math.sin(uRad) * Math.cos(iRad)),
              rL * (Math.sin(uRad) * Math.sin(iRad))
            );
          };

          const peri2d = getPositionForAnomaly(0);
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(peri2d.x, peri2d.y, 4.5 * dpr, 0, 2 * Math.PI);
          ctx.fill();
          ctx.font = `bold ${9 * dpr}px "JetBrains Mono", monospace`;
          ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
          ctx.fillText('近地點 (Perigee)', peri2d.x + 8, peri2d.y + 4);

          const apo2d = getPositionForAnomaly(180);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(apo2d.x, apo2d.y, 4.5 * dpr, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.fillText('遠地點 (Apogee)', apo2d.x + 8, apo2d.y + 4);
        }
      });

      // Compute Earth's physical Rotation (GST Sidereal spin based on real date + speed accelerator)
      const julianDate = (Date.now() / 86400000) + 2440587.5;
      const initialGST = (280.46061837 + 360.98564736629 * (julianDate - 2451545.0)) % 360;
      const EARTH_SPIN_RATE = 360 / 86164.0905; 
      const earthRotation = (initialGST + (elapsedOffsetSecRef.current * EARTH_SPIN_RATE)) % 360;

      const earthProjected = project(0, 0, 0);
      const earthRadiusPixels = EARTH_RADIUS * scaleFactor;

      // Draw Shaded "真實地球" (Spherical Solid Earth)
      ctx.save();
      // Render bounds of the globe strictly inside sphere
      ctx.beginPath();
      ctx.arc(earthProjected.x, earthProjected.y, earthRadiusPixels, 0, 2 * Math.PI);
      ctx.clip(); 

      // 1. Beautiful Deep Ocean Shading
      const oceanShading = ctx.createRadialGradient(
        earthProjected.x - earthRadiusPixels * 0.2, earthProjected.y - earthRadiusPixels * 0.2, earthRadiusPixels * 0.1,
        earthProjected.x, earthProjected.y, earthRadiusPixels
      );
      oceanShading.addColorStop(0, '#1d4ed8'); // Brilliant ocean reflection
      oceanShading.addColorStop(0.35, '#1e3a8a'); // Solid dark royal blue
      oceanShading.addColorStop(0.8, '#0f172a'); // Deep slate blue ocean trenches
      oceanShading.addColorStop(1.0, '#020617'); // Space border dark edge

      ctx.fillStyle = oceanShading;
      ctx.fillRect(earthProjected.x - earthRadiusPixels - 10, earthProjected.y - earthRadiusPixels - 10, earthRadiusPixels * 2 + 20, earthRadiusPixels * 2 + 20);

      // 2. Draw high quality physical continuous vector continents from Natural Earth geojson
      const polygons = cachedPolygonsRef.current;
      polygons.forEach(cachedPoly => {
        ctx.beginPath();
        let first = true;
        let hasVisible = false;

        cachedPoly.vertices.forEach(v => {
          const rotatedLon = v.lon + earthRotation;
          const lonRad = rotatedLon * Math.PI / 180;

          const pX = EARTH_RADIUS * v.cosLat * Math.cos(lonRad);
          const pY = EARTH_RADIUS * v.cosLat * Math.sin(lonRad);
          const pZ = EARTH_RADIUS * v.sinLat;

          const pt2d = project(pX, pY, pZ);

          if (pt2d.depth > -100) {
            if (first) {
              ctx.moveTo(pt2d.x, pt2d.y);
              first = false;
            } else {
              ctx.lineTo(pt2d.x, pt2d.y);
            }
            if (pt2d.depth > 0) hasVisible = true;
          }
        });

        if (!first && hasVisible) {
          ctx.closePath();
          if (cachedPoly.isTaiwan) {
            ctx.fillStyle = '#facc15'; // Solid vibrant yellow for Taiwan
            ctx.fill();
            ctx.strokeStyle = '#fef08a'; // Brighter warm outline
            ctx.lineWidth = 1.0 * dpr;
            ctx.stroke();
          } else {
            const isAntarctica = cachedPoly.vertices[0]?.lat < -60;
            ctx.fillStyle = isAntarctica ? '#f8fafc' : '#166534'; // Pristine snow caps vs deep forest land
            ctx.fill();
            ctx.strokeStyle = isAntarctica ? '#cbd5e1' : '#14532d'; // Realistic border and contour lines
            ctx.lineWidth = 0.5 * dpr;
            ctx.stroke();
          }
        }
      });

      // Draw Taiwan's active ground observation control station pulsing yellow beacon (23.6N, 120.96E)
      const twLonRad = (120.96 + earthRotation) * Math.PI / 180;
      const twLatRad = 23.6 * Math.PI / 180;
      const twCosLat = Math.cos(twLatRad);
      const pX_tw = EARTH_RADIUS * twCosLat * Math.cos(twLonRad);
      const pY_tw = EARTH_RADIUS * twCosLat * Math.sin(twLonRad);
      const pZ_tw = EARTH_RADIUS * Math.sin(twLatRad);
      const twProjected = project(pX_tw, pY_tw, pZ_tw);

      if (twProjected.depth > 0) {
        // Glowing yellow pulse ring
        const pulseRatio = (timeNow * 0.001) % 1.0;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(250, 204, 21, ${1.0 - pulseRatio})`; // yellow fade pulse
        ctx.lineWidth = 1.5 * dpr;
        ctx.arc(twProjected.x, twProjected.y, (3 + pulseRatio * 16) * dpr, 0, 2 * Math.PI);
        ctx.stroke();

        // White-cored yellow radar beacon tip
        ctx.beginPath();
        ctx.fillStyle = '#facc15';
        ctx.arc(twProjected.x, twProjected.y, 4 * dpr, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.arc(twProjected.x, twProjected.y, 1.2 * dpr, 0, 2 * Math.PI);
        ctx.fill();
      }

      // 3. Spherical atmosphere shading overlay (Diffuse 3D solar lit overlay)
      const sunLighting = ctx.createRadialGradient(
        earthProjected.x - earthRadiusPixels * 0.15, earthProjected.y - earthRadiusPixels * 0.15, earthRadiusPixels * 0.1,
        earthProjected.x, earthProjected.y, earthRadiusPixels
      );
      sunLighting.addColorStop(0, 'rgba(255, 255, 255, 0.12)'); // Specular reflection hotspot
      sunLighting.addColorStop(0.35, 'rgba(0, 0, 0, 0)'); // Lit zone
      sunLighting.addColorStop(0.75, 'rgba(0, 0, 0, 0.35)'); // Day-night transition terminator
      sunLighting.addColorStop(0.96, 'rgba(0, 0, 0, 0.85)'); // Crepuscular dark shadow
      sunLighting.addColorStop(1.0, 'rgba(0, 0, 0, 0.98)'); // Space edge dark border

      ctx.fillStyle = sunLighting;
      ctx.fillRect(earthProjected.x - earthRadiusPixels - 10, earthProjected.y - earthRadiusPixels - 10, earthRadiusPixels * 2 + 20, earthRadiusPixels * 2 + 20);

      // Restore clipping region
      ctx.restore();

      // 4. Draw Continent, Division, and Region Label names with high legibility shadows
      CONTINENT_LABELS.forEach(label => {
        const rotatedLon = label.lon + earthRotation;
        const latRad = label.lat * Math.PI / 180;
        const lonRad = rotatedLon * Math.PI / 180;

        const pX = EARTH_RADIUS * Math.cos(latRad) * Math.cos(lonRad);
        const pY = EARTH_RADIUS * Math.cos(latRad) * Math.sin(lonRad);
        const pZ = EARTH_RADIUS * Math.sin(latRad);

        const pt2d = project(pX, pY, pZ);

        if (pt2d.depth > 0) {
          ctx.save();
          if (label.isTaiwan) {
            // Special gray label for Taiwan as requested, with high visibility contrasting line
            ctx.font = `bold ${8.5 * dpr}px "Inter", sans-serif`;
            ctx.fillStyle = label.color; // Special grey color

            // Pointer line pointing to Taiwan beacon
            ctx.strokeStyle = 'rgba(156, 163, 175, 0.65)';
            ctx.lineWidth = 0.8 * dpr;
            ctx.beginPath();
            ctx.moveTo(pt2d.x, pt2d.y);
            ctx.lineTo(pt2d.x + 22 * dpr, pt2d.y - 12 * dpr);
            ctx.stroke();

            // Label text drawing
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 4 * dpr;
            ctx.fillText(label.name, pt2d.x + 25 * dpr, pt2d.y - 8 * dpr);
          } else {
            // General continent divisions
            ctx.font = `bold ${9 * dpr}px "Inter", sans-serif`;
            ctx.fillStyle = label.color;
            ctx.textAlign = 'center';

            // High legibility drop shadow text effect
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 5 * dpr;
            ctx.fillText(label.name, pt2d.x, pt2d.y);
          }
          ctx.restore();
        }
      });

      // Physical outer scattering glowing atmosphere (Cyan ring wrapping around)
      const atmosphericGlow = ctx.createRadialGradient(
        earthProjected.x, earthProjected.y, earthRadiusPixels * 0.94,
        earthProjected.x, earthProjected.y, earthRadiusPixels * 1.05
      );
      atmosphericGlow.addColorStop(0, 'rgba(30, 144, 255, 0.0)');
      atmosphericGlow.addColorStop(0.4, 'rgba(6, 182, 212, 0.32)');
      atmosphericGlow.addColorStop(0.85, 'rgba(34, 211, 238, 0.52)');
      atmosphericGlow.addColorStop(1.0, 'rgba(6, 182, 212, 0.0)');

      ctx.fillStyle = atmosphericGlow;
      ctx.beginPath();
      ctx.arc(earthProjected.x, earthProjected.y, earthRadiusPixels * 1.05, 0, 2 * Math.PI);
      ctx.fill();

      // Draw active satellites
      allSatellites.forEach(sat => {
        const isSelected = sat.id === selectedSatellite.id;
        if (!isSelected && !showAllOrbitsRef.current) return;

        const orbitalState = propagateSatellite(sat, elapsedOffsetSecRef.current);
        const sat2d = project(orbitalState.x, orbitalState.y, orbitalState.z);

        // Back-hemisphere distance and eclipse culling
        const isBehindEarth = sat2d.depth < 0 && (
          Math.pow(sat2d.x - earthProjected.x, 2) + Math.pow(sat2d.y - earthProjected.y, 2) < Math.pow(earthRadiusPixels, 2)
        );

        if (isBehindEarth) {
          ctx.globalAlpha = 0.2; // Dim down occulted satellites behind Earth
        }

        // Project physical 3D vertices of satellite body
        const bodySize = isSelected ? 480 : 280;
        const getECISub = (lx: number, ly: number, lz: number) => {
          // Basis vectors along radial & flight tangent direction
          const stateNext = propagateSatellite(sat, elapsedOffsetSecRef.current + 0.1);
          const rx = -orbitalState.x / orbitalState.distance;
          const ry = -orbitalState.y / orbitalState.distance;
          const rz = -orbitalState.z / orbitalState.distance;

          let tx = stateNext.x - orbitalState.x;
          let ty = stateNext.y - orbitalState.y;
          let tz = stateNext.z - orbitalState.z;
          const tLen = Math.sqrt(tx*tx + ty*ty + tz*tz);
          tx /= tLen; ty /= tLen; tz /= tLen;

          const nx = ty * rz - tz * ry;
          const ny = tz * rx - tx * rz;
          const nz = tx * ry - ty * rx;
          const nLen = Math.sqrt(nx*nx + ny*ny + nz*nz);
          const ux = nx / nLen;
          const uy = ny / nLen;
          const uz = nz / nLen;

          const EX = orbitalState.x + lx * tx + ly * ux + lz * rx;
          const EY = orbitalState.y + lx * ty + ly * uy + lz * ry;
          const EZ = orbitalState.z + lx * tz + ly * uz + lz * rz;
          return project(EX, EY, EZ);
        };

        const vertices = [
          { x: -bodySize, y: -bodySize, z: -bodySize },
          { x: bodySize, y: -bodySize, z: -bodySize },
          { x: bodySize, y: bodySize, z: -bodySize },
          { x: -bodySize, y: bodySize, z: -bodySize },
          { x: -bodySize, y: -bodySize, z: bodySize },
          { x: bodySize, y: -bodySize, z: bodySize },
          { x: bodySize, y: bodySize, z: bodySize },
          { x: -bodySize, y: bodySize, z: bodySize }
        ];

        const projVertices = vertices.map(v => getECISub(v.x * 0.35, v.y * 0.35, v.z * 0.35));

        const faces = [
          { idxs: [0, 1, 2, 3], color: 'rgba(30, 41, 59, 0.95)' },
          { idxs: [4, 5, 6, 7], color: 'rgba(71, 85, 105, 0.95)' },
          { idxs: [0, 1, 5, 4], color: 'rgba(15, 23, 42, 0.95)' },
          { idxs: [2, 3, 7, 6], color: 'rgba(51, 65, 85, 0.95)' },
          { idxs: [1, 2, 6, 5], color: 'rgba(30, 41, 59, 0.95)' },
          { idxs: [0, 3, 7, 4], color: 'rgba(15, 23, 42, 0.95)' }
        ];

        const facesWithDepth = faces.map(f => {
          const avgDepth = (
            projVertices[f.idxs[0]].depth + 
            projVertices[f.idxs[1]].depth + 
            projVertices[f.idxs[2]].depth + 
            projVertices[f.idxs[3]].depth
          ) / 4;
          return { ...f, avgDepth };
        });

        facesWithDepth.sort((a, b) => a.avgDepth - b.avgDepth);

        // Render satellite facets
        facesWithDepth.forEach(f => {
          ctx.beginPath();
          ctx.moveTo(projVertices[f.idxs[0]].x, projVertices[f.idxs[0]].y);
          for (let k = 1; k < 4; k++) {
            ctx.lineTo(projVertices[f.idxs[k]].x, projVertices[f.idxs[k]].y);
          }
          ctx.closePath();
          ctx.fillStyle = f.color;
          ctx.fill();
          ctx.strokeStyle = sat.color;
          ctx.lineWidth = 0.5 * dpr;
          ctx.stroke();
        });

        // Extend Solar array wings
        const wingW = bodySize * 0.28;
        const wingL = bodySize * 1.7;
        const drawWing = (wVerts: {x:number, y:number, z:number}[]) => {
          const projWing = wVerts.map(v => getECISub(v.x * 0.35, v.y * 0.35, v.z * 0.35));
          ctx.beginPath();
          ctx.moveTo(projWing[0].x, projWing[0].y);
          for (let k = 1; k < 4; k++) ctx.lineTo(projWing[k].x, projWing[k].y);
          ctx.closePath();
          ctx.fillStyle = isSelected ? 'rgba(14, 116, 144, 0.95)' : 'rgba(14, 116, 144, 0.6)';
          ctx.fill();
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 0.5 * dpr;
          ctx.stroke();
        };

        drawWing([
          { x: -wingW, y: bodySize * 0.5, z: 0 },
          { x: wingW, y: bodySize * 0.5, z: 0 },
          { x: wingW, y: bodySize * 0.5 + wingL, z: 0 },
          { x: -wingW, y: bodySize * 0.5 + wingL, z: 0 }
        ]);

        drawWing([
          { x: -wingW, y: -bodySize * 0.5, z: 0 },
          { x: wingW, y: -bodySize * 0.5, z: 0 },
          { x: wingW, y: -(bodySize * 0.5 + wingL), z: 0 },
          { x: -wingW, y: -(bodySize * 0.5 + wingL), z: 0 }
        ]);

        // Draw selection highlight rings and labels
        if (isSelected) {
          const pulseRadius = (7.5 + Math.sin(timeNow * 0.009) * 8.5) * dpr;
          ctx.strokeStyle = sat.color;
          ctx.lineWidth = 1.2 * dpr;
          ctx.beginPath();
          ctx.arc(sat2d.x, sat2d.y, pulseRadius, 0, 2 * Math.PI);
          ctx.stroke();

          // Standard glowing text labels
          ctx.font = `bold ${11 * dpr}px "Inter", sans-serif`;
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.shadowColor = sat.color;
          ctx.fillText(sat.name.split(' (')[0], sat2d.x + 14, sat2d.y - 7);
          ctx.shadowBlur = 0; 

          // Link vertical tether alignment lines directly down to Earth intersection
          const earthNormal = { x: orbitalState.x / orbitalState.distance, y: orbitalState.y / orbitalState.distance, z: orbitalState.z / orbitalState.distance };
          const linkSurface = { x: earthNormal.x * EARTH_RADIUS, y: earthNormal.y * EARTH_RADIUS, z: earthNormal.z * EARTH_RADIUS };
          const link2d = project(linkSurface.x, linkSurface.y, linkSurface.z);

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1 * dpr;
          ctx.setLineDash([2 * dpr, 3 * dpr]);
          ctx.beginPath();
          ctx.moveTo(link2d.x, link2d.y);
          ctx.lineTo(sat2d.x, sat2d.y);
          ctx.stroke();
          ctx.setLineDash([]); 
        } else {
          ctx.font = `${9 * dpr}px "Inter", sans-serif`;
          ctx.fillStyle = 'rgba(200, 220, 255, 0.45)';
          ctx.fillText(sat.name.split(' (')[0], sat2d.x + 10, sat2d.y + 12);
        }

        ctx.globalAlpha = 1.0; 
      });

      // Fetch, calculate, and synchronize current active HUD properties (Direct DOM bindings)
      const targetState = propagateSatellite(selectedSatellite, elapsedOffsetSecRef.current);
      const orbitPeriodMinutes = (2 * Math.PI * Math.sqrt(Math.pow(targetState.semiMajorAxis, 3) / MU)) / 60;
      const dynamicAltitude = targetState.distance - EARTH_RADIUS;
      const dynamicSpeed = Math.sqrt(MU * (2 / targetState.distance - 1 / targetState.semiMajorAxis));

      const altEl = document.getElementById('hud-altitude');
      const speedEl = document.getElementById('hud-speed');
      const periodEl = document.getElementById('hud-period');
      const anomalyEl = document.getElementById('hud-anomaly');

      if (altEl) altEl.textContent = `${dynamicAltitude.toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
      if (speedEl) speedEl.textContent = `${dynamicSpeed.toFixed(3)} km/s`;
      if (periodEl) periodEl.textContent = `${orbitPeriodMinutes.toFixed(1)} 分鐘`;
      if (anomalyEl) anomalyEl.textContent = `${targetState.trueAnomalyDegrees.toFixed(1)}°`;

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [selectedSatellite, allSatellites]);

  // Compute standard baseline static calculations for the react SSR frame (before canvas animation boots)
  const isSelected = selectedSatellite;
  const a = isSelected.semiMajorAxis;
  const e = isSelected.eccentricity;
  const distanceR = a; 
  const dynamicAltitude = distanceR - EARTH_RADIUS;
  const dynamicSpeed = Math.sqrt(MU * (2 / distanceR - 1 / a));
  const orbitPeriodMinutes = (2 * Math.PI * Math.sqrt(Math.pow(a, 3) / MU)) / 60;

  return (
    <div className="relative flex flex-col h-full bg-[#030408] border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl shadow-cyan-950/15" id="orbit-simulator-container">
      {/* Simulation Controls Top Frame */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-850 bg-slate-950/80 backdrop-blur-md z-10" id="sim-control-top">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <h3 className="font-sans font-medium text-xs text-slate-200 uppercase tracking-widest flex items-center gap-1">
            <Orbit className="w-3.5 h-3.5 text-[#00f0ff] animate-spin" style={{ animationDuration: '6s' }} />
            3D 互動式太空軌道模擬儀
          </h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Play / Pause button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            id="play-pause-btn"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-[11px] transition ${
              isPlaying 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3" /> 暫停運行
              </>
            ) : (
              <>
                <Play className="w-3 h-3" /> 啟動追蹤
              </>
            )}
          </button>

          {/* Time speed multipliers */}
          <div className="flex items-center px-1 py-0.5 bg-slate-950 border border-slate-800/60 rounded-md" id="speed-controls">
            <span className="text-[9px] text-slate-500 px-1.5 font-mono uppercase tracking-wider">時間模擬</span>
            {[1, 50, 100, 300, 600].map(mult => (
              <button
                key={mult}
                onClick={() => setTimeMultiplier(mult)}
                className={`px-1.5 py-1 rounded text-[9px] font-mono transition ${
                  timeMultiplier === mult 
                    ? 'bg-cyan-500/15 text-cyan-400 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mult === 1 ? 'REAL' : `${mult}x`}
              </button>
            ))}
          </div>

          {/* View Toggle options */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800/60 rounded-md p-0.5" id="orbit-toggles">
            <button
              onClick={() => setShowAllOrbits(!showAllOrbits)}
              title={showAllOrbits ? "隱藏其他衛星軌道" : "顯示所有衛星軌道"}
              className={`p-1.5 rounded transition ${showAllOrbits ? 'bg-slate-800/80 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {showAllOrbits ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setShowEquatorPlane(!showEquatorPlane)}
              title={showEquatorPlane ? "隱藏赤道參考面" : "顯示赤道參考面"}
              className={`p-1.5 rounded text-[9px] font-mono transition px-2 ${showEquatorPlane ? 'bg-slate-800/80 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              赤道面
            </button>
          </div>

          {/* Reset Camera angle */}
          <button
            onClick={handleResetCamera}
            title="重設相機視角"
            id="reset-cam-btn"
            className="p-1.5 bg-slate-950 border border-slate-850 rounded-md text-slate-300 hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Stage Wrapper (centered relative container with side gutters that pass scroll through) */}
      <div className="relative flex-1 w-full bg-[#030408] flex items-center justify-center overflow-hidden" id="stage-parent-box">
        <div 
          ref={containerRef}
          className="relative h-full cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          id="canvas-stage"
          style={{ width: `${canvasStyleWidth}px` }}
        >
          <canvas ref={canvasRef} className="block w-full h-full" />

          {/* Real-time calculated Kepler telemetries (Fading Float Box) */}
          <div 
            className="absolute left-4 bottom-4 p-4 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-850/80 pointer-events-none shadow-xl max-w-[280px]"
            id="realtime-math-hud"
          >
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2 border-b border-slate-850 pb-1 flex items-center justify-between">
              <span>即時聯機遙測數據</span>
              <span>LIVE-TRACK</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center gap-4">
                <span className="text-[11px] text-slate-400 font-sans">目前軌道高度：</span>
                <span id="hud-altitude" className="font-mono text-xs text-[#00f0ff] font-semibold">{dynamicAltitude.toLocaleString(undefined, { maximumFractionDigits: 1 })} km</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-[11px] text-slate-400 font-sans">瞬時向心初速：</span>
                <span id="hud-speed" className="font-mono text-xs text-emerald-400 font-semibold">{dynamicSpeed.toFixed(3)} km/s</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-[11px] text-slate-400 font-sans">精算軌道週期：</span>
                <span id="hud-period" className="font-mono text-xs text-indigo-300 font-semibold">{orbitPeriodMinutes.toFixed(1)} 分鐘</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-[11px] text-slate-400 font-sans">真近點角 (ν)：</span>
                <span id="hud-anomaly" className="font-mono text-xs text-amber-400 font-semibold">0.0°</span>
              </div>
            </div>
          </div>

          {/* View Instructions Info Overlay */}
          <div className="absolute right-4 bottom-4 flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-950/70 p-2 rounded border border-slate-850/40 pointer-events-none">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>滑鼠拖曳旋轉 3D / 滾輪放大縮小</span>
          </div>
        </div>
      </div>
    </div>
  );
}
