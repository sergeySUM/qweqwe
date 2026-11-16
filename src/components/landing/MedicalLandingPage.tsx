import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import {
  ArrowRight,
  Lock,
  HeartPulse,
  ScanLine,
  FlaskConical,
  Stethoscope,
  Eye,
  Activity
} from 'lucide-react';

export interface SelectedServiceAd {
  id: string;
  title: string;
  category: string;
  priceLabel: string;
  specialtyName?: string;
}

interface MedicalLandingPageProps {
  onSelectServiceAd: (ad: SelectedServiceAd) => void;
  onGoToRegister: () => void;
  onGoToGoogleLogin: () => void;
}

interface ServiceAdItem {
  id: string;
  category: 'Diagnóstico' | 'Preventivo' | 'Consultorios';
  kicker: string;
  title: string;
  description: string;
  priceLabel: string;
  coverageNote: string;
  ctaLabel: string;
  image?: string;
  imageAlt?: string;
  featuredSpan?: boolean;
  specialtyName?: string;
  fallbackIcon: React.ReactNode;
}

const HERO_IMAGE = '/src/assets/images/hero_hospital_facade_1794518120710.jpg';

const SERVICE_ADS: ServiceAdItem[] = [
  {
    id: 'ad-cardio',
    category: 'Preventivo',
    kicker: 'Cardiología · Turno en 48 h · Requiere registro',
    title: 'Programa de Cardiología Preventiva y Ecodoppler Color',
    description:
      'Evaluación cardiovascular integral con electrocardiograma de 12 derivaciones, ecodoppler cardíaco y consulta presencial con staff de cardiología.',
    priceLabel: '$25.000',
    coverageNote: 'Cobertura 100% OSDE 310+ y Swiss Medical',
    ctaLabel: 'Solicitar con registro',
    image: '/src/assets/images/service_cardiology_1794518121250.jpg',
    imageAlt: 'Sala moderna de diagnóstico cardiológico y ecocardiograma en MediCore',
    featuredSpan: true,
    specialtyName: 'Cardiología',
    fallbackIcon: <HeartPulse className="w-8 h-8 text-cyan-700" />
  },
  {
    id: 'ad-mri',
    category: 'Diagnóstico',
    kicker: 'Diagnóstico por Imágenes · Informe en 24 h · Requiere registro',
    title: 'Resonancia Magnética 3T de Alta Definición',
    description:
      'Equipo de túnel amplio y baja sonoridad para estudios neurológicos, osteoarticulares y abdominales con acceso digital a placas e informe.',
    priceLabel: '$42.000',
    coverageNote: 'Orden médica y turno directo tras el registro',
    ctaLabel: 'Reservar estudio',
    image: '/src/assets/images/service_imaging_mri_1794518120796.jpg',
    imageAlt: 'Resonador magnético 3T en sala revestida en madera clara',
    featuredSpan: false,
    specialtyName: 'Neurología',
    fallbackIcon: <ScanLine className="w-8 h-8 text-cyan-700" />
  },
  {
    id: 'ad-lab',
    category: 'Preventivo',
    kicker: 'Laboratorio Clínico 24 h · Resultados online · Requiere registro',
    title: 'Chequeo Ejecutivo y Perfil Metabólico Completo',
    description:
      'Extracción sin espera, hemograma, perfil lipídico, glucemia, función renal y tiroidea con devolución clínica médica en el mismo portal.',
    priceLabel: '$18.000',
    coverageNote: 'Resultados descargables en PDF en menos de 24 h',
    ctaLabel: 'Agendar chequeo',
    image: '/src/assets/images/service_lab_checkup_1794518122789.jpg',
    imageAlt: 'Laboratorio clínico y estación de medicina preventiva',
    featuredSpan: false,
    specialtyName: 'Clínica Médica',
    fallbackIcon: <FlaskConical className="w-8 h-8 text-cyan-700" />
  },
  {
    id: 'ad-consult',
    category: 'Consultorios',
    kicker: 'Atención Ambulatoria · Receta Digital QR · Requiere registro',
    title: 'Consultorios de Pediatría, Clínica Médica y Especialidades',
    description:
      'Más de 7 especialidades médicas coordinadas bajo una única historia clínica digital. Emitimos recetas electrónicas y órdenes de estudio al instante.',
    priceLabel: 'Desde $18.000',
    coverageNote: 'Pediatría, Dermatología, Clínica Médica y Traumatología',
    ctaLabel: 'Elegir especialista',
    image: '/src/assets/images/service_pediatrics_care_1794518122564.jpg',
    imageAlt: 'Consultorio luminoso de atención clínica y pediátrica',
    featuredSpan: true,
    specialtyName: 'Pediatría',
    fallbackIcon: <Stethoscope className="w-8 h-8 text-cyan-700" />
  },
  {
    id: 'ad-ophthalmology',
    category: 'Consultorios',
    kicker: 'Oftalmología · Control visual completo · Requiere registro',
    title: 'Campaña de Salud Visual: Fondo de Ojo y Tonometría',
    description:
      'Detección temprana de glaucoma, evaluación de agudeza visual, refracción y emisión de receta óptica en una sola visita programada.',
    priceLabel: '$23.000',
    coverageNote: 'Turnos matutinos y vespertinos disponibles',
    ctaLabel: 'Solicitar control visual',
    featuredSpan: false,
    specialtyName: 'Oftalmología',
    fallbackIcon: <Eye className="w-8 h-8 text-cyan-700" />
  },
  {
    id: 'ad-trauma',
    category: 'Diagnóstico',
    kicker: 'Traumatología y Neurología · Junta Médica · Requiere registro',
    title: 'Evaluación Articular, Deportiva y Dolor Crónico',
    description:
      'Diagnóstico preciso de lesiones musculoesqueléticas, columna y cefaleas con derivación directa a kinesiología o estudios por imagen.',
    priceLabel: '$24.000',
    coverageNote: 'Atención prioritaria para socios registrados',
    ctaLabel: 'Consultar disponibilidad',
    featuredSpan: false,
    specialtyName: 'Traumatología y Ortopedia',
    fallbackIcon: <Activity className="w-8 h-8 text-cyan-700" />
  }
];

const TESTIMONIALS = [
  {
    name: 'Mariana Echeverría',
    context: 'Chequeo Cardiovascular Preventivo · OSDE 310',
    quote:
      'Necesitaba completar mi apto cardiológico antes de viajar y conseguí turno en 48 horas. Al registrarme descargué el ecodoppler y la receta digital sin volver a hacer fila en recepción.'
  },
  {
    name: 'Ing. Roberto Salvatierra',
    context: 'Resonancia Magnética 3T · Swiss Medical',
    quote:
      'El resonador amplio eliminó la sensación de encierro que sufría en otros centros. El informe radiológico apareció en mi historial en menos de un día y mi traumatólogo ya lo tenía en pantalla.'
  },
  {
    name: 'Carolina y Tomás Méndez',
    context: 'Control Pediátrico y Laboratorio · Galeno Oro',
    quote:
      'Centralizar las órdenes de laboratorio y las vacunas de nuestro hijo en una sola cuenta nos ahorró horas de trámites administrativos cada mes.'
  }
];

export const MedicalLandingPage: React.FC<MedicalLandingPageProps> = ({
  onSelectServiceAd,
  onGoToRegister,
  onGoToGoogleLogin
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | 'Diagnóstico' | 'Preventivo' | 'Consultorios'>('Todos');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const specialties = storageService.getSpecialties();
  const settings = storageService.getSettings();

  const resolveAdPriceLabel = (ad: ServiceAdItem): string => {
    if (ad.id === 'ad-mri') return ad.priceLabel;
    if (ad.id === 'ad-consult' && specialties.length > 0) {
      const minFee = Math.min(...specialties.map(s => s.baseFee));
      return `Desde $${minFee.toLocaleString('es-AR')}`;
    }
    if (ad.specialtyName) {
      const matched = specialties.find(
        s => s.name.toLowerCase() === ad.specialtyName!.toLowerCase()
      );
      if (matched) {
        return `$${matched.baseFee.toLocaleString('es-AR')}`;
      }
    }
    return ad.priceLabel;
  };

  const liveAds = SERVICE_ADS.map(ad => ({
    ...ad,
    priceLabel: resolveAdPriceLabel(ad)
  }));

  const filteredAds =
    selectedCategory === 'Todos'
      ? liveAds
      : liveAds.filter(ad => ad.category === selectedCategory);

  const handleAdTrigger = (ad: ServiceAdItem) => {
    onSelectServiceAd({
      id: ad.id,
      title: ad.title,
      category: ad.category,
      priceLabel: ad.priceLabel,
      specialtyName: ad.specialtyName
    });
  };

  const handleImageError = (id: string) => {
    setBrokenImages(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Bar Contract: 3 zones, gap-8, single-line controls */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#inicio"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-700 rounded-sm"
          >
            MediCore
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a
              href="#servicios"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Servicios
            </a>
            <a
              href="#especialidades"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Especialidades
            </a>
            <a
              href="#coberturas"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Coberturas
            </a>
            <a
              href="#testimonios"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Testimonios
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onGoToRegister}
              className="px-4 py-2 text-xs font-semibold text-white bg-cyan-800 hover:bg-cyan-900 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
            >
              Registrarme
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="inicio">
        {/* Hero Section: Asymmetric 2-column split with items-stretch */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Hero Copy */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6 py-2">
              <div className="space-y-5">
                <p className="text-xs font-medium text-cyan-800 tracking-wide">
                  Sanatorio Metropolitano · Turnos Online y Diagnóstico Clínico
                </p>

                <h1 className="text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-tight leading-[1.08] text-slate-900 text-balance">
                  Servicios médicos de alta precisión, sin esperas ni trámites presenciales.
                </h1>

                <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                  Explore nuestras campañas de chequeo cardiovascular, resonancia magnética 3T, laboratorio clínico 24 horas y consultorios médicos. Cree su cuenta de paciente en menos de un minuto para acceder a turnos, aranceles y resultados digitales.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleAdTrigger(SERVICE_ADS[0])}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-800 hover:bg-cyan-900 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
                  >
                    <span>Registrarme y Reservar Turno</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onGoToGoogleLogin}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-950 underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0 py-2"
                  >
                    Ya tengo cuenta registrada
                  </button>
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Para solicitar cualquier servicio promocionado o ver agendas médicas se requiere registro previo.</span>
                </p>
              </div>
            </div>

            {/* Hero Visual Carrier (16:9 / full height match) */}
            <div className="lg:col-span-6">
              <button
                type="button"
                onClick={() => handleAdTrigger(SERVICE_ADS[0])}
                className="group relative w-full h-72 sm:h-96 lg:h-full min-h-[340px] rounded-xl overflow-hidden border border-slate-200 bg-slate-200 text-left block cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
                aria-label="Campaña destacada de Chequeo Cardiovascular Integral - Requiere registro"
              >
                {!brokenImages['hero'] ? (
                  <img
                    src={HERO_IMAGE}
                    alt="Atrio principal del Sanatorio Metropolitano MediCore"
                    referrerPolicy="no-referrer"
                    onError={() => handleImageError('hero')}
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 via-cyan-900 to-slate-900 flex items-center justify-center p-8 text-white">
                    <span className="text-lg font-semibold">Sanatorio Metropolitano MediCore</span>
                  </div>
                )}

                {/* Measured contrast scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white space-y-1.5">
                  <div className="text-xs text-cyan-200 font-medium">
                    Campaña Destacada · Cardiología Preventiva · Requiere registro
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <p className="text-base sm:text-lg font-semibold leading-snug max-w-md">
                      Chequeo Cardiovascular Completo + Ecodoppler en 48 h
                    </p>
                    <span className="text-xs font-semibold text-white bg-cyan-700/90 group-hover:bg-cyan-600 px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors">
                      Acceder tras registro →
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Full-width 4-column quantified proof strip below hero split */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-white p-5">
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">18.400+</div>
              <div className="text-xs text-slate-600 mt-1">Estudios diagnósticos entregados en 2025</div>
            </div>
            <div className="bg-white p-5">
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">&lt; 24 h</div>
              <div className="text-xs text-slate-600 mt-1">Entrega digital de informes y análisis</div>
            </div>
            <div className="bg-white p-5">
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">48</div>
              <div className="text-xs text-slate-600 mt-1">Médicos especialistas de planta certificada</div>
            </div>
            <div className="bg-white p-5">
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">100%</div>
              <div className="text-xs text-slate-600 mt-1">Recetas QR y órdenes descargables en portal</div>
            </div>
          </div>
        </section>

        {/* Medical Service Ads Section (Asymmetric Bento Grid) */}
        <section id="servicios" className="border-t border-slate-200 bg-white py-14 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs font-medium text-cyan-800">
                  01. Servicios Médicos Promocionados
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                  Anuncios de prestaciones clínicas y campañas vigentes
                </h2>
                <p className="text-sm text-slate-600">
                  Seleccione cualquiera de las prestaciones anunciadas para iniciar su registro de paciente y habilitar la reserva inmediata del servicio.
                </p>
              </div>

              {/* Interactive Category Filter Control */}
              <div
                className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start md:self-auto"
                role="tablist"
                aria-label="Filtrar anuncios por categoría médica"
              >
                {(['Todos', 'Preventivo', 'Diagnóstico', 'Consultorios'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Bento Grid of Clickable Medical Service Ads */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAds.map(ad => {
                const isWide = selectedCategory === 'Todos' && ad.featuredSpan;
                return (
                  <button
                    key={ad.id}
                    type="button"
                    onClick={() => handleAdTrigger(ad)}
                    className={`group text-left bg-slate-50 hover:bg-white border border-slate-200 hover:border-cyan-700/60 rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 ${
                      isWide ? 'lg:col-span-2' : 'lg:col-span-1'
                    }`}
                  >
                    <div className={isWide ? 'grid grid-cols-1 sm:grid-cols-12 h-full' : 'flex flex-col h-full'}>
                      {/* Media slot if ad includes photography */}
                      {ad.image && (
                        <div
                          className={`relative overflow-hidden bg-slate-200 ${
                            isWide ? 'sm:col-span-5 h-52 sm:h-full min-h-[220px]' : 'h-48 w-full'
                          }`}
                        >
                          {!brokenImages[ad.id] ? (
                            <img
                              src={ad.image}
                              alt={ad.imageAlt || ad.title}
                              referrerPolicy="no-referrer"
                              onError={() => handleImageError(ad.id)}
                              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-cyan-50 flex flex-col items-center justify-center p-4 gap-2">
                              {ad.fallbackIcon}
                              <span className="text-xs font-medium text-slate-700 text-center">{ad.specialtyName}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ad Content Body */}
                      <div className={`p-6 flex flex-col justify-between gap-5 ${isWide && ad.image ? 'sm:col-span-7' : 'flex-1'}`}>
                        <div className="space-y-2.5">
                          <div className="text-xs text-slate-500">
                            {ad.kicker}
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-900 transition-colors leading-snug">
                            {ad.title}
                          </h3>

                          <p className="text-sm text-slate-600 leading-relaxed">
                            {ad.description}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between gap-4">
                          <div>
                            <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                              {ad.priceLabel}
                            </div>
                            <div className="text-xs text-slate-500">
                              {ad.coverageNote}
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 group-hover:bg-cyan-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0">
                            <span>{ad.ctaLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Specialties Directory Section (Live from hospital catalog, all clickable to register) */}
        <section id="especialidades" className="border-t border-slate-200 bg-slate-50 py-14 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs font-medium text-cyan-800">
                  02. Cartilla de Especialidades Médicas
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                  Turnos programados con arancel base transparente
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Haga clic en cualquier especialidad para registrarse y ver horarios disponibles.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden">
              {specialties.map(esp => (
                <button
                  key={esp.id}
                  type="button"
                  onClick={() =>
                    onSelectServiceAd({
                      id: `esp-${esp.id}`,
                      title: `Consulta de ${esp.name}`,
                      category: 'Consultorios',
                      priceLabel: `$${esp.baseFee.toLocaleString('es-AR')}`,
                      specialtyName: esp.name
                    })
                  }
                  className="w-full px-6 py-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left cursor-pointer group focus-visible:outline-2 focus-visible:outline-cyan-700"
                >
                  <div className="space-y-0.5 max-w-2xl">
                    <div className="text-sm font-semibold text-slate-900 group-hover:text-cyan-800 transition-colors">
                      {esp.name}
                    </div>
                    <div className="text-xs text-slate-600">
                      {esp.description}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                        ${esp.baseFee.toLocaleString('es-AR')}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Arancel particular base
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-cyan-800 group-hover:text-cyan-900 whitespace-nowrap shrink-0 flex items-center gap-1">
                      <span>Registrarme</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Insurances & Proof Testimonials (Adjacent Claim-to-Proof) */}
        <section id="coberturas" className="border-t border-slate-200 bg-white py-14 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Accepted Insurances */}
            <div className="space-y-6">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs font-medium text-cyan-800">
                  03. Obras Sociales y Prepagas Adheridas
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                  Validación inmediata de su cobertura al registrarse
                </h2>
                <p className="text-sm text-slate-600">
                  Trabajamos con las principales coberturas médicas del país con descuento automático en consulta y estudios.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {settings.insurances
                  .filter(ins => ins.active)
                  .map(ins => {
                    const coveragePercent = Math.max(0, 100 - ins.copayPercentage);
                    return (
                      <button
                        key={ins.id}
                        type="button"
                        onClick={() =>
                          onSelectServiceAd({
                            id: `ins-${ins.id}`,
                            title: `Atención con cobertura ${ins.name}`,
                            category: 'Cobertura',
                            priceLabel: `${coveragePercent}% cobertura`
                          })
                        }
                        className="p-5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-cyan-700/60 rounded-xl text-left transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-cyan-700"
                      >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-cyan-900">
                          {ins.name}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 font-mono tabular-nums">
                          Cobertura {coveragePercent}% · Requiere alta
                        </div>
                        <div className="text-xs font-semibold text-cyan-800 mt-3 inline-flex items-center gap-1">
                          <span>Validar con registro</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Patient Testimonials */}
            <div id="testimonios" className="pt-8 border-t border-slate-200 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-cyan-800">
                  04. Experiencia de Pacientes Registrados
                </p>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  Atención clínica respaldada por tiempos medibles
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TESTIMONIALS.map(item => (
                  <blockquote
                    key={item.name}
                    className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between gap-4"
                  >
                    <p className="text-sm text-slate-700 leading-relaxed">
                      “{item.quote}”
                    </p>
                    <footer className="pt-3 border-t border-slate-200/80">
                      <div className="text-xs font-bold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.context}</div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final Conversion Section */}
        <section className="border-t border-slate-200 bg-slate-900 text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
                Habilite su historia clínica digital y reserve cualquier servicio en línea.
              </h2>
              <p className="text-sm text-slate-300">
                El registro de paciente es gratuito, protege sus datos médicos bajo la Ley 25.326 y le otorga acceso inmediato a turnos, recetas y resultados.
              </p>
            </div>

            <button
              type="button"
              onClick={onGoToRegister}
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            >
              <span>Ir a la Página de Registro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="space-y-1">
            <span className="font-bold text-slate-900 text-sm block">MediCore Sanatorio Metropolitano</span>
            <span>Av. del Libertador 4820 · Protección de Datos Personales Ley 25.326</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#servicios" className="hover:text-slate-900 transition-colors">Servicios</a>
            <a href="#especialidades" className="hover:text-slate-900 transition-colors">Especialidades</a>
            <a href="#coberturas" className="hover:text-slate-900 transition-colors">Coberturas</a>
            <button
              type="button"
              onClick={onGoToRegister}
              className="font-semibold text-cyan-800 hover:text-cyan-950 cursor-pointer"
            >
              Registrarme
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
