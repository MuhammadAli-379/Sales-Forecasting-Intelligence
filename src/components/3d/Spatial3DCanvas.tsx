import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Camera,
  Compass,
  Expand,
  Eye,
  Info,
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { ProcessedSalesProject } from '../../types';
import { formatCompactCurrency, formatCurrency } from '../../utils/timeSeriesEngine';

export type SpatialViewMode = 'ribbon' | 'surface' | 'particles' | 'prism';
export type CameraPreset = 'isometric' | 'aerial' | 'cockpit' | 'frontal';

interface ScenarioParams {
  p: number;
  d: number;
  q: number;
  horizon: number; // 6, 12, 18, 24
  confidenceLevel: number; // 0.80, 0.90, 0.95, 0.99
}

interface Spatial3DCanvasProps {
  project: ProcessedSalesProject;
  height?: number;
  interactive?: boolean;
  onSelectMonth?: (monthIndex: number) => void;
  selectedMonthIndex?: number | null;
  onDataSound?: (normalizedVal: number) => void;
  soundEnabled?: boolean;
  scenarioConfig?: ScenarioParams;
}

export const Spatial3DCanvas: React.FC<Spatial3DCanvasProps> = ({
  project,
  height = 460,
  interactive = true,
  onSelectMonth,
  selectedMonthIndex = null,
  onDataSound,
  soundEnabled = false,
  scenarioConfig,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [viewMode, setViewMode] = useState<SpatialViewMode>('ribbon');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    sales: number;
    isForecast: boolean;
    screenX: number;
    screenY: number;
    lowerCI?: number;
    upperCI?: number;
  } | null>(null);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number; dist: number }>({ x: 0, y: 0, dist: 0 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 5, 0));
  const activeMeshGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseCoordsRef = useRef(new THREE.Vector2(-10, -10));
  const pointMeshesRef = useRef<{ mesh: THREE.Mesh; data: any; index: number }[]>([]);
  const timelineProgressRef = useRef(0);
  const isTimelinePlayingRef = useRef(false);

  const { monthlyData, futureForecast } = project;

  // Active scenario tuning
  const horizon = scenarioConfig?.horizon ?? 12;
  const zScore = scenarioConfig?.confidenceLevel === 0.99 ? 2.576 : scenarioConfig?.confidenceLevel === 0.90 ? 1.645 : scenarioConfig?.confidenceLevel === 0.80 ? 1.282 : 1.96;

  // Camera preset positions
  const getCameraPos = (preset: CameraPreset): THREE.Vector3 => {
    switch (preset) {
      case 'isometric':
        return new THREE.Vector3(26, 22, 28);
      case 'aerial':
        return new THREE.Vector3(0, 44, 8);
      case 'cockpit':
        return new THREE.Vector3(-22, 10, 18);
      case 'frontal':
        return new THREE.Vector3(0, 14, 40);
    }
  };

  useEffect(() => {
    isTimelinePlayingRef.current = isPlayingTimeline;
  }, [isPlayingTimeline]);

  // 1. Initial Scene Setup
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const canvasHeight = isFullscreen ? window.innerHeight - 100 : height;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07111f);
    scene.fog = new THREE.FogExp2(0x07111f, 0.015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / canvasHeight, 0.1, 250);
    const initialPos = getCameraPos(cameraPreset);
    camera.position.copy(initialPos);
    camera.lookAt(cameraTargetRef.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // Advanced Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(24, 34, 24);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x818cf8, 2.0, 90);
    rimLight.position.set(-28, 18, -18);
    scene.add(rimLight);

    const groundGlow = new THREE.PointLight(0x06b6d4, 1.0, 70);
    groundGlow.position.set(0, -1, 0);
    scene.add(groundGlow);

    const accentLight = new THREE.PointLight(0xec4899, 0.9, 60);
    accentLight.position.set(20, 10, -10);
    scene.add(accentLight);

    // Volumetric Grid Base Plane
    const grid = new THREE.GridHelper(70, 35, 0x2563eb, 0x0f172a);
    grid.position.y = -0.05;
    scene.add(grid);

    // Floating Atmospheric Particle Field
    const particleCount = 240;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 70;
      particlePositions[i + 1] = Math.random() * 28;
      particlePositions[i + 2] = (Math.random() - 0.5) * 70;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.32,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const starfield = new THREE.Points(particleGeo, particleMat);
    scene.add(starfield);

    // Animation & Render Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Atmospheric starfield motion
      starfield.rotation.y = elapsed * 0.015;

      // Timeline playback interpolation
      if (isTimelinePlayingRef.current && activeMeshGroupRef.current) {
        timelineProgressRef.current = (timelineProgressRef.current + delta * 0.15) % 1;
        const total = monthlyData.length + horizon;
        const currIndex = Math.min(total - 1, Math.floor(timelineProgressRef.current * total));
        setTimelineIndex(currIndex);

        if (onDataSound && soundEnabled) {
          const norm = (currIndex / total);
          onDataSound(norm);
        }
      }

      // Smooth camera interpolation towards preset
      if (!isDraggingRef.current && !isTimelinePlayingRef.current) {
        const targetPos = getCameraPos(cameraPreset);
        camera.position.lerp(targetPos, 0.04);
        camera.lookAt(cameraTargetRef.current);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = isFullscreen ? window.innerHeight - 100 : height;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [height, isFullscreen]);

  // 2. Rebuild 3D Spline Geometry with Physical Shading
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (activeMeshGroupRef.current) {
      scene.remove(activeMeshGroupRef.current);
      activeMeshGroupRef.current.traverse((obj) => {
        if ((obj as any).geometry) (obj as any).geometry.dispose();
        if ((obj as any).material) {
          if (Array.isArray((obj as any).material)) {
            (obj as any).material.forEach((m: any) => m.dispose());
          } else {
            (obj as any).material.dispose();
          }
        }
      });
    }

    const group = new THREE.Group();
    activeMeshGroupRef.current = group;
    pointMeshesRef.current = [];

    // Slice forecast based on scenario horizon
    const effectiveForecast = futureForecast.records.slice(0, horizon);

    const allSales = monthlyData.map((m) => m.sales);
    const maxSales = Math.max(...allSales, ...effectiveForecast.map((r) => r.upper95CI));
    const minSales = Math.min(...allSales);
    const heightScale = 14;

    const getY = (val: number) => ((val - minSales) / (maxSales - minSales || 1)) * heightScale + 0.6;

    const totalPoints = monthlyData.length + effectiveForecast.length;
    const curvePoints: THREE.Vector3[] = [];
    const lowerCiPoints: THREE.Vector3[] = [];
    const upperCiPoints: THREE.Vector3[] = [];

    // Historical Points
    monthlyData.forEach((m, idx) => {
      const x = -22 + (idx / (totalPoints - 1)) * 44;
      const y = getY(m.sales);
      const z = Math.sin(((m.monthNumber - 1) / 12) * Math.PI * 2) * 5;
      const pt = new THREE.Vector3(x, y, z);
      curvePoints.push(pt);

      // Interactive node sphere for raycasting
      const nodeGeo = new THREE.SphereGeometry(0.3, 12, 12);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.65,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pt);
      group.add(nodeMesh);

      pointMeshesRef.current.push({
        mesh: nodeMesh,
        index: idx,
        data: {
          label: m.monthLabel,
          sales: m.sales,
          isForecast: false,
        },
      });
    });

    const splitX = curvePoints[curvePoints.length - 1].x;

    // Forecast Points with Dynamic CI scaling
    effectiveForecast.forEach((f, idx) => {
      const totalIdx = monthlyData.length + idx;
      const x = -22 + (totalIdx / (totalPoints - 1)) * 44;
      const y = getY(f.forecastSales);
      const monthNum = parseInt(f.monthStr.slice(5, 7), 10);
      const z = Math.sin(((monthNum - 1) / 12) * Math.PI * 2) * 5;
      const pt = new THREE.Vector3(x, y, z);

      curvePoints.push(pt);

      // Scaled CI based on zScore
      const ciDelta = (f.upper95CI - f.forecastSales) * (zScore / 1.96);
      const scaledLower = Math.max(0, f.forecastSales - ciDelta);
      const scaledUpper = f.forecastSales + ciDelta;

      lowerCiPoints.push(new THREE.Vector3(x, getY(scaledLower), z));
      upperCiPoints.push(new THREE.Vector3(x, getY(scaledUpper), z));

      const nodeGeo = new THREE.SphereGeometry(0.32, 12, 12);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        transparent: true,
        opacity: 0.75,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pt);
      group.add(nodeMesh);

      pointMeshesRef.current.push({
        mesh: nodeMesh,
        index: totalIdx,
        data: {
          label: f.monthLabel,
          sales: f.forecastSales,
          isForecast: true,
          lowerCI: scaledLower,
          upperCI: scaledUpper,
        },
      });
    });

    // 1. Spline Curve and Volumetric Tube Ribbon
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 140, 0.48, 14, false);

    // Physically-based material with high metallic sheen
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.9,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    group.add(tubeMesh);

    // 2. Train / Test Split Boundary Ring
    const splitRingGeo = new THREE.TorusGeometry(3.6, 0.09, 16, 60);
    const splitRingMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.75,
    });
    const splitRing = new THREE.Mesh(splitRingGeo, splitRingMat);
    splitRing.position.set(splitX, 6, 0);
    splitRing.rotation.y = Math.PI / 2;
    group.add(splitRing);

    // 3. Peak Month Glowing Beacon
    const peakFuture = futureForecast.highestMonth;
    const peakIdx = effectiveForecast.findIndex((r) => r.monthStr === peakFuture.monthStr);
    if (peakIdx >= 0) {
      const ptIdx = monthlyData.length + peakIdx;
      const peakPos = curvePoints[ptIdx];
      const beaconGeo = new THREE.SphereGeometry(0.75, 24, 24);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.95,
        roughness: 0.2,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.copy(peakPos);
      group.add(beacon);

      const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 20, 8);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.45 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(peakPos.x, peakPos.y + 10, peakPos.z);
      group.add(beam);
    }

    // 4. View Mode Variations
    if (viewMode === 'prism' && lowerCiPoints.length > 0) {
      // Confidence interval semi-transparent glass prism
      const prismGeo = new THREE.BufferGeometry();
      const vertices: number[] = [];
      for (let i = 0; i < lowerCiPoints.length - 1; i++) {
        const l1 = lowerCiPoints[i];
        const l2 = lowerCiPoints[i + 1];
        const u1 = upperCiPoints[i];
        const u2 = upperCiPoints[i + 1];

        vertices.push(l1.x, l1.y, l1.z, u1.x, u1.y, u1.z, l2.x, l2.y, l2.z);
        vertices.push(u1.x, u1.y, u1.z, u2.x, u2.y, u2.z, l2.x, l2.y, l2.z);
      }
      prismGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      prismGeo.computeVertexNormals();
      const prismMat = new THREE.MeshPhysicalMaterial({
        color: 0xf43f5e,
        transparent: true,
        opacity: 0.24,
        roughness: 0.1,
        transmission: 0.7,
        side: THREE.DoubleSide,
      });
      const prismMesh = new THREE.Mesh(prismGeo, prismMat);
      group.add(prismMesh);
    } else if (viewMode === 'particles') {
      // 3D Matrix of vertical glowing data pillars
      curvePoints.forEach((pt, i) => {
        const isFcast = i >= monthlyData.length;
        const pillarGeo = new THREE.CylinderGeometry(0.18, 0.18, pt.y, 12);
        const pillarMat = new THREE.MeshStandardMaterial({
          color: isFcast ? 0xf43f5e : 0x38bdf8,
          emissive: isFcast ? 0x9f1239 : 0x0369a1,
          emissiveIntensity: 0.6,
          metalness: 0.5,
        });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(pt.x, pt.y / 2, pt.z);
        group.add(pillar);
      });
    }

    scene.add(group);
  }, [viewMode, monthlyData, futureForecast, horizon, zScore]);

  // Raycasting for interactive hover tooltip
  const handlePointerMove = (e: React.MouseEvent | React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current || isDraggingRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    mouseCoordsRef.current.set(x, y);
    raycasterRef.current.setFromCamera(mouseCoordsRef.current, cameraRef.current);

    const meshes = pointMeshesRef.current.map((p) => p.mesh);
    const intersects = raycasterRef.current.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const found = pointMeshesRef.current.find((p) => p.mesh === hit.object);
      if (found) {
        setHoveredPoint({
          ...found.data,
          screenX: e.clientX - rect.left,
          screenY: e.clientY - rect.top,
        });

        if (onDataSound && soundEnabled) {
          const norm = found.data.sales / Math.max(...monthlyData.map((m) => m.sales));
          onDataSound(norm);
        }
      }
    } else {
      setHoveredPoint(null);
    }
  };

  // Mouse Drag / Orbit Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handlePointerMove(e);
    if (!isDraggingRef.current || !cameraRef.current) return;
    const deltaX = (e.clientX - prevMouseRef.current.x) * 0.008;
    const deltaY = (e.clientY - prevMouseRef.current.y) * 0.008;

    const camera = cameraRef.current;
    const offset = camera.position.clone().sub(cameraTargetRef.current);
    const radius = offset.length();

    let theta = Math.atan2(offset.x, offset.z) - deltaX;
    let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius))) - deltaY;
    phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi));

    offset.x = radius * Math.sin(phi) * Math.sin(theta);
    offset.y = radius * Math.cos(phi);
    offset.z = radius * Math.sin(phi) * Math.cos(theta);

    camera.position.copy(cameraTargetRef.current).add(offset);
    camera.lookAt(cameraTargetRef.current);

    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch Support for Mobile / Tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current.dist = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDraggingRef.current && cameraRef.current) {
      const deltaX = (e.touches[0].clientX - prevMouseRef.current.x) * 0.008;
      const deltaY = (e.touches[0].clientY - prevMouseRef.current.y) * 0.008;

      const camera = cameraRef.current;
      const offset = camera.position.clone().sub(cameraTargetRef.current);
      const radius = offset.length();

      let theta = Math.atan2(offset.x, offset.z) - deltaX;
      let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius))) - deltaY;
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi));

      offset.x = radius * Math.sin(phi) * Math.sin(theta);
      offset.y = radius * Math.cos(phi);
      offset.z = radius * Math.sin(phi) * Math.cos(theta);

      camera.position.copy(cameraTargetRef.current).add(offset);
      camera.lookAt(cameraTargetRef.current);

      prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    e.preventDefault();
    const camera = cameraRef.current;
    const offset = camera.position.clone().sub(cameraTargetRef.current);
    const zoomFactor = e.deltaY > 0 ? 1.05 : 0.95;
    if (offset.length() * zoomFactor > 10 && offset.length() * zoomFactor < 85) {
      offset.multiplyScalar(zoomFactor);
      camera.position.copy(cameraTargetRef.current).add(offset);
      camera.lookAt(cameraTargetRef.current);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl border border-[#CBD5E1] bg-[#0A1120] shadow-lg select-none transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : ''
      }`}
      style={{ height: isFullscreen ? undefined : height }}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Interactive 3D Raycasting Tooltip */}
      {hoveredPoint && (
        <div
          className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 rounded-xl border border-[#CBD5E1] bg-white/95 p-3 shadow-xl backdrop-blur-md text-xs font-mono"
          style={{
            left: Math.max(80, Math.min(hoveredPoint.screenX, (containerRef.current?.clientWidth || 400) - 80)),
            top: Math.max(70, hoveredPoint.screenY),
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-1.5 mb-1.5">
            <span className="font-bold text-[#0F172A] text-[13px]">{hoveredPoint.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                hoveredPoint.isForecast
                  ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                  : 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
              }`}
            >
              {hoveredPoint.isForecast ? 'ARIMA Projection' : 'Historical Actual'}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4 text-[#475569]">
              <span className="text-[#64748B]">Sales Value:</span>
              <span className="font-bold text-[#2563EB]">{formatCurrency(hoveredPoint.sales)}</span>
            </div>
            {hoveredPoint.lowerCI !== undefined && (
              <div className="flex justify-between gap-4 text-[10px] text-[#64748B]">
                <span>Confidence Range:</span>
                <span className="font-mono text-[#0F172A] font-medium">
                  {formatCompactCurrency(hoveredPoint.lowerCI)} – {formatCompactCurrency(hoveredPoint.upperCI || 0)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Floating HUD: Title & View Modes */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white/95 p-2 px-3 shadow-md backdrop-blur-md">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] tracking-tight">3D Spatial Time-Series Hologram</h3>
            <p className="text-[10px] text-[#64748B] font-mono">
              ARIMA({scenarioConfig?.p ?? project.selectedModelOrder[0]},{scenarioConfig?.d ?? project.selectedModelOrder[1]},{scenarioConfig?.q ?? project.selectedModelOrder[2]}) Volumetric Spline · {horizon}M Horizon
            </p>
          </div>
        </div>

        {/* View Mode Segmented Tabs & Fullscreen Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-[#E2E8F0] bg-white/95 p-1 shadow-md backdrop-blur-md text-xs font-mono">
            {(['ribbon', 'prism', 'particles'] as SpatialViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl border border-[#E2E8F0] bg-white/95 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] shadow-md backdrop-blur-md transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand 3D Spatial Canvas'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating HUD: Timeline Flythrough Controls & Camera Presets */}
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
        {/* Playback & Scrub Controls */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-md text-xs font-mono">
          <button
            onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold transition-colors shadow-xs"
          >
            {isPlayingTimeline ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span className="text-[11px]">{isPlayingTimeline ? 'Pause' : 'Flythrough'}</span>
          </button>

          <span className="text-[#CBD5E1] text-[10px]">|</span>

          {/* Camera Angle Presets */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#64748B] px-1 font-sans">Camera:</span>
            {(['isometric', 'aerial', 'cockpit', 'frontal'] as CameraPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => setCameraPreset(preset)}
                className={`px-2 py-0.5 rounded capitalize transition-colors text-[11px] ${
                  cameraPreset === preset
                    ? 'bg-[#0F172A] text-white font-medium'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Legend & Interaction Hint */}
        <div className="pointer-events-auto flex items-center gap-4 rounded-xl border border-[#E2E8F0] bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-md text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-[#2563EB] font-medium">
            <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
            <span>Actual Sales</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#0284C7] font-medium">
            <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
            <span>Forecast Horizon</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#16A34A] font-medium hidden sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
            <span>Peak Beacon ({futureForecast.highestMonth.monthLabel})</span>
          </div>
          <span className="text-[#64748B] text-[10px] hidden md:inline">· Drag / Touch Orbit · Hover Points</span>
        </div>
      </div>
    </div>
  );
};

