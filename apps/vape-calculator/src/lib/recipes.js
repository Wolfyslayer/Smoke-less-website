import { calculateDIY } from "./calculations.js";
const KEY = "vapecalc:recipes:v1";
const MAX_RECIPES = 200;
export const getRecipes = () => {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? data.filter(isRecipe).slice(0,MAX_RECIPES) : [];
  } catch {return [];}
};
const normalFlavor = f => ({
  id: crypto.randomUUID(),
  name: String(f.name).trim().slice(0,100),
  percent: f.percent,
  vgPercent: f.vgPercent
});
export function isRecipe(item) {
  if (!item || typeof item !== "object" || !item.data || typeof item.data !== "object")return false;
  const d = item.data;
  if (typeof item.id !== "string" || item.id.length > 100 || typeof d.name !== "string" || !d.name.trim() || d.name.length > 120 ||
      typeof d.notes !== "string" || d.notes.length > 2000 || !Array.isArray(d.flavors) || d.flavors.length > 20 ||
      d.flavors.some(f => !f || typeof f.name !== "string" || !f.name.trim() || f.name.length > 100 ||
        typeof f.percent !== "number" || typeof f.vgPercent !== "number")) return false;
  if (item.favorite !== undefined && typeof item.favorite !== "boolean") return false;
  const r = calculateDIY(d);
  return r.ok && r.feasible;
}
export function sanitizeRecipe(input) {
  if (!isRecipe(input)) throw new Error("Invalid recipe");
  const d=input.data;
  return {
    id:crypto.randomUUID(),
    favorite:input.favorite===true,
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    data:{
      name:d.name.trim().slice(0,120),notes:d.notes.slice(0,2000),
      totalVolume:d.totalVolume,targetStrength:d.targetStrength,shotStrength:d.shotStrength,shotVolume:d.shotVolume,
      shotVgPercent:d.shotVgPercent,targetVgPercent:d.targetVgPercent,
      flavors:d.flavors.map(normalFlavor)
    }
  };
}
export function persistRecipes(recipes) {
  if (!Array.isArray(recipes) || recipes.length > MAX_RECIPES)throw new Error("Recipe limit exceeded");
  localStorage.setItem(KEY,JSON.stringify(recipes));
}
export function importRecipes(payload, existing) {
  if (!payload || payload.format !== "vapecalc-recipes" || payload.version !== 1 ||
      !Array.isArray(payload.recipes) || payload.recipes.length > MAX_RECIPES ||
      payload.recipes.length + existing.length > MAX_RECIPES)throw new Error("Invalid import");
  const imported=payload.recipes.map(sanitizeRecipe);
  return { next:[...imported,...existing], count:imported.length };
}
