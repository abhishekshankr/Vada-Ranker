import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Star, AlertTriangle, ExternalLink, ChevronRight, X, Info, Menu, List } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
// (Though we are using custom markers, it's good practice)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface VadaPlace {
  id: string;
  name: string;
  rank: number | 'warning';
  lat: number;
  lng: number;
  crispiness: number;
  consistency: number;
  taste: number;
  description: string;
  mapsUrl: string;
  address: string;
  photoUrl?: string;
}

const VADA_DATA: VadaPlace[] = [
  {
    id: '1',
    name: 'Madras Dosa Corner',
    rank: 1,
    lat: 47.5450,
    lng: -122.0545,
    crispiness: 9,
    consistency: 9,
    taste: 9,
    address: '1175 NW Gilman Blvd, Issaquah, WA',
    description: 'Look no further. Just go here. The gold standard for Issaquah and beyond.',
    mapsUrl: 'https://maps.app.goo.gl/eYSTcb6utrXHCZEE7',
    photoUrl: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '2',
    name: 'Madhurai Mess',
    rank: 2,
    lat: 47.6231,
    lng: -122.1321,
    crispiness: 8,
    consistency: 8,
    taste: 9,
    address: '1424 156th Ave NE, Bellevue, WA',
    description: 'When fresh and hot - they transport you to another world! Can be inconsistent though, but the peaks are high.',
    mapsUrl: 'https://maps.app.goo.gl/sE3itCNyMsiTij596',
    photoUrl: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '3',
    name: 'MTR (Mavalli Tiffin Rooms)',
    rank: 3,
    lat: 47.6325,
    lng: -122.1450,
    crispiness: 10,
    consistency: 7,
    taste: 7,
    address: '14625 NE 24th St, Bellevue, WA',
    description: 'A work of art - consistently crispy and perfectly photogenic. Classic taste profile that never fails.',
    mapsUrl: 'https://maps.app.goo.gl/i6WawqEsHi4rwkue7',
    photoUrl: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '4',
    name: "Jayam's Tiffin",
    rank: 4,
    lat: 47.5955,
    lng: -122.1325,
    crispiness: 6,
    consistency: 8,
    taste: 6,
    address: '15546 Lake Hills Blvd, Bellevue, WA',
    description: 'Good, but not great. Keep coming back for the rest of the food which is excellent.',
    mapsUrl: 'https://maps.app.goo.gl/fzkuqBBXSUUaPKVu6',
    photoUrl: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '5',
    name: 'Dosa House',
    rank: 'warning',
    lat: 47.6285,
    lng: -122.1365,
    crispiness: 1,
    consistency: 1,
    taste: 1,
    address: '15259 NE Bel Red Rd, Bellevue, WA',
    description: "Their marketing team is really creative - they make deep fried pakodas and call them 'vadas'. Avoid if you want authentic texture.",
    mapsUrl: 'https://maps.app.goo.gl/awV2CEiDR6arxUjQ8',
    photoUrl: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  }
];

const createCustomIcon = (rank: number | 'warning', rating: number) => {
  const isWarning = rank === 'warning';
  let bgColor = '#10b981'; // emerald-500
  if (rating < 5) bgColor = '#f43f5e'; // rose-500
  else if (rating < 8) bgColor = '#f59e0b'; // amber-500
  
  return L.divIcon({
    className: 'custom-marker-solid',
    html: `<div style="background-color: ${bgColor}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: transform 0.2s;">${isWarning ? '!' : rank}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const getRatingColor = (rating: number) => {
  if (rating >= 8) return 'text-emerald-500';
  if (rating >= 5) return 'text-amber-500';
  return 'text-rose-500';
};

const MapController = ({ center, bounds }: { center?: [number, number], bounds?: L.LatLngBoundsExpression | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 12);
    }
  }, [center, map]);

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  
  return null;
};

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDark;
}

export default function App() {
  const [selectedPlace, setSelectedPlace] = useState<VadaPlace | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([47.60, -122.12]);
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isDarkMode = useDarkMode();
  const cardRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handlePlaceSelect = (place: VadaPlace) => {
    setSelectedPlace(place);
    setMapCenter([place.lat, place.lng]);
    setMapBounds(null); // Clear bounds when selecting a specific place
    setIsSidebarOpen(false);
  };

  const reframeMap = () => {
    const bounds = L.latLngBounds(VADA_DATA.map(p => [p.lat, p.lng]));
    setMapBounds(bounds);
    setSelectedPlace(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't close if clicking a marker, popup, or inside the card/sidebar
      if (
        selectedPlace &&
        cardRef.current && !cardRef.current.contains(target) &&
        (!sidebarRef.current || !sidebarRef.current.contains(target)) &&
        !target.closest('.leaflet-marker-icon') &&
        !target.closest('.leaflet-popup')
      ) {
        setSelectedPlace(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedPlace]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg)] text-[var(--ink)] relative">
      {/* Left Panel: Description & List (Sidebar) */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.div 
            ref={sidebarRef}
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed md:relative w-[85%] md:w-1/3 lg:w-1/4 h-full flex flex-col border-r border-black/5 dark:border-white/10 z-[2000] md:z-10 bg-[var(--panel-bg)] shadow-xl"
          >
            <div className="md:hidden absolute top-4 right-4">
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-black/40 dark:text-white/40">
                <X size={24} />
              </button>
            </div>
            <header className="p-8 border-b border-black/5 dark:border-white/10">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-serif italic font-bold tracking-tight text-[var(--ink)] mb-2"
              >
                Vada Quest
              </motion.h1>
              <p className="text-sm text-black/60 dark:text-white/60 font-medium uppercase tracking-wider">
                Seattle's Definitive Ranking
              </p>
              <div className="mt-6 text-sm leading-relaxed text-black/70 dark:text-white/70">
                A curated guide to the crispy, savory, and sometimes elusive world of South Indian vadas in the Emerald City. 
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8">
              <div className="space-y-2">
                {VADA_DATA.sort((a, b) => {
                  if (a.rank === 'warning') return 1;
                  if (b.rank === 'warning') return -1;
                  return (a.rank as number) - (b.rank as number);
                }).map((place) => (
                  <motion.button
                    key={place.id}
                    whileHover={{ x: 4 }}
                    onClick={() => handlePlaceSelect(place)}
                    className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-4 ${
                      selectedPlace?.id === place.id 
                        ? 'bg-[#1a1a1a] text-white dark:bg-white dark:text-black shadow-lg' 
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--ink)]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      place.rank === 'warning' 
                        ? 'bg-red-500 text-white' 
                        : selectedPlace?.id === place.id ? 'bg-[#e67e22] text-white' : 'bg-black/5 dark:bg-white/10 text-[var(--ink)]'
                    }`}>
                      {place.rank === 'warning' ? '!' : place.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold truncate text-sm">{place.name}</h3>
                        <div className={`flex items-center gap-0.5 shrink-0 ${getRatingColor((place.crispiness + place.consistency + place.taste) / 3)}`}>
                          <span className="text-[10px] font-bold">{((place.crispiness + place.consistency + place.taste) / 3).toFixed(1)}/10</span>
                        </div>
                      </div>
                      <p className={`text-xs truncate ${selectedPlace?.id === place.id ? 'text-white/60 dark:text-black/60' : 'text-black/40 dark:text-white/40'}`}>
                        {place.address}
                      </p>
                    </div>
                    <ChevronRight size={16} className={selectedPlace?.id === place.id ? 'text-white/40 dark:text-black/40' : 'text-black/20 dark:text-white/20'} />
                  </motion.button>
                ))}
              </div>
            </div>

            <footer className="p-6 border-t border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[10px] text-black/40 dark:text-white/40 uppercase tracking-widest text-center">
              Last Updated: March 2026 • Seattle, WA
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1500] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Right Panel: Map */}
      <div className="flex-1 relative h-full">
        <MapContainer 
          center={mapCenter} 
          zoom={11} 
          scrollWheelZoom={true}
          zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={isDarkMode 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            }
          />
          <MapController center={mapCenter} bounds={mapBounds} />
          {VADA_DATA.map((place) => (
            <Marker 
              key={place.id} 
              position={[place.lat, place.lng]} 
              icon={createCustomIcon(place.rank, (place.crispiness + place.consistency + place.taste) / 3)}
              eventHandlers={{
                click: () => setSelectedPlace(place),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <h4 className="font-bold text-sm">{place.name}</h4>
                  <p className="text-xs text-black/60 dark:text-white/60">{place.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Controls */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-[1000]">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden w-14 h-14 bg-[var(--panel-bg)] rounded-full shadow-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/5 dark:border-white/10"
            title="Show List"
          >
            <List size={28} className="text-[#e67e22]" />
          </button>
          <button 
            onClick={reframeMap}
            className="w-14 h-14 bg-[var(--panel-bg)] rounded-full shadow-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/5 dark:border-white/10"
            title="Reframe Map"
          >
            <MapPin size={28} className="text-[#e67e22]" />
          </button>
        </div>

        {/* Overlay Review Details / Bottom Drawer */}
        <AnimatePresence>
          {selectedPlace && (
            <motion.div
              ref={cardRef}
              initial={{ 
                opacity: 0, 
                x: window.innerWidth >= 768 ? 40 : 0, 
                y: window.innerWidth >= 768 ? 0 : 100 
              }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ 
                opacity: 0, 
                x: window.innerWidth >= 768 ? 40 : 0, 
                y: window.innerWidth >= 768 ? 0 : 100 
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed md:absolute bottom-0 md:bottom-auto md:top-8 left-0 md:left-auto right-0 md:right-8 w-full md:w-80 bg-[var(--panel-bg)]/95 backdrop-blur-md rounded-t-3xl md:rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 z-[2000] md:z-[1000] overflow-hidden"
            >
              <div className="p-6 md:p-6 pb-10 md:pb-6">
                <div className="md:hidden w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full mx-auto mb-6" />
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    selectedPlace.rank === 'warning' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-[#e67e22]/10 text-[#e67e22]'
                  }`}>
                    {selectedPlace.rank === 'warning' ? 'Warning' : `Rank #${selectedPlace.rank}`}
                  </div>
                  <div className={`flex items-center gap-1 ${getRatingColor((selectedPlace.crispiness + selectedPlace.consistency + selectedPlace.taste) / 3)}`}>
                    <span className="text-sm font-bold">{((selectedPlace.crispiness + selectedPlace.consistency + selectedPlace.taste) / 3).toFixed(1)}/10</span>
                  </div>
                  <button 
                    onClick={() => setSelectedPlace(null)}
                    className="text-black/20 dark:text-white/20 hover:text-black/60 dark:hover:text-white/60 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {selectedPlace.photoUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden h-32 w-full">
                    <img 
                      src={selectedPlace.photoUrl} 
                      alt={selectedPlace.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <h2 className="text-xl font-serif font-bold text-[var(--ink)] mb-1">{selectedPlace.name}</h2>
                <p className="text-xs text-black/40 dark:text-white/40 mb-6 flex items-center gap-1">
                  <MapPin size={12} /> {selectedPlace.address}
                </p>

                <div className="space-y-4 mb-8">
                  <ScoreRow label="Crispiness" score={selectedPlace.crispiness} />
                  <ScoreRow label="Consistency" score={selectedPlace.consistency} />
                  <ScoreRow label="Taste" score={selectedPlace.taste} />
                </div>

                <div className="mb-8">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/30 mb-2">The Verdict</h4>
                  <p className="text-sm text-black/70 dark:text-white/70 italic leading-relaxed">
                    "{selectedPlace.description}"
                  </p>
                </div>

                <a 
                  href={selectedPlace.mapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#1a1a1a] text-white dark:bg-white dark:text-black rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:bg-[#333] dark:hover:bg-gray-200 transition-colors"
                >
                  View on Google Maps <ExternalLink size={14} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ScoreRow({ label, score }: { label: string, score: number }) {
  const textColor = score >= 8 ? 'text-emerald-500' : score >= 5 ? 'text-amber-500' : 'text-rose-500';
  const bgColor = score >= 8 ? 'bg-emerald-500' : score >= 5 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-black/40 dark:text-white/40">{label}</span>
        <span className={textColor}>{score}/10</span>
      </div>
      <div className="h-1 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${bgColor}`}
        />
      </div>
    </div>
  );
}
