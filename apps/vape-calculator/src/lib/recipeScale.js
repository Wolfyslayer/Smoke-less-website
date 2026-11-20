import {calculateDIY} from "./calculations.js";
export function scaleRecipeData(data,newVolume,lang="sv"){
  if(typeof newVolume!=="number"||!Number.isFinite(newVolume)||newVolume<1||newVolume>10000)throw Error("Invalid volume");
  const next={...data,totalVolume:newVolume,name:(data.name+" ("+newVolume+" ml)").slice(0,120),flavors:data.flavors.map(f=>({...f}))};
  const result=calculateDIY(next);
  if(!result.ok||!result.feasible)throw Error("Invalid scaled mix");
  return next;
}
