import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { animate, stagger, inView } from 'motion';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  ArrowRight,
  BadgeCheck,
  Binoculars,
  Camera,
  CarFront,
  ChevronRight,
  Flame,
  Gauge,
  MapPinned,
  Mountain,
  ShieldCheck,
  Sparkles,
  Star,
  Tent,
  Trees,
  Waves,
} from 'lucide-react';
import './styles.css';
import heroImage from './assets/hero-overland.jpg';

const campingSpots = [
  {
    name: 'Valle Encantado',
    zone: 'San Gerardo de Dota',
    coords: [-83.802, 9.571],
    rating: 4.8,
    access: '4x4 recomendado',
    climate: 'Frio de montaña',
    tags: ['Miradores', 'Senderos', 'Fogata'],
    detail:
      'Zona alta, noches frias, acceso con lastre y miradores naturales para amanecer.',
  },
  {
    name: 'Río Celeste Basecamp',
    zone: 'Guatuso',
    coords: [-84.988, 10.705],
    rating: 4.6,
    access: 'SUV o 4x4',
    climate: 'Humedo tropical',
    tags: ['Pozas', 'Catarata', 'Pet-friendly'],
    detail:
      'Camping cerca de bosque lluvioso con puntos de agua, cocina comunal y senderos.',
  },
  {
    name: 'Dunas del Pacifico',
    zone: 'Nicoya',
    coords: [-85.455, 10.137],
    rating: 4.5,
    access: '4x4 necesario en lluvia',
    climate: 'Calido seco',
    tags: ['Playa', 'MTB', 'Atardecer'],
    detail:
      'Ruta costera con arena compacta, espacios abiertos y noches ideales para toldo.',
  },
  {
    name: 'Bosque Nuboso Camp',
    zone: 'Monteverde',
    coords: [-84.825, 10.302],
    rating: 4.7,
    access: 'Lastre mixto',
    climate: 'Neblina y viento',
    tags: ['Aves', 'Hiking', 'Ranchos'],
    detail:
      'Ideal para familias y parejas que buscan bosque, fauna y servicios basicos cerca.',
  },
];

const reviewFields = [
  ['Clima', 'Temperatura real, viento, lluvia y mejor temporada para visitar.'],
  ['Acceso', 'Estado de ruta, necesidad de 4x4, puntos criticos y alternativas.'],
  ['Facilidades', 'Baños, letrinas, agua, luz, ranchos, mesas y cocina compartida.'],
  ['Atractivos', 'Pozas, rios, lagunas, cataratas, senderos, miradores y fauna.'],
  ['Ambiente', 'Familiar, parejas, grupos, pet-friendly y nivel de ruido.'],
  ['Preparacion', 'Checklist de equipo, comida, seguridad, fuego y rescate basico.'],
];

const gear = [
  {
    icon: <Tent size={22} />,
    title: 'Setup de campamento',
    copy: 'Tiendas, toldos, luces, cocina, cubiertos, mesas plegables y organizadores.',
  },
  {
    icon: <CarFront size={22} />,
    title: 'Accesorios 4x4',
    copy: 'Eslingas, compresores, planchas de rescate, racks, soportes y proteccion.',
  },
  {
    icon: <Flame size={22} />,
    title: 'Gadgets de marca',
    copy: 'Stickers, parches, pines, encendedores, linternas y drops funcionales.',
  },
];

const costaRicaMapStyle = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
};
function useReveal() {
  useEffect(() => {
    const stops = [];
    document.querySelectorAll('[data-reveal]').forEach((element) => {
      const stop = inView(
        element,
        () => {
          animate(
            element,
            { opacity: [0, 1], y: [22, 0], filter: ['blur(10px)', 'blur(0px)'] },
            { duration: 0.7, easing: [0.22, 1, 0.36, 1] },
          );
        },
        { margin: '-12% 0px -12% 0px' },
      );
      stops.push(stop);
    });

    const cards = document.querySelectorAll('[data-stagger] > *');
    if (cards.length) {
      const stop = inView('[data-stagger]', () => {
        animate(
          cards,
          { opacity: [0, 1], y: [18, 0] },
          { delay: stagger(0.08), duration: 0.55, easing: [0.22, 1, 0.36, 1] },
        );
      });
      stops.push(stop);
    }

    return () => stops.forEach((stop) => stop?.());
  }, []);
}

function Button({ children, className = '', variant = 'primary', ...props }) {
  return (
    <button className={`wm-button wm-button-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Badge({ children, tone = 'moss' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Placeholder({ label, tall = false }) {
  return (
    <div className={`image-holder ${tall ? 'image-holder-tall' : ''}`}>
      <Camera size={24} />
      <span>{label}</span>
    </div>
  );
}

function CampingMap({ selected, setSelected }) {
  const mapNode = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    if (!mapNode.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapNode.current,
      style: costaRicaMapStyle,
      center: [-84.09, 9.93],
      zoom: 6.4,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    campingSpots.forEach((spot, index) => {
      const markerEl = document.createElement('button');
      markerEl.className = 'map-marker';
      markerEl.type = 'button';
      markerEl.setAttribute('aria-label', `Ver ${spot.name}`);
      markerEl.innerHTML = `<span>${index + 1}</span>`;
      markerEl.addEventListener('click', () => setSelected(index));

      const marker = new maplibregl.Marker({ element: markerEl, anchor: 'center' })
        .setLngLat(spot.coords)
        .addTo(map.current);

      markers.current.push({ marker, markerEl });
    });

    return () => {
      markers.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, [setSelected]);

  useEffect(() => {
    markers.current.forEach(({ markerEl }, index) => {
      markerEl.classList.toggle('is-active', index === selected);
    });

    const spot = campingSpots[selected];
    if (map.current && spot) {
      map.current.flyTo({
        center: spot.coords,
        zoom: 8.2,
        speed: 0.7,
        curve: 1.4,
      });
    }
  }, [selected]);

  return <div className="map-canvas" ref={mapNode} aria-label="Mapa interactivo de zonas de camping" />;
}

function App() {
  const [selectedSpot, setSelectedSpot] = useState(0);
  const activeSpot = campingSpots[selectedSpot];
  const stats = useMemo(
    () => [
      ['42+', 'lugares por documentar'],
      ['4x4', 'rutas con nivel de acceso'],
      ['360', 'fotos, drone y guias visuales'],
    ],
    [],
  );

  useReveal();

  return (
    <main>
      <nav className="nav-shell">
        <a className="brand" href="#inicio" aria-label="Overland CR inicio">
          <span className="brand-mark">OCR</span>
          <span>Overland CR</span>
        </a>
        <div className="nav-links">
          <a href="#resenas">Reseñas</a>
          <a href="#mapa">Mapa</a>
          <a href="#equipo">Equipo</a>
          <a href="#marca">Marca</a>
        </div>
        <Button variant="ghost" className="nav-cta">
          Explorar <ChevronRight size={16} />
        </Button>
      </nav>

      <section id="inicio" className="hero" style={{ '--hero-image': `url(${heroImage})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <Badge tone="amber">
            <Mountain size={14} /> Costa Rica overlanding
          </Badge>
          <h1>Barro, camping y rutas 4x4.</h1>
          <p>
            Una plataforma para reseñar campings, ubicar rutas, comparar equipo y preparar
            salidas al aire libre con informacion clara para principiantes y expertos.
          </p>
          <div className="hero-actions">
            <Button>
              Ver lugares <ArrowRight size={18} />
            </Button>
            <Button variant="secondary">
              Subir reseña <Sparkles size={18} />
            </Button>
          </div>
        </div>
        <div className="hero-panel" data-reveal>
          <div className="panel-header">
            <span>Checklist de ruta</span>
            <Badge>Beta</Badge>
          </div>
          <div className="check-row">
            <ShieldCheck size={18} /> Acceso validado por temporada
          </div>
          <div className="check-row">
            <Gauge size={18} /> Nivel de 4x4 y puntos criticos
          </div>
          <div className="check-row">
            <Waves size={18} /> Agua, baños, pozas y fogata
          </div>
        </div>
      </section>

      <section className="stats-band" data-stagger>
        {stats.map(([value, label]) => (
          <div className="stat-card" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section id="resenas" className="section two-col">
        <div data-reveal>
          <Badge>
            <Tent size={14} /> Reseñas utiles
          </Badge>
          <h2>Mas que solo una plataforma, un estilo de vida.</h2>
          <p>
           Una comunidad unida, amantes por el 4x4 y el camping.
          </p>
          <div className="review-grid">
            {reviewFields.map(([title, copy]) => (
              <article className="mini-card" key={title}>
                <BadgeCheck size={18} />
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="feature-card" data-reveal>
          <Placeholder label="Holder: foto principal del camping" tall />
          <div className="feature-content">
            <span className="eyebrow">Ficha ejemplo</span>
            <h3>Camping con ficha tecnica, fotos y recomendaciones.</h3>
            <p>
              Espacio reservado para galeria, video de drone, estado de ruta, precio,
              contacto, Waze, Google Maps y consejos de seguridad.
            </p>
          </div>
        </div>
      </section>

      <section id="mapa" className="section map-section">
        <div className="section-head" data-reveal>
          <Badge tone="sky">
            <MapPinned size={14} /> Zonas de camping
          </Badge>
          <h2>Mapa interactivo para explorar spots.</h2>
          <p>
            La base esta lista para conectar puntos reales, rutas GPX, capas de dificultad,
            fotos de drone y enlaces directos a software de mapeo.
          </p>
        </div>
        <div className="map-layout">
          <CampingMap selected={selectedSpot} setSelected={setSelectedSpot} />
          <aside className="spot-panel" data-reveal>
            <span className="eyebrow">Spot seleccionado</span>
            <h3>{activeSpot.name}</h3>
            <p>{activeSpot.detail}</p>
            <div className="spot-meta">
              <span>
                <MapPinned size={15} /> {activeSpot.zone}
              </span>
              <span>
                <Star size={15} /> {activeSpot.rating}
              </span>
              <span>
                <CarFront size={15} /> {activeSpot.access}
              </span>
              <span>
                <Trees size={15} /> {activeSpot.climate}
              </span>
            </div>
            <div className="tag-row">
              {activeSpot.tags.map((tag) => (
                <Badge key={tag} tone="stone">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="spot-list">
              {campingSpots.map((spot, index) => (
                <button
                  className={index === selectedSpot ? 'spot-link is-active' : 'spot-link'}
                  key={spot.name}
                  onClick={() => setSelectedSpot(index)}
                >
                  <span>{index + 1}</span>
                  {spot.name}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="equipo" className="section">
        <div className="section-head" data-reveal>
          <Badge tone="amber">
            <CarFront size={14} /> Equipo y 4x4
          </Badge>
          <h2>Guias de accesorios con utilidad real.</h2>
          <p>
            Espacio para reviews de precios, puntos de venta, durabilidad, usos,
            comparativas y notas honestas para comprar con criterio.
          </p>
        </div>
        <div className="gear-grid" data-stagger>
          {gear.map((item) => (
            <article className="gear-card" key={item.title}>
              <div className="gear-icon">{item.icon}</div>
              <Placeholder label="Holder: producto o setup" />
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="marca" className="section brand-section">
        <div className="brand-copy" data-reveal>
          <Badge>
            <Flame size={14} /> Futuro merch
          </Badge>
          <h2>Una marca para quienes viven la ruta.</h2>
          <p>
            Drops pequeños, funcionales y con identidad: parches, calcomanias, luces,
            encendedores, cubiertos y accesorios con equilibrio entre calidad, economia y uso.
          </p>
          <Button variant="secondary">
            Ver roadmap <ArrowRight size={18} />
          </Button>
        </div>
        <div className="merch-wall" data-stagger>
          {['Parches', 'Stickers', 'Luces LED', 'Encendedores', 'Pines', 'Cubiertos'].map(
            (item) => (
              <div className="merch-tile" key={item}>
                <Binoculars size={18} />
                <span>{item}</span>
              </div>
            ),
          )}
        </div>
      </section>

      <footer>
        <div>
          <strong>Overland CR</strong>
          <p>Reseñas, rutas, equipo y comunidad para explorar Costa Rica al aire libre.</p>
        </div>
        <div className="footer-links">
          <a href="#resenas">Reseñas</a>
          <a href="#mapa">Mapa</a>
          <a href="#equipo">Equipo</a>
        </div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);



