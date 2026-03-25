export const PREMIER_VENUE_TYPES = ['auditorium', 'conference_hall', 'indoor_stadium', 'cineplex'] as const;
export type PremierVenueType = typeof PREMIER_VENUE_TYPES[number];

export interface VenueBooking {
  id: string;
  venueId: string;
  venueName: string;
  venueType: PremierVenueType;
  hostId: string;
  hostName: string;
  eventName: string;
  description: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface VenueRequest {
  id: string;
  bookingId: string;
  requestorId: string;
  requestorName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
}

export const VENUE_COLORS: Record<PremierVenueType, string> = {
  auditorium: 'hsl(0, 84%, 60%)',
  conference_hall: 'hsl(142, 71%, 45%)',
  indoor_stadium: 'hsl(38, 92%, 50%)',
  cineplex: 'hsl(199, 89%, 48%)',
};

export const VENUE_BG_COLORS: Record<PremierVenueType, string> = {
  auditorium: 'bg-destructive/20 text-destructive border-destructive/30',
  conference_hall: 'bg-success/20 text-success border-success/30',
  indoor_stadium: 'bg-warning/20 text-warning border-warning/30',
  cineplex: 'bg-info/20 text-info border-info/30',
};

export const VENUE_LABELS: Record<PremierVenueType, string> = {
  auditorium: 'Auditorium',
  conference_hall: 'Conference Hall',
  indoor_stadium: 'Indoor Stadium',
  cineplex: 'Cineplex',
};

export function isPremierVenue(type: string): type is PremierVenueType {
  return PREMIER_VENUE_TYPES.includes(type as PremierVenueType);
}
