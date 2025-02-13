import { useState, useCallback } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export const useModelLoader = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadModel = useCallback(async (url: string): Promise<GLTF> => {
    setLoading(true);
    setError(null);

    try {
      const loader = new GLTFLoader();
      const model = await new Promise<GLTF>((resolve, reject) => {
        loader.load(
          url,
          resolve,
          undefined,
          reject
        );
      });

      return model;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load model');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loadModel, loading, error };
}; 