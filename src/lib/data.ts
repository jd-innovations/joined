export type Sport = "soccer" | "basketball" | "baseball" | "volleyball" | "tennis";

export interface Group {
  id: string;
  name: string;
  sport: Sport;
  emoji: string;
  joinCode: string;
  memberCount: number;
  coverUrl: string;
  isPremium: boolean;
}

export type RsvpStatus = "going" | "maybe" | "not_going";

export interface Event {
  id: string;
  groupId: string;
  title: string;
  type: "practice" | "game" | "social" | "meetup";
  startAt: string; // ISO
  endAt: string; // ISO
  location: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  rsvpStatus?: RsvpStatus;
  goingCount: number;
  maybeCount: number;
  notGoingCount: number;
  checkedInCount: number;
  isLive: boolean;
  liveScore?: { us: number; them: number };
  coverUrl: string;
  weather?: {
    temp: number;
    condition: "sunny" | "cloudy" | "rainy" | "partly_cloudy";
    playability: "good" | "caution" | "poor";
  };
}

export interface User {
  id: string;
  displayName: string;
  avatarUrl: string;
  pointsEarned: number;
  pointsSaved: number;
}

export interface ActionItem {
  id: string;
  type: "rsvp" | "poll" | "volunteer" | "form";
  title: string;
  subtitle: string;
  eventId?: string;
  groupId?: string;
}

export interface LiveActivity {
  id: string;
  eventId: string;
  title: string;
  status: "pre" | "live" | "final";
  countdown?: string;
  score?: { us: number; them: number };
  update?: string;
}

export const currentUser: User = {
  id: "u1",
  displayName: "JD",
  avatarUrl:
    "https://images.unsplash.com/photo-1740252117012-bb53ad05e370?auto=format&fit=crop&q=80&w=200&h=200",
  pointsEarned: 1240,
  pointsSaved: 320,
};

export const groups: Group[] = [
  {
    id: "g1",
    name: "FC United",
    sport: "soccer",
    emoji: "⚽",
    joinCode: "FIRE7",
    memberCount: 22,
    coverUrl:
      "https://images.pexels.com/photos/38224034/pexels-photo-38224034.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    isPremium: true,
  },
  {
    id: "g2",
    name: "Court Kings",
    sport: "basketball",
    emoji: "🏀",
    joinCode: "HOOPS",
    memberCount: 14,
    coverUrl:
      "https://images.pexels.com/photos/12954255/pexels-photo-12954255.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    isPremium: false,
  },
  {
    id: "g3",
    name: "Beach Bumpers",
    sport: "volleyball",
    emoji: "🏐",
    joinCode: "SANDY",
    memberCount: 18,
    coverUrl:
      "https://images.pexels.com/photos/19834317/pexels-photo-19834317.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    isPremium: false,
  },
];

export const events: Event[] = [
  {
    id: "e1",
    groupId: "g1",
    title: "League Match vs Rangers",
    type: "game",
    startAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2h from now
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    location: {
      name: "Memorial Field",
      address: "123 Main St, Springfield",
      lat: 40.7128,
      lng: -74.006,
    },
    rsvpStatus: "going",
    goingCount: 14,
    maybeCount: 3,
    notGoingCount: 2,
    checkedInCount: 0,
    isLive: false,
    coverUrl:
      "https://images.pexels.com/photos/38224034/pexels-photo-38224034.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    weather: { temp: 72, condition: "partly_cloudy", playability: "good" },
  },
  {
    id: "e2",
    groupId: "g2",
    title: "Practice — Pick & Roll",
    type: "practice",
    startAt: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(),
    location: {
      name: "Sunset Rec Center",
      address: "456 Oak Ave, Springfield",
      lat: 40.72,
      lng: -74.01,
    },
    goingCount: 9,
    maybeCount: 2,
    notGoingCount: 1,
    checkedInCount: 0,
    isLive: false,
    coverUrl:
      "https://images.pexels.com/photos/12954255/pexels-photo-12954255.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    weather: { temp: 68, condition: "sunny", playability: "good" },
  },
  {
    id: "e3",
    groupId: "g1",
    title: "Scrimmage — Inter-squad",
    type: "game",
    startAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // live
    endAt: new Date(Date.now() + 1000 * 60 * 60 * 1.5).toISOString(),
    location: {
      name: "Westside Park",
      address: "789 Pine Rd, Springfield",
      lat: 40.71,
      lng: -74.02,
    },
    rsvpStatus: "going",
    goingCount: 18,
    maybeCount: 1,
    notGoingCount: 0,
    checkedInCount: 12,
    isLive: true,
    liveScore: { us: 2, them: 1 },
    coverUrl:
      "https://images.pexels.com/photos/38224034/pexels-photo-38224034.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    weather: { temp: 75, condition: "sunny", playability: "good" },
  },
];

export const actionItems: ActionItem[] = [
  {
    id: "a1",
    type: "rsvp",
    title: "RSVP needed",
    subtitle: "Practice — Pick & Roll is tomorrow",
    eventId: "e2",
    groupId: "g2",
  },
  {
    id: "a2",
    type: "volunteer",
    title: "Volunteer slot open",
    subtitle: "Snacks for Saturday's game",
    eventId: "e1",
    groupId: "g1",
  },
  {
    id: "a3",
    type: "poll",
    title: "New poll",
    subtitle: "What color jerseys for the tournament?",
    groupId: "g1",
  },
];

export const liveActivities: LiveActivity[] = [
  {
    id: "l1",
    eventId: "e3",
    title: "Scrimmage — Inter-squad",
    status: "live",
    score: { us: 2, them: 1 },
    update: "12 checked in · Field 4",
  },
];

export function getNextEvent(): Event | undefined {
  const now = new Date().toISOString();
  return events
    .filter((e) => e.startAt > now)
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )[0];
}

export function getLiveActivities(): LiveActivity[] {
  return liveActivities;
}

export function formatEventTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeTime(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffMins = Math.round(diffMs / (1000 * 60));
  if (diffMins < 60) return `${diffMins} min`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d`;
}

export function getWeatherForUser(): {
  temp: number;
  condition: string;
  high: number;
  low: number;
  location: string;
} {
  return {
    temp: 72,
    condition: "Partly cloudy",
    high: 78,
    low: 64,
    location: "Springfield",
  };
}
