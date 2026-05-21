const YEARS = Array.from({ length: 11 }, (_, index) => 2025 + index);
const STORAGE_KEY = "financial-dashboard-model-v9";
const CPI_SERIES = {
  US: { id: "CUUR0000SA0", label: "US CPI-U" },
  CA: { id: "CUURS49BSA0", label: "CA CPI-U proxy (San Francisco-Oakland-Hayward)" },
};
const TAX_FILING_STATUSES = {
  single: "Single",
  marriedJoint: "Married filing jointly",
  headOfHousehold: "Head of household",
};
const TAX_SOURCES = {
  federal: "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets",
  california: "https://www.ftb.ca.gov/forms/2025/2025-540-tax-rate-schedules.pdf",
  californiaSurtax: "https://www.ftb.ca.gov/forms/2025/2025-540-es-instructions.html",
  ficaWageBase: "https://www.ssa.gov/news/en/cola/factsheets/2025.html",
  additionalMedicare: "https://www.irs.gov/taxtopics/tc560",
};
const FICA_TAX = {
  socialSecurityRate: 0.062,
  socialSecurityWageBase: 176100,
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  additionalMedicareThresholds: {
    single: 200000,
    marriedJoint: 250000,
    headOfHousehold: 200000,
  },
};
const WEALTH_PERCENTILE_SOURCE = "https://www.freefincalc.net/net-worth-calculator";
const WEALTH_PERCENTILE_OFFICIAL_SOURCE = "https://www.federalreserve.gov/releases/z1/dataviz/dfa/";
const WEALTH_PERCENTILES = [
  { percentile: 25, netWorth: 27100 },
  { percentile: 50, netWorth: 192700 },
  { percentile: 75, netWorth: 658900 },
  { percentile: 90, netWorth: 1920758 },
  { percentile: 99, netWorth: 14000000 },
];
const TAX_BRACKETS = {
  federal: {
    label: "Federal ordinary income tax",
    source: TAX_SOURCES.federal,
    brackets: {
      single: [
        { over: 0, upTo: 11925, rate: 0.10 },
        { over: 11925, upTo: 48475, rate: 0.12 },
        { over: 48475, upTo: 103350, rate: 0.22 },
        { over: 103350, upTo: 197300, rate: 0.24 },
        { over: 197300, upTo: 250525, rate: 0.32 },
        { over: 250525, upTo: 626350, rate: 0.35 },
        { over: 626350, upTo: Infinity, rate: 0.37 },
      ],
      marriedJoint: [
        { over: 0, upTo: 23850, rate: 0.10 },
        { over: 23850, upTo: 96950, rate: 0.12 },
        { over: 96950, upTo: 206700, rate: 0.22 },
        { over: 206700, upTo: 394600, rate: 0.24 },
        { over: 394600, upTo: 501050, rate: 0.32 },
        { over: 501050, upTo: 751600, rate: 0.35 },
        { over: 751600, upTo: Infinity, rate: 0.37 },
      ],
      headOfHousehold: [
        { over: 0, upTo: 17000, rate: 0.10 },
        { over: 17000, upTo: 64850, rate: 0.12 },
        { over: 64850, upTo: 103350, rate: 0.22 },
        { over: 103350, upTo: 197300, rate: 0.24 },
        { over: 197300, upTo: 250500, rate: 0.32 },
        { over: 250500, upTo: 626350, rate: 0.35 },
        { over: 626350, upTo: Infinity, rate: 0.37 },
      ],
    },
  },
  california: {
    label: "California Form 540 regular tax",
    source: TAX_SOURCES.california,
    brackets: {
      single: [
        { over: 0, upTo: 11079, rate: 0.01 },
        { over: 11079, upTo: 26264, rate: 0.02 },
        { over: 26264, upTo: 41452, rate: 0.04 },
        { over: 41452, upTo: 57542, rate: 0.06 },
        { over: 57542, upTo: 72724, rate: 0.08 },
        { over: 72724, upTo: 371479, rate: 0.093 },
        { over: 371479, upTo: 445771, rate: 0.103 },
        { over: 445771, upTo: 742953, rate: 0.113 },
        { over: 742953, upTo: Infinity, rate: 0.123 },
      ],
      marriedJoint: [
        { over: 0, upTo: 22158, rate: 0.01 },
        { over: 22158, upTo: 52528, rate: 0.02 },
        { over: 52528, upTo: 82904, rate: 0.04 },
        { over: 82904, upTo: 115084, rate: 0.06 },
        { over: 115084, upTo: 145448, rate: 0.08 },
        { over: 145448, upTo: 742958, rate: 0.093 },
        { over: 742958, upTo: 891542, rate: 0.103 },
        { over: 891542, upTo: 1485906, rate: 0.113 },
        { over: 1485906, upTo: Infinity, rate: 0.123 },
      ],
      headOfHousehold: [
        { over: 0, upTo: 22173, rate: 0.01 },
        { over: 22173, upTo: 52530, rate: 0.02 },
        { over: 52530, upTo: 67716, rate: 0.04 },
        { over: 67716, upTo: 83805, rate: 0.06 },
        { over: 83805, upTo: 98990, rate: 0.08 },
        { over: 98990, upTo: 505208, rate: 0.093 },
        { over: 505208, upTo: 606251, rate: 0.103 },
        { over: 606251, upTo: 1010417, rate: 0.113 },
        { over: 1010417, upTo: Infinity, rate: 0.123 },
      ],
    },
    surtaxes: [
      {
        label: "Behavioral Health Services Tax",
        threshold: 1000000,
        rate: 0.01,
        source: TAX_SOURCES.californiaSurtax,
      },
    ],
  },
};

const defaultModel = {
  scenario: "Base",
  displayCurrency: "USD",
  cadUsdFx: 0.73,
  startingInvestmentAssetsUsd: 1600000,
  startingRealEstateAssetsUsd: 400000,
  investmentReturn: 0.10,
  realEstateGrowth: 0.04,
  housePurchaseYear: 2028,
  houseValue: 2000000,
  houseDownPaymentPct: 0.20,
  mortgageTermYears: 30,
  mortgageInterestRate: 0.06,
  propertyTaxRate: 0.0118,
  taxFilingStatus: "single",
  cpiSource: "US",
  cpi: 0.04,
  lastRefresh: "",
  applyPartner: true,
  applyLifeEvents: true,
  scenarios: [
    { name: "Downside", salaryGrowth: 0.10, expenses: 1.05, returnAdj: -0.02 },
    { name: "Base", salaryGrowth: 0.12, expenses: 1, returnAdj: 0 },
    { name: "Upside", salaryGrowth: 0.15, expenses: 0.95, returnAdj: 0.02 },
  ],
  annual: {
    baseGrossSalary: 540000,
    salaryGrowth: 0.12,
    baseCoreExpenses: 150000,
    partnerCf: [135000, 135000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    career: ["Lead", "Lead", "Principal", "Principal", "Head", "Head", "Head", "Dir", "Dir", "Dir", "Senior Director"],
    personalEvent: ["SF move", "Wedding", "1st kid", "House", "2nd kid", "", "", "", "", "", ""],
  },
  lifeEvents: [
    { event: "Sell cottage", enabled: true, type: "One-time", start: 2028, end: 2028, amount: 86956.52, notes: "Inflow" },
    { event: "Wedding", enabled: true, type: "One-time", start: 2026, end: 2026, amount: -15000, notes: "One-time cost" },
    { event: "Buy car", enabled: true, type: "One-time", start: 2026, end: 2026, amount: -30000, notes: "One-time cost" },
    { event: "House purchase", enabled: true, type: "Recurring", start: 2028, end: 2035, amount: 0, notes: "Pulls Home purchase and mortgage inputs" },
    { event: "1st kid", enabled: true, type: "Recurring", start: 2029, end: 2035, amount: -30000, notes: "Recurring child cost" },
    { event: "2nd kid", enabled: true, type: "Recurring", start: 2031, end: 2035, amount: -30000, notes: "Recurring child cost" },
  ],
  assets: [
    { owner: "Michelle", currency: "CAD", value: 1141498 },
    { owner: "Patrick", currency: "CAD", value: 506358 },
  ],
};

let model = loadModel();

const els = {
  scenario: document.querySelector("#scenario"),
  displayCurrency: document.querySelector("#displayCurrency"),
  cadUsdFx: document.querySelector("#cadUsdFx"),
  startingInvestmentAssetsUsd: document.querySelector("#startingInvestmentAssetsUsd"),
  startingRealEstateAssetsUsd: document.querySelector("#startingRealEstateAssetsUsd"),
  baseGrossSalary: document.querySelector("#baseGrossSalary"),
  salaryGrowth: document.querySelector("#salaryGrowth"),
  investmentReturn: document.querySelector("#investmentReturn"),
  realEstateGrowth: document.querySelector("#realEstateGrowth"),
  houseValue: document.querySelector("#houseValue"),
  houseDownPaymentPct: document.querySelector("#houseDownPaymentPct"),
  mortgageTermYears: document.querySelector("#mortgageTermYears"),
  mortgageInterestRate: document.querySelector("#mortgageInterestRate"),
  propertyTaxRate: document.querySelector("#propertyTaxRate"),
  taxFilingStatus: document.querySelector("#taxFilingStatus"),
  cpiSource: document.querySelector("#cpiSource"),
  cpi: document.querySelector("#cpi"),
  baseCoreExpenses: document.querySelector("#baseCoreExpenses"),
  applyPartner: document.querySelector("#applyPartner"),
  applyLifeEvents: document.querySelector("#applyLifeEvents"),
  refreshInputs: document.querySelector("#refreshInputs"),
  refreshStatus: document.querySelector("#refreshStatus"),
  annualInputsTable: document.querySelector("#annualInputsTable"),
  scenarioTable: document.querySelector("#scenarioTable"),
  eventsTable: document.querySelector("#eventsTable"),
  assetsTable: document.querySelector("#assetsTable"),
  kpiGrid: document.querySelector("#kpiGrid"),
  projectionTable: document.querySelector("#projectionTable"),
  taxBracketContent: document.querySelector("#taxBracketContent"),
  wealthStatsContent: document.querySelector("#wealthStatsContent"),
  incomeChart: document.querySelector("#incomeChart"),
  cashOutChart: document.querySelector("#cashOutChart"),
  assetsChart: document.querySelector("#assetsChart"),
  modelStatus: document.querySelector("#modelStatus"),
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadModel() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return clone(defaultModel);
  try {
    return normalizeModel(JSON.parse(stored));
  } catch {
    return clone(defaultModel);
  }
}

function normalizeModel(raw) {
  const next = clone(defaultModel);
  Object.assign(next, raw || {});
  next.annual = { ...clone(defaultModel.annual), ...(raw?.annual || {}) };
  if (Array.isArray(next.annual.salaryGrowth)) {
    const growthValues = next.annual.salaryGrowth.filter((value) => Number.isFinite(Number(value)) && Number(value) !== 0);
    next.annual.salaryGrowth = growthValues.length ? growthValues.reduce((sum, value) => sum + Number(value), 0) / growthValues.length : defaultModel.annual.salaryGrowth;
  }
  if (!TAX_FILING_STATUSES[next.taxFilingStatus]) next.taxFilingStatus = defaultModel.taxFilingStatus;
  if (!Number.isFinite(Number(next.startingInvestmentAssetsUsd)) && Number.isFinite(Number(raw?.startingAssetsUsd))) {
    next.startingInvestmentAssetsUsd = numberValue(raw.startingAssetsUsd);
  }
  if (!Number.isFinite(Number(next.startingInvestmentAssetsUsd))) {
    const assetsCad = (raw?.assets || defaultModel.assets).reduce((sum, asset) => sum + numberValue(asset.value), 0);
    next.startingInvestmentAssetsUsd = assetsCad * numberValue(next.cadUsdFx || defaultModel.cadUsdFx);
  }
  if (!Number.isFinite(Number(next.startingRealEstateAssetsUsd))) next.startingRealEstateAssetsUsd = 0;
  if (!Number.isFinite(Number(next.realEstateGrowth))) next.realEstateGrowth = defaultModel.realEstateGrowth;
  if (!Number.isFinite(Number(next.housePurchaseYear))) next.housePurchaseYear = defaultModel.housePurchaseYear;
  if (!Number.isFinite(Number(next.houseValue))) next.houseValue = defaultModel.houseValue;
  if (!Number.isFinite(Number(next.houseDownPaymentPct))) next.houseDownPaymentPct = defaultModel.houseDownPaymentPct;
  if (!Number.isFinite(Number(next.mortgageTermYears))) next.mortgageTermYears = defaultModel.mortgageTermYears;
  if (!Number.isFinite(Number(next.mortgageInterestRate))) next.mortgageInterestRate = defaultModel.mortgageInterestRate;
  if (!Number.isFinite(Number(next.propertyTaxRate))) next.propertyTaxRate = defaultModel.propertyTaxRate;
  next.scenarios = next.scenarios.map((scenario, index) => ({
    ...scenario,
    salaryGrowth: Number.isFinite(Number(scenario.salaryGrowth)) ? Number(scenario.salaryGrowth) : defaultModel.scenarios[index]?.salaryGrowth || defaultModel.annual.salaryGrowth,
  }));
  next.lifeEvents = (raw?.lifeEvents || next.lifeEvents).map((event, index) => ({
    ...clone(defaultModel.lifeEvents[index] || defaultModel.lifeEvents.at(-1)),
    ...event,
    type: event.type || (event.start === event.end ? "One-time" : "Recurring"),
  }));
  next.assets = raw?.assets || next.assets;
  return next;
}

function saveModel() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
}

function money(value, digits = 2, currency = model.displayCurrency) {
  const converted = currency === "CAD" ? value / model.cadUsdFx : value;
  const convertedAbs = Math.abs(converted);
  const formatted = convertedAbs.toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
  if (converted < 0) return `(${formatted})`;
  return formatted;
}

function moneyFromCad(valueCad, digits = 2, currency = model.displayCurrency) {
  const value = currency === "CAD" ? valueCad : valueCad * model.cadUsdFx;
  const formatted = Math.abs(value).toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
  if (value < 0) return `(${formatted})`;
  return formatted;
}

function displayAmount(valueUsd) {
  return model.displayCurrency === "CAD" ? valueUsd / model.cadUsdFx : valueUsd;
}

function displayCadAmount(valueCad) {
  return model.displayCurrency === "CAD" ? valueCad : valueCad * model.cadUsdFx;
}

function percent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function numberValue(value) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function parseCurrency(value) {
  const raw = String(value ?? "").trim();
  const negative = raw.startsWith("(") && raw.endsWith(")");
  const cleaned = raw.replace(/[,$\s()]/g, "");
  const next = Number(cleaned);
  if (!Number.isFinite(next)) return 0;
  return negative ? -next : next;
}

function parsePercentInput(value) {
  const raw = String(value ?? "").trim();
  const cleaned = raw.replace(/[%\s,]/g, "");
  const next = Number(cleaned);
  if (!Number.isFinite(next)) return 0;
  return raw.includes("%") || Math.abs(next) > 1 ? next / 100 : next;
}

function formatCurrencyInput(value, currency = "USD") {
  const next = numberValue(value);
  const formatted = Math.abs(next).toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  return next < 0 ? `(${formatted})` : formatted;
}

function formatPercentInput(value) {
  return `${(numberValue(value) * 100).toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}%`;
}

function wealthPercentile(valueUsd) {
  const value = Math.max(0, numberValue(valueUsd));
  const points = WEALTH_PERCENTILES;
  if (value <= points[0].netWorth) {
    return value <= 0 ? 0 : (value / points[0].netWorth) * points[0].percentile;
  }
  for (let index = 1; index < points.length; index += 1) {
    const lower = points[index - 1];
    const upper = points[index];
    if (value <= upper.netWorth) {
      const lowerLog = Math.log10(Math.max(1, lower.netWorth));
      const upperLog = Math.log10(Math.max(1, upper.netWorth));
      const valueLog = Math.log10(Math.max(1, value));
      const weight = (valueLog - lowerLog) / (upperLog - lowerLog || 1);
      return lower.percentile + (upper.percentile - lower.percentile) * Math.max(0, Math.min(1, weight));
    }
  }
  return 99;
}

function formatPercentile(value) {
  if (value >= 99) return "99th+";
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 0 })}th`;
}

function calculateProgressiveTax(income, brackets) {
  const taxableIncome = Math.max(0, numberValue(income));
  return brackets.reduce((tax, bracket) => {
    if (taxableIncome <= bracket.over) return tax;
    const top = Number.isFinite(bracket.upTo) ? Math.min(taxableIncome, bracket.upTo) : taxableIncome;
    return tax + Math.max(0, top - bracket.over) * bracket.rate;
  }, 0);
}

function calculateSurtaxes(income, surtaxes = []) {
  const taxableIncome = Math.max(0, numberValue(income));
  return surtaxes.reduce((tax, surtax) => {
    if (taxableIncome <= surtax.threshold) return tax;
    return tax + (taxableIncome - surtax.threshold) * surtax.rate;
  }, 0);
}

function calculateFicaTax(income, filingStatus) {
  const wages = Math.max(0, numberValue(income));
  const socialSecurityTax = Math.min(wages, FICA_TAX.socialSecurityWageBase) * FICA_TAX.socialSecurityRate;
  const medicareTax = wages * FICA_TAX.medicareRate;
  const additionalThreshold = FICA_TAX.additionalMedicareThresholds[filingStatus] || FICA_TAX.additionalMedicareThresholds.single;
  const additionalMedicareTax = Math.max(0, wages - additionalThreshold) * FICA_TAX.additionalMedicareRate;
  return socialSecurityTax + medicareTax + additionalMedicareTax;
}

function annualMortgagePayment(principal, annualRate, years) {
  const balance = Math.max(0, numberValue(principal));
  const rate = Math.max(0, numberValue(annualRate));
  const periods = Math.max(1, numberValue(years));
  if (!balance) return 0;
  if (!rate) return balance / periods;
  return (balance * rate) / (1 - (1 + rate) ** -periods);
}

function selectedScenario() {
  return model.scenarios.find((scenario) => scenario.name === model.scenario) || model.scenarios[1];
}

function selectedSalaryGrowth() {
  const scenarioGrowth = numberValue(selectedScenario().salaryGrowth);
  return scenarioGrowth || numberValue(model.annual.salaryGrowth);
}

function isHouseEvent(event) {
  return ["House purchase", "House down payment", "House mortgage delta vs. rent"].includes(event.event);
}

function selectedHouseEvent() {
  return model.lifeEvents.find((event) => event.event === "House purchase")
    || model.lifeEvents.find((event) => isHouseEvent(event));
}

function calculateProjection() {
  const scenario = selectedScenario();
  let investmentAssetsUsd = numberValue(model.startingInvestmentAssetsUsd);
  let realEstateAssetsUsd = numberValue(model.startingRealEstateAssetsUsd);
  let mortgageBalance = 0;
  let yearsPaid = 0;
  let purchasedHouseValue = 0;
  let priorGrossSalary = 0;
  let priorCoreExpenses = 0;
  const houseEvent = selectedHouseEvent();
  const houseEnabled = Boolean(model.applyLifeEvents && houseEvent?.enabled);
  const houseStartYear = houseEnabled ? numberValue(houseEvent.start) : numberValue(model.housePurchaseYear);
  const houseEndYear = houseEnabled ? numberValue(houseEvent.end) : numberValue(model.housePurchaseYear);

  return YEARS.map((year, index) => {
    const beginningInvestmentAssets = investmentAssetsUsd;
    const beginningRealEstateAssets = realEstateAssetsUsd;
    const beginningNetAssets = beginningInvestmentAssets + beginningRealEstateAssets;
    const baseGrossSalary = index === 0
      ? numberValue(model.annual.baseGrossSalary)
      : priorGrossSalary * (1 + selectedSalaryGrowth());
    const grossSalary = baseGrossSalary;
    priorGrossSalary = baseGrossSalary;
    const taxStatus = model.taxFilingStatus;
    const federalTaxes = calculateProgressiveTax(grossSalary, TAX_BRACKETS.federal.brackets[taxStatus]);
    const californiaRegularTaxes = calculateProgressiveTax(grossSalary, TAX_BRACKETS.california.brackets[taxStatus]);
    const californiaSurtaxes = calculateSurtaxes(grossSalary, TAX_BRACKETS.california.surtaxes);
    const californiaTaxes = californiaRegularTaxes + californiaSurtaxes;
    const ficaTaxes = calculateFicaTax(grossSalary, taxStatus);
    const taxes = federalTaxes + californiaTaxes + ficaTaxes;
    const effectiveTaxRate = grossSalary === 0 ? 0 : taxes / grossSalary;
    const netIncome = grossSalary - taxes;
    const netSalary = netIncome;
    const baseCoreExpenses = index === 0
      ? numberValue(model.annual.baseCoreExpenses)
      : priorCoreExpenses * (1 + numberValue(model.cpi));
    const coreExpenses = baseCoreExpenses * scenario.expenses;
    priorCoreExpenses = baseCoreExpenses;
    const lifeEvents = model.applyLifeEvents
      ? model.lifeEvents.reduce((sum, event) => {
          if (!event.enabled) return sum;
          if (isHouseEvent(event)) return sum;
          if (event.type === "One-time" && year !== numberValue(event.start)) return sum;
          if (event.type === "Recurring" && (year < numberValue(event.start) || year > numberValue(event.end))) return sum;
          return sum + numberValue(event.amount);
        }, 0)
      : 0;
    const partnerCf = model.applyPartner ? model.annual.partnerCf[index] : 0;
    const ptNetSavings = netIncome - coreExpenses;
    const preHousingSavingsInflow = ptNetSavings + partnerCf + lifeEvents;
    const patInvestableCf = ptNetSavings + lifeEvents;
    const savingsRate = grossSalary === 0 ? 0 : preHousingSavingsInflow / grossSalary;
    const returnRate = model.investmentReturn + scenario.returnAdj;
    const capitalGains = beginningInvestmentAssets * returnRate;
    const realEstateGrowthRate = numberValue(model.realEstateGrowth);
    const realEstateGrowth = beginningRealEstateAssets * realEstateGrowthRate;

    const housePurchase = houseEnabled && year === houseStartYear;
    const houseActive = houseEnabled && year >= houseStartYear && year <= houseEndYear;
    const houseValue = housePurchase ? numberValue(model.houseValue) : 0;
    const downPayment = housePurchase ? houseValue * numberValue(model.houseDownPaymentPct) : 0;
    if (housePurchase) {
      mortgageBalance += Math.max(0, houseValue - downPayment);
      purchasedHouseValue += houseValue;
    } else if (purchasedHouseValue > 0 && houseActive) {
      purchasedHouseValue *= 1 + realEstateGrowthRate;
    }

    const mortgageEligible = houseActive && mortgageBalance > 0 && yearsPaid < numberValue(model.mortgageTermYears);
    const scheduledMortgagePayment = mortgageEligible
      ? annualMortgagePayment(mortgageBalance, model.mortgageInterestRate, numberValue(model.mortgageTermYears) - yearsPaid)
      : 0;
    const mortgageInterest = mortgageEligible ? mortgageBalance * numberValue(model.mortgageInterestRate) : 0;
    const mortgagePrincipal = mortgageEligible ? Math.min(mortgageBalance, Math.max(0, scheduledMortgagePayment - mortgageInterest)) : 0;
    const mortgagePayment = mortgageInterest + mortgagePrincipal;
    if (mortgageEligible) {
      mortgageBalance -= mortgagePrincipal;
      yearsPaid += 1;
    }
    const propertyTaxes = houseActive
      ? purchasedHouseValue * numberValue(model.propertyTaxRate)
      : 0;

    const savingsInflow = preHousingSavingsInflow - downPayment - mortgagePayment - propertyTaxes;
    const totalInvestableCf = savingsInflow;
    investmentAssetsUsd = beginningInvestmentAssets + capitalGains + savingsInflow;
    realEstateAssetsUsd = beginningRealEstateAssets + realEstateGrowth + downPayment + mortgagePrincipal;
    const liquidUsd = investmentAssetsUsd + realEstateAssetsUsd;
    const liquidCad = liquidUsd / model.cadUsdFx;
    const realUsd = liquidUsd / (1 + model.cpi) ** (year - YEARS[0]);

    return {
      year,
      grossSalary,
      salaryGrowth: index === 0 ? 0 : selectedSalaryGrowth(),
      federalTaxes,
      californiaTaxes,
      ficaTaxes,
      taxes,
      effectiveTaxRate,
      netIncome,
      netSalary,
      coreExpenses,
      lifeEvents,
      ptNetSavings,
      partnerCf,
      patInvestableCf,
      preHousingSavingsInflow,
      savingsInflow,
      capitalGains,
      realEstateGrowth,
      downPayment,
      mortgagePayment,
      mortgageInterest,
      mortgagePrincipal,
      propertyTaxes,
      mortgageBalance,
      beginningInvestmentAssets,
      beginningRealEstateAssets,
      openingAssetsUsd: beginningNetAssets,
      investmentAssetsUsd,
      realEstateAssetsUsd,
      totalInvestableCf,
      savingsRate,
      liquidCad,
      liquidUsd,
      realUsd,
      displayNetAssets: model.displayCurrency === "CAD" ? liquidCad : liquidUsd,
      wealthPercentile: wealthPercentile(liquidUsd),
      career: model.annual.career[index],
      personalEvent: model.annual.personalEvent[index],
    };
  });
}

function setCellClass(cell, value) {
  if (typeof value !== "number") return;
  if (value < 0) cell.classList.add("negative");
  if (value > 0) cell.classList.add("positive");
}

function inputCell(value, onChange, type = "number", step = "1") {
  const td = document.createElement("td");
  td.className = "input-cell";
  const input = document.createElement("input");
  input.type = type === "currency" || type === "percent" ? "text" : type;
  if (type === "currency" || type === "percent") input.inputMode = "decimal";
  if (type === "currency") input.classList.add("currency-input");
  if (type === "number") input.step = step;
  input.value = type === "number" ? formatInputNumber(value) : type === "currency" ? formatCurrencyInput(value, "USD") : type === "percent" ? formatPercentInput(value) : value;
  input.addEventListener("change", () => {
    const nextValue = type === "number" ? numberValue(input.value) : type === "currency" ? parseCurrency(input.value) : type === "percent" ? parsePercentInput(input.value) : input.value;
    onChange(nextValue);
    if (type === "number") input.value = formatInputNumber(nextValue);
    if (type === "currency") input.value = formatCurrencyInput(nextValue, "USD");
    if (type === "percent") input.value = formatPercentInput(nextValue);
    saveModel();
    markPending();
  });
  td.append(input);
  return td;
}

function formatInputNumber(value) {
  return Number(value).toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

function formulaCell(value, formatter = (next) => next, variant = "") {
  const td = document.createElement("td");
  td.className = "formula-cell";
  if (variant) td.classList.add(variant);
  td.textContent = formatter(value);
  setCellClass(td, typeof value === "number" ? value : 0);
  return td;
}

function renderControls() {
  els.scenario.innerHTML = model.scenarios.map((scenario) => `<option>${scenario.name}</option>`).join("");
  els.scenario.value = model.scenario;
  els.displayCurrency.value = model.displayCurrency;
  els.cadUsdFx.value = formatInputNumber(model.cadUsdFx);
  els.baseGrossSalary.value = formatCurrencyInput(model.annual.baseGrossSalary, "USD");
  els.salaryGrowth.value = formatPercentInput(selectedSalaryGrowth());
  els.investmentReturn.value = formatPercentInput(model.investmentReturn);
  els.taxFilingStatus.value = model.taxFilingStatus;
  els.cpiSource.value = model.cpiSource;
  els.cpi.value = formatPercentInput(model.cpi);
  els.baseCoreExpenses.value = formatCurrencyInput(model.annual.baseCoreExpenses, "USD");
  els.startingInvestmentAssetsUsd.value = formatCurrencyInput(model.startingInvestmentAssetsUsd, "USD");
  els.startingRealEstateAssetsUsd.value = formatCurrencyInput(model.startingRealEstateAssetsUsd, "USD");
  els.realEstateGrowth.value = formatPercentInput(model.realEstateGrowth);
  els.houseValue.value = formatCurrencyInput(model.houseValue, "USD");
  els.houseDownPaymentPct.value = formatPercentInput(model.houseDownPaymentPct);
  els.mortgageTermYears.value = formatInputNumber(model.mortgageTermYears);
  els.mortgageInterestRate.value = formatPercentInput(model.mortgageInterestRate);
  els.propertyTaxRate.value = formatPercentInput(model.propertyTaxRate);
  els.applyPartner.checked = model.applyPartner;
  els.applyLifeEvents.checked = model.applyLifeEvents;
  els.refreshStatus.textContent = model.lastRefresh || "Refresh pulls USD/CAD from Frankfurter, CPI from BLS, and mortgage rates from FRED/Freddie Mac PMMS.";
}

function renderScenarioTable() {
  els.scenarioTable.innerHTML = `
    <thead><tr><th>Case</th><th>Salary Growth</th><th>Expenses</th><th>Return Adj.</th></tr></thead>
    <tbody></tbody>
  `;
  const tbody = els.scenarioTable.querySelector("tbody");
  model.scenarios.forEach((scenario) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${scenario.name}</td>`;
    tr.append(inputCell(scenario.salaryGrowth, (value) => { scenario.salaryGrowth = value; }, "percent"));
    tr.append(inputCell(scenario.expenses, (value) => { scenario.expenses = value; }, "number", "0.001"));
    tr.append(inputCell(scenario.returnAdj, (value) => { scenario.returnAdj = value; }, "percent"));
    tbody.append(tr);
  });
}

function renderAnnualInputs(projection) {
  els.annualInputsTable.innerHTML = `<thead><tr><th>Input</th>${YEARS.map((year) => `<th>${year}</th>`).join("")}</tr></thead><tbody></tbody>`;
  const tbody = els.annualInputsTable.querySelector("tbody");

  function addRow(label, cells) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${label}</td>`;
    cells.forEach((cell) => tr.append(cell));
    tbody.append(tr);
  }

  addRow("Gross salary", projection.map((row) => formulaCell(row.grossSalary, money)));
  addRow("Federal taxes", projection.map((row) => formulaCell(row.federalTaxes, money)));
  addRow("California taxes", projection.map((row) => formulaCell(row.californiaTaxes, money)));
  addRow("FICA taxes", projection.map((row) => formulaCell(row.ficaTaxes, money)));
  addRow("Effective tax rate", projection.map((row) => formulaCell(row.effectiveTaxRate, percent)));
  addRow("Total taxes", projection.map((row) => formulaCell(row.taxes, money)));
  addRow("Net income", projection.map((row) => formulaCell(row.netIncome, money)));
  addRow("Core living expenses", projection.map((row) => formulaCell(row.coreExpenses, money)));
  addRow("PT net savings rate", projection.map((row) => formulaCell(row.ptNetSavings, money)));

  const rows = [
    ["Partner investable CF", "partnerCf", money],
    ["Career milestone", "career", (value) => value, "text"],
    ["Personal event label", "personalEvent", (value) => value, "text"],
  ];

  rows.forEach(([label, key, formatter, type]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${label}</td>`;
    YEARS.forEach((_, index) => {
      const inputType = key === "partnerCf" ? "currency" : type || "number";
      const cell = inputCell(model.annual[key][index], (value) => { model.annual[key][index] = value; }, inputType, "1");
      tr.append(cell);
    });
    tbody.append(tr);
  });
  addRow("Life events cash flow", projection.map((row) => formulaCell(row.lifeEvents, money)));
  addRow("Net assets per year", projection.map((row) => formulaCell(row.displayNetAssets, (value) => value.toLocaleString("en-US", { style: "currency", currency: model.displayCurrency, maximumFractionDigits: 2, minimumFractionDigits: 0 }), "highlight")));
  addRow("U.S. wealth percentile", projection.map((row) => formulaCell(row.wealthPercentile, formatPercentile, "highlight-subtle")));
  addRow("Investment assets", projection.map((row) => formulaCell(row.investmentAssetsUsd, money)));
  addRow("Real estate assets", projection.map((row) => formulaCell(row.realEstateAssetsUsd, money)));
  addRow("Savings inflow", projection.map((row) => formulaCell(row.savingsInflow, money)));
  addRow("Investment gains", projection.map((row) => formulaCell(row.capitalGains, money)));
  addRow("Real estate growth", projection.map((row) => formulaCell(row.realEstateGrowth, money)));
  addRow("House down payment", projection.map((row) => formulaCell(row.downPayment, money)));
  addRow("Mortgage payment", projection.map((row) => formulaCell(row.mortgagePayment, money)));
  addRow("Mortgage interest", projection.map((row) => formulaCell(row.mortgageInterest, money)));
  addRow("Mortgage principal", projection.map((row) => formulaCell(row.mortgagePrincipal, money)));
  addRow("Property taxes", projection.map((row) => formulaCell(row.propertyTaxes, money)));
  addRow("Ending mortgage balance", projection.map((row) => formulaCell(row.mortgageBalance, money)));
}

function renderEventsTable() {
  els.eventsTable.innerHTML = `
    <thead><tr><th>Event</th><th>Enabled</th><th>Type</th><th>Start</th><th>End</th><th>Amount USD</th><th>Notes</th></tr></thead>
    <tbody></tbody>
  `;
  const tbody = els.eventsTable.querySelector("tbody");
  model.lifeEvents.forEach((event) => {
    const houseRow = event.event === "House purchase";
    const tr = document.createElement("tr");
    tr.append(inputCell(event.event, (value) => { event.event = value; }, "text"));

    const enabled = document.createElement("td");
    enabled.className = "input-cell text-cell";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = event.enabled;
    checkbox.addEventListener("change", () => {
      event.enabled = checkbox.checked;
      saveModel();
      markPending();
    });
    enabled.append(checkbox);
    tr.append(enabled);

    if (houseRow) {
      tr.append(formulaCell("Home inputs", (value) => value, "text-cell"));
    } else {
      const typeCell = document.createElement("td");
      typeCell.className = "input-cell";
      const select = document.createElement("select");
      ["One-time", "Recurring"].forEach((optionValue) => {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue;
        select.append(option);
      });
      select.value = event.type;
      select.addEventListener("change", () => {
        event.type = select.value;
        if (event.type === "One-time") event.end = event.start;
        saveModel();
        markPending();
      });
      typeCell.append(select);
      tr.append(typeCell);
    }

    tr.append(inputCell(event.start, (value) => { event.start = value; }, "number"));
    tr.append(inputCell(event.end, (value) => { event.end = value; }, "number"));
    if (houseRow) {
      tr.append(formulaCell("Home inputs", (value) => value, "text-cell"));
    } else {
      tr.append(inputCell(event.amount, (value) => { event.amount = value; }, "currency"));
    }
    tr.append(inputCell(event.notes, (value) => { event.notes = value; }, "text"));
    tbody.append(tr);
  });
}

function renderAssetsTable() {
  const investmentUsd = numberValue(model.startingInvestmentAssetsUsd);
  const realEstateUsd = numberValue(model.startingRealEstateAssetsUsd);
  const startingUsd = investmentUsd + realEstateUsd;
  const startingCad = startingUsd / numberValue(model.cadUsdFx || defaultModel.cadUsdFx);
  els.assetsTable.innerHTML = `
    <thead><tr><th>Metric</th><th>Currency</th><th>Opening value</th></tr></thead>
    <tbody></tbody>
  `;
  const tbody = els.assetsTable.querySelector("tbody");
  tbody.innerHTML = `
    <tr><td>2025 investment assets</td><td>USD</td><td><strong>${money(investmentUsd, 2, "USD")}</strong></td></tr>
    <tr><td>2025 real estate assets</td><td>USD</td><td><strong>${money(realEstateUsd, 2, "USD")}</strong></td></tr>
    <tr><td>2025 total assets</td><td>USD</td><td><strong>${money(startingUsd, 2, "USD")}</strong></td></tr>
    <tr><td>CAD equivalent</td><td>CAD</td><td><strong>${moneyFromCad(startingCad, 2, "CAD")}</strong></td></tr>
    <tr><td>Dashboard display</td><td>${model.displayCurrency}</td><td><strong>${model.displayCurrency === "CAD" ? moneyFromCad(startingCad) : money(startingUsd)}</strong></td></tr>
  `;
}

function renderKpis(projection) {
  const finalYear = projection.at(-1);
  const avgSavings = projection.reduce((sum, row) => sum + row.savingsRate, 0) / projection.length;
  const kpis = [
    ["Selected Case", model.scenario, `${percent(selectedSalaryGrowth())} salary growth`],
    [`2035 Gross Salary (${model.displayCurrency})`, money(finalYear.grossSalary), finalYear.career],
    [`2035 Net Income (${model.displayCurrency})`, money(finalYear.netIncome), "After modeled taxes"],
    ["Avg. Savings Rate", percent(avgSavings), "Savings inflow / gross salary"],
    [`2035 Net Assets (${model.displayCurrency})`, model.displayCurrency === "CAD" ? moneyFromCad(finalYear.liquidCad) : money(finalYear.liquidUsd), "Nominal"],
    [`2035 Real (${model.displayCurrency})`, money(finalYear.realUsd), "2025 dollars"],
  ];
  els.kpiGrid.innerHTML = kpis
    .map(([label, value, detail]) => `<article class="kpi-card"><span>${label}</span><strong>${value}</strong><small>${detail}</small></article>`)
    .join("");
}

function renderProjectionTable(projection) {
  const rows = [
    ["Gross salary", "grossSalary", money],
    ["Salary growth", "salaryGrowth", percent],
    ["Federal taxes", "federalTaxes", money],
    ["California taxes", "californiaTaxes", money],
    ["FICA taxes", "ficaTaxes", money],
    ["Taxes", "taxes", money],
    ["Effective tax rate", "effectiveTaxRate", percent],
    ["Net income", "netIncome", money],
    ["Core living expenses", "coreExpenses", money],
    ["PT net savings rate", "ptNetSavings", money],
    ["Life events cash flow", "lifeEvents", money],
    ["Partner investable CF", "partnerCf", money],
    ["Pre-housing savings inflow", "preHousingSavingsInflow", money],
    ["House down payment", "downPayment", money],
    ["Mortgage payment", "mortgagePayment", money],
    ["Mortgage interest", "mortgageInterest", money],
    ["Mortgage principal", "mortgagePrincipal", money],
    ["Property taxes", "propertyTaxes", money],
    ["Savings inflow", "savingsInflow", money],
    ["Investment gains", "capitalGains", money],
    ["Real estate growth", "realEstateGrowth", money],
    ["Investment assets", "investmentAssetsUsd", money],
    ["Real estate assets", "realEstateAssetsUsd", money],
    ["Ending mortgage balance", "mortgageBalance", money],
    ["Beginning net assets", "openingAssetsUsd", money],
    ["Savings rate", "savingsRate", percent],
    [`Liquid assets (${model.displayCurrency})`, "displayNetAssets", (value) => value.toLocaleString("en-US", { style: "currency", currency: model.displayCurrency, maximumFractionDigits: 2, minimumFractionDigits: 0 })],
    ["U.S. wealth percentile", "wealthPercentile", formatPercentile],
    [`Liquid assets (2025 ${model.displayCurrency})`, "realUsd", money],
    ["Career milestone", "career", (value) => value],
    ["Personal event", "personalEvent", (value) => value || ""],
  ];

  els.projectionTable.innerHTML = `<thead><tr><th>Metric</th>${projection.map((row) => `<th>${row.year}</th>`).join("")}</tr></thead><tbody></tbody>`;
  const tbody = els.projectionTable.querySelector("tbody");
  rows.forEach(([label, key, formatter]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${label}</td>`;
    projection.forEach((row) => {
      const td = document.createElement("td");
      td.textContent = formatter(row[key]);
      setCellClass(td, typeof row[key] === "number" && key !== "taxes" && key !== "coreExpenses" ? row[key] : 0);
      if (typeof row[key] !== "number") td.classList.add("text-cell");
      tr.append(td);
    });
    tbody.append(tr);
  });
}

function renderTaxBrackets() {
  const statusKeys = Object.keys(TAX_FILING_STATUSES);
  const bracketTables = Object.values(TAX_BRACKETS).map((jurisdiction) => {
    const rows = statusKeys.flatMap((statusKey) => jurisdiction.brackets[statusKey].map((bracket) => `
      <tr>
        <td>${TAX_FILING_STATUSES[statusKey]}</td>
        <td>${money(bracket.over, 0, "USD")}</td>
        <td>${Number.isFinite(bracket.upTo) ? money(bracket.upTo, 0, "USD") : "And up"}</td>
        <td>${percent(bracket.rate)}</td>
      </tr>
    `)).join("");
    return `
      <article class="bracket-block">
        <div class="bracket-heading">
          <h3>${jurisdiction.label}</h3>
          <a href="${jurisdiction.source}" target="_blank" rel="noreferrer">Official source</a>
        </div>
        <div class="table-wrap">
          <table class="bracket-table">
            <thead><tr><th>Filing status</th><th>Income over</th><th>Up to</th><th>Rate</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </article>
    `;
  }).join("");

  const surtaxRows = TAX_BRACKETS.california.surtaxes.map((surtax) => `
    <tr>
      <td>${surtax.label}</td>
      <td>${money(surtax.threshold, 0, "USD")}</td>
      <td>${percent(surtax.rate)}</td>
      <td><a href="${surtax.source}" target="_blank" rel="noreferrer">Official source</a></td>
    </tr>
  `).join("");
  const additionalThresholdRows = Object.entries(FICA_TAX.additionalMedicareThresholds).map(([statusKey, threshold]) => `
    <tr>
      <td>${TAX_FILING_STATUSES[statusKey]}</td>
      <td>${money(threshold, 0, "USD")}</td>
      <td>${percent(FICA_TAX.additionalMedicareRate)}</td>
    </tr>
  `).join("");

  els.taxBracketContent.innerHTML = `
    <div class="bracket-summary">
      <strong>Calculation basis:</strong> gross salary is treated as taxable income for this high-level model. The 2025 brackets below are applied across the forecast, federal and California taxes are calculated progressively by filing status, California adds the 1% Behavioral Health Services Tax above $1,000,000, and FICA is calculated from employee Social Security and Medicare rates.
    </div>
    <div class="bracket-grid">${bracketTables}</div>
    <article class="bracket-block">
      <div class="bracket-heading">
        <h3>California Surtax</h3>
      </div>
      <div class="table-wrap compact">
        <table class="bracket-table">
          <thead><tr><th>Tax</th><th>Income over</th><th>Rate</th><th>Source</th></tr></thead>
          <tbody>${surtaxRows}</tbody>
        </table>
      </div>
    </article>
    <article class="bracket-block">
      <div class="bracket-heading">
        <h3>FICA Payroll Tax</h3>
        <a href="${TAX_SOURCES.ficaWageBase}" target="_blank" rel="noreferrer">SSA wage base</a>
      </div>
      <div class="table-wrap compact">
        <table class="bracket-table">
          <thead><tr><th>Tax</th><th>Base</th><th>Rate</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td>Social Security</td><td>${money(FICA_TAX.socialSecurityWageBase, 0, "USD")} wage base</td><td>${percent(FICA_TAX.socialSecurityRate)}</td><td><a href="${TAX_SOURCES.ficaWageBase}" target="_blank" rel="noreferrer">Official source</a></td></tr>
            <tr><td>Medicare</td><td>All wages</td><td>${percent(FICA_TAX.medicareRate)}</td><td>Payroll tax rule</td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-wrap compact">
        <table class="bracket-table">
          <thead><tr><th>Additional Medicare status</th><th>Income over</th><th>Rate</th></tr></thead>
          <tbody>${additionalThresholdRows}</tbody>
        </table>
      </div>
      <p class="source-note"><a href="${TAX_SOURCES.additionalMedicare}" target="_blank" rel="noreferrer">IRS Additional Medicare Tax source</a></p>
    </article>
  `;
}

function renderWealthStats() {
  const rows = WEALTH_PERCENTILES.map((row) => `
    <tr>
      <td>${formatPercentile(row.percentile)}</td>
      <td>${money(row.netWorth, 0, "USD")}</td>
    </tr>
  `).join("");

  els.wealthStatsContent.innerHTML = `
    <div class="bracket-summary">
      <strong>Reference basis:</strong> 2025/2026 U.S. household net-worth threshold estimates. The latest authoritative SCF microdata is still 2022, while the Federal Reserve Distributional Financial Accounts provide newer quarterly wealth aggregates through 2025. The model interpolates between the breakpoints below.
    </div>
    <article class="bracket-block">
      <div class="bracket-heading">
        <h3>Net Worth Percentile Breakpoints</h3>
        <a href="${WEALTH_PERCENTILE_SOURCE}" target="_blank" rel="noreferrer">Threshold source</a>
      </div>
      <div class="table-wrap compact">
        <table class="bracket-table">
          <thead><tr><th>Percentile</th><th>Net worth threshold</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </article>
    <p class="source-note"><a href="${WEALTH_PERCENTILE_OFFICIAL_SOURCE}" target="_blank" rel="noreferrer">Federal Reserve Distributional Financial Accounts reference</a></p>
  `;
}

function lineChart(container, series, options = {}) {
  const width = 920;
  const height = options.height || 280;
  const pad = { top: 18, right: 22, bottom: 52, left: 64 };
  const allValues = series.flatMap((item) => item.values);
  const min = Math.min(0, ...allValues);
  const max = Math.max(...allValues);
  const span = max - min || 1;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const x = (index) => pad.left + (innerW * index) / (YEARS.length - 1);
  const y = (value) => pad.top + innerH - ((value - min) / span) * innerH;
  const ticks = Array.from({ length: 5 }, (_, index) => min + (span * index) / 4);
  const paths = series.map((item) => {
    const d = item.values.map((value, index) => `${index === 0 ? "M" : "L"} ${x(index).toFixed(1)} ${y(value).toFixed(1)}`).join(" ");
    return `<path class="${item.className}" d="${d}"></path>`;
  }).join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${options.label || "Line chart"}">
      ${ticks.map((tick) => `<line class="grid-line" x1="${pad.left}" x2="${width - pad.right}" y1="${y(tick)}" y2="${y(tick)}"></line><text class="tick" x="8" y="${y(tick) + 4}">${compactMoney(tick)}</text>`).join("")}
      ${YEARS.map((year, index) => `<text class="tick" x="${x(index) - 12}" y="${height - 22}">${year}</text>`).join("")}
      ${paths}
      ${series.map((item, index) => `<text class="legend" x="${pad.left + index * 190}" y="${height - 5}">${item.name}</text><line class="${item.className}" x1="${pad.left + index * 190 - 24}" x2="${pad.left + index * 190 - 6}" y1="${height - 9}" y2="${height - 9}"></line>`).join("")}
    </svg>
  `;
}

function barChart(container, groups) {
  const width = 520;
  const height = 280;
  const pad = { top: 18, right: 16, bottom: 54, left: 58 };
  const allValues = groups.flatMap((group) => [group.taxes, group.expenses, group.events]);
  const min = Math.min(0, ...allValues);
  const max = Math.max(...allValues);
  const span = max - min || 1;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const groupW = innerW / groups.length;
  const barW = Math.max(5, groupW / 5);
  const y = (value) => pad.top + innerH - ((value - min) / span) * innerH;
  const zeroY = y(0);
  const bars = groups.map((group, index) => {
    const baseX = pad.left + index * groupW + groupW * 0.18;
    return [
      bar(baseX, group.taxes, "bar-tax"),
      bar(baseX + barW + 3, group.expenses, "bar-expense"),
      bar(baseX + (barW + 3) * 2, group.events, "bar-event"),
    ].join("");
  }).join("");

  function bar(x, value, className) {
    const top = Math.min(y(value), zeroY);
    const heightValue = Math.max(2, Math.abs(zeroY - y(value)));
    return `<rect class="${className}" x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${barW.toFixed(1)}" height="${heightValue.toFixed(1)}"></rect>`;
  }

  const ticks = Array.from({ length: 5 }, (_, index) => min + (span * index) / 4);
  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Cash outflow bar chart">
      ${ticks.map((tick) => `<line class="grid-line" x1="${pad.left}" x2="${width - pad.right}" y1="${y(tick)}" y2="${y(tick)}"></line><text class="tick" x="4" y="${y(tick) + 4}">${compactMoney(tick)}</text>`).join("")}
      <line x1="${pad.left}" x2="${width - pad.right}" y1="${zeroY}" y2="${zeroY}" stroke="#aab8b5"></line>
      ${bars}
      ${groups.map((group, index) => `<text class="tick" x="${pad.left + index * groupW + 5}" y="${height - 24}">${group.year}</text>`).join("")}
      <text class="legend" x="${pad.left + 12}" y="${height - 5}">Taxes</text><rect class="bar-tax" x="${pad.left}" y="${height - 14}" width="8" height="8"></rect>
      <text class="legend" x="${pad.left + 112}" y="${height - 5}">Core Expenses</text><rect class="bar-expense" x="${pad.left + 100}" y="${height - 14}" width="8" height="8"></rect>
      <text class="legend" x="${pad.left + 252}" y="${height - 5}">Life Events</text><rect class="bar-event" x="${pad.left + 240}" y="${height - 14}" width="8" height="8"></rect>
    </svg>
  `;
}

function compactMoney(value) {
  const sign = value < 0 ? "-" : "";
  const symbol = model.displayCurrency === "CAD" ? "C$" : "$";
  const abs = Math.abs(value);
  if (abs >= 1000000) return `${sign}${symbol}${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}${symbol}${Math.round(abs / 1000)}K`;
  return `${sign}${symbol}${Math.round(abs)}`;
}

function renderCharts(projection) {
  lineChart(els.incomeChart, [
    { name: `Gross Salary (${model.displayCurrency})`, className: "line-primary", values: projection.map((row) => displayAmount(row.grossSalary)) },
    { name: `Net Income (${model.displayCurrency})`, className: "line-secondary", values: projection.map((row) => displayAmount(row.netIncome)) },
    { name: `Investable CF (${model.displayCurrency})`, className: "line-tertiary", values: projection.map((row) => displayAmount(row.totalInvestableCf)) },
  ]);

  barChart(els.cashOutChart, projection.map((row) => ({
    year: row.year,
    taxes: displayAmount(row.taxes),
    expenses: displayAmount(row.coreExpenses),
    events: displayAmount(row.lifeEvents),
  })));

  lineChart(els.assetsChart, [
    { name: `Net Assets ${model.displayCurrency}`, className: "line-primary", values: projection.map((row) => row.displayNetAssets) },
    { name: `Net Assets 2025 ${model.displayCurrency}`, className: "line-secondary", values: projection.map((row) => displayAmount(row.realUsd)) },
  ], { height: 300, label: "Net assets line chart" });
}

function renderStatus(projection) {
  const hasGross = numberValue(model.annual.baseGrossSalary) > 0;
  const endingAssetsPositive = projection.at(-1).liquidUsd > 0;
  const avgSavings = projection.reduce((sum, row) => sum + row.savingsRate, 0) / projection.length;
  const boundedSavings = avgSavings > -1 && avgSavings < 1;
  const ok = hasGross && endingAssetsPositive && boundedSavings;
  els.modelStatus.textContent = ok ? "OK" : "Check";
  els.modelStatus.style.background = ok ? "#d9ead3" : "#fce4d6";
  els.modelStatus.style.color = ok ? "#1e5b38" : "#9a3412";
}

function markPending() {
  els.modelStatus.textContent = "Pending";
  els.modelStatus.style.background = "#fff2cc";
  els.modelStatus.style.color = "#7a4d00";
  els.refreshStatus.textContent = "Pending changes. Press Refresh model to apply inputs, refresh FX/CPI, and recalculate.";
}

function stageNumberInput(input, setter) {
  const nextValue = numberValue(input.value);
  setter(nextValue);
  input.value = formatInputNumber(nextValue);
  saveModel();
  markPending();
}

function stageCurrencyInput(input, setter) {
  const nextValue = parseCurrency(input.value);
  setter(nextValue);
  input.value = formatCurrencyInput(nextValue, "USD");
  saveModel();
  markPending();
}

function stagePercentInput(input, setter) {
  const nextValue = parsePercentInput(input.value);
  setter(nextValue);
  input.value = formatPercentInput(nextValue);
  saveModel();
  markPending();
}

function render() {
  const projection = calculateProjection();
  renderControls();
  renderScenarioTable();
  renderAnnualInputs(projection);
  renderEventsTable();
  renderAssetsTable();
  renderTaxBrackets();
  renderWealthStats();
  renderKpis(projection);
  renderProjectionTable(projection);
  renderCharts(projection);
  renderStatus(projection);
}

async function refreshMarketInputs() {
  els.refreshInputs.disabled = true;
  els.refreshStatus.textContent = "Refreshing FX, CPI, and mortgage rates...";
  const messages = [];
  const [fxRefresh, cpiRefresh, mortgageRefresh] = await Promise.allSettled([
    fetchCadUsdFx(),
    fetchCpiRate(model.cpiSource),
    fetchMortgageRate(numberValue(model.mortgageTermYears)),
  ]);
  if (fxRefresh.status === "fulfilled") {
    const fxResult = fxRefresh.value;
    model.cadUsdFx = fxResult.usdPerCad;
    messages.push(`USD/CAD ${fxResult.cadPerUsd.toFixed(2)} (${fxResult.date})`);
  } else {
    messages.push(`FX unchanged: ${fxRefresh.reason.message}`);
  }
  if (cpiRefresh.status === "fulfilled") {
    const cpiResult = cpiRefresh.value;
    model.cpi = cpiResult.rate;
    messages.push(`${cpiResult.label} ${percent(cpiResult.rate)} YoY (${cpiResult.period})`);
  } else {
    messages.push(`CPI unchanged: ${cpiRefresh.reason.message}`);
  }
  if (mortgageRefresh.status === "fulfilled") {
    const mortgageResult = mortgageRefresh.value;
    model.mortgageInterestRate = mortgageResult.rate;
    messages.push(`${mortgageResult.label} ${percent(mortgageResult.rate)} (${mortgageResult.date})`);
  } else {
    messages.push(`Mortgage rate unchanged: ${mortgageRefresh.reason.message}`);
  }
  model.lastRefresh = `Updated ${new Date().toLocaleString()}: ${messages.join("; ")}.`;
  saveModel();
  render();
  els.refreshInputs.disabled = false;
}

async function fetchCadUsdFx() {
  const response = await fetch("https://api.frankfurter.dev/v1/latest?from=USD&to=CAD");
  if (!response.ok) throw new Error("FX source did not respond");
  const data = await response.json();
  const cadPerUsd = numberValue(data?.rates?.CAD);
  if (!cadPerUsd) throw new Error("FX response missing CAD rate");
  return {
    cadPerUsd,
    usdPerCad: 1 / cadPerUsd,
    date: data.date || "latest",
  };
}

async function fetchCpiRate(source) {
  const series = CPI_SERIES[source] || CPI_SERIES.US;
  const response = await fetch(`https://api.bls.gov/publicAPI/v2/timeseries/data/${series.id}`);
  if (!response.ok) throw new Error("CPI source did not respond");
  const data = await response.json();
  const rows = data?.Results?.series?.[0]?.data?.filter((row) => /^M\d{2}$/.test(row.period)) || [];
  if (rows.length < 13) throw new Error("CPI response did not include enough monthly data");
  const latest = rows[0];
  const prior = rows.find((row) => Number(row.year) === Number(latest.year) - 1 && row.period === latest.period);
  if (!prior) throw new Error("Could not find prior-year CPI value");
  const rate = numberValue(latest.value) / numberValue(prior.value) - 1;
  return {
    rate,
    label: series.label,
    period: `${latest.periodName || latest.period} ${latest.year}`,
  };
}

async function fetchMortgageRate(termYears) {
  const [fifteen, thirty] = await Promise.all([
    fetchFredMortgageSeries("MORTGAGE15US"),
    fetchFredMortgageSeries("MORTGAGE30US"),
  ]);
  const term = Math.max(1, numberValue(termYears || 30));
  let rate = thirty.rate;
  let label = "30-year fixed mortgage rate";
  if (term <= 15) {
    rate = fifteen.rate;
    label = "15-year fixed mortgage rate";
  } else if (term < 30) {
    const weight = (term - 15) / 15;
    rate = fifteen.rate + (thirty.rate - fifteen.rate) * weight;
    label = `${term}-year interpolated fixed mortgage rate`;
  }
  return {
    rate,
    label,
    date: thirty.date === fifteen.date ? thirty.date : `${fifteen.date}/${thirty.date}`,
  };
}

async function fetchFredMortgageSeries(seriesId) {
  const fredUrl = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`;
  let response;
  try {
    response = await fetch(fredUrl);
  } catch {
    response = null;
  }
  if (!response || !response.ok) {
    response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(fredUrl)}`);
  }
  if (!response.ok) throw new Error("Mortgage rate source did not respond");
  const csv = await response.text();
  const rows = csv.trim().split(/\r?\n/).slice(1)
    .map((line) => {
      const [date, value] = line.split(",");
      return { date, value: Number(value) };
    })
    .filter((row) => row.date && Number.isFinite(row.value));
  const latest = rows.at(-1);
  if (!latest) throw new Error("Mortgage rate response was empty");
  return {
    date: latest.date,
    rate: latest.value / 100,
  };
}

function wireEvents() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
      document.querySelector(`#${button.dataset.tab}Panel`).classList.add("active");
    });
  });

  els.scenario.addEventListener("change", () => {
    model.scenario = els.scenario.value;
    saveModel();
    markPending();
  });
  els.displayCurrency.addEventListener("change", () => {
    model.displayCurrency = els.displayCurrency.value;
    saveModel();
    markPending();
  });
  els.cadUsdFx.addEventListener("change", () => {
    stageNumberInput(els.cadUsdFx, (value) => { model.cadUsdFx = value; });
  });
  els.baseGrossSalary.addEventListener("change", () => {
    stageCurrencyInput(els.baseGrossSalary, (value) => { model.annual.baseGrossSalary = value; });
  });
  els.salaryGrowth.addEventListener("change", () => {
    stagePercentInput(els.salaryGrowth, (value) => {
      const scenario = selectedScenario();
      scenario.salaryGrowth = value;
      model.annual.salaryGrowth = value;
    });
  });
  els.investmentReturn.addEventListener("change", () => {
    stagePercentInput(els.investmentReturn, (value) => { model.investmentReturn = value; });
  });
  els.taxFilingStatus.addEventListener("change", () => {
    model.taxFilingStatus = els.taxFilingStatus.value;
    saveModel();
    markPending();
  });
  els.cpiSource.addEventListener("change", () => {
    model.cpiSource = els.cpiSource.value;
    saveModel();
    markPending();
  });
  els.cpi.addEventListener("change", () => {
    stagePercentInput(els.cpi, (value) => { model.cpi = value; });
  });
  els.baseCoreExpenses.addEventListener("change", () => {
    stageCurrencyInput(els.baseCoreExpenses, (value) => { model.annual.baseCoreExpenses = value; });
  });
  els.startingInvestmentAssetsUsd.addEventListener("change", () => {
    stageCurrencyInput(els.startingInvestmentAssetsUsd, (value) => { model.startingInvestmentAssetsUsd = value; });
  });
  els.startingRealEstateAssetsUsd.addEventListener("change", () => {
    stageCurrencyInput(els.startingRealEstateAssetsUsd, (value) => { model.startingRealEstateAssetsUsd = value; });
  });
  els.realEstateGrowth.addEventListener("change", () => {
    stagePercentInput(els.realEstateGrowth, (value) => { model.realEstateGrowth = value; });
  });
  els.houseValue.addEventListener("change", () => {
    stageCurrencyInput(els.houseValue, (value) => { model.houseValue = value; });
  });
  els.houseDownPaymentPct.addEventListener("change", () => {
    stagePercentInput(els.houseDownPaymentPct, (value) => { model.houseDownPaymentPct = value; });
  });
  els.mortgageTermYears.addEventListener("change", () => {
    stageNumberInput(els.mortgageTermYears, (value) => { model.mortgageTermYears = value; });
  });
  els.mortgageInterestRate.addEventListener("change", () => {
    stagePercentInput(els.mortgageInterestRate, (value) => { model.mortgageInterestRate = value; });
  });
  els.propertyTaxRate.addEventListener("change", () => {
    stagePercentInput(els.propertyTaxRate, (value) => { model.propertyTaxRate = value; });
  });
  els.applyPartner.addEventListener("change", () => {
    model.applyPartner = els.applyPartner.checked;
    saveModel();
    markPending();
  });
  els.applyLifeEvents.addEventListener("change", () => {
    model.applyLifeEvents = els.applyLifeEvents.checked;
    saveModel();
    markPending();
  });

  document.querySelector("#resetModel").addEventListener("click", () => {
    model = clone(defaultModel);
    saveModel();
    render();
  });
  els.refreshInputs.addEventListener("click", refreshMarketInputs);
}

wireEvents();
render();
