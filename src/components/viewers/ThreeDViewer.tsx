import React, { useEffect, useState, Suspense, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { getModelUrl, getFileExtension } from '../../utils/modelUtils';

export interface ThreeDViewerProps {
  modelUrl: string;
  onModelLoaded?: () => void;
  onError?: (error: unknown) => void;
}

function LoadingMessage() {
  return (
    <Html center>
      <div className="text-white text-opacity-60">
        Loading model...
      </div>
    </Html>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <Html center>
      <div className="text-red-500 text-center">
        <p>Error loading model</p>
        <p className="text-sm opacity-75">{message}</p>
      </div>
    </Html>
  );
}

// Create a cache for loaded models
const modelCache = new Map<string, THREE.Group>();

function Model({ url, onLoaded }: { url: string; onLoaded?: (stats: any) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const modelRef = useRef<THREE.Group>();
  const { scene } = useThree();
  const loadingRef = useRef(false);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (modelRef.current) {
        scene.remove(modelRef.current);
      }
    };
  }, [scene]);

  // Model loading effect
  useEffect(() => {
    let isMounted = true;
    
    const loadModel = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        setError(null);
        setIsLoading(true);

        // Check cache first
        if (modelCache.has(url)) {
          const cachedModel = modelCache.get(url)!;
          if (modelRef.current) {
            scene.remove(modelRef.current);
          }
          modelRef.current = cachedModel.clone();
          scene.add(modelRef.current);
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        const resolvedUrl = await getModelUrl(url);
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        loader.setDRACOLoader(dracoLoader);
        loader.crossOrigin = 'anonymous';

        // Add VRM support if it's a VRM file
        const isVRM = getFileExtension(url).toLowerCase() === 'vrm';
        if (isVRM) {
          loader.register((parser) => new VRMLoaderPlugin(parser));
        }

        const gltf = await new Promise<GLTF>((resolve, reject) => {
          loader.load(
            resolvedUrl,
            resolve,
            (event) => {
              if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                console.log(`Loading model: ${Math.round(percentComplete)}%`);
              }
            },
            reject
          );
        });

        if (!isMounted) return;

        if (modelRef.current) {
          scene.remove(modelRef.current);
        }

        let modelScene = gltf.scene;

        // Process materials for proper transparency
        modelScene.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((material) => {
                // Only enable basic transparency
                material.transparent = true;
                material.alphaTest = 0.001;
              });
            }
          }
        });

        // For VRM files, use the VRM scene and rotate to face camera
        if (isVRM && (gltf as any).userData?.vrm) {
          const vrm = (gltf as any).userData.vrm;
          modelScene = vrm.scene;
          modelScene.rotation.y = Math.PI;
        }

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(modelScene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Calculate the largest dimension for scaling
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 2; // Desired size in world units
        const scale = targetSize / maxDim;
        
        // Apply uniform scaling
        modelScene.scale.setScalar(scale);
        
        // Recalculate bounds after scaling
        box.setFromObject(modelScene);
        box.getCenter(center);
        box.getSize(size);
        
        // Position model
        modelScene.position.x = -center.x;
        modelScene.position.z = -center.z;
        modelScene.position.y = -center.y - (size.y * 0.1); // Slight downward shift

        // Cache the loaded model
        modelCache.set(url, modelScene.clone());

        modelRef.current = modelScene;
        scene.add(modelScene);

        if (onLoaded) {
          const stats = {
            vertices: 0,
            triangles: 0,
            materials: 0
          };

          modelScene.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.geometry) {
                stats.vertices += mesh.geometry.attributes.position.count;
                stats.triangles += mesh.geometry.index ? mesh.geometry.index.count / 3 : 0;
              }
              if (mesh.material) {
                stats.materials += Array.isArray(mesh.material) ? mesh.material.length : 1;
              }
            }
          });

          onLoaded(stats);
        }

        setIsLoading(false);
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load model';
          console.error('Error loading model:', err);
          setError(errorMessage);
          setIsLoading(false);
        }
      } finally {
        loadingRef.current = false;
      }
    };

    loadModel();

    return () => {
      isMounted = false;
    };
  }, [url, onLoaded, scene]);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (isLoading) {
    return <LoadingMessage />;
  }

  return null;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ 
  modelUrl, 
  onModelLoaded,
  onError 
}) => {
  const [cameraDistance, setCameraDistance] = useState(4);

  if (!modelUrl) {
    return <div className="w-full h-full min-h-[450px] bg-black/40 rounded-lg flex items-center justify-center text-white/60">
      No model URL provided
    </div>;
  }

  return (
    <div className="w-full h-full min-h-[450px] rounded-lg overflow-hidden relative">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-slate-900/40 to-purple-900/20" />
      
      {/* Animated subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 animate-gradient" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[length:24px_24px]" />
      
      <Canvas
        camera={{ 
          position: [0, 0, cameraDistance],
          fov: 40, // Slightly reduced FOV for better framing
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
          // Add proper transparency sorting
          sortObjects: true,
        }}
        shadows
        onCreated={({ gl, scene, camera }) => {
          gl.setClearColor(0x000000, 0);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          scene.background = null;
          
          // Enable proper transparency
          gl.getContext().enable(gl.getContext().BLEND);
          gl.getContext().blendFunc(gl.getContext().SRC_ALPHA, gl.getContext().ONE_MINUS_SRC_ALPHA);
          
          // Look at the center with slight upward tilt
          camera.lookAt(0, 0.2, 0);
          
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            console.warn('WebGL context lost. Attempting to restore...');
          });
          
          canvas.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored.');
            gl.setSize(canvas.clientWidth, canvas.clientHeight);
          });
        }}
      >
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.7} />
        {/* Main light - adjusted position */}
        <directionalLight 
          position={[3, 2, 3]} 
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        {/* Cyan rim light - adjusted position */}
        <pointLight position={[-2, 0, -2]} intensity={0.6} color="#0891b2" />
        {/* Purple fill light - adjusted position */}
        <pointLight position={[2, -1, -2]} intensity={0.4} color="#7e22ce" />
        {/* Top light - adjusted position */}
        <pointLight position={[0, 3, 0]} intensity={0.3} color="#ffffff" />
        
        <Suspense fallback={<LoadingMessage />}>
          <Model 
            url={modelUrl} 
            onLoaded={(stats) => {
              // Adjust camera distance based on model stats if needed
              if (stats.vertices > 100000) {
                setCameraDistance(5); // Move camera back for larger models
              } else {
                setCameraDistance(4);
              }
              onModelLoaded?.(stats);
            }}
          />
        </Suspense>
        <OrbitControls 
          makeDefault
          target={[0, 0.2, 0]}
          minDistance={2}
          maxDistance={10}
          minPolarAngle={Math.PI / 4} // Limit how low user can orbit
          maxPolarAngle={Math.PI * 3/4} // Limit how high user can orbit
        />
      </Canvas>
    </div>
  );
};

export default ThreeDViewer; 