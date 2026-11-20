// Drafts stay on this device. Keys are scoped by the current user (or guest)
// so switching accounts never loads another account's unsaved recipe.
const PREFIX="vapecalc:draft:v1:";
const KEY_PATTERN=/^(guest|[a-f0-9-]{36})$/i;
const keyFor=owner=>{if(!KEY_PATTERN.test(owner))throw Error("Invalid draft owner");return PREFIX+owner;};
export function isMeaningfulDraft(data,editing){
  return !!editing||!!data.name?.trim()||!!data.notes?.trim()||data.flavors?.some(f=>f.name?.trim());
}
export function loadRecipeDraft(owner){
  try{
    const raw=localStorage.getItem(keyFor(owner));
    if(!raw||raw.length>32000)return null;
    const payload=JSON.parse(raw);
    if(payload.version!==1||!payload.data||typeof payload.data!=="object")return null;
    const d=payload.data;
    if(typeof d.name!=="string"||typeof d.notes!=="string"||d.name.length>120||d.notes.length>2000||!Array.isArray(d.flavors)||d.flavors.length>20)return null;
    if(d.flavors.some(f=>!f||typeof f.id!=="string"||typeof f.name!=="string"||f.name.length>100))return null;
    for(const field of ["totalVolume","targetStrength","shotStrength","shotVolume","shotVgPercent","targetVgPercent"]){if(typeof d[field]!=="number"||!Number.isFinite(d[field]))return null;}
    if(d.flavors.some(f=>typeof f.percent!=="number"||!Number.isFinite(f.percent)||typeof f.vgPercent!=="number"||!Number.isFinite(f.vgPercent)))return null;
    const validPrice=value=>typeof value==="number"&&Number.isFinite(value)&&value>=0&&value<=100000;
    if(d.costs!==undefined&&(!d.costs||typeof d.costs!=="object"||["vg","pg","shot"].some(k=>d.costs[k]!==undefined&&!validPrice(d.costs[k]))))return null;
    if(d.flavors.some(f=>f.pricePerMl!==undefined&&!validPrice(f.pricePerMl)))return null;
    return {data:d,editing:typeof payload.editing==="string"&&payload.editing.length<=100?payload.editing:null};
  }catch{return null;}
}
export function saveRecipeDraft(owner,payload){
  try{
    const key=keyFor(owner);
    if(!isMeaningfulDraft(payload.data,payload.editing)){localStorage.removeItem(key);return;}
    const encoded=JSON.stringify({version:1,...payload});
    if(encoded.length<32000)localStorage.setItem(key,encoded);
  }catch{/* No storage availability: never block recipe editing. */}
}
export function clearRecipeDraft(owner){try{localStorage.removeItem(keyFor(owner))}catch{}}
