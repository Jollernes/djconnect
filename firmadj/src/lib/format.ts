export function formatDate(date?: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return d.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(date?: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatCurrency(amount?: number, opts?: { includeVat?: boolean }): string {
  if (amount === undefined || amount === null) return '';
  const formatted = amount.toLocaleString('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 });
  if (opts?.includeVat) return `${formatted} inkl. moms`;
  return `${formatted} ekskl. moms`;
}

export function formatRange(from?: number, to?: number): string {
  if (from === undefined && to === undefined) return '';
  if (to === undefined || from === to) return formatCurrency(from);
  return `${formatCurrency(from)} - ${formatCurrency(to)}`;
}

export function parseGuestCount(range?: string): { min: number; max: number; exact?: number } {
  if (!range) return { min: 0, max: 9999 };
  if (range === 'Under 50') return { min: 0, max: 50 };
  if (range === '50 to 80') return { min: 50, max: 80 };
  if (range === '80 to 150') return { min: 80, max: 150 };
  if (range === '150 to 200') return { min: 150, max: 200 };
  if (range === '200+') return { min: 200, max: 9999 };
  if (range === 'Not sure') return { min: 0, max: 9999 };
  const match = range.match(/(\d+)/);
  if (match) return { min: Number(match[1]), max: Number(match[1]), exact: Number(match[1]) };
  return { min: 0, max: 9999 };
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function statusLabel(status?: string): string {
  const labels: Record<string, string> = {
    new_lead: 'Ny lead',
    proposal_created: 'Forslag oprettet',
    provisional_hold: 'Foreløbig reservation',
    awaiting_final_confirmation: 'Afventer bekræftelse',
    awaiting_deposit_or_invoice: 'Afventer faktura/depositum',
    confirmed: 'Bekræftet',
    questionnaire_sent: 'Spørgeskema sendt',
    questionnaire_completed: 'Spørgeskema udfyldt',
    technical_confirmed: 'Teknik bekræftet',
    run_sheet_ready: 'Køreplan klar',
    completed: 'Gennemført',
    cancelled: 'Aflyst',
  };
  return labels[status || ''] || status || '';
}

export const bookingTimeline: { key: string; label: string }[] = [
  { key: 'new_lead', label: 'Brief modtaget' },
  { key: 'proposal_created', label: 'Forslag oprettet' },
  { key: 'provisional_hold', label: 'Foreløbig reservation' },
  { key: 'awaiting_final_confirmation', label: 'Endeligt tilbud sendt' },
  { key: 'confirmed', label: 'Bekræftet' },
  { key: 'questionnaire_sent', label: 'Spørgeskema sendt' },
  { key: 'questionnaire_completed', label: 'Spørgeskema udfyldt' },
  { key: 'technical_confirmed', label: 'Teknik bekræftet' },
  { key: 'run_sheet_ready', label: 'Køreplan klar' },
  { key: 'completed', label: 'Arrangement gennemført' },
];
