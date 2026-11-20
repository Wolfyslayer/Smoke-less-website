import {calculateDIY} from "./calculations.js";
const safePrice=value=>typeof value==="number"&&Number.isFinite(value)&&value>=0&&value<=100000;
export function calculateRecipeCost(recipe){
  const r=calculateDIY(recipe);
  if(!r.ok||!r.feasible)return {ok:false,hasPrices:false};
  const unit={vg:recipe.costs?.vg??0,pg:recipe.costs?.pg??0,shot:recipe.costs?.shot??0};
  if(!Object.values(unit).every(safePrice)||recipe.flavors.some(f=>!safePrice(f.pricePerMl??0)))return {ok:false,hasPrices:false};
  const vgCost=r.vgVolume*unit.vg,pgCost=r.pgVolume*unit.pg,shotCost=r.nicotineVolume*unit.shot;
  const flavorCosts=r.flavorItems.map((f,i)=>({name:f.name,amount:f.volume,cost:f.volume*(recipe.flavors[i].pricePerMl??0)}));
  const totalCost=vgCost+pgCost+shotCost+flavorCosts.reduce((sum,f)=>sum+f.cost,0);
  return {ok:true,hasPrices:Object.values(unit).some(v=>v>0)||recipe.flavors.some(f=>(f.pricePerMl??0)>0),totalCost,costPerMl:totalCost/r.totalVolume,vgCost,pgCost,shotCost,flavorCosts};
}
