import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { 
  X, 
  Rotate3d, 
  Sun, 
  Sparkles, 
  Layers, 
  Camera, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle,
  Eye,
  Info
} from 'lucide-react';
import { NURSERY_PHONE } from '../utils/whatsapp';

interface PlantStudio3DProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlantName?: string;
}

type PlantType = 'mango' | 'adenium' | 'areca';
type PotFinish = 'terracotta' | 'ceramic' | 'stone' | 'bronze';
type LightPreset = 'morning' | 'noon' | 'golden';

export const PlantStudio3D: React.FC<PlantStudio3DProps> = ({
  isOpen,
  onClose,
  initialPlantName = 'Banganapalli Grafted Mango',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPlant, setSelectedPlant] = useState<PlantType>('mango');
  const [selectedPot, setSelectedPot] = useState<PotFinish>('terracotta');
  const [selectedLight, setSelectedLight] = useState<LightPreset>('morning');
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [growthStage, setGrowthStage] = useState<number>(2); // 1 = young sapling, 2 = ready for farm, 3 = established

  // Mutable refs for Three.js instance
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const plantGroupRef = useRef<THREE.Group | null>(null);
  const potMeshRef = useRef<THREE.Mesh | null>(null);
  const potRimRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    let frameId = 0;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Detect software WebGL safely
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131a15);
    scene.fog = new THREE.FogExp2(0x131a15, 0.045);
    sceneRef.current = scene;

    // Procedural Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Camera & Damped Controls
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.8, 3.8);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.9, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 6.5;
    controlsRef.current = controls;

    // 5. Lighting Rig (Key, Fill, Rim)
    const keyLight = new THREE.DirectionalLight(0xfff3db, 2.8);
    keyLight.position.set(3, 5, 2.5);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 15;
      keyLight.shadow.camera.left = -2;
      keyLight.shadow.camera.right = 2;
      keyLight.shadow.camera.top = 2;
      keyLight.shadow.camera.bottom = -2;
    }
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const hemiLight = new THREE.HemisphereLight(0x406e53, 0x1a211b, 1.2);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const rimLight = new THREE.DirectionalLight(0x86efac, 1.0);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    // 6. Ground Studio Pedestal & Contact Shadow Plane
    const groundGeo = new THREE.CylinderGeometry(2.5, 2.8, 0.2, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1f2923,
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.1;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // Procedural Radial Contact Shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.6),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.85,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.005;
    scene.add(shadowPlane);

    // 7. Procedural Plant Assembly Group
    const plantGroup = new THREE.Group();
    scene.add(plantGroup);
    plantGroupRef.current = plantGroup;

    // Render loop
    const clock = new THREE.Clock();
    function tick() {
      const delta = clock.getDelta();
      controls.update();

      // Gentle organic ambient foliage movement
      if (plantGroupRef.current) {
        plantGroupRef.current.rotation.y += delta * 0.08;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }
    tick();

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isOpen]);

  // Re-build 3D Plant Model whenever selected plant, pot finish, or growth stage changes
  useEffect(() => {
    const scene = sceneRef.current;
    const plantGroup = plantGroupRef.current;
    if (!scene || !plantGroup) return;

    // Clear previous plant children
    while (plantGroup.children.length > 0) {
      const obj = plantGroup.children[0];
      plantGroup.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }

    // --- Part 1: Procedural Pot & Soil (Composite Parts 1, 2, 3) ---
    // Get Pot Material based on selected finish
    const potColor =
      selectedPot === 'terracotta'
        ? 0xb45309
        : selectedPot === 'ceramic'
        ? 0xf8fafc
        : selectedPot === 'stone'
        ? 0x475569
        : 0x78350f;
    const potRoughness =
      selectedPot === 'ceramic' ? 0.15 : selectedPot === 'stone' ? 0.9 : selectedPot === 'bronze' ? 0.25 : 0.75;
    const potMetalness = selectedPot === 'bronze' ? 0.8 : selectedPot === 'ceramic' ? 0.1 : 0.05;

    // Pot Body (Part 1)
    const potGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.5, 32);
    const potMat = new THREE.MeshStandardMaterial({
      color: potColor,
      roughness: potRoughness,
      metalness: potMetalness,
    });
    const potMesh = new THREE.Mesh(potGeo, potMat);
    potMesh.position.y = 0.25;
    potMesh.castShadow = true;
    potMesh.receiveShadow = true;
    plantGroup.add(potMesh);
    potMeshRef.current = potMesh;

    // Pot Lip / Upper Rim (Part 2)
    const rimGeo = new THREE.TorusGeometry(0.35, 0.03, 16, 32);
    const rimMesh = new THREE.Mesh(rimGeo, potMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.5;
    rimMesh.castShadow = true;
    plantGroup.add(rimMesh);
    potRimRef.current = rimMesh;

    // Soil Bed (Part 3)
    const soilGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.04, 24);
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x271c19, // Rich organic loamy dark soil
      roughness: 0.95,
      metalness: 0.0,
    });
    const soilMesh = new THREE.Mesh(soilGeo, soilMat);
    soilMesh.position.y = 0.48;
    plantGroup.add(soilMesh);

    const scale = growthStage === 1 ? 0.75 : growthStage === 2 ? 1.0 : 1.25;

    // --- Build Selected Species ---
    if (selectedPlant === 'mango') {
      // Banganapalli Mango Sapling:
      // Part 4: Rootstock base trunk
      const trunkMat = new THREE.MeshStandardMaterial({
        color: 0x4a3728,
        roughness: 0.88,
        metalness: 0.02,
      });
      const trunkGeo = new THREE.CylinderGeometry(0.04 * scale, 0.05 * scale, 0.5 * scale, 16);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.5 + 0.25 * scale;
      trunk.castShadow = true;
      plantGroup.add(trunk);

      // Part 5: Graft Union Knot (Authentic local nursery graft)
      const graftKnotGeo = new THREE.SphereGeometry(0.065 * scale, 12, 12);
      const graftMat = new THREE.MeshStandardMaterial({
        color: 0x3d2b1f,
        roughness: 0.9,
      });
      const graftKnot = new THREE.Mesh(graftKnotGeo, graftMat);
      graftKnot.position.y = 0.5 + 0.3 * scale;
      graftKnot.scale.set(1.2, 0.8, 1.1);
      graftKnot.castShadow = true;
      plantGroup.add(graftKnot);

      // Part 6: Scion Branching (3 primary limbs)
      const branchMat = new THREE.MeshStandardMaterial({
        color: 0x3d5032,
        roughness: 0.7,
      });
      const angles = [0, 2.1, 4.2];
      angles.forEach((ang, i) => {
        const branchGeo = new THREE.CylinderGeometry(0.025 * scale, 0.035 * scale, 0.45 * scale, 12);
        const branch = new THREE.Mesh(branchGeo, branchMat);
        branch.position.set(
          Math.sin(ang) * 0.08 * scale,
          0.5 + 0.48 * scale,
          Math.cos(ang) * 0.08 * scale
        );
        branch.rotation.z = Math.sin(ang) * 0.35;
        branch.rotation.x = Math.cos(ang) * 0.35;
        branch.castShadow = true;
        plantGroup.add(branch);

        // Part 7, 8, 9: Mango Leaf Foliage Clusters
        const leafMat = new THREE.MeshStandardMaterial({
          color: i === 0 ? 0x226b38 : i === 1 ? 0x1b5e20 : 0x2e7d32,
          roughness: 0.4,
          metalness: 0.05,
        });

        // Sub-cluster of elongated elliptical leaves
        for (let l = 0; l < 5; l++) {
          const leafGeo = new THREE.ConeGeometry(0.08 * scale, 0.28 * scale, 6);
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          const leafAng = (l * Math.PI * 2) / 5;
          leaf.position.set(
            branch.position.x + Math.sin(leafAng) * 0.14 * scale,
            branch.position.y + 0.2 * scale,
            branch.position.z + Math.cos(leafAng) * 0.14 * scale
          );
          leaf.rotation.x = Math.cos(leafAng) * 0.6 + Math.PI / 2;
          leaf.rotation.z = Math.sin(leafAng) * 0.6;
          leaf.castShadow = true;
          plantGroup.add(leaf);
        }
      });

      // Part 10: Tender young copper-red top flush leaves (Signature Banganapalli trait)
      const copperLeafMat = new THREE.MeshStandardMaterial({
        color: 0x853b26, // Coppery maroon young leaves
        roughness: 0.35,
      });
      const topLeafGeo = new THREE.ConeGeometry(0.06 * scale, 0.22 * scale, 5);
      const topLeaf = new THREE.Mesh(topLeafGeo, copperLeafMat);
      topLeaf.position.set(0, 0.5 + 0.85 * scale, 0);
      topLeaf.rotation.x = 0.2;
      plantGroup.add(topLeaf);

    } else if (selectedPlant === 'adenium') {
      // Adenium Desert Rose Bonsai:
      // Part 4: Swollen Caudex Base (Sculptural bulbous trunk)
      const caudexGeo = new THREE.SphereGeometry(0.22 * scale, 24, 20);
      const caudexMat = new THREE.MeshStandardMaterial({
        color: 0x5a483a,
        roughness: 0.9,
        metalness: 0.05,
      });
      const caudex = new THREE.Mesh(caudexGeo, caudexMat);
      caudex.position.y = 0.5 + 0.16 * scale;
      caudex.scale.set(1.1, 0.9, 1.2);
      caudex.castShadow = true;
      plantGroup.add(caudex);

      // Part 5 & 6: Twisted Stems
      const stemMat = new THREE.MeshStandardMaterial({
        color: 0x47553b,
        roughness: 0.8,
      });
      [
        { x: -0.08, z: 0.05, rotZ: 0.25 },
        { x: 0.09, z: -0.06, rotZ: -0.25 },
        { x: 0.0, z: 0.1, rotX: -0.2 },
      ].forEach((s) => {
        const stemGeo = new THREE.CylinderGeometry(0.035 * scale, 0.06 * scale, 0.35 * scale, 12);
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.set(s.x * scale, 0.5 + 0.35 * scale, s.z * scale);
        stem.rotation.z = s.rotZ || 0;
        stem.rotation.x = s.rotX || 0;
        stem.castShadow = true;
        plantGroup.add(stem);

        // Part 7: Glossy fleshy leaves rosette
        const adeniumLeafMat = new THREE.MeshStandardMaterial({
          color: 0x1b4332,
          roughness: 0.3,
        });
        const rosetteGeo = new THREE.DodecahedronGeometry(0.09 * scale, 0);
        const rosette = new THREE.Mesh(rosetteGeo, adeniumLeafMat);
        rosette.position.set(stem.position.x, stem.position.y + 0.18 * scale, stem.position.z);
        plantGroup.add(rosette);

        // Part 8 & 9: Radiant Pink Trumpet Blooms
        const flowerMat = new THREE.MeshStandardMaterial({
          color: 0xec4899, // Bright desert pink
          roughness: 0.4,
          metalness: 0.05,
        });
        const flowerGeo = new THREE.ConeGeometry(0.07 * scale, 0.12 * scale, 5);
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.set(stem.position.x, stem.position.y + 0.23 * scale, stem.position.z);
        flower.rotation.x = -Math.PI;
        flower.castShadow = true;
        plantGroup.add(flower);

        // Flower Center (Yellow pistil)
        const centerMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const centerGeo = new THREE.SphereGeometry(0.02 * scale, 8, 8);
        const center = new THREE.Mesh(centerGeo, centerMat);
        center.position.set(stem.position.x, stem.position.y + 0.18 * scale, stem.position.z);
        plantGroup.add(center);
      });

    } else if (selectedPlant === 'areca') {
      // Areca Air-Purifying Palm:
      // Part 4 & 5: Clump of Green Canes
      const caneMat = new THREE.MeshStandardMaterial({
        color: 0x65a30d,
        roughness: 0.6,
      });
      const caneCount = 6;
      for (let c = 0; c < caneCount; c++) {
        const rad = 0.08 * scale;
        const ang = (c * Math.PI * 2) / caneCount;
        const caneGeo = new THREE.CylinderGeometry(0.015 * scale, 0.025 * scale, 0.7 * scale, 10);
        const cane = new THREE.Mesh(caneGeo, caneMat);
        cane.position.set(Math.sin(ang) * rad, 0.5 + 0.32 * scale, Math.cos(ang) * rad);
        cane.rotation.z = Math.sin(ang) * 0.18;
        cane.rotation.x = Math.cos(ang) * 0.18;
        cane.castShadow = true;
        plantGroup.add(cane);

        // Parts 6 - 12: Arching Feathery Pinnate Palm Fronds
        const frondMat = new THREE.MeshStandardMaterial({
          color: c % 2 === 0 ? 0x22c55e : 0x16a34a,
          roughness: 0.45,
          side: THREE.DoubleSide,
        });
        const frondGeo = new THREE.ConeGeometry(0.14 * scale, 0.55 * scale, 4);
        const frond = new THREE.Mesh(frondGeo, frondMat);
        frond.scale.set(1.4, 1.0, 0.15);
        frond.position.set(
          cane.position.x + Math.sin(ang) * 0.22 * scale,
          cane.position.y + 0.35 * scale,
          cane.position.z + Math.cos(ang) * 0.22 * scale
        );
        frond.rotation.z = Math.sin(ang) * 0.6 + Math.PI / 2;
        frond.rotation.y = ang;
        frond.castShadow = true;
        plantGroup.add(frond);
      }
    }
  }, [selectedPlant, selectedPot, growthStage]);

  // Handle lighting preset changes
  useEffect(() => {
    const keyLight = keyLightRef.current;
    const hemiLight = hemiLightRef.current;
    if (!keyLight || !hemiLight) return;

    if (selectedLight === 'morning') {
      keyLight.color.setHex(0xfff3db);
      keyLight.intensity = 2.8;
      hemiLight.color.setHex(0x406e53);
    } else if (selectedLight === 'noon') {
      keyLight.color.setHex(0xffffff);
      keyLight.intensity = 3.2;
      hemiLight.color.setHex(0x52796f);
    } else if (selectedLight === 'golden') {
      keyLight.color.setHex(0xfbbf24);
      keyLight.intensity = 3.5;
      hemiLight.color.setHex(0xb45309);
    }
  }, [selectedLight]);

  const setCameraPreset = (view: 'orbit' | 'foliage' | 'pot') => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (view === 'orbit') {
      camera.position.set(0, 1.8, 3.8);
      controls.target.set(0, 0.9, 0);
    } else if (view === 'foliage') {
      camera.position.set(0, 1.5, 2.0);
      controls.target.set(0, 1.1, 0);
    } else if (view === 'pot') {
      camera.position.set(0, 0.6, 1.8);
      controls.target.set(0, 0.35, 0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Top Header Controls (Minimal Top Dock) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        
        {/* Title & Provenance Badge */}
        <div className="pointer-events-auto bg-stone-900/90 text-white px-4 py-2.5 rounded-2xl border border-stone-800 shadow-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
            <Rotate3d className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-stone-100 flex items-center gap-2">
              <span>3D Plant Visualizer & Growth Studio</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                PBR Real-Time
              </span>
            </h3>
            <p className="text-[11px] text-stone-400">
              Procedural models based on Maruthi Nursery Malladi rootstock
            </p>
          </div>
        </div>

        {/* Action Controls & Close */}
        <div className="pointer-events-auto flex items-center gap-2">
          <a
            href={`https://wa.me/${NURSERY_PHONE}?text=${encodeURIComponent(
              `Hello Maruthi Nursery! I am viewing the 3D Visualizer for "${
                selectedPlant === 'mango'
                  ? 'Banganapalli Grafted Mango'
                  : selectedPlant === 'adenium'
                  ? 'Adenium Desert Rose Bonsai'
                  : 'Areca Air-Purifying Palm'
              }" in ${selectedPot} pot finish. Please confirm pricing and availability at Malladi Village.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Order via WhatsApp</span>
          </a>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
            aria-label="Close 3D viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Mounting Container (Full-Bleed Viewport) */}
      <div 
        ref={mountRef} 
        className="w-full h-full relative cursor-grab active:cursor-grabbing"
      />

      {/* Floating Bottom Control Dock (Viewport-First Directive from Three.js Constitution) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-3xl pointer-events-auto flex flex-col items-center">
        
        {/* Dock Collapse Toggle Button */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="mb-1 px-3 py-1 bg-stone-900/90 text-stone-300 hover:text-white text-[11px] font-semibold rounded-t-xl border-t border-l border-r border-stone-800 flex items-center gap-1 transition-colors shadow-lg cursor-pointer"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Studio Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Hide Controls (Zen View)</span>
            </>
          )}
        </button>

        {!isDockCollapsed && (
          <div className="w-full bg-stone-900/95 text-stone-100 rounded-2xl border border-stone-800 p-3 sm:p-4 shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200">
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              
              {/* Plant Variety Switcher */}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  1. Plant Species
                </span>
                <div className="flex sm:flex-col gap-1">
                  <button
                    onClick={() => setSelectedPlant('mango')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-left text-xs font-semibold transition-all ${
                      selectedPlant === 'mango'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
                    }`}
                  >
                    Banganapalli Mango
                  </button>
                  <button
                    onClick={() => setSelectedPlant('adenium')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-left text-xs font-semibold transition-all ${
                      selectedPlant === 'adenium'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
                    }`}
                  >
                    Adenium Bonsai
                  </button>
                  <button
                    onClick={() => setSelectedPlant('areca')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-left text-xs font-semibold transition-all ${
                      selectedPlant === 'areca'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
                    }`}
                  >
                    Areca Palm
                  </button>
                </div>
              </div>

              {/* Pot Finish Switcher */}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  2. Planter Material
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {(
                    [
                      { id: 'terracotta', label: 'Terracotta' },
                      { id: 'ceramic', label: 'Ceramic' },
                      { id: 'stone', label: 'Basalt' },
                      { id: 'bronze', label: 'Bronze' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPot(p.id)}
                      className={`py-1.5 px-2 rounded-lg text-center text-xs font-medium transition-all ${
                        selectedPot === p.id
                          ? 'bg-emerald-700 text-white font-bold'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Growth Stage Slider */}
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  <span>3. Growth Stage</span>
                  <span className="text-emerald-400">
                    {growthStage === 1 ? '1-2 ft Sapling' : growthStage === 2 ? 'Ready Rootstock' : 'Mature Garden'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="1"
                  value={growthStage}
                  onChange={(e) => setGrowthStage(Number(e.target.value))}
                  className="w-full accent-emerald-500 mt-2"
                />
                <div className="flex justify-between text-[10px] text-stone-500 mt-1">
                  <span>Early</span>
                  <span>Grafted Ready</span>
                  <span>Established</span>
                </div>
              </div>

              {/* Sunlight & Camera Angle Presets */}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  4. View & Lighting
                </span>
                <div className="flex gap-1 mb-1.5">
                  <button
                    onClick={() => setSelectedLight('morning')}
                    className={`flex-1 py-1 rounded text-[11px] font-semibold ${
                      selectedLight === 'morning' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    Morning
                  </button>
                  <button
                    onClick={() => setSelectedLight('noon')}
                    className={`flex-1 py-1 rounded text-[11px] font-semibold ${
                      selectedLight === 'noon' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    Noon
                  </button>
                  <button
                    onClick={() => setSelectedLight('golden')}
                    className={`flex-1 py-1 rounded text-[11px] font-semibold ${
                      selectedLight === 'golden' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    Golden
                  </button>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => setCameraPreset('orbit')}
                    className="flex-1 py-1 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded text-[10px] font-medium"
                  >
                    Full View
                  </button>
                  <button
                    onClick={() => setCameraPreset('foliage')}
                    className="flex-1 py-1 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded text-[10px] font-medium"
                  >
                    Foliage
                  </button>
                  <button
                    onClick={() => setCameraPreset('pot')}
                    className="flex-1 py-1 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded text-[10px] font-medium"
                  >
                    Graft Knot
                  </button>
                </div>
              </div>

            </div>

            <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
              <span className="flex items-center gap-1.5">
                <Rotate3d className="w-3.5 h-3.5 text-emerald-400" />
                <span>Drag to rotate 360° • Scroll/pinch to zoom • Right-click to pan</span>
              </span>
              <span className="text-emerald-400 font-semibold">
                Available at Malladi Village Nursery
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
