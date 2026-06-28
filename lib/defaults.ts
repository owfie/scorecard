import type { Inputs } from "./model";

export type { Inputs };

export const DEFAULT_INPUTS: Inputs = {
  daysPerWeek: 6,
  weeksPerYear: 50,
  coffeesPerDay: 150,
  coffeePrice: 5.0,
  foodAttach: 45,
  foodPrice: 16.0,
  coffeeCogs: 25,
  foodCogs: 32,
  cogsMode: "percent",
  coffeeMilkCost: 0.55,
  coffeeBeanCost: 0.45,
  coffeeCupCost: 0.2,
  coffeeSundryCost: 0.05,
  foodIngredientCost: 4.42,
  foodPackagingCost: 0.7,
  eveningOn: false,
  eveningNights: 3,
  eveningCovers: 25,
  eveningSpend: 35.0,
  eveningCogs: 35,
  coworkOn: false,
  coworkMembers: 20,
  coworkPrice: 180,
  staffHoursPerWeek: 60,
  blendedRate: 36,
  ownerWagesAnnual: 0,
  renewMode: false,
  ratePerM2: 250,
  outgoingsPerM2: 70,
  areaMode: "modelled",
  manualArea: 80,
  utilities: 1100,
  insurance: 220,
  equipLease: 0,
  softwarePos: 120,
  marketing: 600,
  accounting: 300,
  repairsSundries: 450,
  merchantPct: 1.6,
  financeMonthly: 0,
  dineInPct: 55,
  busiestHourShare: 18,
  seatTurns: 1.2,
  seatArea: 1.7,
  counterArea: 8,
  bohPct: 35,
  deskArea: 3.5,
  outdoorSeats: 12,
  fitout: 60000,
  equipment: 25000,
  coffeeMachine: 0,
  bondDeposit: 15000,
  licensingLegal: 8000,
  initialStock: 6000,
  contingency: 12,
};

export const CRITERIA = [
  { key: "rentAfford", label: "Rent affordability (10 = cheap)" },
  { key: "footTraffic", label: "Passing foot traffic" },
  { key: "daytimePop", label: "Daytime population / workers" },
  { key: "eveningVibe", label: "Evening vibrancy (for pivot)" },
  { key: "lowComp", label: "Room to differentiate (low café saturation)" },
  { key: "grantElig", label: "Grant / incentive eligibility" },
  { key: "outdoor", label: "Outdoor seating potential" },
  { key: "access", label: "Parking & transport" },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]["key"];

export interface Site {
  name: string;
  rentPerM2: number;
  scores: Record<CriterionKey, number>;
}

export const SEED_WEIGHTS: Record<CriterionKey, number> = {
  rentAfford: 20,
  footTraffic: 18,
  daytimePop: 14,
  eveningVibe: 14,
  lowComp: 12,
  grantElig: 6,
  outdoor: 10,
  access: 6,
};

export const SEED_SITES: Site[] = [
  {
    name: "CBD West End",
    rentPerM2: 300,
    scores: { rentAfford: 5, footTraffic: 8, daytimePop: 9, eveningVibe: 8, lowComp: 6, grantElig: 6, outdoor: 6, access: 5 },
  },
  {
    name: "Prospect Rd",
    rentPerM2: 220,
    scores: { rentAfford: 7, footTraffic: 6, daytimePop: 6, eveningVibe: 6, lowComp: 5, grantElig: 4, outdoor: 8, access: 8 },
  },
  {
    name: "The Parade, Norwood",
    rentPerM2: 280,
    scores: { rentAfford: 5, footTraffic: 8, daytimePop: 7, eveningVibe: 7, lowComp: 3, grantElig: 3, outdoor: 7, access: 7 },
  },
  {
    name: "Jetty Rd, Glenelg",
    rentPerM2: 300,
    scores: { rentAfford: 4, footTraffic: 9, daytimePop: 6, eveningVibe: 8, lowComp: 4, grantElig: 3, outdoor: 9, access: 6 },
  },
  {
    name: "Bowden / Plant 4",
    rentPerM2: 250,
    scores: { rentAfford: 6, footTraffic: 6, daytimePop: 7, eveningVibe: 6, lowComp: 7, grantElig: 5, outdoor: 7, access: 7 },
  },
  {
    name: "Semaphore",
    rentPerM2: 200,
    scores: { rentAfford: 8, footTraffic: 6, daytimePop: 5, eveningVibe: 7, lowComp: 6, grantElig: 4, outdoor: 8, access: 8 },
  },
];
