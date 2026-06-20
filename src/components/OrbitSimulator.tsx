import React, { useRef, useEffect, useState } from 'react';
import { Satellite } from '../types';
import { Play, Pause, RotateCcw, Orbit, HelpCircle, Eye, EyeOff } from 'lucide-react';

interface OrbitSimulatorProps {
  selectedSatellite: Satellite;
  allSatellites: Satellite[];
}

export default function OrbitSimulator({ selectedSatellite, allSatellites }: OrbitSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction options
  const [pitch, setPitch] = useState<number>(-0.4); // elevation rotation in radians
  const [yaw, setYaw] = useState<number>(0.8);    // azimuth rotation in radians
  const [zoom, setZoom] = useState<number>(7.0);   // pixel scale per km
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeMultiplier, setTimeMultiplier] = useState<number>(100); // Orbit speed multiplier
  const [showAllOrbits, setShowAllOrbits] = useState<boolean>(true);
  const [showEquatorPlane, setShowEquatorPlane] = useState<boolean>(true);

  // Simulated true anomalies (current positions) for all satellites to run parallel
  const [anomalies, setAnomalies] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    allSatellites.forEach(s => {
      // Start with some random offset for visual interest
      initial[s.id] = Math.random() * 360;
    });
    return initial;
  });

  // Track mouse dragging
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startAngles = useRef({ pitch: 0, yaw: 0 });

  // Gravitational Parameter mu (km^3 / s^2)
  const MU = 398600.44;
  const EARTH_RADIUS = 6378.1; // km

  // Re-calculate zoom when size or satellite changes to fit comfortable bounds
  useEffect(() => {
    if (selectedSatellite) {
      if (selectedSatellite.id === 'himawari-9') {
        setZoom(4.5); // Geo orbit is huge (42k km), zoom out
      } else if (selectedSatellite.id === 'gps-block3' || selectedSatellite.id === 'molniya-1') {
        setZoom(5.5); // GPS and Molniya (26k km) need medium zoom
      } else if (selectedSatellite.id === 'jwst') {
        setZoom(8.0); // Webb scaled
      } else {
        setZoom(14.0); // LEO orbits (ISS, Hubble, Formosat-7) are small (6k km), zoom in
      }
    }
  }, [selectedSatellite]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    startAngles.current = { pitch, yaw };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // Adjust camera yaw and pitch
    setYaw(startAngles.current.yaw + dx * 0.007);
    setPitch(Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, startAngles.current.pitch - dy * 0.007)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      startAngles.current = { pitch, yaw };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;

    setYaw(startAngles.current.yaw + dx * 0.01);
    setPitch(Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, startAngles.current.pitch - dy * 0.01)));
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    // prevent default if embedded
    setZoom(prev => Math.max(1.0, Math.min(40.0, prev - e.deltaY * 0.005)));
  };

  // Orbit math converter: Perifocal/Keplerian to Earth-Centered Inertial (ECI) coordinates (X, Y, Z in km)
  const getECIPosition = (satellite: Satellite, trueAnomalyDegrees: number) => {
    const a = satellite.semiMajorAxis;
    const e = satellite.eccentricity;
    const i = satellite.inclination * Math.PI / 180;
    const omega = satellite.argPerigee * Math.PI / 180;
    const Ω = satellite.raan * Math.PI / 180;
    const anomalyRad = trueAnomalyDegrees * Math.PI / 180;

    // Orbit Equation: r = a(1 - e^2) / (1 + e * cos(nu))
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(anomalyRad));

    // Perifocal coordinate matrix transform directly expanded
    const u = omega + anomalyRad; // Argument of Latitude

    const x = r * (Math.cos(Ω) * Math.cos(u) - Math.sin(Ω) * Math.sin(u) * Math.cos(i));
    const y = r * (Math.sin(Ω) * Math.cos(u) + Math.cos(Ω) * Math.sin(u) * Math.cos(i));
    const z = r * (Math.sin(u) * Math.sin(i));

    return { x, y, z, distance: r };
  };

  // Reset Camera View
  const handleResetCamera = () => {
    setPitch(-0.4);
    setYaw(0.8);
    if (selectedSatellite.id === 'himawari-9') {
      setZoom(4.5);
    } else if (selectedSatellite.id === 'gps-block3' || selectedSatellite.id === 'molniya-1') {
      setZoom(5.5);
    } else {
      setZoom(14.0);
    }
  };

  // The rendering and physics loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    // Resize matching
    const resizeCanvas = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      canvas.width = (rect?.width || 800) * window.devicePixelRatio;
      canvas.height = (rect?.height || 550) * window.devicePixelRatio;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    };
    
    // Initial size
    resizeCanvas();
    const observer = new ResizeObserver(() => resizeCanvas());
    if (containerRef.current) observer.observe(containerRef.current);

    // Track Earth axial rotation in degrees
    let earthRotation = 0;

    const renderLoop = (timeNow: number) => {
      const dt = (timeNow - lastTime) / 1000; // seconds elapsed
      lastTime = timeNow;

      // 1. Process physics/anomalies movement
      if (isPlaying) {
        setAnomalies(prev => {
          const next = { ...prev };
          allSatellites.forEach(sat => {
            // Orbit period: T = 2 * pi * sqrt(a^3 / mu) seconds
            const periodSec = 2 * Math.PI * Math.sqrt(Math.pow(sat.semiMajorAxis, 3) / MU);
            // Mean angular rate: n = 360 / T degrees per second
            const meanRate = 360 / periodSec;
            
            // Adjust rate according to true anomaly simulation for non-circular (Molniya)
            // (v_ang is higher at perigee, lower at apogee based on Kepler's 2nd Law)
            let speedMultiplierFactor = 1.0;
            if (sat.eccentricity > 0.01) {
              const currentNuRad = (prev[sat.id] || 0) * Math.PI / 180;
              // Keplerian Speed ratio: (1 + e*cos(nu))^2 / (1 - e^2)^1.5
              speedMultiplierFactor = Math.pow(1 + sat.eccentricity * Math.cos(currentNuRad), 2) / 
                                      Math.pow(1 - sat.eccentricity * sat.eccentricity, 1.5);
            }

            // Increment anomaly
            const deltaAnomaly = meanRate * dt * timeMultiplier * speedMultiplierFactor;
            next[sat.id] = ((prev[sat.id] || 0) + deltaAnomaly) % 360;
          });
          return next;
        });

        // Rotate Earth axial angle (e.g. 15 degrees/hour, sped up so it looks rotating)
        earthRotation = (earthRotation + dt * 2.0 * (timeMultiplier / 100)) % 360;
      }

      // 2. Setup Screen dimensions and variables
      const width = canvas.width;
      const height = canvas.height;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const scaleFactor = (Math.min(width, height) / 800) * zoom; // scale mapping miles/km to screen canvas pixels

      // Precalculate camera rotation matrices for fast math
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);

      // 3D projection helper function: projects ECI coords (X, Y, Z) to 2D Screen coords (x2d, y2d, depth)
      const project = (X: number, Y: number, Z: number) => {
        // Rotate around Celestial Z (Yaw / Azimuth)
        const x1 = X * cosY - Y * sinY;
        const y1 = X * sinY + Y * cosY;
        const z1 = Z;

        // Rotate around camera X (Pitch / Elevation)
        const x2 = x1;
        const y2 = y1 * cosP - z1 * sinP;
        const z2 = y1 * sinP + z1 * cosP; // z2 acts as screen depth (higher values are closer)

        // Project orthographically or mild perspective
        const screenX = centerX + x2 * scaleFactor;
        const screenY = centerY - z2 * scaleFactor; // flip Y for screen coordinates
        
        return { x: screenX, y: screenY, depth: y2 };
      };

      // 3. Draw Background Cosmic Starfield
      // Generates deterministic stars using sine seeds so they look fixed but rotate naturally with the camera
      ctx.fillStyle = '#ffffff';
      for (let sSec = 0; sSec < 60; sSec++) {
        const starYaw = Math.sin(sSec * 45.19) * Math.PI;
        const starPitch = Math.cos(sSec * 12.33) * (Math.PI / 2.2);
        
        // Convert polar star coordinate to ECI vector at huge virtual radius
        const starR = 50000; 
        const sX = starR * Math.cos(starPitch) * Math.cos(starYaw);
        const sY = starR * Math.cos(starPitch) * Math.sin(starYaw);
        const sZ = starR * Math.sin(starPitch);

        const star2d = project(sX, sY, sZ);
        // Draw only if in front of viewport or scattered nicely
        const size = (Math.sin(sSec * 2235.1) + 1.2) * 0.8 * dpr;
        const opacity = (Math.cos(sSec * 342.1) + 1) / 2 * 0.6 + 0.4;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(star2d.x, star2d.y, size, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw Depth Sorting:
      // We will sort Earth, Orbit Paths, and Satellites by their intermediate depth value (y2 on projection)
      // to render deep assets properly. For simple visualization, draw in logical stages grouped by depth.
      const earthProjected = project(0, 0, 0);

      // 4. Draw Equator grid lines (Z = 0 plane) in background/faint blue
      if (showEquatorPlane) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        for (let rEq = 5000; rEq <= 45000; rEq += 10000) {
          ctx.beginPath();
          for (let thEq = 0; thEq <= 360; thEq += 5) {
            const radEq = thEq * Math.PI / 180;
            const eqP = project(rEq * Math.cos(radEq), rEq * Math.sin(radEq), 0);
            if (thEq === 0) ctx.moveTo(eqP.x, eqP.y);
            else ctx.lineTo(eqP.x, eqP.y);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // 5. Draw Orbit Traces
      allSatellites.forEach(sat => {
        const isSelected = sat.id === selectedSatellite.id;
        if (!isSelected && !showAllOrbits) return;

        // Configuration
        ctx.lineWidth = isSelected ? 2.5 * dpr : 1.0 * dpr;
        ctx.strokeStyle = isSelected 
          ? sat.color 
          : 'rgba(150, 170, 190, 0.22)';
        
        ctx.beginPath();
        // Sample 150 points along the ellipse
        for (let thetaStep = 0; thetaStep <= 360; thetaStep += 2.4) {
          const orbitPt = getECIPosition(sat, thetaStep);
          // Get screen space coordinates
          const pt2d = project(orbitPt.x, orbitPt.y, orbitPt.z);
          
          if (thetaStep === 0) {
            ctx.moveTo(pt2d.x, pt2d.y);
          } else {
            ctx.lineTo(pt2d.x, pt2d.y);
          }
        }
        ctx.stroke();

        // Highlight Selected Orbit Special nodes: Perigee & Apogee
        if (isSelected) {
          // Perigee node (theta = 0)
          const periPt = getECIPosition(sat, 0);
          const peri2d = project(periPt.x, periPt.y, periPt.z);
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(peri2d.x, peri2d.y, 4 * dpr, 0, 2 * Math.PI);
          ctx.fill();
          ctx.font = `bold ${10 * dpr}px "JetBrains Mono", monospace`;
          ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
          ctx.fillText('近地點 (Perigee)', peri2d.x + 8, peri2d.y + 4);

          // Apogee node (theta = 180)
          const apoPt = getECIPosition(sat, 180);
          const apo2d = project(apoPt.x, apoPt.y, apoPt.z);
          ctx.fillStyle = '#e50914';
          ctx.beginPath();
          ctx.arc(apo2d.x, apo2d.y, 4 * dpr, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = 'rgba(229, 9, 20, 0.85)';
          ctx.fillText('遠地點 (Apogee)', apo2d.x + 8, apo2d.y + 4);
        }
      });

      // 6. Draw glowing 3D Earth Globe
      const earthRadiusPixels = EARTH_RADIUS * scaleFactor;
      
      // We clip outer globe to render detailed earth texture shadows or grid
      ctx.save();
      
      // Draw Earth glow shadow effect
      const earthGlow = ctx.createRadialGradient(
        earthProjected.x, earthProjected.y, earthRadiusPixels * 0.8,
        earthProjected.x, earthProjected.y, earthRadiusPixels * 1.05
      );
      earthGlow.addColorStop(0, 'rgba(10, 30, 80, 0.9)');
      earthGlow.addColorStop(0.6, 'rgba(20, 80, 180, 0.7)');
      earthGlow.addColorStop(0.9, 'rgba(0, 240, 255, 0.35)');
      earthGlow.addColorStop(1, 'rgba(0, 150, 255, 0)');
      
      // Base earth ocean filling
      ctx.fillStyle = 'rgba(6, 11, 26, 0.95)';
      ctx.beginPath();
      ctx.arc(earthProjected.x, earthProjected.y, earthRadiusPixels, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = earthGlow;
      ctx.beginPath();
      ctx.arc(earthProjected.x, earthProjected.y, earthRadiusPixels * 1.05, 0, 2 * Math.PI);
      ctx.fill();

      // Earth Wireframe lines (Longitude & Latitude meridians)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
      ctx.lineWidth = 0.5 * dpr;

      // Draw Latitudes 
      for (let latDeg = -75; latDeg <= 75; latDeg += 15) {
        const radLat = latDeg * Math.PI / 180;
        const zH = EARTH_RADIUS * Math.sin(radLat);
        const rLat = EARTH_RADIUS * Math.cos(radLat);
        
        ctx.beginPath();
        for (let rDeg = 0; rDeg <= 360; rDeg += 5) {
          const lRad = rDeg * Math.PI / 180;
          // Rotate on local y/x
          const xP = rLat * Math.cos(lRad);
          const yP = rLat * Math.sin(lRad);
          const pt3d = project(xP, yP, zH);
          
          // Verify if point is on the front side of Earth relative to camera depth orientation
          // Earth is at (0,0,0), any projected element with relative depth > earth's depth represents the front face
          if (rDeg === 0) ctx.moveTo(pt3d.x, pt3d.y);
          else ctx.lineTo(pt3d.x, pt3d.y);
        }
        ctx.stroke();
      }

      // Draw Longitudes spinning based on rotating Earth variables
      for (let lonDeg = 0; lonDeg < 360; lonDeg += 30) {
        const radLon = (lonDeg + earthRotation) * Math.PI / 180;
        ctx.beginPath();
        for (let latDeg = -90; latDeg <= 90; latDeg += 5) {
          const radLat = latDeg * Math.PI / 180;
          const xP = EARTH_RADIUS * Math.cos(radLat) * Math.cos(radLon);
          const yP = EARTH_RADIUS * Math.cos(radLat) * Math.sin(radLon);
          const zP = EARTH_RADIUS * Math.sin(radLat);
          const pt3d = project(xP, yP, zP);
          if (latDeg === -90) ctx.moveTo(pt3d.x, pt3d.y);
          else ctx.lineTo(pt3d.x, pt3d.y);
        }
        ctx.stroke();
      }

      // Restore earth clip
      ctx.restore();

      // 7. Draw The Active Satellites on top (layered based on basic depth projection)
      allSatellites.forEach(sat => {
        const isSelected = sat.id === selectedSatellite.id;
        if (!isSelected && !showAllOrbits) return;

        const currentAnomaly = anomalies[sat.id] || 0;
        const state = getECIPosition(sat, currentAnomaly);
        const sat2d = project(state.x, state.y, state.z);

        // Standard Depth Culling:
        // If satellite is perfectly behind earth sphere, make it translucent or hidden.
        // Screen distance to Earth center:
        const distFromEarthCenter = Math.sqrt(Math.pow(state.x, 2) + Math.pow(state.y, 2) + Math.pow(state.z, 2));
        const isBehindEarth = sat2d.depth < 0 && (Math.pow(sat2d.x - earthProjected.x, 2) + Math.pow(sat2d.y - earthProjected.y, 2) < Math.pow(earthRadiusPixels, 2));

        if (isBehindEarth) {
          ctx.globalAlpha = 0.25; // make satellite transparent behind Earth
        }

        // Animated neon core
        ctx.fillStyle = sat.color;
        ctx.beginPath();
        ctx.arc(sat2d.x, sat2d.y, (isSelected ? 6 : 4) * dpr, 0, 2 * Math.PI);
        ctx.fill();

        // Pulsing radar ripple around selected outer ring
        if (isSelected) {
          const pulseRadius = (6 + Math.sin(timeNow * 0.008) * 8) * dpr;
          ctx.strokeStyle = sat.color;
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath();
          ctx.arc(sat2d.x, sat2d.y, pulseRadius, 0, 2 * Math.PI);
          ctx.stroke();

          // Subdued dashboard text tag label
          ctx.font = `bold ${11 * dpr}px "Inter", sans-serif`;
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.shadowColor = sat.color;
          ctx.fillText(sat.name.split(' (')[0], sat2d.x + 12, sat2d.y - 6);
          ctx.shadowBlur = 0; // reset shadow

          // Trace Altitude (faint vertical altitude line connecting earth surface to satellite)
          const normDirection = { x: state.x / state.distance, y: state.y / state.distance, z: state.z / state.distance };
          const earthIntersect = { x: normDirection.x * EARTH_RADIUS, y: normDirection.y * EARTH_RADIUS, z: normDirection.z * EARTH_RADIUS };
          const int2d = project(earthIntersect.x, earthIntersect.y, earthIntersect.z);

          // Draw dotted link line
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 1 * dpr;
          ctx.setLineDash([2 * dpr, 3 * dpr]);
          ctx.beginPath();
          ctx.moveTo(int2d.x, int2d.y);
          ctx.lineTo(sat2d.x, sat2d.y);
          ctx.stroke();
          ctx.setLineDash([]); // reset line dash
        } else {
          // Unselected satellite text labels showing simplified mini-tag 
          ctx.font = `${9 * dpr}px "Inter", sans-serif`;
          ctx.fillStyle = 'rgba(200, 220, 255, 0.45)';
          ctx.fillText(sat.name.split(' (')[0], sat2d.x + 8, sat2d.y + 12);
        }

        ctx.globalAlpha = 1.0; // reset alpha
      });

      // Request next frame
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [selectedSatellite, allSatellites, pitch, yaw, zoom, isPlaying, timeMultiplier, showAllOrbits, showEquatorPlane, anomalies]);

  // Extract selected satellite's dynamic telemetry equations
  const currentAnomaly = anomalies[selectedSatellite.id] || 0;
  const a = selectedSatellite.semiMajorAxis;
  const e = selectedSatellite.eccentricity;
  const iRad = selectedSatellite.inclination * Math.PI / 180;
  
  // Dynamic Distance r = a(1-e^2)/(1+e*cos(nu))
  const currentNuRad = currentAnomaly * Math.PI / 180;
  const distanceR = (a * (1 - e * e)) / (1 + e * Math.cos(currentNuRad));
  const dynamicAltitude = distanceR - EARTH_RADIUS;

  // Orbit Speed v = sqrt(mu * (2/r - 1/a))
  const dynamicSpeed = Math.sqrt(MU * (2 / distanceR - 1 / a));

  // Period T = 2 * pi * sqrt(a^3 / mu)
  const orbitPeriodMinutes = (2 * Math.PI * Math.sqrt(Math.pow(a, 3) / MU)) / 60;

  return (
    <div className="relative flex flex-col h-full bg-[#0a0b10] border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-cyan-950/20" id="orbit-simulator-container">
      {/* Simulation Controls Top Frame */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md z-10" id="sim-control-top">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <h3 className="font-sans font-medium text-xs text-slate-300 uppercase tracking-widest flex items-center gap-1">
            <Orbit className="w-3.5 h-3.5 text-[#00f0ff]" />
            3D 互動式軌道模擬儀
          </h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Play / Pause button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            id="play-pause-btn"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
              isPlaying 
                ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 hover:bg-[#00f0ff]/20' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> 暫停運行
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> 啟動追蹤
              </>
            )}
          </button>

          {/* Time speed multipliers */}
          <div className="flex items-center px-1 py-0.5 bg-slate-950 border border-slate-800 rounded-md" id="speed-controls">
            <span className="text-[10px] text-slate-500 px-2 font-mono uppercase">時間模擬</span>
            {[10, 100, 300, 800].map(mult => (
              <button
                key={mult}
                onClick={() => setTimeMultiplier(mult)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition ${
                  timeMultiplier === mult 
                    ? 'bg-[#00f0ff]/15 text-[#00f0ff] font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mult}x
              </button>
            ))}
          </div>

          {/* View Toggle options */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-md p-0.5" id="orbit-toggles">
            <button
              onClick={() => setShowAllOrbits(!showAllOrbits)}
              title={showAllOrbits ? "隱藏其他衛星軌道" : "顯示所有衛星軌道"}
              className={`p-1.5 rounded transition ${showAllOrbits ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {showAllOrbits ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setShowEquatorPlane(!showEquatorPlane)}
              title={showEquatorPlane ? "隱藏赤道參考面" : "顯示赤道參考面"}
              className={`p-1.5 rounded text-[10px] font-mono transition ${showEquatorPlane ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              赤道面
            </button>
          </div>

          {/* Reset Camera angle */}
          <button
            onClick={handleResetCamera}
            title="重設相機視角"
            id="reset-cam-btn"
            className="p-1.5 bg-slate-800 border border-slate-700/50 rounded-md text-slate-300 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Stage Wrapper */}
      <div 
        ref={containerRef}
        className="relative flex-1 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleWheel}
        id="canvas-stage"
      >
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* Real-time calculated Kepler telemetries (Fading Float Box) */}
        <div 
          className="absolute left-4 bottom-4 p-4 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800/80 pointer-events-none shadow-xl max-w-[280px]"
          id="realtime-math-hud"
        >
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>即時飛行遙測數據</span>
            <span>AUTO-CALC</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
              <span className="text-[11px] text-slate-400 font-sans">目前軌道高度：</span>
              <span className="font-mono text-xs text-[#00f0ff] font-semibold">{dynamicAltitude.toLocaleString(undefined, { maximumFractionDigits: 1 })} km</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-[11px] text-slate-400 font-sans">瞬時向心初速：</span>
              <span className="font-mono text-xs text-emerald-400 font-semibold">{dynamicSpeed.toFixed(3)} km/s</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-[11px] text-slate-400 font-sans">精算軌道週期：</span>
              <span className="font-mono text-xs text-indigo-300 font-semibold">{orbitPeriodMinutes.toFixed(1)} 分鐘</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-[11px] text-slate-400 font-sans">真近點角 (ν)：</span>
              <span className="font-mono text-xs text-amber-400 font-semibold">{currentAnomaly.toFixed(1)}°</span>
            </div>
          </div>
        </div>

        {/* View Instructions Info Overlay */}
        <div className="absolute right-4 bottom-4 flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-950/70 p-2 rounded border border-slate-800/40 pointer-events-none">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>滑鼠拖曳旋轉 3D / 滾輪放大縮小</span>
        </div>
      </div>
    </div>
  );
}
