// The calculation engine keeps historical Swedish error messages for backwards compatibility.
// Presentation is translated here without changing numeric validation or formula behavior.
const english = {
  "Ange en giltig mängd nikotinfri e-juice.": "Enter a valid amount of nicotine-free e-liquid.",
  "En shotflaska måste vara mellan 0,1 och 10 ml.": "A shot bottle must contain 0.1–10 ml.",
  "Shotstyrkan måste vara mellan 0 och 20 mg/ml.": "Shot strength must be between 0 and 20 mg/ml.",
  "Ange ett helt antal shots.": "Enter a whole number of shots.",
  "Den totala volymen måste vara mellan 0 och 10 000 ml.": "Total volume must be between 0 and 10,000 ml.",
  "Ogiltigt beräkningsläge.": "Invalid calculation mode.",
  "Ange en volym mellan 0,01 och 10 000 ml.": "Enter a volume between 0.01 and 10,000 ml.",
  "Shotstyrkan måste vara större än 0 och högst 20 mg/ml.": "Shot strength must be above 0 and at most 20 mg/ml.",
  "Målstyrkan måste vara mellan 0 och 20 mg/ml.": "Target strength must be between 0 and 20 mg/ml.",
  "Med nikotinfri vätska som behålls måste målstyrkan vara lägre än shotstyrkan.": "When keeping the nicotine-free base, target strength must be below shot strength.",
  "Målstyrkan kan inte vara högre än shotstyrkan.": "Target strength cannot exceed shot strength.",
  "Slutvolymen överskrider 10 000 ml. Välj en mindre sats.": "Final volume exceeds 10,000 ml. Choose a smaller batch.",
  "Slutvolymen måste vara mellan 1 och 10 000 ml.": "Final volume must be between 1 and 10,000 ml.",
  "Välj en målkoncentration mellan 0 och 20 mg/ml.": "Choose a target nicotine concentration between 0 and 20 mg/ml.",
  "Önskad nikotinstyrka kan inte överstiga shotstyrkan.": "Target nicotine strength cannot exceed shot strength.",
  "Shotflaskans volym måste vara mellan 0,1 och 10 ml.": "Shot bottle volume must be between 0.1 and 10 ml.",
  "VG-andelarna måste ligga mellan 0 och 100 %.": "VG percentages must be between 0 and 100%.",
  "Du kan ha högst 20 smaker i ett recept.": "You can add up to 20 flavors per recipe.",
  "Kontrollera smakerna, procentandelarna och PG/VG-värdena.": "Check flavor names, percentages and PG/VG values.",
  "Smakerna får inte utgöra mer än 100 % av blandningen.": "Flavors cannot exceed 100% of the mix.",
  "Nikotinshots och aromer tar mer plats än slutvolymen. Minska nikotin eller arom.": "Nicotine shots and flavors exceed the final volume. Reduce their amounts."
};
export function translateCalcError(error, lang="sv") {
  if (lang!=="en") return error || "Kontrollera inmatade värden.";
  return english[error] || "Please check the entered values.";
}
