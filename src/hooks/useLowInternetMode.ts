import { useState, useEffect, useCallback } from 'react';

type NetworkQuality = 'fast' | 'slow' | 'offline';

interface LowInternetState {
    quality: NetworkQuality;
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
}

interface NetworkInfo {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
}

// Extend Navigator for connection info
declare global {
    interface Navigator {
        connection?: NetworkInfo & EventTarget;
        mozConnection?: NetworkInfo;
        webkitConnection?: NetworkInfo;
    }
}

export function useLowInternetMode() {
    const [state, setState] = useState<LowInternetState>({
        quality: 'fast',
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false,
    });

    const [isLowDataMode, setIsLowDataMode] = useState(false);

    const updateNetworkInfo = useCallback(() => {
        const connection = navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;

        if (!navigator.onLine) {
            setState(prev => ({ ...prev, quality: 'offline' }));
            return;
        }

        if (connection) {
            const effectiveType = connection.effectiveType || '4g';
            const downlink = connection.downlink || 10;
            const rtt = connection.rtt || 50;
            const saveData = connection.saveData || false;

            let quality: NetworkQuality = 'fast';

            // Determine quality based on connection info
            if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 0.5) {
                quality = 'slow';
            } else if (effectiveType === '3g' || downlink < 1.5 || rtt > 300) {
                quality = 'slow';
            }

            setState({
                quality,
                effectiveType,
                downlink,
                rtt,
                saveData,
            });

            // Auto-enable low data mode on slow connections
            if (quality === 'slow' || saveData) {
                setIsLowDataMode(true);
            }
        }
    }, []);

    useEffect(() => {
        updateNetworkInfo();

        const connection = navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;

        // Safe event listener handling - connection may not support events
        const connAny = connection as any;
        if (connAny?.addEventListener) {
            connAny.addEventListener('change', updateNetworkInfo);
        }

        window.addEventListener('online', updateNetworkInfo);
        window.addEventListener('offline', updateNetworkInfo);

        return () => {
            if (connAny?.removeEventListener) {
                connAny.removeEventListener('change', updateNetworkInfo);
            }
            window.removeEventListener('online', updateNetworkInfo);
            window.removeEventListener('offline', updateNetworkInfo);
        };
    }, [updateNetworkInfo]);

    const toggleLowDataMode = useCallback(() => {
        setIsLowDataMode(prev => !prev);
    }, []);

    // Helper to check if we should load heavy content
    const shouldLoadHeavyContent = useCallback(() => {
        return state.quality === 'fast' && !isLowDataMode && !state.saveData;
    }, [state.quality, isLowDataMode, state.saveData]);

    // Helper to get appropriate image quality
    const getImageQuality = useCallback((): 'high' | 'medium' | 'low' | 'placeholder' => {
        if (state.quality === 'offline') return 'placeholder';
        if (isLowDataMode || state.quality === 'slow') return 'low';
        if (state.effectiveType === '3g') return 'medium';
        return 'high';
    }, [state.quality, state.effectiveType, isLowDataMode]);

    // Get optimized image URL
    const getOptimizedImageUrl = useCallback((originalUrl: string): string => {
        const quality = getImageQuality();

        if (quality === 'placeholder') {
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFmMjkzNyIvPjwvc3ZnPg==';
        }

        // In a real app, you'd modify the URL for CDN resizing
        // Example: return `${originalUrl}?q=${quality === 'low' ? 30 : quality === 'medium' ? 60 : 90}`;
        return originalUrl;
    }, [getImageQuality]);

    return {
        ...state,
        isLowDataMode,
        toggleLowDataMode,
        shouldLoadHeavyContent,
        getImageQuality,
        getOptimizedImageUrl,
    };
}

// Lazy loading hook for images
export function useLazyImage(src: string, placeholder?: string) {
    const [imageSrc, setImageSrc] = useState(placeholder || '');
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
        };

        img.onerror = () => {
            setError(true);
        };
    }, [src]);

    return { imageSrc, isLoaded, error };
}

// Debounced fetch for slow connections
export function useNetworkAwareFetch() {
    const { quality, isLowDataMode } = useLowInternetMode();

    const fetchWithRetry = useCallback(async (
        url: string,
        options?: RequestInit,
        retries = 3
    ): Promise<Response> => {
        const timeout = quality === 'slow' ? 30000 : 10000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (retries > 0 && (error as Error).name !== 'AbortError') {
                // Wait before retry (longer wait on slow connections)
                await new Promise(resolve =>
                    setTimeout(resolve, isLowDataMode ? 2000 : 1000)
                );
                return fetchWithRetry(url, options, retries - 1);
            }
            throw error;
        }
    }, [quality, isLowDataMode]);

    return { fetchWithRetry };
}
