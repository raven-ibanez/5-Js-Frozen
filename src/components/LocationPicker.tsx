import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Crosshair, Loader2 } from 'lucide-react';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number) => void;
    readOnly?: boolean;
}

export const LocationPicker = ({ initialLat = 14.5995, initialLng = 120.9842, onLocationSelect, readOnly = false }: LocationPickerProps) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // Initial Map Setup
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // If map already exists, just return (or update view in a separate effect)
        if (mapRef.current) return;

        // Create Map
        const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);
        mapRef.current = map;

        // Add Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add Marker if initial coords are provided
        if (initialLat && initialLng) {
            updateMarkerPosition(initialLat, initialLng);
        }

        // Map Click Event
        if (!readOnly) {
            map.on('click', (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;
                updateMarkerPosition(lat, lng);
            });
        }

        // Cleanup
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // Run once on mount

    const updateMarkerPosition = (lat: number, lng: number) => {
        if (!mapRef.current) return;

        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            const marker = L.marker([lat, lng], { draggable: !readOnly }).addTo(mapRef.current);
            markerRef.current = marker;

            if (!readOnly) {
                marker.on('dragend', (event) => {
                    const m = event.target;
                    const position = m.getLatLng();
                    onLocationSelect(position.lat, position.lng);
                });
            }
        }
        onLocationSelect(lat, lng);
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                if (mapRef.current) {
                    mapRef.current.setView([latitude, longitude], 16); // Closer zoom for locate me
                    updateMarkerPosition(latitude, longitude);
                }
                setIsLocating(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to retrieve your location. Please check your browser permissions.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true }
        );
    };

    // Update View/Marker when props change
    useEffect(() => {
        if (!mapRef.current) return;

        const isValid = !isNaN(Number(initialLat)) && !isNaN(Number(initialLng));
        if (!isValid) return;

        // Only update view if the props significantly differ from current center (avoid fighting with user interaction)
        // For simplicity, we just adhere to props for now, but in a real app might need checks.
        // Actually, if we just located the user, we don't want this effect to override it immediately if parent state hasn't caught up or if different logic applies.
        // For now, let's assume the parent updates these props when `onLocationSelect` is called, so it should be fine.
        mapRef.current.setView([initialLat, initialLng], mapRef.current.getZoom());

        if (markerRef.current) {
            markerRef.current.setLatLng([initialLat, initialLng]);
            if (readOnly) {
                markerRef.current.dragging?.disable();
            } else {
                markerRef.current.dragging?.enable();
            }
        } else {
            // Create marker if it didn't exist (e.g. slight race condition)
            const marker = L.marker([initialLat, initialLng], {
                draggable: !readOnly
            }).addTo(mapRef.current);
            markerRef.current = marker;
        }
    }, [initialLat, initialLng, readOnly]);


    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300 relative z-0 group">
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

            {!readOnly && (
                <>
                    <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md z-[1000] text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        Click map to pin location
                    </div>

                    <button
                        onClick={handleLocateMe}
                        disabled={isLocating}
                        className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg z-[1000] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-75"
                        title="Locate Me"
                    >
                        {isLocating ? (
                            <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                        ) : (
                            <Crosshair className="w-6 h-6 text-red-600" />
                        )}
                    </button>
                </>
            )}
        </div>
    );
};
