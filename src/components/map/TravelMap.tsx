import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// Fix for default marker icons in Leaflet + Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom marker icons
const createCustomIcon = (emoji: string, color: string = '#3B82F6') => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="
                background: ${color};
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                border: 2px solid white;
            ">${emoji}</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    });
};

export const MARKER_TYPES = {
    attraction: createCustomIcon('📍', '#3B82F6'),
    restaurant: createCustomIcon('🍜', '#F59E0B'),
    hotel: createCustomIcon('🏨', '#8B5CF6'),
    danger: createCustomIcon('⚠️', '#EF4444'),
    safe: createCustomIcon('✅', '#10B981'),
    photo: createCustomIcon('📸', '#EC4899'),
    secret: createCustomIcon('💎', '#6366F1'),
};

export interface MapMarker {
    id: string;
    position: [number, number];
    type: keyof typeof MARKER_TYPES;
    title: string;
    description?: string;
    rating?: number;
}

export interface SafetyZone {
    center: [number, number];
    radius: number;
    type: 'safe' | 'caution' | 'danger';
    name: string;
}

interface TravelMapProps {
    center: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    safetyZones?: SafetyZone[];
    className?: string;
    height?: string;
    showZoomControl?: boolean;
    onMarkerClick?: (marker: MapMarker) => void;
}

// Component to handle map view changes
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);

    return null;
}

export function TravelMap({
    center,
    zoom = 13,
    markers = [],
    safetyZones = [],
    className,
    height = '300px',
    showZoomControl = true,
    onMarkerClick,
}: TravelMapProps) {
    const mapRef = useRef<L.Map>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const safetyZoneColors = {
        safe: { fill: '#10B981', opacity: 0.2 },
        caution: { fill: '#F59E0B', opacity: 0.3 },
        danger: { fill: '#EF4444', opacity: 0.3 },
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isLoaded ? 1 : 0.5, scale: 1 }}
            className={cn("rounded-2xl overflow-hidden", className)}
            style={{ height }}
        >
            <MapContainer
                ref={mapRef}
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                whenReady={() => setIsLoaded(true)}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {showZoomControl && <ZoomControl position="bottomright" />}

                <MapViewController center={center} zoom={zoom} />

                {/* Safety Zones */}
                {safetyZones.map((zone, index) => (
                    <Circle
                        key={`zone-${index}`}
                        center={zone.center}
                        radius={zone.radius}
                        pathOptions={{
                            fillColor: safetyZoneColors[zone.type].fill,
                            fillOpacity: safetyZoneColors[zone.type].opacity,
                            color: safetyZoneColors[zone.type].fill,
                            weight: 2,
                        }}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong>{zone.name}</strong>
                                <p className="capitalize">{zone.type} zone</p>
                            </div>
                        </Popup>
                    </Circle>
                ))}

                {/* Markers */}
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={marker.position}
                        icon={MARKER_TYPES[marker.type]}
                        eventHandlers={{
                            click: () => onMarkerClick?.(marker),
                        }}
                    >
                        <Popup>
                            <div className="text-sm min-w-[150px]">
                                <strong className="text-base">{marker.title}</strong>
                                {marker.description && (
                                    <p className="text-gray-600 mt-1">{marker.description}</p>
                                )}
                                {marker.rating && (
                                    <p className="mt-1">
                                        {'⭐'.repeat(Math.round(marker.rating))} {marker.rating.toFixed(1)}
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </motion.div>
    );
}

// Mini map for cards/previews
interface MiniMapProps {
    center: [number, number];
    className?: string;
}

export function MiniMap({ center, className }: MiniMapProps) {
    return (
        <TravelMap
            center={center}
            zoom={14}
            height="120px"
            showZoomControl={false}
            className={cn("pointer-events-none", className)}
            markers={[{
                id: 'center',
                position: center,
                type: 'attraction',
                title: 'Location',
            }]}
        />
    );
}

// Safety overlay map with heatmap-like zones
interface SafetyMapProps {
    center: [number, number];
    zones: SafetyZone[];
    className?: string;
}

export function SafetyMap({ center, zones, className }: SafetyMapProps) {
    return (
        <TravelMap
            center={center}
            zoom={12}
            height="250px"
            safetyZones={zones}
            className={className}
        />
    );
}

// Location search result type
export interface LocationSearchResult {
    name: string;
    displayName: string;
    lat: number;
    lon: number;
    type: string;
}

// Geocoding using Nominatim (free OpenStreetMap service)
export async function searchLocation(query: string): Promise<LocationSearchResult[]> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
            {
                headers: {
                    'User-Agent': 'FAIO-Travel-App',
                },
            }
        );

        const data = await response.json();

        return data.map((item: any) => ({
            name: item.name,
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            type: item.type,
        }));
    } catch (error) {
        console.error('Error searching location:', error);
        return [];
    }
}

// Get coordinates for a city name
export async function getCoordinates(cityName: string): Promise<[number, number] | null> {
    const results = await searchLocation(cityName);
    if (results.length > 0) {
        return [results[0].lat, results[0].lon];
    }
    return null;
}

// Default city coordinates
export const CITY_COORDINATES: Record<string, [number, number]> = {
    'Tokyo': [35.6762, 139.6503],
    'Paris': [48.8566, 2.3522],
    'New York': [40.7128, -74.0060],
    'London': [51.5074, -0.1278],
    'Dubai': [25.2048, 55.2708],
    'Singapore': [1.3521, 103.8198],
    'Sydney': [-33.8688, 151.2093],
    'Barcelona': [41.3851, 2.1734],
    'Rome': [41.9028, 12.4964],
    'Bangkok': [13.7563, 100.5018],
    'Mumbai': [19.0760, 72.8777],
    'Delhi': [28.7041, 77.1025],
    'Bali': [-8.4095, 115.1889],
    'Amsterdam': [52.3676, 4.9041],
    'Prague': [50.0755, 14.4378],
};
