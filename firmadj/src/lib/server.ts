'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  getStore as _getStore,
  getUserByEmail, createUser, createCompany, createBrief, createProposal as _createProposal,
  createProposalDJ as _createProposalDJ, createBooking, createQuestionnaire, updateQuestionnaire,
  createMessage, createCallbackRequest, updateOffer, createOffer, updateBooking,
  updateBrief as _updateBrief, updateProposal, getProposalById, getBookingById as _getBookingById,
  getDJById, updateDJ, createDJ, createDJApplication, createReview, createRunSheet, updateRunSheet,
  getDJByUserId as _getDJByUserId, createDocument, createAvailability, createDefaultAvailability,
  getDJAvailability as _getDJAvailability, getDJDefaultAvailability as _getDJDefaultAvailability,
  getOffersForDJ as _getOffersForDJ, getMessagesForBooking as _getMessagesForBooking,
  getEventBriefs as _getEventBriefs, getProposals as _getProposals,
  getBookingByBriefId as _getBookingByBriefId, getDJs as _getDJs, getPackageById as _getPackageById,
  getEventBriefById as _getEventBriefById,
} from './data';
import { recommendPackage, matchDJs, matchReasonsText } from './matching';
import { requireSession, requireRole, demoLogin, logout } from './auth';
import { EventBrief, Package, DJ, Booking, ClientQuestionnaire, Proposal, ProposalDJ } from './types';

export { demoLogin, logout };

export async function submitBrief(formData: FormData): Promise<{ success: boolean; proposalId?: string; error?: string }> {
  try {
    const contactName = formData.get('contact_name') as string;
    const contactEmail = formData.get('contact_email') as string;
    const contactPhone = formData.get('contact_phone') as string;
    const companyName = formData.get('company_name') as string;
    const role = formData.get('role') as string;
    const eventType = formData.get('event_type') as string;
    const eventDate = formData.get('event_date') as string;
    const dateFlexibility = formData.get('date_flexibility') as string;
    const startTime = formData.get('start_time') as string;
    const endTime = formData.get('end_time') as string;
    const city = formData.get('city') as string;
    const region = formData.get('region') as string;
    const venueName = formData.get('venue_name') as string;
    const venueStatus = formData.get('venue_status') as string;
    const guestCountRange = formData.get('guest_count_range') as string;
    const needsSound = formData.get('needs_sound') as string;
    const needsLighting = formData.get('needs_lighting') as string;
    const needsMicrophone = formData.get('needs_microphone') as string;
    const needsDinnerMusic = formData.get('needs_dinner_music') as string;
    const needsVenueCoordination = formData.get('needs_venue_coordination') as string;
    const musicVibeTags = formData.getAll('music_vibe_tags') as string[];
    const mustPlay = formData.get('must_play') as string;
    const doNotPlay = formData.get('do_not_play') as string;
    const languagePreference = formData.get('language_preference') as string;
    const budgetBand = formData.get('budget_band') as string;
    const successDescription = formData.get('success_description') as string;

    if (!contactName || !contactEmail || !eventType) {
      return { success: false, error: 'Kontaktoplysninger og eventtype er påkrævet.' };
    }

    let company = _getStore().companies.find((c) => c.name.toLowerCase() === (companyName || '').toLowerCase());
    if (!company && companyName) {
      company = createCompany({ name: companyName, created_by: undefined });
    }

    const brief = createBrief({
      company_id: company?.id,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      company_name: companyName || '',
      role,
      event_type: eventType,
      event_date: eventDate,
      date_flexibility: dateFlexibility,
      start_time: startTime,
      end_time: endTime,
      city,
      region,
      venue_name: venueName,
      venue_status: venueStatus,
      guest_count_range: guestCountRange,
      needs_sound: needsSound,
      needs_lighting: needsLighting,
      needs_microphone: needsMicrophone,
      needs_dinner_music: needsDinnerMusic,
      needs_venue_coordination: needsVenueCoordination,
      music_vibe_tags: musicVibeTags,
      must_play: mustPlay,
      do_not_play: doNotPlay,
      language_preference: languagePreference,
      budget_band: budgetBand,
      success_description: successDescription,
    });

    const packageRec = await recommendPackage(brief);
    const pkg = _getStore().packages.find((p) => p.id === packageRec.packageId);

    const matches = await matchDJs(brief);
    const priceFrom = pkg?.price_from || 0;
    const priceTo = pkg?.price_to || (priceFrom * 1.2);

    const proposal = _createProposal({
      event_brief_id: brief.id,
      recommended_package_id: pkg?.id,
      status: 'sent',
      price_estimate_from: priceFrom,
      price_estimate_to: Math.round(priceTo),
      travel_fee_estimate: 0,
      technical_surcharge_estimate: 0,
      vat_note: 'Priser vises ekskl. moms. Transport og særlige tekniske behov beregnes tydeligt før bekræftelse.',
      recommendation_reason: packageRec.reason,
    });

    matches.forEach((m, i) => {
      _createProposalDJ({
        proposal_id: proposal.id,
        dj_id: m.dj.id,
        match_score: m.score,
        match_reasons: m.reasons,
        is_platform_recommended: m.recommended,
        display_order: i + 1,
        hold_status: 'none',
      });
    });

    _updateBrief(brief.id, { status: 'proposal_created' });

    revalidatePath('/brief');
    return { success: true, proposalId: proposal.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Der opstod en fejl.' };
  }
}

export async function getProposalData(proposalId: string) {
  const proposal = getProposalById(proposalId);
  if (!proposal) return null;
  const brief = _getStore().eventBriefs.find((b) => b.id === proposal.event_brief_id);
  const pkg = _getStore().packages.find((p) => p.id === proposal.recommended_package_id);
  const pDjs = _getStore().proposalDjs.filter((p) => p.proposal_id === proposalId);
  const matches = pDjs.map((pd) => {
    const dj = _getStore().djs.find((d) => d.id === pd.dj_id);
    const reviews = _getStore().reviews.filter((r) => r.dj_id === pd.dj_id && r.approved);
    return { ...pd, dj, reviews };
  });
  const matchReasons = brief && pkg ? await matchReasonsText(brief, pkg) : [];
  return { proposal, brief, pkg, matches, matchReasons };
}

export async function submitReservation(formData: FormData): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    const proposalId = formData.get('proposal_id') as string;
    const selectedDjId = formData.get('selected_dj_id') as string;
    const clientChoiceMode = formData.get('client_choice_mode') as 'platform_selects' | 'client_selected_dj';
    const invoiceEmail = formData.get('invoice_email') as string;
    const cvr = formData.get('cvr') as string;
    const notes = formData.get('notes') as string;

    const proposal = getProposalById(proposalId);
    if (!proposal) return { success: false, error: 'Forslag ikke fundet' };

    const brief = _getStore().eventBriefs.find((b) => b.id === proposal.event_brief_id);
    if (!brief) return { success: false, error: 'Brief ikke fundet' };

    const booking = createBooking({
      proposal_id: proposalId,
      event_brief_id: brief.id,
      company_id: brief.company_id,
      selected_dj_id: clientChoiceMode === 'client_selected_dj' ? selectedDjId : undefined,
      recommended_package_id: proposal.recommended_package_id,
      client_choice_mode: clientChoiceMode,
      status: 'provisional_hold',
      final_price: proposal.price_estimate_from,
      vat_amount: Math.round((proposal.price_estimate_from || 0) * 0.25),
      travel_fee: 0,
      technical_surcharge: 0,
      discount: 0,
      contract_status: 'not_sent',
      invoice_status: 'not_sent',
      payment_status: 'not_paid',
    });

    _updateBrief(brief.id, { status: 'provisional_hold' });
    updateProposal(proposalId, { status: 'accepted' });

    if (clientChoiceMode === 'client_selected_dj' && selectedDjId) {
      const offer = _getStore().eventOffers.find((o) => o.proposal_id === proposalId && o.dj_id === selectedDjId) ||
        createOffer({ booking_id: booking.id, proposal_id: proposalId, dj_id: selectedDjId, status: 'offered', payout_estimate: 0 });
      updateOffer(offer.id, { status: 'accepted', booking_id: booking.id });
    } else {
      const recommended = _getStore().proposalDjs.find((p) => p.proposal_id === proposalId && p.is_platform_recommended);
      if (recommended) {
        const offer = _getStore().eventOffers.find((o) => o.proposal_id === proposalId && o.dj_id === recommended.dj_id) ||
          createOffer({ booking_id: booking.id, proposal_id: proposalId, dj_id: recommended.dj_id, status: 'offered', payout_estimate: 0 });
        updateOffer(offer.id, { status: 'accepted', booking_id: booking.id });
      }
    }

    revalidatePath('/reserve/[proposalId]');
    return { success: true, bookingId: booking.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Reservationsfejl' };
  }
}

export async function getClientDashboard() {
  const session = await requireSession();
  const user = getUserByEmail(session.email);
  if (!user) return null;

  const briefs = _getStore().eventBriefs.filter((b) => b.contact_email.toLowerCase() === user.email.toLowerCase());
  const bookings = _getStore().bookings.filter((b) => briefs.some((br) => br.id === b.event_brief_id));
  const proposals = _getStore().proposals.filter((p) => briefs.some((br) => br.id === p.event_brief_id));
  return { user, briefs, bookings, proposals };
}

export async function getDJDashboard() {
  const session = await requireRole('dj');
  const dj = _getDJByUserId(session.userId);
  if (!dj) return null;

  const offers = _getStore().eventOffers.filter((o) => o.dj_id === dj.id).map((o) => {
    const booking = o.booking_id ? _getBookingById(o.booking_id) : undefined;
    const brief = booking ? _getEventBriefById(booking.event_brief_id) : undefined;
    return { ...o, event_type: brief?.event_type, event_date: brief?.event_date, city: brief?.city, guest_count_range: brief?.guest_count_range };
  });
  const bookings = _getStore().bookings.filter((b) => b.selected_dj_id === dj.id || _getStore().eventOffers.some((o) => o.booking_id === b.id && o.dj_id === dj.id && o.status === 'accepted'));
  return { session, dj, offers, bookings };
}

export async function getAdminDashboard() {
  await requireRole('admin');
  const s = _getStore();
  return {
    counts: {
      leads: s.eventBriefs.filter((b) => b.status === 'new_lead').length,
      proposals: s.proposals.filter((p) => p.status === 'sent').length,
      bookings: s.bookings.length,
      djs: s.djs.length,
      pendingApplications: s.djApplications.filter((a) => a.status === 'pending_review').length,
    },
    recentBriefs: s.eventBriefs.slice(0, 10),
    upcomingBookings: s.bookings.filter((b) => b.status === 'confirmed').slice(0, 10),
  };
}

export async function getBookingWithDetails(bookingId: string) {
  const session = await requireSession();
  const booking = _getBookingById(bookingId);
  if (!booking) return null;
  const brief = _getStore().eventBriefs.find((b) => b.id === booking.event_brief_id);
  const pkg = _getStore().packages.find((p) => p.id === booking.recommended_package_id);
  const selectedDJ = booking.selected_dj_id ? getDJById(booking.selected_dj_id) : undefined;
  const backupDJ = booking.backup_dj_id ? getDJById(booking.backup_dj_id) : undefined;
  const messages = _getStore().messages.filter((m) => m.booking_id === bookingId);
  const questionnaire = _getStore().questionnaires.find((q) => q.booking_id === bookingId);
  const runSheet = _getStore().runSheets.find((r) => r.booking_id === bookingId);
  const documents = _getStore().documents.filter((d) => d.booking_id === bookingId);
  return { booking, brief, pkg, selectedDJ, backupDJ, messages, questionnaire, runSheet, documents };
}

export async function submitMessage(bookingId: string, message: string, senderRole?: string) {
  const session = await requireSession();
  createMessage({ booking_id: bookingId, sender_role: senderRole || session.role, sender_id: session.userId, message });
  revalidatePath('/client/beskeder');
  revalidatePath('/dj/beskeder');
  revalidatePath('/admin/beskeder');
  return { success: true };
}

export async function submitQuestionnaire(bookingId: string, data: Partial<ClientQuestionnaire>) {
  await requireSession();
  const existing = _getStore().questionnaires.find((q) => q.booking_id === bookingId);
  if (existing) {
    updateQuestionnaire(existing.id, { ...data, completed_at: new Date().toISOString() });
  } else {
    createQuestionnaire({ ...data as any, booking_id: bookingId, completed_at: new Date().toISOString() });
  }
  const booking = _getBookingById(bookingId);
  if (booking) updateBooking(bookingId, { status: 'questionnaire_completed' });
  revalidatePath('/client/spoergeskema');
  return { success: true };
}

export async function updateDJProfile(djId: string, data: Partial<import('./types').DJ>) {
  const session = await requireSession();
  const dj = getDJById(djId);
  if (!dj) return { success: false, error: 'DJ ikke fundet' };
  if (session.role !== 'admin' && dj.user_id !== session.userId) return { success: false, error: 'Ingen adgang' };
  updateDJ(djId, data);
  revalidatePath('/dj/profile');
  return { success: true };
}

export async function uploadDJPhoto(djId: string, formData: FormData) {
  const session = await requireSession();
  const dj = getDJById(djId);
  if (!dj) return { success: false, error: 'DJ ikke fundet' };
  if (session.role !== 'admin' && dj.user_id !== session.userId) return { success: false, error: 'Ingen adgang' };
  const file = formData.get('photo') as File;
  if (!file) return { success: false, error: 'Ingen fil' };
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUrl = `data:${file.type};base64,${base64}`;
  updateDJ(djId, { photo_url: dataUrl });
  return { success: true, url: dataUrl };
}

export async function updateDJAvailability(djId: string, entries: { date: string; status: string; notes?: string }[]) {
  await requireSession();
  entries.forEach((e) => {
    const d = new Date(e.date);
    const weekday = d.getDay() === 4 ? 'thursday' : d.getDay() === 5 ? 'friday' : 'saturday';
    createAvailability({ dj_id: djId, date: e.date, weekday, status: e.status as any, notes: e.notes, is_override: true });
  });
  const dj = getDJById(djId);
  if (dj) updateDJ(djId, { last_availability_update: new Date().toISOString(), availability_freshness_score: 98 });
  revalidatePath('/dj/availability');
  return { success: true };
}

export async function updateDJDefaultAvailability(djId: string, data: { thursday?: 'available'|'unavailable'; friday?: 'available'|'unavailable'; saturday?: 'available'|'unavailable' }) {
  await requireSession();
  (Object.entries(data) as [string, 'available'|'unavailable'][]).forEach(([weekday, status]) => {
    createDefaultAvailability({ dj_id: djId, weekday: weekday as any, default_status: status });
  });
  revalidatePath('/dj/availability');
  return { success: true };
}

export async function respondToOffer(offerId: string, status: 'accepted' | 'declined', djNote?: string) {
  const session = await requireRole('dj');
  const offer = _getStore().eventOffers.find((o) => o.id === offerId);
  if (!offer) return { success: false, error: 'Tilbud ikke fundet' };
  const dj = _getDJByUserId(session.userId);
  if (!dj || offer.dj_id !== dj.id) return { success: false, error: 'Ingen adgang' };
  updateOffer(offerId, { status, dj_note: djNote });
  if (status === 'accepted' && offer.booking_id) {
    updateBooking(offer.booking_id, { selected_dj_id: dj.id });
  }
  revalidatePath('/dj/tilbud');
  return { success: true };
}

export async function submitDJApplication(formData: FormData) {
  const app = {
    stage_name: formData.get('stage_name') as string,
    legal_name: formData.get('legal_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    city: formData.get('city') as string,
    regions: (formData.get('regions') as string)?.split(',').map((r) => r.trim()) || [],
    cvr: formData.get('cvr') as string,
    years_experience: Number(formData.get('years_experience') || 0),
    corporate_event_experience: formData.get('corporate_event_experience') as string,
    equipment_owned: formData.get('equipment_owned') as string,
    can_provide_sound: formData.get('can_provide_sound') === 'on',
    can_provide_lighting: formData.get('can_provide_lighting') === 'on',
    can_handle_microphone: formData.get('can_handle_microphone') === 'on',
    languages: (formData.get('languages') as string)?.split(',').map((l) => l.trim()) || [],
    music_strengths: (formData.get('music_strengths') as string)?.split(',').map((s) => s.trim()) || [],
    sample_mix_url: formData.get('sample_mix_url') as string,
    references_text: formData.get('references_text') as string,
    short_bio: formData.get('short_bio') as string,
  };
  createDJApplication(app);
  return { success: true };
}

export async function submitCallbackRequest(formData: FormData) {
  createCallbackRequest({
    proposal_id: formData.get('proposal_id') as string,
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    company: formData.get('company') as string,
    message: formData.get('message') as string,
  });
  return { success: true };
}

export async function adminUpdateBookingStatus(bookingId: string, status: string) {
  await requireRole('admin');
  updateBooking(bookingId, { status: status as any });
  revalidatePath('/admin/bookinger');
  return { success: true };
}

export async function adminAssignDJ(bookingId: string, djId: string) {
  await requireRole('admin');
  updateBooking(bookingId, { selected_dj_id: djId });
  revalidatePath('/admin/bookinger');
  return { success: true };
}

export async function adminReplaceDJ(bookingId: string, djId: string) {
  await requireRole('admin');
  updateBooking(bookingId, { selected_dj_id: djId });
  revalidatePath('/admin/bookinger');
  return { success: true };
}

export async function adminAddBackupDJ(bookingId: string, djId: string) {
  await requireRole('admin');
  updateBooking(bookingId, { backup_dj_id: djId });
  revalidatePath('/admin/bookinger');
  return { success: true };
}

export async function adminUpdatePackage(pkgId: string, data: Partial<Package>) {
  await requireRole('admin');
  const { updatePackage } = await import('./data');
  updatePackage(pkgId, data);
  revalidatePath('/admin/pakker');
  return { success: true };
}

export async function adminApproveDJ(djId: string) {
  await requireRole('admin');
  updateDJ(djId, { status: 'approved', approved_for_shortlist: true });
  revalidatePath('/admin/djs');
  return { success: true };
}

export async function adminApproveApplication(applicationId: string) {
  await requireRole('admin');
  const app = _getStore().djApplications.find((a) => a.id === applicationId);
  if (!app) return { success: false, error: 'Application not found' };
  _getStore().djApplications = _getStore().djApplications.map((a) => a.id === applicationId ? { ...a, status: 'approved' as const } : a);
  const user = createUser({ email: app.email || '', role: 'dj', name: app.stage_name || '', phone: app.phone || '' });
  createDJ({
    user_id: user.id,
    stage_name: app.stage_name || '',
    public_display_name: app.stage_name || '',
    legal_name: app.legal_name || '',
    email: app.email || '',
    phone: app.phone || '',
    city: app.city || '',
    regions: app.regions || [],
    bio_short: app.short_bio || '',
    corporate_experience_years: app.years_experience || 0,
    languages: app.languages || [],
    vibe_tags: app.music_strengths || [],
    specialties: app.music_strengths || [],
    status: 'approved',
    approved_for_shortlist: true,
    profile_completeness_score: 60,
    availability_freshness_score: 50,
  });
  revalidatePath('/admin/djs');
  return { success: true };
}

export async function adminUpdateBookingPricing(bookingId: string, data: Partial<Booking>) {
  await requireRole('admin');
  updateBooking(bookingId, data);
  revalidatePath('/admin/bookinger');
  return { success: true };
}

export async function adminCreateRunSheet(bookingId: string, data: Partial<import('./types').RunSheet>) {
  await requireRole('admin');
  const existing = _getStore().runSheets.find((r) => r.booking_id === bookingId);
  if (existing) {
    updateRunSheet(existing.id, data);
  } else {
    createRunSheet({ ...data as any, booking_id: bookingId });
  }
  updateBooking(bookingId, { status: 'run_sheet_ready' });
  revalidatePath('/admin/bookinger');
  return { success: true };
}

export async function adminSendMessage(bookingId: string, message: string) {
  await requireRole('admin');
  return submitMessage(bookingId, message, 'admin');
}

export async function rebookPreviousBooking(bookingId: string, newDate: string, newGuestCount: string, newCity: string, newVenue: string, newVibe: string) {
  await requireSession();
  const booking = _getBookingById(bookingId);
  if (!booking) return { success: false, error: 'Booking ikke fundet' };
  const brief = _getStore().eventBriefs.find((b) => b.id === booking.event_brief_id);
  if (!brief) return { success: false, error: 'Brief ikke fundet' };
  const newBrief = createBrief({
    ...brief,
    event_date: newDate,
    guest_count_range: newGuestCount,
    city: newCity,
    venue_name: newVenue,
    music_vibe_tags: newVibe ? [newVibe] : brief.music_vibe_tags,
  });
  const packageRec = await recommendPackage(newBrief);
  const pkg = _getStore().packages.find((p) => p.id === packageRec.packageId);
  const matches = await matchDJs(newBrief);
  const proposal = _createProposal({
    event_brief_id: newBrief.id,
    recommended_package_id: pkg?.id,
    status: 'sent',
    price_estimate_from: pkg?.price_from || 0,
    price_estimate_to: pkg?.price_to || (pkg?.price_from || 0) * 1.2,
    vat_note: 'Priser vises ekskl. moms.',
    recommendation_reason: packageRec.reason,
  });
  matches.forEach((m, i) => _createProposalDJ({
    proposal_id: proposal.id,
    dj_id: m.dj.id,
    match_score: m.score,
    match_reasons: m.reasons,
    is_platform_recommended: m.recommended,
    display_order: i + 1,
    hold_status: 'none',
  }));
  _updateBrief(newBrief.id, { status: 'proposal_created' });
  revalidatePath('/client/genbook');
  return { success: true, proposalId: proposal.id };
}

export async function regenerateShortlist(proposalId: string) {
  await requireRole('admin');
  const proposal = getProposalById(proposalId);
  if (!proposal) return { success: false, error: 'Forslag ikke fundet' };
  const brief = _getStore().eventBriefs.find((b) => b.id === proposal.event_brief_id);
  if (!brief) return { success: false, error: 'Brief ikke fundet' };
  _getStore().proposalDjs = _getStore().proposalDjs.filter((p) => p.proposal_id !== proposalId);
  const matches = await matchDJs(brief);
  matches.forEach((m, i) => _createProposalDJ({
    proposal_id: proposalId,
    dj_id: m.dj.id,
    match_score: m.score,
    match_reasons: m.reasons,
    is_platform_recommended: m.recommended,
    display_order: i + 1,
    hold_status: 'none',
  }));
  revalidatePath('/admin/forslag');
  return { success: true };
}

export async function adminEditPriceComponents(bookingId: string, data: Partial<Booking>) {
  await requireRole('admin');
  updateBooking(bookingId, data);
  revalidatePath('/admin/bookinger');
  return { success: true };
}

export async function getStore() { return _getStore(); }
export async function getBookingById(id: string) { return _getBookingById(id); }
export async function getDJByUserId(userId: string) { return _getDJByUserId(userId); }
export async function updateBrief(id: string, data: Partial<EventBrief>) { return _updateBrief(id, data); }
export async function createProposal(data: Omit<Proposal, 'id' | 'created_at'>) { return _createProposal(data); }
export async function createProposalDJ(data: Omit<ProposalDJ, 'id'>) { return _createProposalDJ(data); }
export async function getOffersForDJ(djId: string) { return _getOffersForDJ(djId); }
export async function getMessagesForBooking(bookingId: string) { return _getMessagesForBooking(bookingId); }
export async function getDJAvailability(djId: string) { return _getDJAvailability(djId); }
export async function getDJDefaultAvailability(djId: string) { return _getDJDefaultAvailability(djId); }
export async function getEventBriefs() { return _getEventBriefs(); }
export async function getProposals() { return _getProposals(); }
export async function getBookingByBriefId(briefId: string) { return _getBookingByBriefId(briefId); }
export async function getDJs() { return _getDJs(); }
export async function getPackageById(id: string) { return _getPackageById(id); }
export async function getEventBriefById(id: string) { return _getEventBriefById(id); }
