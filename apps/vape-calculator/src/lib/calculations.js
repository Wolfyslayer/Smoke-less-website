// All volumes are millilitres (ml), strengths are mg/ml, and ratios are volume percentages.
// The formulas assume additive volumes. They do not account for density or measurement error.
export const LIMITS = Object.freeze({
  maxNicotineStrength: 20,
  maxShotVolume: 10,
  maxBatchVolume: 10000,
  maxFlavors: 20
});

const EPS = 1e-8;
const finite = (value) => typeof value === "number" && Number.isFinite(value);
const within = (value, min, max) => finite(value) && value >= min && value <= max;
const failure = (error) => ({ ok: false, error });
const success = (data) => ({ ok: true, ...data });
export const round = (number, digits = 2) => Number(number.toFixed(digits));

export function strengthFromShots({ baseVolume, shotVolume, shotStrength, shotCount }) {
  if (!within(baseVolume, 0, LIMITS.maxBatchVolume)) return failure("Ange en giltig mängd nikotinfri e-juice.");
  if (!within(shotVolume, 0.1, LIMITS.maxShotVolume)) return failure("En shotflaska måste vara mellan 0,1 och 10 ml.");
  if (!within(shotStrength, 0, LIMITS.maxNicotineStrength)) return failure("Shotstyrkan måste vara mellan 0 och 20 mg/ml.");
  if (!within(shotCount, 0, 1000) || !Number.isInteger(shotCount)) return failure("Ange ett helt antal shots.");
  const nicotineVolume = shotCount * shotVolume;
  const totalVolume = baseVolume + nicotineVolume;
  if (totalVolume <= 0 || totalVolume > LIMITS.maxBatchVolume) return failure("Den totala volymen måste vara mellan 0 och 10 000 ml.");
  const nicotineMg = nicotineVolume * shotStrength;
  return success({ nicotineVolume, totalVolume, nicotineMg, strength: nicotineMg / totalVolume });
}

export function shotsNeeded({ volume, targetStrength, shotStrength, shotVolume, mode = "base" }) {
  if (!["base", "final"].includes(mode)) return failure("Ogiltigt beräkningsläge.");
  if (!within(volume, 0.01, LIMITS.maxBatchVolume)) return failure("Ange en volym mellan 0,01 och 10 000 ml.");
  if (!within(shotVolume, 0.1, LIMITS.maxShotVolume)) return failure("En shotflaska måste vara mellan 0,1 och 10 ml.");
  if (!within(shotStrength, 0.01, LIMITS.maxNicotineStrength)) return failure("Shotstyrkan måste vara större än 0 och högst 20 mg/ml.");
  if (!within(targetStrength, 0, LIMITS.maxNicotineStrength)) return failure("Målstyrkan måste vara mellan 0 och 20 mg/ml.");
  if (mode === "base" && targetStrength >= shotStrength) return failure("Med nikotinfri vätska som behålls måste målstyrkan vara lägre än shotstyrkan.");
  if (mode === "final" && targetStrength > shotStrength) return failure("Målstyrkan kan inte vara högre än shotstyrkan.");
  const nicotineVolume = mode === "base"
    ? targetStrength * volume / (shotStrength - targetStrength)
    : targetStrength * volume / shotStrength;
  const baseVolume = mode === "base" ? volume : volume - nicotineVolume;
  const totalVolume = mode === "base" ? volume + nicotineVolume : volume;
  if (totalVolume > LIMITS.maxBatchVolume) return failure("Slutvolymen överskrider 10 000 ml. Välj en mindre sats.");
  const exactShots = nicotineVolume / shotVolume;
  const bottlesToBuy = Math.ceil(exactShots - EPS);
  const fullBottlesVolume = bottlesToBuy * shotVolume;
  const strengthIfAllUsed = mode === "base"
    ? (volume + fullBottlesVolume > 0 ? fullBottlesVolume * shotStrength / (volume + fullBottlesVolume) : 0)
    : (fullBottlesVolume <= totalVolume ? fullBottlesVolume * shotStrength / totalVolume : null);
  return success({ nicotineVolume, baseVolume, totalVolume, exactShots, bottlesToBuy, strengthIfAllUsed, leftoverShotVolume: Math.max(0, fullBottlesVolume - nicotineVolume) });
}

export function calculateDIY({ totalVolume, targetStrength, shotStrength, shotVolume, shotVgPercent, targetVgPercent, flavors = [] }) {
  if (!within(totalVolume, 1, LIMITS.maxBatchVolume)) return failure("Slutvolymen måste vara mellan 1 och 10 000 ml.");
  if (!within(targetStrength, 0, LIMITS.maxNicotineStrength)) return failure("Välj en målkoncentration mellan 0 och 20 mg/ml.");
  if (!within(shotStrength, 0.01, LIMITS.maxNicotineStrength)) return failure("Shotstyrkan måste vara större än 0 och högst 20 mg/ml.");
  if (targetStrength > shotStrength) return failure("Önskad nikotinstyrka kan inte överstiga shotstyrkan.");
  if (!within(shotVolume, 0.1, LIMITS.maxShotVolume)) return failure("Shotflaskans volym måste vara mellan 0,1 och 10 ml.");
  if (!within(shotVgPercent, 0, 100) || !within(targetVgPercent, 0, 100)) return failure("VG-andelarna måste ligga mellan 0 och 100 %.");
  if (!Array.isArray(flavors) || flavors.length > LIMITS.maxFlavors) return failure("Du kan ha högst 20 smaker i ett recept.");
  if (flavors.some((f) => !within(f.percent, 0, 100) || !within(f.vgPercent, 0, 100) || typeof f.name !== "string")) {
    return failure("Kontrollera smakerna, procentandelarna och PG/VG-värdena.");
  }
  const totalFlavorPercent = flavors.reduce((sum, f) => sum + f.percent, 0);
  if (totalFlavorPercent > 100 + EPS) return failure("Smakerna får inte utgöra mer än 100 % av blandningen.");
  const nicotineVolume = totalVolume * targetStrength / shotStrength;
  const flavorItems = flavors.map((f) => ({ ...f, volume: totalVolume * f.percent / 100 }));
  const flavorVolume = flavorItems.reduce((sum, f) => sum + f.volume, 0);
  const remainingBase = totalVolume - nicotineVolume - flavorVolume;
  if (remainingBase < -EPS) return failure("Nikotinshots och aromer tar mer plats än slutvolymen. Minska nikotin eller arom.");
  const nicotineVgVolume = nicotineVolume * shotVgPercent / 100;
  const flavorVgVolume = flavorItems.reduce((sum, f) => sum + f.volume * f.vgPercent / 100, 0);
  const vgVolume = totalVolume * targetVgPercent / 100 - nicotineVgVolume - flavorVgVolume;
  const pgVolume = remainingBase - vgVolume;
  const feasible = pgVolume >= -EPS && vgVolume >= -EPS;
  const closestVgBase = Math.min(Math.max(vgVolume, 0), Math.max(0, remainingBase));
  const closestVgPercent = 100 * (nicotineVgVolume + flavorVgVolume + closestVgBase) / totalVolume;
  return success({
    feasible, totalVolume, targetStrength, nicotineVolume, flavorItems, flavorVolume,
    totalFlavorPercent, pgVolume: Math.max(0, pgVolume), vgVolume: Math.max(0, vgVolume),
    closestVgPercent, bottlesToBuy: Math.max(0, Math.ceil(nicotineVolume / shotVolume - EPS)),
    nicotineMg: nicotineVolume * shotStrength,
    warning: feasible ? null : "Vald VG/PG-fördelning är inte möjlig med de valda shotsen och aromerna."
  });
}
