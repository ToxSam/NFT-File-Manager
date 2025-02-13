import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

interface VRMViewerProps {
  modelUrl: string;
  onModelLoaded?: (stats: any) => void;
}

export const VRMViewer: React.FC<VRMViewerProps> = ({ modelUrl, onModelLoaded }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const vrmRef = useRef<any>();
  const clockRef = useRef(new THREE.Clock());

  useEffect(() => {
    if (!modelUrl || !canvasRef.current) return;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(30.0, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 20.0);
    camera.position.set(0.0, 1.0, 3.5);
    cameraRef.current = camera;

    // Add lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    scene.add(new THREE.DirectionalLight(0xffffff, 0.5));

    // Setup controls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minPolarAngle = Math.PI / 3;
    controls.enableZoom = false;
    controls.enablePan = false;
    controlsRef.current = controls;

    // Add floor
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.0,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.8;
    scene.add(floor);

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Load VRM
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(modelUrl, (gltf) => {
      const vrm = gltf.userData.vrm;
      if (!vrm) {
        console.error('Could not load VRM');
        return;
      }
      
      vrmRef.current = vrm;
      scene.add(vrm.scene);

      // Setup VRM
      vrm.humanoid?.resetPose();
      VRMUtils.rotateVRM0(vrm);

      // Center model
      const box = new THREE.Box3().setFromObject(vrm.scene);
      const center = box.getCenter(new THREE.Vector3());
      vrm.scene.position.sub(center);
      vrm.scene.position.y += 0.5; // Lift model slightly above floor

      // Calculate stats if needed
      if (onModelLoaded) {
        const stats = {
          vertices: 0,
          triangles: 0,
          materials: 0
        };

        vrm.scene.traverse((child: THREE.Mesh) => {
          if (child.isMesh) {
            if (child.geometry) {
              stats.vertices += child.geometry.attributes.position.count;
              stats.triangles += child.geometry.index ? child.geometry.index.count / 3 : 0;
            }
            if (child.material) {
              stats.materials += Array.isArray(child.material) ? child.material.length : 1;
            }
          }
        });

        onModelLoaded(stats);
      }
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (vrmRef.current) {
        vrmRef.current.update(clockRef.current.getDelta());
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      controlsRef.current?.dispose();
      rendererRef.current?.dispose();
      sceneRef.current?.clear();
    };
  }, [modelUrl, onModelLoaded]);

  return (
    <div className="w-full h-[400px] bg-black/40 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
}; 