import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Map as MapIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issues with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapPanel() {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});
  const movementIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: rides } = useQuery({
    queryKey: ["/api/rides"],
    refetchInterval: 5000,
  });

  const { data: drivers } = useQuery({
    queryKey: ["/api/drivers"],
    refetchInterval: 3000,
  });

  const activeRides = Array.isArray(rides) ? rides.filter((ride: any) => 
    ride.status === 'accepted' || ride.status === 'in_progress'
  ) : [];

  const onlineDrivers = Array.isArray(drivers) ? drivers.filter((driver: any) => driver.isOnline === 1) : [];

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return; // Map already initialized

    // Centraliza em Furnas/RJ
    const centro: [number, number] = [-22.51, -43.71];

    const map = L.map('leaflet-map').setView(centro, 13);

    // OpenStreetMap layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update driver markers
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const onlineDriverIds = new Set(onlineDrivers.map((d: any) => Number(d.id)));

    // Remove markers that are no longer online (convert keys to numbers)
    Object.keys(markersRef.current).forEach(key => {
      const driverId = Number(key);
      if (!onlineDriverIds.has(driverId)) {
        markersRef.current[driverId].remove();
        delete markersRef.current[driverId];
      }
    });

    // Add or update driver markers
    onlineDrivers.forEach((driver: any) => {
      const driverId = Number(driver.id);
      let marker = markersRef.current[driverId];
      
      // Default position if no lat/lng (near Furnas)
      const lat = driver.latitude ? parseFloat(driver.latitude) : -22.51 + (Math.random() - 0.5) * 0.01;
      const lng = driver.longitude ? parseFloat(driver.longitude) : -43.71 + (Math.random() - 0.5) * 0.01;

      if (marker) {
        // Update existing marker position
        marker.setLatLng([lat, lng]);
      } else {
        // Create new marker
        const redIcon = L.icon({
          iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          iconSize: [32, 32]
        });

        marker = L.marker([lat, lng], { icon: redIcon })
          .addTo(map)
          .bindPopup(`<b>${driver.name}</b><br>${driver.vehicleModel || 'Motorista'}`);
        
        markersRef.current[driverId] = marker;
      }
    });
  }, [onlineDrivers]);

  // Simulate movement for drivers without GPS (for demo)
  useEffect(() => {
    // Clear previous interval
    if (movementIntervalRef.current) {
      clearInterval(movementIntervalRef.current);
    }

    // Only animate if there are markers
    if (Object.keys(markersRef.current).length > 0) {
      movementIntervalRef.current = setInterval(() => {
        Object.values(markersRef.current).forEach(marker => {
          const pos = marker.getLatLng();
          const novoLat = pos.lat + (Math.random() - 0.5) * 0.0005;
          const novoLng = pos.lng + (Math.random() - 0.5) * 0.0005;
          marker.setLatLng([novoLat, novoLng]);
        });
      }, 3000);
    }

    return () => {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
        movementIntervalRef.current = null;
      }
    };
  }, [onlineDrivers]); // Re-run when drivers change

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapIcon className="text-primary mr-3" />
          Mapa em Tempo Real - Motoristas Online
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          id="leaflet-map" 
          className="rounded-lg h-96 w-full"
          style={{ zIndex: 0 }}
        />

        {/* Map Legend */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Motoristas Online ({onlineDrivers.length})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Passageiros Aguardando
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Corridas Ativas ({activeRides.length})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
