import {
  User, Company, EventBrief, Package, DJ, DJPayout, DJAvailability, DJDefaultAvailability,
  DJApplication, Proposal, ProposalDJ, Booking, ClientQuestionnaire, EventOffer, Message,
  Review, AdminNote, Document, RunSheet, CallbackRequest, AuditLog, Role
} from './types';

// In-memory store used for demo mode and local development.
// This is a quick reference implementation; connect a real Supabase project for production.

const now = () => new Date().toISOString();

const store: {
  users: User[];
  companies: Company[];
  eventBriefs: EventBrief[];
  packages: Package[];
  djs: DJ[];
  djPayouts: DJPayout[];
  djDefaultAvailability: DJDefaultAvailability[];
  djAvailability: DJAvailability[];
  djApplications: DJApplication[];
  proposals: Proposal[];
  proposalDjs: ProposalDJ[];
  bookings: Booking[];
  questionnaires: ClientQuestionnaire[];
  eventOffers: EventOffer[];
  messages: Message[];
  reviews: Review[];
  adminNotes: AdminNote[];
  documents: Document[];
  runSheets: RunSheet[];
  callbackRequests: CallbackRequest[];
  auditLogs: AuditLog[];
} = {
  users: [],
  companies: [],
  eventBriefs: [],
  packages: [],
  djs: [],
  djPayouts: [],
  djDefaultAvailability: [],
  djAvailability: [],
  djApplications: [],
  proposals: [],
  proposalDjs: [],
  bookings: [],
  questionnaires: [],
  eventOffers: [],
  messages: [],
  reviews: [],
  adminNotes: [],
  documents: [],
  runSheets: [],
  callbackRequests: [],
  auditLogs: [],
};

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function ensureSeed() {
  if (store.packages.length > 0) return;
  seed();
}

function seed() {
  store.packages = [
    {
      id: 'pkg-kompakt',
      name: 'Kompakt Firmafest',
      slug: 'kompakt-firmafest',
      description: 'Professionel DJ, kompakt lyd, grundlæggende dansebelysning, op- og nedpakning, 4 timer musik.',
      best_for: 'Mindre firmaevents op til cirka 80 gæster',
      price_from: 8900,
      price_to: 11900,
      vat_note: 'Priser vises ekskl. moms. Transport og særlige tekniske behov beregnes tydeligt før bekræftelse.',
      guest_min: 0,
      guest_max: 80,
      hours_included: '4 timer',
      sound_included: true,
      lighting_included: true,
      microphone_included: false,
      setup_teardown_included: true,
      technical_coordination_included: false,
      backup_level: 'standard',
      recommended_guest_range: '0-80',
      active: true,
      display_order: 1,
      created_at: now(),
    },
    {
      id: 'pkg-dinner',
      name: 'Dinner & Party',
      slug: 'dinner-party',
      description: 'DJ, middags- og baggrundsmusik, dansegulvssæt, professionel lyd, dansebelysning, trådløs mikrofon til taler, op- og nedpakning, 5 timer musik.',
      best_for: 'De fleste firmafester, julefrokoster, sommerfester og personalemiddage fra 80 til 150 gæster',
      price_from: 13900,
      price_to: 18900,
      vat_note: 'Priser vises ekskl. moms. Transport og særlige tekniske behov beregnes tydeligt før bekræftelse.',
      guest_min: 80,
      guest_max: 150,
      hours_included: '5 timer',
      sound_included: true,
      lighting_included: true,
      microphone_included: true,
      setup_teardown_included: true,
      technical_coordination_included: true,
      backup_level: 'extended',
      recommended_guest_range: '80-150',
      active: true,
      display_order: 2,
      created_at: now(),
    },
    {
      id: 'pkg-stor',
      name: 'Stor Firmafest',
      slug: 'stor-firmafest',
      description: 'Senior firma-DJ, større lydsæt, opgraderet belysning, trådløs mikrofon, teknisk koordinering, backup-planlægning, op- og nedpakning, 5-6 timer musik.',
      best_for: 'Større firmaevents fra 150 til 200 gæster',
      price_from: 18900,
      price_to: 24900,
      vat_note: 'Priser vises ekskl. moms. Transport og særlige tekniske behov beregnes tydeligt før bekræftelse.',
      guest_min: 150,
      guest_max: 200,
      hours_included: '5-6 timer',
      sound_included: true,
      lighting_included: true,
      microphone_included: true,
      setup_teardown_included: true,
      technical_coordination_included: true,
      backup_level: 'premium',
      recommended_guest_range: '150-200',
      active: true,
      display_order: 3,
      created_at: now(),
    },
    {
      id: 'pkg-custom',
      name: 'Custom / Enterprise',
      slug: 'custom-enterprise',
      description: 'Skræddersyet løsning til events over 200 gæster, store venue, udendørs events, flere rum, konferencer, messer, produktlanceringer eller særlige tekniske behov.',
      best_for: 'Events over 200 gæster, store venue, udendørs, multi-rum',
      price_from: 25000,
      price_to: undefined,
      vat_note: 'Priser vises ekskl. moms. Transport og særlige tekniske behov beregnes tydeligt før bekræftelse.',
      guest_min: 200,
      guest_max: 9999,
      hours_included: 'Aftales',
      sound_included: true,
      lighting_included: true,
      microphone_included: true,
      setup_teardown_included: true,
      technical_coordination_included: true,
      backup_level: 'premium',
      recommended_guest_range: '200+',
      active: true,
      display_order: 4,
      created_at: now(),
    },
  ];

  store.users = [
    { id: 'user-client', email: 'client@firmadj.demo', role: 'client', name: 'Laura Jensen', phone: '20123456', created_at: now() },
    { id: 'user-dj', email: 'dj@firmadj.demo', role: 'dj', name: 'Mikkel Rasmussen', phone: '20234567', created_at: now() },
    { id: 'user-admin', email: 'admin@firmadj.demo', role: 'admin', name: 'Admin FirmaDJ', phone: '20345678', created_at: now() },
  ];

  store.companies = [
    { id: 'company-1', name: 'Nordisk Demo ApS', cvr: '12345678', invoice_email: 'regning@nordiskdemo.demo', created_by: 'user-client', created_at: now() },
  ];

  store.djs = [
    {
      id: 'dj-mikkel',
      user_id: 'user-dj',
      stage_name: 'DJ Mikkel',
      public_display_name: 'DJ Mikkel',
      legal_name: 'Mikkel Rasmussen',
      email: 'dj@firmadj.demo',
      phone: '20234567',
      city: 'København',
      regions: ['København / Sjælland', 'Hele Danmark / andet'],
      bio_short: 'Erfaren firma-DJ med styr på overgangen fra middag til dansegulv.',
      bio_long: 'Jeg har spillet til mere end 150 firmafester og julefrokoster i København og på Sjælland. Styrken er at læse dansegulvet og holde energien oppe uden at presse publikum.',
      corporate_experience_years: 8,
      languages: ['Dansk', 'Engelsk'],
      vibe_tags: ['Bred firmafest for alle aldre', 'Elegant middag først, fest senere', 'Disco, funk og 80’er/90’er'],
      specialties: ['stærk til middag-til-dansegulv overgang', 'mikrofon og taler', 'internationalt publikum'],
      sample_mix_url: 'https://example.com/mikkel-mix',
      photo_url: '/dj-photos/mikkel.png',
      equipment_sound: 'Kompakt professionelt Pioneer/EV-system',
      equipment_lighting: 'LED-pakke til dansegulv',
      can_handle_speeches: true,
      can_provide_mc: true,
      can_deliver_80: true,
      can_deliver_150: true,
      can_deliver_200: true,
      transport_radius_km: 200,
      setup_time_minutes: 90,
      setup_area_description: '3x2 meter og strøm indenfor 10 meter',
      roster_layer: 'core',
      status: 'approved',
      profile_quality_score: 92,
      profile_completeness_score: 95,
      reliability_score: 96,
      availability_freshness_score: 98,
      last_availability_update: now(),
      approved_for_shortlist: true,
      created_at: now(),
    },
    {
      id: 'dj-maja',
      stage_name: 'Maja K.',
      public_display_name: 'Maja K.',
      legal_name: 'Maja Kristensen',
      email: 'maja@firmadj.demo',
      phone: '20456789',
      city: 'Aarhus',
      regions: ['Aarhus / Østjylland', 'Hele Danmark / andet'],
      bio_short: 'Julefrokost- og sommerfest-specialist med fokus på fællessang og klassikere.',
      bio_long: 'Jeg elsker at spille til danske firmafester, hvor gæsterne spænder bredt i alder. Repertoiret går fra 70’er til nutid og tilpasses stemningen.',
      corporate_experience_years: 6,
      languages: ['Dansk', 'Engelsk'],
      vibe_tags: ['Julefrokost med singalong og klassikere', 'Bred firmafest for alle aldre', 'Disco, funk og 80’er/90’er'],
      specialties: ['fællessang og klassikere', 'sommerfest stemning', 'bølgende dansegulv'],
      sample_mix_url: 'https://example.com/maja-mix',
      photo_url: '/dj-photos/maja.png',
      equipment_sound: 'Fuldt QSC/JBL lydanlæg',
      equipment_lighting: 'LED-beam og wash-pakke',
      can_handle_speeches: true,
      can_provide_mc: true,
      can_deliver_80: true,
      can_deliver_150: true,
      can_deliver_200: false,
      transport_radius_km: 120,
      setup_time_minutes: 75,
      setup_area_description: '2,5x2 meter og strøm i nærheden',
      roster_layer: 'core',
      status: 'approved',
      profile_quality_score: 90,
      profile_completeness_score: 88,
      reliability_score: 94,
      availability_freshness_score: 90,
      last_availability_update: now(),
      approved_for_shortlist: true,
      created_at: now(),
    },
    {
      id: 'dj-oliver',
      stage_name: 'DJ Oliver',
      public_display_name: 'DJ Oliver',
      legal_name: 'Oliver Sørensen',
      email: 'oliver@firmadj.demo',
      phone: '20567890',
      city: 'Odense',
      regions: ['Fyn', 'Hele Danmark / andet'],
      bio_short: 'Dynamisk DJ med kant til højtenergisk dansegulv og moderne pop/dance.',
      bio_long: 'Jeg leverer høj energi og kender de nyeste hitlister. God til større firmafester, kick-offs og produktlanceringer, hvor dansegulvet skal fyldes.',
      corporate_experience_years: 5,
      languages: ['Dansk', 'Engelsk'],
      vibe_tags: ['Moderne dance/pop', 'High-energy dansegulv', 'Internationalt publikum'],
      specialties: ['moderne dance og pop', 'kick-off energi', 'store venue'],
      sample_mix_url: 'https://example.com/oliver-mix',
      photo_url: '/dj-photos/oliver.png',
      equipment_sound: 'Stort aktivt lydsystem til 200+ gæster',
      equipment_lighting: 'Moving heads og LED-wall',
      can_handle_speeches: true,
      can_provide_mc: false,
      can_deliver_80: true,
      can_deliver_150: true,
      can_deliver_200: true,
      transport_radius_km: 300,
      setup_time_minutes: 120,
      setup_area_description: '4x3 meter og teknikrum i nærheden',
      roster_layer: 'extended',
      status: 'approved',
      profile_quality_score: 88,
      profile_completeness_score: 90,
      reliability_score: 90,
      availability_freshness_score: 85,
      last_availability_update: now(),
      approved_for_shortlist: true,
      created_at: now(),
    },
    {
      id: 'dj-sofie',
      stage_name: 'Sofie V.',
      public_display_name: 'Sofie V.',
      legal_name: 'Sofie Vestergaard',
      email: 'sofie@firmadj.demo',
      phone: '20678901',
      city: 'Aalborg',
      regions: ['Aalborg / Nordjylland', 'Hele Danmark / andet'],
      bio_short: 'Stilfuld DJ med øre for elegant middag og sjælfuld fest.',
      bio_long: 'Jeg skaber den rigtige lyd til middagen og tager gæsterne med videre ud på dansegulvet. Stilfuldt, tilpas friskt og altid professionelt.',
      corporate_experience_years: 7,
      languages: ['Dansk', 'Engelsk'],
      vibe_tags: ['Elegant middag først, fest senere', 'Rolig lounge og baggrund', 'Bred firmafest for alle aldre'],
      specialties: ['elegant middag', 'lounge stemning', 'smooth overgange'],
      sample_mix_url: 'https://example.com/sofie-mix',
      photo_url: '/dj-photos/sofie.png',
      equipment_sound: 'Kompakt kvalitetslyd til 100 gæster',
      equipment_lighting: 'Subtil LED-lyspakke',
      can_handle_speeches: true,
      can_provide_mc: true,
      can_deliver_80: true,
      can_deliver_150: true,
      can_deliver_200: false,
      transport_radius_km: 150,
      setup_time_minutes: 60,
      setup_area_description: '2x2 meter, strøm i nærheden',
      roster_layer: 'core',
      status: 'approved',
      profile_quality_score: 89,
      profile_completeness_score: 87,
      reliability_score: 93,
      availability_freshness_score: 92,
      last_availability_update: now(),
      approved_for_shortlist: true,
      created_at: now(),
    },
    {
      id: 'dj-jonas',
      stage_name: 'DJ Jonas',
      public_display_name: 'DJ Jonas',
      legal_name: 'Jonas Lindberg',
      email: 'jonas@firmadj.demo',
      phone: '20789012',
      city: 'København',
      regions: ['København / Sjælland'],
      bio_short: 'Alle aldre, alle genrer – DJ Jonas får dansegulvet til at boble.',
      bio_long: 'Med et bredt repertoire og erfaring fra hundredvis af events skaber jeg den rigtige stemning fra middag til sidste dans.',
      corporate_experience_years: 10,
      languages: ['Dansk', 'Engelsk'],
      vibe_tags: ['Bred firmafest for alle aldre', 'High-energy dansegulv', 'Disco, funk og 80’er/90’er'],
      specialties: ['bredt repertoire', 'store firmaevents', 'høj energi'],
      sample_mix_url: 'https://example.com/jonas-mix',
      photo_url: '/dj-photos/jonas.png',
      equipment_sound: 'Professionelt Pioneer/EV system',
      equipment_lighting: 'LED-pakke med dansegulvseffekter',
      can_handle_speeches: true,
      can_provide_mc: true,
      can_deliver_80: true,
      can_deliver_150: true,
      can_deliver_200: true,
      transport_radius_km: 100,
      setup_time_minutes: 90,
      setup_area_description: '3x2 meter, strøm i nærheden',
      roster_layer: 'core',
      status: 'approved',
      profile_quality_score: 91,
      profile_completeness_score: 92,
      reliability_score: 95,
      availability_freshness_score: 80,
      last_availability_update: now(),
      approved_for_shortlist: true,
      created_at: now(),
    },
    {
      id: 'dj-nora',
      stage_name: 'Nora DJ',
      public_display_name: 'Nora DJ',
      legal_name: 'Nora Holm',
      email: 'nora@firmadj.demo',
      phone: '20890123',
      city: 'Aarhus',
      regions: ['Aarhus / Østjylland'],
      bio_short: 'Energisk og lydhør DJ med flair for fællesskab og 90’er hits.',
      bio_long: 'Jeg elsker at spille til arrangementer, hvor gæsterne vil danse og synge med. Jeg planlægger overgange, så middag og fest hænger naturligt sammen.',
      corporate_experience_years: 4,
      languages: ['Dansk', 'Engelsk'],
      vibe_tags: ['Disco, funk og 80’er/90’er', 'Moderne dance/pop', 'High-energy dansegulv'],
      specialties: ['90’er og 00’er hits', 'hurtige overgange', 'interaktive sange'],
      sample_mix_url: 'https://example.com/nora-mix',
      photo_url: '/dj-photos/nora.png',
      equipment_sound: 'Kompakt kvalitetslyd til 120 gæster',
      equipment_lighting: 'LED-wash og diskolys',
      can_handle_speeches: true,
      can_provide_mc: false,
      can_deliver_80: true,
      can_deliver_150: true,
      can_deliver_200: false,
      transport_radius_km: 80,
      setup_time_minutes: 60,
      setup_area_description: '2x2 meter og strøm',
      roster_layer: 'extended',
      status: 'approved',
      profile_quality_score: 86,
      profile_completeness_score: 84,
      reliability_score: 91,
      availability_freshness_score: 95,
      last_availability_update: now(),
      approved_for_shortlist: true,
      created_at: now(),
    },
  ];

  store.djDefaultAvailability = store.djs.map((dj) => {
    return ['thursday', 'friday', 'saturday'].map((weekday) => ({
      id: uuid(),
      dj_id: dj.id,
      weekday: weekday as 'thursday' | 'friday' | 'saturday',
      default_status: (weekday === 'friday' || weekday === 'saturday' ? 'available' : 'unavailable') as 'available' | 'unavailable',
      updated_at: now(),
    }));
  }).flat();

  const upcomingDates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12];
  store.djAvailability = [];
  upcomingDates.forEach((weeks) => {
    const base = new Date();
    base.setDate(base.getDate() + weeks * 7);
    [4, 5, 6].forEach((weekday) => {
      const d = new Date(base);
      d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7));
      const dateStr = d.toISOString().split('T')[0];
      const weekDayName = weekday === 4 ? 'thursday' : weekday === 5 ? 'friday' : 'saturday';
      store.djs.forEach((dj) => {
        if (Math.random() > 0.3) {
          store.djAvailability.push({
            id: uuid(),
            dj_id: dj.id,
            date: dateStr,
            weekday: weekDayName,
            status: Math.random() > 0.85 ? 'tentative' : 'available',
            notes: '',
            is_override: false,
            updated_at: now(),
          });
        }
      });
    });
  });

  store.reviews = [
    { id: uuid(), dj_id: 'dj-mikkel', event_type: 'Julefrokost', reviewer_label: 'HR Manager, SaaS-virksomhed i København', rating: 5, quote: 'Professionel fra start til slut. Dansegulvet var fyldt hele aftenen.', approved: true, created_at: now() },
    { id: uuid(), dj_id: 'dj-mikkel', event_type: 'Sommerfest', reviewer_label: 'Office Manager, konsulenthus i Aarhus', rating: 5, quote: 'Perfekt overgang fra middag til fest. Kunne ikke være gået nemmere.', approved: true, created_at: now() },
    { id: uuid(), dj_id: 'dj-maja', event_type: 'Julefrokost', reviewer_label: 'Eventudvalg, produktionsvirksomhed på Fyn', rating: 5, quote: 'Maja fik alle med – fra juniorkonsulenter til direktøren.', approved: true, created_at: now() },
    { id: uuid(), dj_id: 'dj-oliver', event_type: 'Firmafest', reviewer_label: 'Founder, tech-virksomhed i Odense', rating: 5, quote: 'Høj energi, præcis timing og imponerende lyd.', approved: true, created_at: now() },
    { id: uuid(), dj_id: 'dj-sofie', event_type: 'Middag og efterfest', reviewer_label: 'Office Manager, detailkæde i Aalborg', rating: 5, quote: 'Elegant og stilfuldt. Gæsterne spurgte, hvor vi fandt hende.', approved: true, created_at: now() },
    { id: uuid(), dj_id: 'dj-jonas', event_type: 'Jubilæum', reviewer_label: 'Kommunikationschef, finansvirksomhed i København', rating: 5, quote: 'Jonas ramte lige i stemningen for både unge og erfarne.', approved: true, created_at: now() },
    { id: uuid(), dj_id: 'dj-nora', event_type: 'Kick-off', reviewer_label: 'HR Manager, e-commerce firma i Aarhus', rating: 5, quote: 'Nora fik energien op fra første track. Fantastisk aften.', approved: true, created_at: now() },
  ];

  const briefs: EventBrief[] = [
    {
      id: 'brief-julefrokost',
      company_id: 'company-1',
      contact_name: 'Laura Jensen',
      contact_email: 'client@firmadj.demo',
      contact_phone: '20123456',
      company_name: 'Nordisk Demo ApS',
      role: 'Office Manager',
      event_type: 'Julefrokost',
      event_date: addDays(28),
      date_flexibility: 'Fast dato',
      start_time: '18:00',
      end_time: '02:00',
      city: 'København',
      region: 'København / Sjælland',
      venue_name: 'Demo Venue København',
      venue_status: 'Vi har booket venue',
      guest_count_range: '80 to 150',
      needs_sound: 'Ja',
      needs_lighting: 'Ja',
      needs_microphone: 'Ja',
      needs_dinner_music: 'Ja',
      needs_venue_coordination: 'Ja',
      music_vibe_tags: ['Julefrokost med singalong og klassikere', 'Bred firmafest for alle aldre'],
      must_play: 'Wham! - Last Christmas',
      do_not_play: 'Hård techno',
      language_preference: 'Dansk',
      budget_band: '12.000 to 18.000 DKK',
      success_description: 'At middagen føles professionel, at dansegulvet kommer i gang efter talerne, og at musikken passer til alle aldre.',
      status: 'confirmed',
      created_at: now(),
    },
    {
      id: 'brief-sommerfest',
      company_id: 'company-1',
      contact_name: 'Laura Jensen',
      contact_email: 'client@firmadj.demo',
      contact_phone: '20123456',
      company_name: 'Nordisk Demo ApS',
      role: 'Office Manager',
      event_type: 'Sommerfest',
      event_date: addDays(56),
      date_flexibility: 'Fast dato',
      start_time: '16:00',
      end_time: '23:00',
      city: 'Aarhus',
      region: 'Aarhus / Østjylland',
      venue_name: 'Demo Venue Aarhus',
      venue_status: 'Vi har booket venue',
      guest_count_range: '80 to 150',
      needs_sound: 'Ja',
      needs_lighting: 'Ja',
      needs_microphone: 'Nej',
      needs_dinner_music: 'Nej',
      needs_venue_coordination: 'Ja',
      music_vibe_tags: ['Bred firmafest for alle aldre', 'Disco, funk og 80’er/90’er'],
      must_play: 'Katy Perry - Firework',
      do_not_play: 'Tunge ballader',
      language_preference: 'Dansk',
      budget_band: '12.000 to 18.000 DKK',
      success_description: 'At alle har det sjovt, at udendørsområdet også har god lyd, og at festen kører uden stop.',
      status: 'provisional_hold',
      created_at: now(),
    },
    {
      id: 'brief-stor',
      company_id: 'company-1',
      contact_name: 'Laura Jensen',
      contact_email: 'client@firmadj.demo',
      contact_phone: '20123456',
      company_name: 'Nordisk Demo ApS',
      role: 'Office Manager',
      event_type: 'Firmafest',
      event_date: addDays(42),
      date_flexibility: 'Fast dato',
      start_time: '18:00',
      end_time: '01:00',
      city: 'Odense',
      region: 'Fyn',
      venue_name: 'Demo Venue Odense',
      venue_status: 'Vi har booket venue',
      guest_count_range: '150 to 200',
      needs_sound: 'Ja',
      needs_lighting: 'Ja',
      needs_microphone: 'Ja',
      needs_dinner_music: 'Ja',
      needs_venue_coordination: 'Ja',
      music_vibe_tags: ['Bred firmafest for alle aldre', 'Moderne dance/pop'],
      must_play: 'Abba - Dancing Queen',
      do_not_play: 'Hård rock',
      language_preference: 'Begge',
      budget_band: '18.000 to 25.000 DKK',
      success_description: 'At 180 kolleger danser sammen, at talerne kører smurt, og at lydsættet dækker hele lokalet.',
      status: 'proposal_created',
      created_at: now(),
    },
    {
      id: 'brief-custom',
      company_id: 'company-1',
      contact_name: 'Laura Jensen',
      contact_email: 'client@firmadj.demo',
      contact_phone: '20123456',
      company_name: 'Nordisk Demo ApS',
      role: 'Office Manager',
      event_type: 'Reception',
      event_date: addDays(90),
      date_flexibility: 'Muligvis fleksibel',
      start_time: '17:00',
      end_time: '24:00',
      city: 'København',
      region: 'København / Sjælland',
      venue_name: 'Stort venue',
      venue_status: 'Vi er tæt på at booke venue',
      guest_count_range: '200+',
      needs_sound: 'Ja',
      needs_lighting: 'Ja',
      needs_microphone: 'Ja',
      needs_dinner_music: 'Ja',
      needs_venue_coordination: 'Ja',
      music_vibe_tags: ['Moderne dance/pop', 'Internationalt publikum'],
      must_play: 'Dua Lipa - Levitating',
      do_not_play: '',
      language_preference: 'Engelsk',
      budget_band: '25.000+ DKK',
      success_description: 'At et internationalt publikum føler sig velkomne, at teknikken virker i flere rum, og at festen slutter på toppen.',
      status: 'new_lead',
      created_at: now(),
    },
  ];
  store.eventBriefs = briefs;

  store.proposals = [
    {
      id: 'prop-julefrokost',
      event_brief_id: 'brief-julefrokost',
      recommended_package_id: 'pkg-dinner',
      status: 'sent',
      price_estimate_from: 13900,
      price_estimate_to: 17900,
      travel_fee_estimate: 0,
      technical_surcharge_estimate: 0,
      vat_note: 'Priser vises ekskl. moms.',
      recommendation_reason: 'Perfekt til en julefrokost med middag, taler og dansegulv efterfølgende.',
      created_at: now(),
      expires_at: addDays(34),
    },
    {
      id: 'prop-sommerfest',
      event_brief_id: 'brief-sommerfest',
      recommended_package_id: 'pkg-dinner',
      status: 'sent',
      price_estimate_from: 13900,
      price_estimate_to: 16900,
      travel_fee_estimate: 0,
      technical_surcharge_estimate: 0,
      vat_note: 'Priser vises ekskl. moms.',
      recommendation_reason: 'Passer til 80 gæster i Aarhus og bred festmusik.',
      created_at: now(),
      expires_at: addDays(62),
    },
    {
      id: 'prop-stor',
      event_brief_id: 'brief-stor',
      recommended_package_id: 'pkg-stor',
      status: 'sent',
      price_estimate_from: 19900,
      price_estimate_to: 23900,
      travel_fee_estimate: 0,
      technical_surcharge_estimate: 0,
      vat_note: 'Priser vises ekskl. moms.',
      recommendation_reason: 'Larger setup med 150-200 gæster i Odense.',
      created_at: now(),
      expires_at: addDays(48),
    },
    {
      id: 'prop-custom',
      event_brief_id: 'brief-custom',
      recommended_package_id: 'pkg-custom',
      status: 'draft',
      price_estimate_from: 25000,
      price_estimate_to: 35000,
      travel_fee_estimate: 0,
      technical_surcharge_estimate: 0,
      vat_note: 'Priser vises ekskl. moms. Custom løsning kræver teknisk vurdering.',
      recommendation_reason: 'Større event over 200 gæster med flere rum. Vi kontakter jer.',
      created_at: now(),
      expires_at: addDays(96),
    },
  ];

  store.proposalDjs = [
    { id: uuid(), proposal_id: 'prop-julefrokost', dj_id: 'dj-mikkel', match_score: 98, match_reasons: ['Julefrokost-erfaring', 'Mikrofon og taler', 'København'], is_platform_recommended: true, display_order: 1, hold_status: 'locked' },
    { id: uuid(), proposal_id: 'prop-julefrokost', dj_id: 'dj-jonas', match_score: 92, match_reasons: ['Stor erfaring', 'Bredt repertoire', 'København'], is_platform_recommended: false, display_order: 2, hold_status: 'none' },
    { id: uuid(), proposal_id: 'prop-julefrokost', dj_id: 'dj-maja', match_score: 89, match_reasons: ['Klassikere', 'Singalong', 'God til 120 gæster'], is_platform_recommended: false, display_order: 3, hold_status: 'none' },

    { id: uuid(), proposal_id: 'prop-sommerfest', dj_id: 'dj-maja', match_score: 96, match_reasons: ['Aarhus', '80 gæster', 'Bred festmusik'], is_platform_recommended: true, display_order: 1, hold_status: 'provisional' },
    { id: uuid(), proposal_id: 'prop-sommerfest', dj_id: 'dj-nora', match_score: 91, match_reasons: ['Aarhus', 'Høj energi', 'Moderne hits'], is_platform_recommended: false, display_order: 2, hold_status: 'none' },
    { id: uuid(), proposal_id: 'prop-sommerfest', dj_id: 'dj-oliver', match_score: 87, match_reasons: ['Stort setup', 'High energy', 'Dækker Fyn/Jylland'], is_platform_recommended: false, display_order: 3, hold_status: 'none' },

    { id: uuid(), proposal_id: 'prop-stor', dj_id: 'dj-oliver', match_score: 97, match_reasons: ['200 gæster', 'Stort lydanlæg', 'Fyn'], is_platform_recommended: true, display_order: 1, hold_status: 'none' },
    { id: uuid(), proposal_id: 'prop-stor', dj_id: 'dj-mikkel', match_score: 93, match_reasons: ['Større events', 'Dækker Sjælland', '200 gæster'], is_platform_recommended: false, display_order: 2, hold_status: 'none' },
    { id: uuid(), proposal_id: 'prop-stor', dj_id: 'dj-jonas', match_score: 90, match_reasons: ['København', 'Høj erfaring', 'Stor lyd'], is_platform_recommended: false, display_order: 3, hold_status: 'none' },
  ];

  store.bookings = [
    {
      id: 'booking-julefrokost',
      proposal_id: 'prop-julefrokost',
      event_brief_id: 'brief-julefrokost',
      company_id: 'company-1',
      selected_dj_id: 'dj-mikkel',
      recommended_package_id: 'pkg-dinner',
      client_choice_mode: 'client_selected_dj',
      status: 'confirmed',
      final_price: 16900,
      vat_amount: 4225,
      travel_fee: 0,
      technical_surcharge: 0,
      discount: 0,
      contract_status: 'sent',
      invoice_status: 'sent',
      payment_status: 'paid',
      backup_dj_id: 'dj-jonas',
      created_at: now(),
      updated_at: now(),
    },
    {
      id: 'booking-sommerfest',
      proposal_id: 'prop-sommerfest',
      event_brief_id: 'brief-sommerfest',
      company_id: 'company-1',
      selected_dj_id: undefined,
      recommended_package_id: 'pkg-dinner',
      client_choice_mode: 'platform_selects',
      status: 'provisional_hold',
      final_price: 14900,
      vat_amount: 3725,
      travel_fee: 0,
      technical_surcharge: 0,
      discount: 0,
      contract_status: 'not_sent',
      invoice_status: 'not_sent',
      payment_status: 'not_paid',
      backup_dj_id: undefined,
      created_at: now(),
      updated_at: now(),
    },
  ];

  store.questionnaires = [
    {
      id: uuid(),
      booking_id: 'booking-julefrokost',
      venue_contact_name: 'Anders Hansen',
      venue_contact_phone: '30987654',
      load_in_time: '16:00',
      parking_info: 'Ladefladen bag bygningen',
      access_notes: 'Indgang gennem bagdøren',
      final_start_time: '19:00',
      final_end_time: '02:00',
      speech_times: '20:00 - 21:00',
      microphone_notes: 'To trådløse mikrofoner til taler',
      must_play_final: 'Last Christmas, Dancing Queen',
      do_not_play_final: 'Hård techno',
      dress_code: 'Smart casual',
      onsite_contact_name: 'Laura Jensen',
      onsite_contact_phone: '20123456',
      special_notes: 'Catering skal rydde før 18:30',
      completed_at: now(),
    },
  ];

  store.eventOffers = [
    {
      id: uuid(),
      booking_id: 'booking-julefrokost',
      proposal_id: 'prop-julefrokost',
      dj_id: 'dj-mikkel',
      status: 'accepted',
      payout_estimate: 9500,
      admin_note: 'Bekræftet til julefrokost København.',
      dj_note: '',
      created_at: now(),
      responded_at: now(),
    },
    {
      id: uuid(),
      booking_id: 'booking-sommerfest',
      proposal_id: 'prop-sommerfest',
      dj_id: 'dj-maja',
      status: 'offered',
      payout_estimate: 7500,
      admin_note: 'Aarhus sommerfest, 80 gæster.',
      dj_note: '',
      created_at: now(),
      responded_at: undefined,
    },
  ];

  store.messages = [
    { id: uuid(), booking_id: 'booking-julefrokost', sender_role: 'admin', sender_id: 'user-admin', message: 'Hej Laura. Vi har bekræftet DJ Mikkel til jeres julefrokost. Køreplanen følger snarest.', created_at: now() },
    { id: uuid(), booking_id: 'booking-julefrokost', sender_role: 'client', sender_id: 'user-client', message: 'Perfekt. Kan vi få to mikrofoner til taler?', created_at: now() },
    { id: uuid(), booking_id: 'booking-julefrokost', sender_role: 'admin', sender_id: 'user-admin', message: 'Ja, der medfølger to trådløse mikrofoner. Den endelige plan følger.', created_at: now() },
  ];

  store.runSheets = [
    {
      id: uuid(),
      booking_id: 'booking-julefrokost',
      venue: 'Demo Venue København',
      load_in_time: '16:00',
      soundcheck_time: '17:30',
      dinner_start: '18:00',
      speeches: '20:00 - 21:00',
      dj_start: '21:00',
      event_end: '02:00',
      onsite_contact: 'Laura Jensen, 20123456',
      dress_code: 'Smart casual',
      technical_notes: 'To trådløse mikrofoner, LED-lyspakke, kompakt lyd.',
      emergency_plan: 'Backup DJ Jonas klar til indsats, kontakt admin.',
      backup_dj_id: 'dj-jonas',
      created_at: now(),
      updated_at: now(),
    },
  ];

  store.documents = [
    { id: uuid(), booking_id: 'booking-julefrokost', type: 'contract', title: 'Kontrakt - Julefrokost København', url: '#', status: 'sent', created_at: now() },
    { id: uuid(), booking_id: 'booking-julefrokost', type: 'invoice', title: 'Faktura - Julefrokost København', url: '#', status: 'paid', created_at: now() },
  ];

  store.djPayouts = [
    { id: uuid(), dj_id: 'dj-mikkel', package_id: 'pkg-kompakt', payout_amount: 5500, extra_hour_payout: 1200, early_setup_payout: 800, dinner_music_addon_payout: 800, admin_approved: true, updated_at: now() },
    { id: uuid(), dj_id: 'dj-mikkel', package_id: 'pkg-dinner', payout_amount: 9000, extra_hour_payout: 1500, early_setup_payout: 1000, dinner_music_addon_payout: 1000, admin_approved: true, updated_at: now() },
    { id: uuid(), dj_id: 'dj-mikkel', package_id: 'pkg-stor', payout_amount: 12000, extra_hour_payout: 2000, early_setup_payout: 1200, dinner_music_addon_payout: 1200, admin_approved: true, updated_at: now() },
  ];

  store.djApplications = [
    {
      id: uuid(),
      stage_name: 'DJ Thomas',
      legal_name: 'Thomas Nielsen',
      email: 'thomas@firmadj.demo',
      phone: '20987654',
      city: 'København',
      regions: ['København / Sjælland'],
      cvr: '87654321',
      years_experience: 3,
      corporate_event_experience: 'Jeg har spillet til 20+ firmafester og sommerfester.',
      equipment_owned: 'Mikrofoner, kompakt lyd, LED-lys',
      can_provide_sound: true,
      can_provide_lighting: true,
      can_handle_microphone: true,
      languages: ['Dansk'],
      music_strengths: ['Moderne dance/pop', 'Disco, funk og 80’er/90’er'],
      sample_mix_url: 'https://example.com/thomas-mix',
      references_text: 'Flere mindre virksomheder i København',
      short_bio: 'Ung, energisk DJ med kærlighed til firmafester.',
      status: 'pending_review',
      created_at: now(),
    },
  ];
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

ensureSeed();

export function getStore() {
  ensureSeed();
  return store;
}

export function getUsers() { ensureSeed(); return store.users; }
export function getUserByEmail(email: string): User | undefined {
  ensureSeed();
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  ensureSeed();
  return store.users.find((u) => u.id === id);
}

export function getCompanies() { ensureSeed(); return store.companies; }
export function getCompanyById(id: string) { ensureSeed(); return store.companies.find((c) => c.id === id); }

export function getPackages() { ensureSeed(); return store.packages; }
export function getPackageById(id: string) { ensureSeed(); return store.packages.find((p) => p.id === id); }

export function getDJs() { ensureSeed(); return store.djs; }
export function getDJById(id: string) { ensureSeed(); return store.djs.find((d) => d.id === id); }
export function getDJByUserId(userId: string) { ensureSeed(); return store.djs.find((d) => d.user_id === userId); }

export function getEventBriefs() { ensureSeed(); return store.eventBriefs; }
export function getEventBriefById(id: string) { ensureSeed(); return store.eventBriefs.find((b) => b.id === id); }

export function getProposals() { ensureSeed(); return store.proposals; }
export function getProposalById(id: string) { ensureSeed(); return store.proposals.find((p) => p.id === id); }
export function getProposalByBriefId(briefId: string) { ensureSeed(); return store.proposals.find((p) => p.event_brief_id === briefId); }

export function getProposalDJs(proposalId: string) { ensureSeed(); return store.proposalDjs.filter((p) => p.proposal_id === proposalId); }

export function getBookings() { ensureSeed(); return store.bookings; }
export function getBookingById(id: string) { ensureSeed(); return store.bookings.find((b) => b.id === id); }
export function getBookingByBriefId(briefId: string) { ensureSeed(); return store.bookings.find((b) => b.event_brief_id === briefId); }

export function getDJAvailability(djId: string) { ensureSeed(); return store.djAvailability.filter((a) => a.dj_id === djId); }
export function getDJDefaultAvailability(djId: string) { ensureSeed(); return store.djDefaultAvailability.filter((a) => a.dj_id === djId); }

export function getReviewsForDJ(djId: string) { ensureSeed(); return store.reviews.filter((r) => r.dj_id === djId && r.approved); }

export function getMessagesForBooking(bookingId: string) { ensureSeed(); return store.messages.filter((m) => m.booking_id === bookingId); }

export function getQuestionnaireByBookingId(bookingId: string) { ensureSeed(); return store.questionnaires.find((q) => q.booking_id === bookingId); }

export function getRunSheetByBookingId(bookingId: string) { ensureSeed(); return store.runSheets.find((r) => r.booking_id === bookingId); }

export function getDocumentsByBookingId(bookingId: string) { ensureSeed(); return store.documents.filter((d) => d.booking_id === bookingId); }

export function getOffersForDJ(djId: string) { ensureSeed(); return store.eventOffers.filter((o) => o.dj_id === djId); }

export function getAdminNotes(relatedType: string, relatedId: string) { ensureSeed(); return store.adminNotes.filter((n) => n.related_type === relatedType && n.related_id === relatedId); }

export function getCallbackRequests() { ensureSeed(); return store.callbackRequests; }

export function addAudit(action: string, entityType: string, entityId: string, actorRole?: string, metadata?: any) {
  store.auditLogs.push({ id: uuid(), action, entity_type: entityType, entity_id: entityId, actor_role: actorRole, metadata, created_at: now() });
}

export function createUser(user: Omit<User, 'id' | 'created_at'>) {
  ensureSeed();
  const newUser: User = { ...user, id: uuid(), created_at: now() };
  store.users.push(newUser);
  return newUser;
}

export function createCompany(company: Omit<Company, 'id' | 'created_at'>) {
  ensureSeed();
  const newCompany: Company = { ...company, id: uuid(), created_at: now() };
  store.companies.push(newCompany);
  return newCompany;
}

export function createBrief(brief: Omit<EventBrief, 'id' | 'created_at' | 'status'>) {
  ensureSeed();
  const newBrief: EventBrief = { ...brief, id: uuid(), status: 'new_lead', created_at: now() };
  store.eventBriefs.push(newBrief);
  return newBrief;
}

export function updateBrief(id: string, changes: Partial<EventBrief>) {
  ensureSeed();
  const idx = store.eventBriefs.findIndex((b) => b.id === id);
  if (idx === -1) return undefined;
  store.eventBriefs[idx] = { ...store.eventBriefs[idx], ...changes };
  return store.eventBriefs[idx];
}

export function createProposal(proposal: Omit<Proposal, 'id' | 'created_at'>) {
  ensureSeed();
  const newProposal: Proposal = { ...proposal, id: uuid(), created_at: now() };
  store.proposals.push(newProposal);
  return newProposal;
}

export function updateProposal(id: string, changes: Partial<Proposal>) {
  ensureSeed();
  const idx = store.proposals.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  store.proposals[idx] = { ...store.proposals[idx], ...changes };
  return store.proposals[idx];
}

export function createProposalDJ(pd: Omit<ProposalDJ, 'id'>) {
  ensureSeed();
  const newPD: ProposalDJ = { ...pd, id: uuid() };
  store.proposalDjs.push(newPD);
  return newPD;
}

export function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
  ensureSeed();
  const newBooking: Booking = { ...booking, id: uuid(), created_at: now(), updated_at: now() };
  store.bookings.push(newBooking);
  return newBooking;
}

export function updateBooking(id: string, changes: Partial<Booking>) {
  ensureSeed();
  const idx = store.bookings.findIndex((b) => b.id === id);
  if (idx === -1) return undefined;
  store.bookings[idx] = { ...store.bookings[idx], ...changes, updated_at: now() };
  return store.bookings[idx];
}

export function createQuestionnaire(q: Omit<ClientQuestionnaire, 'id'>) {
  ensureSeed();
  const newQ: ClientQuestionnaire = { ...q, id: uuid() };
  store.questionnaires.push(newQ);
  return newQ;
}

export function updateQuestionnaire(id: string, changes: Partial<ClientQuestionnaire>) {
  ensureSeed();
  const idx = store.questionnaires.findIndex((q) => q.id === id);
  if (idx === -1) return undefined;
  store.questionnaires[idx] = { ...store.questionnaires[idx], ...changes };
  return store.questionnaires[idx];
}

export function createMessage(message: Omit<Message, 'id' | 'created_at'>) {
  ensureSeed();
  const newMessage: Message = { ...message, id: uuid(), created_at: now() };
  store.messages.push(newMessage);
  return newMessage;
}

export function createOffer(offer: Omit<EventOffer, 'id' | 'created_at' | 'responded_at'>) {
  ensureSeed();
  const newOffer: EventOffer = { ...offer, id: uuid(), created_at: now() };
  store.eventOffers.push(newOffer);
  return newOffer;
}

export function updateOffer(id: string, changes: Partial<EventOffer>) {
  ensureSeed();
  const idx = store.eventOffers.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  store.eventOffers[idx] = { ...store.eventOffers[idx], ...changes, responded_at: now() };
  return store.eventOffers[idx];
}

export function updateDJ(id: string, changes: Partial<DJ>) {
  ensureSeed();
  const idx = store.djs.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  store.djs[idx] = { ...store.djs[idx], ...changes };
  return store.djs[idx];
}

export function createDJ(dj: Omit<DJ, 'id' | 'created_at'>) {
  ensureSeed();
  const newDJ: DJ = { ...dj, id: uuid(), created_at: now() };
  store.djs.push(newDJ);
  return newDJ;
}

export function createDJApplication(app: Omit<DJApplication, 'id' | 'created_at' | 'status'>) {
  ensureSeed();
  const newApp: DJApplication = { ...app, id: uuid(), status: 'pending_review', created_at: now() };
  store.djApplications.push(newApp);
  return newApp;
}

export function updateDJApplication(id: string, changes: Partial<DJApplication>) {
  ensureSeed();
  const idx = store.djApplications.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  store.djApplications[idx] = { ...store.djApplications[idx], ...changes };
  return store.djApplications[idx];
}

export function createPackage(pkg: Omit<Package, 'id' | 'created_at'>) {
  ensureSeed();
  const newPkg: Package = { ...pkg, id: uuid(), created_at: now() };
  store.packages.push(newPkg);
  return newPkg;
}

export function updatePackage(id: string, changes: Partial<Package>) {
  ensureSeed();
  const idx = store.packages.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  store.packages[idx] = { ...store.packages[idx], ...changes };
  return store.packages[idx];
}

export function createReview(review: Omit<Review, 'id' | 'created_at'>) {
  ensureSeed();
  const newReview: Review = { ...review, id: uuid(), created_at: now() };
  store.reviews.push(newReview);
  return newReview;
}

export function createAdminNote(note: Omit<AdminNote, 'id' | 'created_at'>) {
  ensureSeed();
  const newNote: AdminNote = { ...note, id: uuid(), created_at: now() };
  store.adminNotes.push(newNote);
  return newNote;
}

export function createRunSheet(rs: Omit<RunSheet, 'id' | 'created_at' | 'updated_at'>) {
  ensureSeed();
  const newRS: RunSheet = { ...rs, id: uuid(), created_at: now(), updated_at: now() };
  store.runSheets.push(newRS);
  return newRS;
}

export function updateRunSheet(id: string, changes: Partial<RunSheet>) {
  ensureSeed();
  const idx = store.runSheets.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  store.runSheets[idx] = { ...store.runSheets[idx], ...changes, updated_at: now() };
  return store.runSheets[idx];
}

export function createDocument(doc: Omit<Document, 'id' | 'created_at'>) {
  ensureSeed();
  const newDoc: Document = { ...doc, id: uuid(), created_at: now() };
  store.documents.push(newDoc);
  return newDoc;
}

export function createCallbackRequest(req: Omit<CallbackRequest, 'id' | 'created_at' | 'status'>) {
  ensureSeed();
  const newReq: CallbackRequest = { ...req, id: uuid(), status: 'open', created_at: now() };
  store.callbackRequests.push(newReq);
  return newReq;
}

export function createAvailability(avail: Omit<DJAvailability, 'id' | 'updated_at'>) {
  ensureSeed();
  const idx = store.djAvailability.findIndex((a) => a.dj_id === avail.dj_id && a.date === avail.date);
  if (idx !== -1) {
    store.djAvailability[idx] = { ...store.djAvailability[idx], ...avail, updated_at: now() };
    return store.djAvailability[idx];
  }
  const newAvail: DJAvailability = { ...avail, id: uuid(), updated_at: now() };
  store.djAvailability.push(newAvail);
  return newAvail;
}

export function updateDefaultAvailability(id: string, changes: Partial<DJDefaultAvailability>) {
  ensureSeed();
  const idx = store.djDefaultAvailability.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  store.djDefaultAvailability[idx] = { ...store.djDefaultAvailability[idx], ...changes, updated_at: now() };
  return store.djDefaultAvailability[idx];
}

export function createDefaultAvailability(da: Omit<DJDefaultAvailability, 'id' | 'updated_at'>) {
  ensureSeed();
  const idx = store.djDefaultAvailability.findIndex((a) => a.dj_id === da.dj_id && a.weekday === da.weekday);
  if (idx !== -1) {
    store.djDefaultAvailability[idx] = { ...store.djDefaultAvailability[idx], ...da, updated_at: now() };
    return store.djDefaultAvailability[idx];
  }
  const newDA: DJDefaultAvailability = { ...da, id: uuid(), updated_at: now() };
  store.djDefaultAvailability.push(newDA);
  return newDA;
}

export function getDJAvailabilityForDate(djId: string, date: string) {
  ensureSeed();
  const override = store.djAvailability.find((a) => a.dj_id === djId && a.date === date);
  if (override) return override;
  const d = new Date(date);
  const day = d.getDay();
  const weekday = day === 4 ? 'thursday' : day === 5 ? 'friday' : day === 6 ? 'saturday' : undefined;
  if (!weekday) return { status: 'unavailable' as const };
  const def = store.djDefaultAvailability.find((a) => a.dj_id === djId && a.weekday === weekday);
  return { status: (def?.default_status as 'available' | 'tentative' | 'booked' | 'unavailable') || 'unavailable' };
}

export { uuid, now };
