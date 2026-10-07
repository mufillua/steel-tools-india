/**
 * Single source of truth for company details.
 * Every component reads from COMPANY — never hardcode phone / email / address elsewhere.
 *
 * Details below were supplied directly by the client (30 Sep 2026).
 */

export interface BusinessHours {
  /** Label shown on the site, e.g. "Monday – Friday". */
  label: string;
  /** Short label for tight spaces, e.g. "Mon – Fri". */
  short: string;
  /** ISO weekday numbers covered: 1 = Monday … 7 = Sunday. */
  days: number[];
  /** 24-hour "HH:MM", or null when closed. */
  opens: string | null;
  closes: string | null;
}

export interface CompanyConfig {
  name: string;
  tagline: string;
  foundedYear: number;
  city: string;

  /** Human-readable phone, shown in the navbar as "Ph. No. …" */
  phoneDisplay: string;
  /** E.164 form used for tel: links */
  phoneE164: string;

  /** Human-readable WhatsApp number */
  whatsappDisplay: string;
  /** Digits only, country code first, no "+" — the format wa.me expects */
  whatsappDigits: string;

  email: string;

  /** Owner, as supplied by the client (1 Oct 2026). */
  owner: { name: string; role: string };

  /** Opening hours, as supplied by the client (1 Oct 2026). Times are local (Asia/Kolkata). */
  hours: BusinessHours[];
  timeZone: string;

  address: {
    lines: string[];
    city: string;
    pincode: string;
    country: string;
  };

  /**
   * Client instruction: prices must NOT appear anywhere on the website.
   * Product data deliberately carries no price fields; this flag documents that decision.
   */
  showPrices: false;

  /** Placeholder until the production domain is confirmed — used for canonical/OG URLs later. */
  siteUrl: string;
}

export const COMPANY: CompanyConfig = {
  name: 'Steel Tools India',
  tagline: 'Since 1957',
  foundedYear: 1957,
  city: 'Kolkata',

  phoneDisplay: '+91 98302 58198',
  phoneE164: '+919830258198',

  // TODO(confirm): the client supplied one phone number; it is assumed to also be the WhatsApp number.
  whatsappDisplay: '+91 98302 58198',
  whatsappDigits: '919830258198',

  email: 'huzi11052@gmail.com',

  owner: { name: 'Huzefa Maimoon', role: 'Owner' },

  hours: [
    { label: 'Monday – Friday', short: 'Mon – Fri', days: [1, 2, 3, 4, 5], opens: '10:00', closes: '18:00' },
    { label: 'Saturday', short: 'Sat', days: [6], opens: '10:00', closes: '17:00' },
    { label: 'Sunday', short: 'Sun', days: [7], opens: null, closes: null },
  ],
  timeZone: 'Asia/Kolkata',

  address: {
    lines: ['67/B, N. S. Road, Room No. 37'],
    city: 'Kolkata',
    pincode: '700001',
    country: 'India',
  },

  showPrices: false,

  // Live domain. Serve the site at this exact address (no www) and redirect www to it.
  siteUrl: 'https://www.steeltoolsind.com',
};

/** Convenience helpers so templates never build links by hand. */
export const COMPANY_LINKS = {
  tel: `tel:${COMPANY.phoneE164}`,
  mailto: `mailto:${COMPANY.email}`,
  whatsapp: `https://wa.me/${COMPANY.whatsappDigits}`,
  mapsSearch: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [...COMPANY.address.lines, `${COMPANY.address.city} ${COMPANY.address.pincode}`].join(', '),
  )}`,
  /** Keyless Google Maps embed for the Contact page (search by the address as supplied). */
  mapsEmbed: `https://www.google.com/maps?q=${encodeURIComponent(
    [...COMPANY.address.lines, `${COMPANY.address.city} ${COMPANY.address.pincode}`, COMPANY.address.country].join(', '),
  )}&output=embed`,
} as const;

export const COMPANY_ADDRESS_ONE_LINE = [
  ...COMPANY.address.lines,
  `${COMPANY.address.city} ${COMPANY.address.pincode}`,
].join(', ');
