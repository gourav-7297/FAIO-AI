import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, Navigation } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface MapMarker {
    id: string | number;
    lat: number;
    lon: number;
    label: string;
    emoji?: string;
    color?: string;
    popup?: string;
}

interface MapViewProps {
    markers?: MapMarker[];
    center?: [number, number]; // [lon, lat]
    zoom?: number;
    height?: string;
    className?: string;
    onMarkerClick?: (marker: MapMarker) => void;
    showUserLocation?: boolean;
}

export function MapView({
    markers = [],
    center,
    zoom = 12,
    height = '300px',
    className = '',
    onMarkerClick,
    showUserLocation = false,
}: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Calculate center from markers if not provided
    const mapCenter = center || (markers.length > 0
        ? [
            markers.reduce((sum, m) => sum + m.lon, 0) / markers.length,
            markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
        ] as [number, number]
        : [77.2090, 28.6139] // Default: Delhi
    );

    useEffect(() => {
        if (!mapContainer.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap',
                    },
                },
                layers: [{
                    id: 'osm',
                    type: 'raster',
                    source: 'osm',
                }],
            },
            center: mapCenter,
            zoom,
            attributionControl: false,
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.on('load', () => {
            setMapLoaded(true);

            // Add markers
            markers.forEach(marker => {
                const el = document.createElement('div');
                el.className = 'map-marker';
                el.style.cssText = `
                    width: 32px; height: 32px; border-radius: 50%;
                    background: ${marker.color || '#6366f1'};
                    border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 14px; cursor: pointer;
                `;
                el.textContent = marker.emoji || '📍';

                if (onMarkerClick) {
                    el.addEventListener('click', () => onMarkerClick(marker));
                }

                const popup = marker.popup ? new maplibregl.Popup({ offset: 20, closeButton: false })
                    .setHTML(`<div style="padding:4px 8px;font-size:12px;font-weight:600;color:#1e293b">${marker.popup || marker.label}</div>`) : undefined;

                new maplibregl.Marker({ element: el })
                    .setLngLat([marker.lon, marker.lat])
                    .setPopup(popup)
                    .addTo(map);
            });

            // Fit bounds to markers if multiple
            if (markers.length > 1) {
                const bounds = new maplibregl.LngLatBounds();
                markers.forEach(m => bounds.extend([m.lon, m.lat]));
                map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
            }

            // Show user location
            if (showUserLocation && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const userEl = document.createElement('div');
                    userEl.style.cssText = `
                        width: 16px; height: 16px; border-radius: 50%;
                        background: #3b82f6; border: 3px solid white;
                        box-shadow: 0 0 0 4px rgba(59,130,246,0.3);
                    `;
                    new maplibregl.Marker({ element: userEl })
                        .setLngLat([pos.coords.longitude, pos.coords.latitude])
                        .addTo(map);
                }, () => { }, { timeout: 5000 });
            }
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update markers when they change
    useEffect(() => {
        if (!mapRef.current || !mapLoaded || markers.length === 0) return;

        // Fly to new center
        const newCenter: [number, number] = [
            markers.reduce((sum, m) => sum + m.lon, 0) / markers.length,
            markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
        ];
        mapRef.current.flyTo({ center: newCenter, zoom: Math.min(zoom, 14) });
    }, [markers, mapLoaded, zoom]);

    const recenter = () => {
        if (navigator.geolocation && mapRef.current) {
            navigator.geolocation.getCurrentPosition((pos) => {
                mapRef.current?.flyTo({
                    center: [pos.coords.longitude, pos.coords.latitude],
                    zoom: 14,
                });
            });
        }
    };

    return (
        <motion.div
            layout
            className={`relative rounded-2xl overflow-hidden border border-white/10 ${className}`}
            style={{ height: isExpanded ? '70vh' : height }}
        >
            <div ref={mapContainer} className="w-full h-full" />

            {/* Map controls overlay */}
            <div className="absolute top-2 left-2 flex gap-1.5 z-10">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-8 h-8 rounded-lg bg-background/80 backdrop-blur border border-white/10 flex items-center justify-center text-secondary hover:text-white transition-colors"
                >
                    {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                    onClick={recenter}
                    className="w-8 h-8 rounded-lg bg-background/80 backdrop-blur border border-white/10 flex items-center justify-center text-secondary hover:text-white transition-colors"
                >
                    <Navigation className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Loading overlay */}
            {!mapLoaded && (
                <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
                    <div className="text-secondary text-sm animate-pulse">Loading map...</div>
                </div>
            )}
        </motion.div>
    );
}
