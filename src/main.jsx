import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { animate, inView, stagger } from 'motion';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bot,
  Camera,
  CarFront,
  Check,
  ChevronRight,
  Download,
  Flame,
  Gauge,
  MapPinned,
  Menu,
  MessageSquare,
  Mountain,
  PackageCheck,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Tent,
  Trees,
  Trophy,
  Waves,
  WifiOff,
  X,
} from 'lucide-react';
import './styles.css';
import heroImage from './assets/hero-overland.jpg';

const campingSpots = [
  {
    id: 'valle-encantado',
    name: 'Valle Encantado',
    zone: 'San Gerardo de Dota',
    coords: [-83.802, 9.571],
    score: 88,
    rating: 4.8,
    access: '4x4 recomendado',
    accessLevel: 3,
    climate: 'Frío de montaña',
    tags: ['Miradores', 'Senderos', 'Fogata', 'Familiar'],
    detail: 'Zona alta, noches frías, acceso con lastre y miradores naturales para amanecer.',
    amenities: ['Baños', 'Agua', 'Ranchos', 'Mesas', 'Fogata'],
    activities: ['Hiking', 'Avistamiento de aves', 'Picnic', 'Fotografía'],
    needs: ['Abrigo', 'Estacas fuertes', 'Café', 'Botiquín'],
    conditions: { Acceso: 8, Limpieza: 9, Seguridad: 8, Servicios: 7, Paisaje: 10, Señal: 5 },
    offline: ['Mapa', 'Coordenadas', 'Ruta', 'Teléfonos', 'Fotos de acceso'],
  },
  {
    id: 'rio-celeste-basecamp',
    name: 'Río Celeste Basecamp',
    zone: 'Guatuso, Alajuela',
    coords: [-84.988, 10.705],
    score: 87,
    rating: 4.7,
    access: 'SUV o 4x4',
    accessLevel: 3,
    climate: 'Húmedo tropical',
    tags: ['Pozas', 'Catarata', 'Pet-friendly', 'Río'],
    detail: 'Camping cerca de bosque lluvioso con puntos de agua, cocina comunal y senderos.',
    amenities: ['Duchas', 'Baños', 'Agua potable', 'Cocina comunal', 'Río'],
    activities: ['Pozas', 'Senderismo', 'Caminata nocturna', 'Aves'],
    needs: ['Repelente', 'Tarp', 'Bolsa seca', 'Zapatos con agarre'],
    conditions: { Acceso: 7, Limpieza: 9, Seguridad: 8, Servicios: 8, Paisaje: 10, Señal: 4 },
    offline: ['Mapa offline', 'Coordenadas', 'Ruta', 'Contactos', 'Checklist lluvia'],
  },
  {
    id: 'dunas-pacifico',
    name: 'Dunas del Pacífico',
    zone: 'Nicoya, Guanacaste',
    coords: [-85.455, 10.137],
    score: 82,
    rating: 4.5,
    access: '4x4 necesario en lluvia',
    accessLevel: 4,
    climate: 'Cálido seco',
    tags: ['Playa', 'MTB', 'Atardecer', 'Ruta 4x4'],
    detail: 'Ruta costera con arena compacta, espacios abiertos y noches ideales para toldo.',
    amenities: ['Playa', 'Fogata controlada', 'Mirador', 'Sin baños'],
    activities: ['MTB', 'Pesca', 'Ruta 4x4', 'Atardecer'],
    needs: ['Compresor', 'Pala', 'Agua extra', 'Protección solar'],
    conditions: { Acceso: 6, Limpieza: 7, Seguridad: 7, Servicios: 3, Paisaje: 10, Señal: 6 },
    offline: ['Ruta GPX', 'Puntos de agua', 'Talleres cercanos', 'Coordenadas'],
  },
  {
    id: 'bosque-nuboso-camp',
    name: 'Bosque Nuboso Camp',
    zone: 'Monteverde, Puntarenas',
    coords: [-84.825, 10.302],
    score: 91,
    rating: 4.9,
    access: 'AWD recomendado',
    accessLevel: 2,
    climate: 'Neblina y viento',
    tags: ['Aves', 'Hiking', 'Ranchos', 'Parejas'],
    detail: 'Ideal para familias y parejas que buscan bosque, fauna y servicios básicos cerca.',
    amenities: ['Ranchos', 'Mesas', 'Agua', 'Baños', 'Mirador'],
    activities: ['Hiking', 'Fotografía', 'Fogata', 'Avistamiento de aves'],
    needs: ['Capa', 'Abrigo', 'Linterna', 'Batería externa'],
    conditions: { Acceso: 7, Limpieza: 9, Seguridad: 9, Servicios: 7, Paisaje: 10, Señal: 6 },
    offline: ['Coordenadas', 'Instrucciones', 'Clima', 'Teléfonos'],
  },
];

const reviewFields = [
  ['Clima', 'Temperatura real, viento, lluvia, humedad y mejor temporada para visitar.'],
  ['Acceso', 'Estado de ruta, necesidad de 4x4, puntos críticos, barro, piedra y alternativas.'],
  ['Facilidades', 'Baños, letrinas, agua, luz, ranchos, mesas, techos y cocina compartida.'],
  ['Atractivos', 'Pozas, ríos, lagunas, cataratas, senderos, miradores y fauna.'],
  ['Ambiente', 'Familiar, parejas, grupos, pet-friendly, privacidad y nivel de ruido.'],
  ['Preparación', 'Checklist de equipo, comida, seguridad, fuego y rescate básico.'],
];

const accessLevels = [
  ['Nivel 1', 'Fácil', 'Cualquier automóvil.'],
  ['Nivel 2', 'Moderado', 'SUV o AWD recomendado.'],
  ['Nivel 3', 'Off-road', '4x4 recomendado.'],
  ['Nivel 4', 'Técnico', '4x4 necesario, compresor y recuperación.'],
  ['Nivel 5', 'Extremo', 'Vehículos preparados y experiencia.'],
];

const mapCategories = ['Campings', 'Fincas privadas', 'Playas', 'Montañas', 'Ríos', 'Miradores', 'Gasolineras', 'Talleres', 'Puntos de agua', 'Tiendas 4x4'];
const gear = [
  { icon: Tent, title: 'Setup de campamento', copy: 'Tiendas, toldos, luces, cocina, cubiertos, mesas plegables y organizadores.', price: '₡25k - ₡150k' },
  { icon: CarFront, title: 'Accesorios 4x4', copy: 'Eslingas, compresores, planchas de rescate, racks, soportes y protección.', price: '₡35k - ₡220k' },
  { icon: Flame, title: 'Gadgets de marca', copy: 'Stickers, parches, pines, encendedores, linternas y drops funcionales.', price: '₡3k - ₡35k' },
];
const communityUpdates = [
  ['Camino revisado hace 12 días en Río Celeste Basecamp', 'Barro moderado en los últimos 2 km.', Route],
  ['Sin señal desde el km 8 hacia Valle Encantado', 'Descargar mapa y contactos offline.', WifiOff],
  ['Arena suave después de lluvia en Dunas del Pacífico', 'Bajar presión y llevar pala.', Gauge],
  ['Nueva galería de acceso en Bosque Nuboso Camp', 'Fotos de camino, rancho y mirador.', Camera],
];
const learnTopics = [
  ['Camping 101', 'Carpa, cocina, lluvia, sueño cómodo y orden básico del campamento.'],
  ['Supervivencia', 'Agua, orientación, botiquín, energía, fuego responsable y fauna.'],
  ['Overlanding 4x4', 'Presión de llantas, recuperación, cruce de agua y lectura de terreno.'],
  ['Cocina de ruta', 'Menús simples, conservación, limpieza y fogatas seguras.'],
  ['Mapas offline', 'Coordenadas, rutas GPX, puntos críticos y enlaces a Waze/Maps.'],
  ['Ética de exploración', 'Explora más, deja menos: basura, ruido, privacidad y lugares sensibles.'],
];
const shopDrops = [
  ['Fire Starter BASE', 'Accesorio', '₡6.900'],
  ['Mini luz para tienda', 'Camping', '₡8.500'],
  ['Paracord 10m', 'Emergencia', '₡5.200'],
  ['Spot Patch Río Celeste', 'Colección', '₡4.500'],
  ['Sticker pack barro', 'Merch', '₡3.000'],
  ['Mosquetón marcado', 'Utilitario', '₡4.200'],
];
const proFeatures = ['Perfil verificado', 'Ficha destacada', 'Reservas y contacto', 'Galería premium', 'Anuncios por zona', 'Estadísticas de visitas', 'Sello de confianza', 'Campañas con marcas'];

const pageLinks = [
  ['mapa', 'Mapa'],
  ['fichas', 'Fichas'],
  ['comunidad', 'Comunidad'],
  ['equipo', 'Equipo'],
  ['aprende', 'Aprende'],
  ['tienda', 'Tienda'],
  ['visita', 'Solicitar visita'],
];

const costaRicaMapStyle = {
  version: 8,
  sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '&copy; OpenStreetMap contributors' } },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

function getInitialPage() {
  const value = window.location.hash.replace(/^#\/?/, '');
  return pageLinks.some(([id]) => id === value) ? value : 'home';
}

function useReveal(routeKey) {
  useEffect(() => {
    const stops = [];
    document.querySelectorAll('[data-reveal]').forEach((element) => {
      const stop = inView(element, () => {
        animate(element, { opacity: [0, 1], y: [26, 0], filter: ['blur(10px)', 'blur(0px)'] }, { duration: 0.72, easing: [0.22, 1, 0.36, 1] });
      }, { margin: '-12% 0px -12% 0px' });
      stops.push(stop);
    });
    document.querySelectorAll('[data-stagger]').forEach((group) => {
      const children = group.querySelectorAll(':scope > *');
      const stop = inView(group, () => {
        animate(children, { opacity: [0, 1], y: [22, 0] }, { delay: stagger(0.07), duration: 0.58, easing: [0.22, 1, 0.36, 1] });
      });
      stops.push(stop);
    });
    return () => stops.forEach((stop) => stop?.());
  }, [routeKey]);
}

function Button({ children, className = '', variant = 'primary', ...props }) {
  return <button className={`wm-button wm-button-${variant} ${className}`} {...props}>{children}</button>;
}
function Badge({ children, tone = 'moss' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
function Placeholder({ label, tall = false }) {
  return <div className={`image-holder ${tall ? 'image-holder-tall' : ''}`}><Camera size={24} /><span>{label}</span></div>;
}
function ScoreBar({ label, value }) {
  return <div className="score-row"><span>{label}</span><i><b style={{ width: `${value * 10}%` }} /></i><strong>{value}/10</strong></div>;
}

function CampingMap({ selected, setSelected, spots }) {
  const mapNode = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    if (!mapNode.current || map.current) return;
    map.current = new maplibregl.Map({ container: mapNode.current, style: costaRicaMapStyle, center: [-84.09, 9.93], zoom: 6.4, attributionControl: false });
    map.current.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    return () => {
      markers.current.forEach(({ marker }) => marker.remove());
      markers.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    markers.current.forEach(({ marker }) => marker.remove());
    markers.current = spots.map((spot, index) => {
      const markerEl = document.createElement('button');
      markerEl.className = 'map-marker';
      markerEl.type = 'button';
      markerEl.setAttribute('aria-label', `Ver ${spot.name}`);
      markerEl.innerHTML = `<span>${spot.score}</span>`;
      markerEl.addEventListener('click', () => setSelected(index));
      const marker = new maplibregl.Marker({ element: markerEl, anchor: 'center' }).setLngLat(spot.coords).addTo(map.current);
      return { marker, markerEl };
    });
  }, [setSelected, spots]);

  useEffect(() => {
    markers.current.forEach(({ markerEl }, index) => markerEl.classList.toggle('is-active', index === selected));
    const spot = spots[selected];
    if (map.current && spot) map.current.flyTo({ center: spot.coords, zoom: 8.15, speed: 0.72, curve: 1.4 });
  }, [selected, spots]);

  return <div className="map-canvas" ref={mapNode} aria-label="Mapa interactivo de zonas de camping" />;
}

function AiAssistant() {
  const [days, setDays] = useState(3);
  const [weather, setWeather] = useState('lluvia');
  const [vehicle, setVehicle] = useState('4x4');
  const list = useMemo(() => {
    const base = ['Carpa impermeable', 'Sleeping bag', 'Cocina', 'Agua', 'Botiquín', 'Linterna'];
    if (weather === 'lluvia') base.push('Tarp', 'Bolsa seca', 'Ropa de cambio');
    if (vehicle === '4x4') base.push('Compresor', 'Eslinga', 'Guantes');
    if (Number(days) >= 3) base.push('Power bank', 'Comida extra');
    return base.slice(0, 10);
  }, [days, weather, vehicle]);

  return (
    <div className="assistant-card" data-reveal>
      <div className="assistant-controls">
        <label>Días<input min="1" max="10" type="number" value={days} onChange={(event) => setDays(event.target.value)} /></label>
        <label>Clima<select value={weather} onChange={(event) => setWeather(event.target.value)}><option value="lluvia">Lluvioso</option><option value="seco">Seco</option><option value="frio">Frío</option></select></label>
        <label>Vehículo<select value={vehicle} onChange={(event) => setVehicle(event.target.value)}><option value="4x4">4x4</option><option value="awd">AWD</option><option value="auto">Auto</option></select></label>
      </div>
      <div className="assistant-list">{list.map((item) => <span key={item}><Check size={15} /> {item}</span>)}</div>
    </div>
  );
}

function Nav({ page, setPage, menuOpen, setMenuOpen }) {
  const go = (nextPage) => {
    window.location.hash = nextPage === 'home' ? '/' : `/${nextPage}`;
    setPage(nextPage);
    setMenuOpen(false);
  };
  return (
    <nav className="nav-shell">
      <button className="brand brand-button" onClick={() => go('home')} aria-label="Overland CR inicio">
        <span className="brand-mark">OCR</span>
        <span>Overland CR</span>
      </button>
      <div className="nav-links">
        {pageLinks.map(([id, label]) => <button className={page === id ? 'is-active' : ''} key={id} onClick={() => go(id)}>{label}</button>)}
      </div>
      <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Abrir menú">
        {menuOpen ? <X size={19} /> : <Menu size={19} />}
      </button>
      {menuOpen && (
        <div className="nav-drawer">
          <button onClick={() => go('home')}>Inicio<ChevronRight size={15} /></button>
          {pageLinks.map(([id, label]) => <button key={id} onClick={() => go(id)}>{label}<ChevronRight size={15} /></button>)}
        </div>
      )}
    </nav>
  );
}

function HomePage({ setPage }) {
  const stats = [['42+', 'lugares por documentar'], ['5', 'niveles de acceso'], ['360', 'fotos, drone y guías visuales']];
  const pageCards = [
    ['mapa', MapPinned, 'Buscar lugares', 'Campings, fincas, ríos, miradores y servicios para planear la ruta.'],
    ['fichas', SlidersIcon, 'Revisar un spot', 'Acceso, clima, servicios, atractivos y qué llevar antes de salir.'],
    ['comunidad', MessageSquare, 'Ver reportes', 'Notas recientes del camino, fotos de acceso y cambios de temporada.'],
    ['visita', Store, 'Publicar mi camping', 'Mandanos la información y coordinamos una visita al lugar.'],
  ];

  return (
    <>
      <section id="inicio" className="hero" style={{ '--hero-image': `url(${heroImage})` }}>
        <div className="hero-overlay" />
        <div className="hero-content" data-reveal>
          <Badge tone="amber"><Mountain size={14} /> Costa Rica overlanding</Badge>
          <h1>Barro, camping y rutas 4x4.</h1>
          <p>Mas que una plataforma, con Base descubre lugares, preparar salidas, documentar rutas y conectar campings con una comunidad que vive la aventura al aire libre.</p>
          <div className="hero-actions">
            <Button onClick={() => setPage('mapa')}>Ver lugares <ArrowRight size={18} /></Button>
            <Button variant="secondary" onClick={() => setPage('visita')}>Quiero que visiten mi camping <Sparkles size={18} /></Button>
          </div>
        </div>
        <div className="hero-panel" data-reveal>
          <div className="panel-header"><span>Checklist de ruta</span><Badge>Beta</Badge></div>
          <div className="check-row"><ShieldCheck size={18} /> Acceso validado por temporada</div>
          <div className="check-row"><Gauge size={18} /> Nivel de 4x4 y puntos críticos</div>
          <div className="check-row"><Waves size={18} /> Agua, baños, pozas y fogata</div>
          <div className="check-row"><WifiOff size={18} /> Paquete offline antes de salir</div>
        </div>
        <button className="scroll-cue" onClick={() => document.getElementById('resenas')?.scrollIntoView({ behavior: 'smooth' })}>Explorar</button>
      </section>

      <section className="stats-band" data-stagger>{stats.map(([value, label]) => <div className="stat-card" key={label}><strong>{value}</strong><span>{label}</span></div>)}</section>

      <section id="resenas" className="section two-col review-blocks">
        <div className="review-copy-block" data-reveal>
          <Badge><Tent size={14} /> Reseñas útiles</Badge>
          <h2>Más que solo una plataforma, un estilo de vida.</h2>
          <p>Un lugar donde puedes encontrar todo lo que necesitas desde tu primer aventura hasta experiencias desafiantes, Base es una comunidad unida, amantes por el offroad, 4x4 y el camping.</p>
          <div className="review-grid" data-stagger>{reviewFields.map(([title, copy]) => <article className="mini-card" key={title}><BadgeCheck size={18} /><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </div>
        <div className="feature-card" data-reveal>
          <Placeholder label="Holder: foto principal del camping" tall />
          <div className="feature-content"><span className="eyebrow">Ficha ejemplo</span><h3>Camping con ficha técnica, fotos y recomendaciones.</h3><p>La información completa vive en páginas internas: mapa, fichas, comunidad, equipo, aprendizaje, tienda y solicitud de visita.</p></div>
        </div>
      </section>

      <section className="section page-cards-section">
        <div className="section-head" data-reveal>
          <Badge tone="sky"><CompassIcon /> Explorá BASE</Badge>
          <h2>Escogé por dónde querés empezar.</h2>
          <p>Buscá lugares, revisá detalles antes de salir o contanos sobre tu camping para que podamos visitarlo y documentarlo.</p>
        </div>
        <div className="page-card-grid" data-stagger>
          {pageCards.map(([id, Icon, title, copy]) => <button className="page-card" key={id} onClick={() => setPage(id)}><Icon size={22} /><h3>{title}</h3><p>{copy}</p><ChevronRight size={18} /></button>)}
        </div>
      </section>

      <VisitTeaser setPage={setPage} />
    </>
  );
}

function SlidersIcon() { return <Gauge size={22} />; }
function CompassIcon() { return <MapPinned size={14} />; }

function PageHero({ badge, title, copy, icon: Icon }) {
  return (
    <section className="page-hero" style={{ '--hero-image': `url(${heroImage})` }}>
      <div className="hero-overlay" />
      <div data-reveal>
        <Badge tone="amber">{Icon && <Icon size={14} />} {badge}</Badge>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
    </section>
  );
}

function MapPage(props) {
  const { query, setQuery, displaySpots, displaySelectedIndex, selectDisplaySpot, activeSpot, selectedSpot, setSelectedSpot } = props;
  return (
    <>
      <PageHero icon={MapPinned} badge="Mapa vivo" title="Zonas de camping, rutas y servicios." copy="Un mapa dedicado para explorar spots, filtrar por datos reales y abrir la ficha del lugar sin cargar todo el home." />
      <section className="section map-section page-section-flat">
        <label className="search-box" data-reveal><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar camping, ruta, clima o acceso" /></label>
        <div className="map-layout">
          <CampingMap selected={displaySelectedIndex} setSelected={selectDisplaySpot} spots={displaySpots} />
          <SpotPanel activeSpot={activeSpot} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} />
        </div>
        <div className="category-strip" data-stagger>{mapCategories.map((item) => <span key={item}>{item}</span>)}</div>
      </section>
    </>
  );
}

function SpotPanel({ activeSpot, selectedSpot, setSelectedSpot }) {
  return (
    <aside className="spot-panel" data-reveal>
      <span className="eyebrow">Spot seleccionado</span>
      <div className="spot-title"><h3>{activeSpot.name}</h3><strong>{activeSpot.score}</strong></div>
      <p>{activeSpot.detail}</p>
      <div className="spot-meta"><span><MapPinned size={15} /> {activeSpot.zone}</span><span><Star size={15} /> {activeSpot.rating}</span><span><CarFront size={15} /> {activeSpot.access}</span><span><Trees size={15} /> {activeSpot.climate}</span></div>
      <div className="tag-row">{activeSpot.tags.map((tag) => <Badge key={tag} tone="stone">{tag}</Badge>)}</div>
      <div className="spot-list">{campingSpots.map((spot, index) => <button className={index === selectedSpot ? 'spot-link is-active' : 'spot-link'} key={spot.name} onClick={() => setSelectedSpot(index)}><span>{index + 1}</span>{spot.name}</button>)}</div>
    </aside>
  );
}

function FichasPage({ activeSpot }) {
  return (
    <>
      <PageHero icon={SlidersIcon} badge="Ficha técnica" title="Cada spot con datos para decidir." copy="El detalle de camping se separa del home para mostrar condiciones, offline, preparación y nivel 4x4 con más claridad." />
      <section className="section">
        <div className="detail-grid">
          <article className="detail-card" data-reveal><Placeholder label="Holder: galería del spot / drone" /><h3>{activeSpot.name}</h3><p>{activeSpot.detail}</p><div className="tag-row">{activeSpot.amenities.map((item) => <Badge tone="stone" key={item}>{item}</Badge>)}</div></article>
          <article className="detail-card" data-reveal><h3>Condiciones reales</h3>{Object.entries(activeSpot.conditions).map(([label, value]) => <ScoreBar key={label} label={label} value={value} />)}</article>
          <article className="detail-card" data-reveal><h3>Paquete offline</h3><div className="check-list">{activeSpot.offline.map((item) => <span key={item}><Download size={15} /> {item}</span>)}</div><h3>Para ir preparado</h3><div className="check-list">{activeSpot.needs.map((item) => <span key={item}><Check size={15} /> {item}</span>)}</div></article>
        </div>
        <div className="access-grid" data-stagger>{accessLevels.map(([level, label, copy]) => <article className={activeSpot.accessLevel === Number(level.split(' ')[1]) ? 'access-card is-current' : 'access-card'} key={level}><strong>{level}</strong><h3>{label}</h3><p>{copy}</p></article>)}</div>
      </section>
    </>
  );
}

function CommunityPage() {
  return <><PageHero icon={MessageSquare} badge="Comunidad" title="Reportes del camino por gente que sí fue." copy="Un espacio dedicado para check-ins, fotos, rutas favoritas y actualizaciones recientes." /><section className="section community-section"><div className="updates-grid" data-stagger>{communityUpdates.map(([title, copy, Icon]) => <article className="update-card" key={title}><Icon size={21} /><h3>{title}</h3><p>{copy}</p></article>)}</div></section></>;
}

function GearPage() {
  return <><PageHero icon={PackageCheck} badge="Equipo y 4x4" title="Guías de accesorios con utilidad real." copy="Reviews de precios, puntos de venta, durabilidad, usos, comparativas y notas honestas para comprar con criterio." /><section className="section"><div className="gear-grid" data-stagger>{gear.map(({ icon: Icon, title, copy, price }) => <article className="gear-card" key={title}><div className="gear-icon"><Icon size={22} /></div><Placeholder label="Holder: producto o setup" /><h3>{title}</h3><p>{copy}</p><strong>{price}</strong></article>)}</div></section></>;
}

function LearnPage() {
  return <><PageHero icon={Bot} badge="Aprende + AI Camp Assistant" title="Preparación guiada para cada salida." copy="Módulos de aprendizaje y un asistente de checklist según clima, vehículo y duración." /><section className="section learn-section"><AiAssistant /><div className="learn-grid" data-stagger>{learnTopics.map(([title, copy]) => <article className="learn-card" key={title}><BookOpen size={20} /><h3>{title}</h3><p>{copy}</p><Placeholder label="Holder: video corto / guía visual" /></article>)}</div></section></>;
}

function ShopPage() {
  return <><PageHero icon={Store} badge="BASE Shop" title="Una marca para quienes viven la ruta." copy="Drops pequeños, funcionales y con identidad para campismo, 4x4 y comunidad." /><section className="section brand-section"><div className="brand-copy" data-reveal><Badge><Store size={14} /> Merch y accesorios</Badge><h2>Calidad, funcionalidad y economía.</h2><p>Parches, calcomanías, luces, encendedores, cubiertos y accesorios útiles con identidad BASE.</p></div><div className="shop-grid" data-stagger>{shopDrops.map(([name, type, price]) => <article className="shop-card" key={name}><Placeholder label="Holder: producto / merch" /><Badge tone="stone">{type}</Badge><h3>{name}</h3><strong>{price}</strong></article>)}</div></section></>;
}

function VisitTeaser({ setPage }) {
  return <section className="section visit-section"><div className="visit-card" data-reveal><Badge tone="amber"><Trophy size={14} /> Para campings y negocios</Badge><h2>¿Querés que visitemos tu camping?</h2><p>Dejá la información de tu lugar y armamos una ficha con acceso, fotos, servicios, atractivos y recomendaciones para publicarlo con confianza.</p><div className="visit-steps"><span><MapPinned size={16} /> Visitamos y ubicamos el lugar</span><span><Camera size={16} /> Fotos, video y holders para drone</span><span><Gauge size={16} /> Nivel de acceso y tipo de vehículo</span><span><Store size={16} /> Ficha publicada para recibir visitas</span></div><Button onClick={() => setPage('visita')}>Solicitar visita <ArrowRight size={18} /></Button></div><div className="privacy-card" data-reveal><MapPinned size={24} /><h3>Fuera del mapa</h3><p>Sabemos que los mejores lugares estan ocultos fuera del mapa, hagamos que esten al alcance de todos con Base.</p></div></section>;
}

function VisitPage() {
  return (
    <>
      <PageHero icon={Trophy} badge="Solicitar visita" title="Queremos conocer tu camping." copy="Esta página está pensada para que dueños de campings, fincas y experiencias nos pasen la información necesaria para valorar una visita." />
      <section className="section visit-section">
        <div className="visit-card" data-reveal>
          <Badge tone="amber"><Trophy size={14} /> Para campings y negocios</Badge>
          <h2>¿Querés que visitemos tu camping?</h2>
          <p>BASE puede ir al lugar, documentar la experiencia, revisar el acceso, tomar fotos, levantar la ficha técnica y publicar el spot para que más overlanders lo encuentren con confianza.</p>
          <div className="pro-features">{proFeatures.map((item) => <span key={item}><Check size={15} /> {item}</span>)}</div>
        </div>
        <LeadForm />
      </section>
    </>
  );
}

function LeadForm() {
  return <form className="lead-form" data-reveal onSubmit={(event) => event.preventDefault()}><div><Badge tone="sky"><MessageSquare size={14} /> Solicitar visita</Badge><h3>Contanos sobre tu lugar</h3><p>Con esta información se puede valorar la visita, preparar la ficha y definir si conviene una publicación verificada o una campaña destacada.</p></div><div className="form-grid"><label>Nombre del camping o finca<input placeholder="Ej. Finca Río Azul" /></label><label>Zona / provincia<input placeholder="Ej. Turrialba, Cartago" /></label><label>Contacto<input placeholder="WhatsApp o correo" /></label><label>Tipo de acceso<select defaultValue=""><option value="" disabled>Seleccionar</option><option>Automóvil</option><option>SUV / AWD</option><option>4x4 recomendado</option><option>4x4 necesario</option></select></label><label>Facilidades<input placeholder="Baños, agua, duchas, electricidad..." /></label><label>Atractivos<input placeholder="Río, pozas, mirador, senderos..." /></label></div><label className="wide-field">Qué querés que documentemos<textarea placeholder="Contanos qué hace especial el lugar, precios, reglas, horarios, si aceptan mascotas y qué servicios querés destacar." /></label><Button>Enviar información <ArrowRight size={18} /></Button></form>;
}

function Footer({ setPage }) {
  return <footer><div><strong>Overland CR</strong><p>Reseñas, rutas, equipo y comunidad para explorar Costa Rica al aire libre.</p></div><div className="footer-links"><button onClick={() => setPage('fichas')}>Fichas</button><button onClick={() => setPage('mapa')}>Mapa</button><button onClick={() => setPage('visita')}>Solicitar visita</button></div></footer>;
}

function App() {
  const [page, setPageState] = useState(getInitialPage);
  const [selectedSpot, setSelectedSpot] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const activeSpot = campingSpots[selectedSpot];
  const spots = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return campingSpots;
    return campingSpots.filter((spot) => [spot.name, spot.zone, spot.access, spot.climate, ...spot.tags].join(' ').toLowerCase().includes(term));
  }, [query]);
  const displaySpots = spots.length ? spots : campingSpots;
  const displaySelectedIndex = Math.max(0, displaySpots.findIndex((spot) => spot.id === activeSpot.id));
  const selectDisplaySpot = useCallback((index) => {
    const spot = displaySpots[index];
    const originalIndex = campingSpots.findIndex((item) => item.id === spot?.id);
    if (originalIndex >= 0) setSelectedSpot(originalIndex);
  }, [displaySpots]);

  const setPage = useCallback((nextPage) => {
    window.location.hash = nextPage === 'home' ? '/' : `/${nextPage}`;
    setPageState(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onHash = () => setPageState(getInitialPage());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  useReveal(page);

  const pageProps = { query, setQuery, displaySpots, displaySelectedIndex, selectDisplaySpot, activeSpot, selectedSpot, setSelectedSpot };
  const content = {
    home: <HomePage setPage={setPage} />,
    mapa: <MapPage {...pageProps} />,
    fichas: <FichasPage activeSpot={activeSpot} />,
    comunidad: <CommunityPage />,
    equipo: <GearPage />,
    aprende: <LearnPage />,
    tienda: <ShopPage />,
    visita: <VisitPage />,
  }[page] || <HomePage setPage={setPage} />;

  return <main><Nav page={page} setPage={setPage} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />{content}<Footer setPage={setPage} /></main>;
}

createRoot(document.getElementById('root')).render(<App />);

