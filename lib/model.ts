// Pure, typed financial core for the café venture model.
// Zero React imports — this is the testable heart of the app. Everything
// in lib/defaults.ts and the UI consumes `compute`.

export interface Inputs {
  daysPerWeek: number;
  weeksPerYear: number;
  coffeesPerDay: number;
  coffeePrice: number;
  foodAttach: number;
  foodPrice: number;
  coffeeCogs: number;
  foodCogs: number;
  // COGS can be entered directly as a % of price, or built up from per-unit
  // ingredient / packaging costs (cogsMode === "perUnit").
  cogsMode: "percent" | "perUnit";
  coffeeMilkCost: number;
  coffeeBeanCost: number;
  coffeeCupCost: number;
  coffeeSundryCost: number;
  foodIngredientCost: number;
  foodPackagingCost: number;
  eveningOn: boolean;
  eveningNights: number;
  eveningCovers: number;
  eveningSpend: number;
  eveningCogs: number;
  coworkOn: boolean;
  coworkMembers: number;
  coworkPrice: number;
  staffHoursPerWeek: number;
  blendedRate: number;
  ownerWagesAnnual: number;
  renewMode: boolean;
  ratePerM2: number;
  outgoingsPerM2: number;
  areaMode: "modelled" | "manual";
  manualArea: number;
  utilities: number;
  insurance: number;
  equipLease: number;
  softwarePos: number;
  marketing: number;
  accounting: number;
  repairsSundries: number;
  merchantPct: number;
  financeMonthly: number;
  dineInPct: number;
  busiestHourShare: number;
  seatTurns: number;
  seatArea: number;
  counterArea: number;
  bohPct: number;
  deskArea: number;
  outdoorSeats: number;
  fitout: number;
  equipment: number;
  coffeeMachine: number;
  bondDeposit: number;
  licensingLegal: number;
  initialStock: number;
  contingency: number;
}

export interface Results {
  opDays: number;
  // revenue lines
  dayRevenue: number;
  dayCogs: number;
  evRev: number;
  evCogs: number;
  cwRev: number;
  cwCogs: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  // effective COGS (derived from per-unit build-up when in that mode)
  coffeeCogsPct: number;
  foodCogsPct: number;
  coffeeUnitCost: number;
  foodUnitCost: number;
  // operating costs
  rent: number;
  outgoings: number;
  labour: number;
  fixed: number;
  merchant: number;
  opex: number;
  netProfit: number;
  // capital & returns
  capex: number;
  capexBase: number;
  contingencyAmount: number;
  roi: number;
  paybackMonths: number;
  beCoffees: number;
  // sizing
  dineInCovers: number;
  peakHourCovers: number;
  seats: number;
  seatingArea: number;
  coworkArea: number;
  fohArea: number;
  bohArea: number;
  modelledArea: number;
  area: number;
}

export function compute(i: Inputs): Results {
  const opDays = i.daysPerWeek * i.weeksPerYear;

  // ── COGS: direct % or built up from per-unit costs ────────────
  const coffeeUnitCost =
    i.coffeeMilkCost + i.coffeeBeanCost + i.coffeeCupCost + i.coffeeSundryCost;
  const foodUnitCost = i.foodIngredientCost + i.foodPackagingCost;
  const coffeeCogsPct =
    i.cogsMode === "perUnit"
      ? i.coffeePrice > 0
        ? (coffeeUnitCost / i.coffeePrice) * 100
        : 0
      : i.coffeeCogs;
  const foodCogsPct =
    i.cogsMode === "perUnit"
      ? i.foodPrice > 0
        ? (foodUnitCost / i.foodPrice) * 100
        : 0
      : i.foodCogs;

  // ── Daytime trade ──────────────────────────────────────────────
  const dayRevenue =
    (i.coffeesPerDay * i.coffeePrice +
      i.coffeesPerDay * (i.foodAttach / 100) * i.foodPrice) *
    opDays;
  const dayCogs =
    (i.coffeesPerDay * i.coffeePrice * (coffeeCogsPct / 100) +
      i.coffeesPerDay *
        (i.foodAttach / 100) *
        i.foodPrice *
        (foodCogsPct / 100)) *
    opDays;

  // ── Evening service (optional pivot) ──────────────────────────
  let evRev = 0;
  let evCogs = 0;
  if (i.eveningOn) {
    const nights = i.eveningNights * i.weeksPerYear;
    evRev = i.eveningCovers * i.eveningSpend * nights;
    evCogs = evRev * (i.eveningCogs / 100);
  }

  // ── Co-working memberships (optional) ─────────────────────────
  let cwRev = 0;
  const cwCogs = 0;
  if (i.coworkOn) {
    cwRev = i.coworkMembers * i.coworkPrice * 12;
  }

  const revenue = dayRevenue + evRev + cwRev;
  const cogs = dayCogs + evCogs + cwCogs;
  const grossProfit = revenue - cogs;

  // ── Space sizing ──────────────────────────────────────────────
  const dineInCovers = i.coffeesPerDay * (i.dineInPct / 100);
  const peakHourCovers = dineInCovers * (i.busiestHourShare / 100);
  const seats = Math.ceil(peakHourCovers / Math.max(i.seatTurns, 0.1));
  const seatingArea = seats * i.seatArea;
  const coworkArea = i.coworkOn ? i.coworkMembers * 0.6 * i.deskArea : 0;
  const fohArea = seatingArea + i.counterArea;
  const bohArea = fohArea * (i.bohPct / 100);
  const modelledArea = fohArea + bohArea + coworkArea;
  const area = i.areaMode === "manual" ? i.manualArea : modelledArea;

  // ── Operating costs ───────────────────────────────────────────
  const rent = i.renewMode ? 0 : area * i.ratePerM2;
  const outgoings = area * i.outgoingsPerM2;
  const labour = i.staffHoursPerWeek * 52 * i.blendedRate + i.ownerWagesAnnual;
  const fixed =
    (i.utilities +
      i.insurance +
      i.equipLease +
      i.softwarePos +
      i.marketing +
      i.accounting +
      i.repairsSundries +
      i.financeMonthly) *
    12;
  const merchant = revenue * (i.merchantPct / 100);
  const opex = rent + outgoings + labour + fixed + merchant;

  // Operating profit — pre-tax & pre-depreciation.
  const netProfit = grossProfit - opex;

  // ── Capital & returns ─────────────────────────────────────────
  const capexBase =
    i.fitout +
    i.equipment +
    i.coffeeMachine +
    i.bondDeposit +
    i.licensingLegal +
    i.initialStock;
  const contingencyAmount = capexBase * (i.contingency / 100);
  const capex = capexBase + contingencyAmount;
  const roi = capex !== 0 ? (netProfit / capex) * 100 : 0;
  const paybackMonths = netProfit > 0 ? capex / (netProfit / 12) : Infinity;

  // ── Break-even coffees/day ────────────────────────────────────
  const gpPerCoffeeDay =
    opDays *
    (i.coffeePrice * (1 - coffeeCogsPct / 100) +
      (i.foodAttach / 100) * i.foodPrice * (1 - foodCogsPct / 100));
  const beCoffees =
    gpPerCoffeeDay !== 0
      ? (opex - merchant - (evRev - evCogs) - (cwRev - cwCogs)) / gpPerCoffeeDay
      : Infinity;

  return {
    opDays,
    dayRevenue,
    dayCogs,
    evRev,
    evCogs,
    cwRev,
    cwCogs,
    revenue,
    cogs,
    grossProfit,
    coffeeCogsPct,
    foodCogsPct,
    coffeeUnitCost,
    foodUnitCost,
    rent,
    outgoings,
    labour,
    fixed,
    merchant,
    opex,
    netProfit,
    capex,
    capexBase,
    contingencyAmount,
    roi,
    paybackMonths,
    beCoffees,
    dineInCovers,
    peakHourCovers,
    seats,
    seatingArea,
    coworkArea,
    fohArea,
    bohArea,
    modelledArea,
    area,
  };
}
