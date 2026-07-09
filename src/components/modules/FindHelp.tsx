import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, LayersControl } from "react-leaflet";
import L from "leaflet";
import { listVets, type VetContact } from "@/lib/data/vets";
import { haversineKm } from "@/lib/poultry-calc";
import { Phone, MapPin, Stethoscope, Store } from "lucide-react";
import { cn } from "@/lib/utils";

// Fix default marker icons for Vite
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const NAIROBI = { lat: -1.286389, lng: 36.817223 };

export function FindHelpModule({ county }: { county: string }) {
  const [filter, setFilter] = useState<"all" | "vet" | "agrovet">("all");
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [vets, setVets] = useState<VetContact[]>([]);

  useEffect(() => {
    listVets().then(setVets).catch(() => setVets([]));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 4000 },
    );
  }, []);

  const origin = me ?? NAIROBI;

  const list = useMemo(() => {
    return vets
      .filter((v) => filter === "all" || v.kind === filter)
      .map((v) => ({ ...v, distance: haversineKm(origin, v) }))
      .sort((a, b) => {
        const aSame = a.county === county ? 0 : 1;
        const bSame = b.county === county ? 0 : 1;
        if (aSame !== bSame) return aSame - bSame;
        return a.distance - b.distance;
      });
  }, [vets, filter, origin, county]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="h-[480px] w-full">
          <MapContainer center={[origin.lat, origin.lng]} zoom={11} scrollWheelZoom={false}>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Satellite">
                <TileLayer
                  attribution="Tiles &copy; Esri"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Street">
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
            </LayersControl>
            <TileLayer
              attribution="Labels &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              pane="overlayPane"
            />
            {me && (
              <CircleMarker center={[me.lat, me.lng]} radius={8} pathOptions={{ color: "#2e7d55", fillOpacity: 0.6 }}>
                <Popup>You are here</Popup>
              </CircleMarker>
            )}
            {list.map((v) => (
              <Marker key={v.id} position={[v.lat, v.lng]}>
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">{v.name}</p>
                    <p className="text-xs">{v.kind === "vet" ? "Veterinary" : "Agrovet"} · {v.county}</p>
                    <a href={`tel:${v.phone.replace(/\s/g, "")}`} className="text-primary underline">{v.phone}</a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          {(["all", "vet", "agrovet"] as const).map((k) => (
            <button key={k} onClick={() => setFilter(k)}
              className={cn("flex-1 rounded-lg border px-3 py-2 text-sm capitalize",
                filter === k ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50")}>
              {k}
            </button>
          ))}
        </div>

        <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
          {list.map((v) => (
            <div key={v.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg",
                  v.kind === "vet" ? "bg-primary/10 text-primary" : "bg-clay/10 text-clay")}>
                  {v.kind === "vet" ? <Stethoscope className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{v.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {v.county} · {v.distance.toFixed(1)} km
                  </p>
                  <a href={`tel:${v.phone.replace(/\s/g, "")}`}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <Phone className="h-3 w-3" /> {v.phone}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
