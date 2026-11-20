import test from "node:test";
import assert from "node:assert/strict";
import {scaleRecipeData} from "../src/lib/recipeScale.js";
import {calculateDIY} from "../src/lib/calculations.js";
const d={name:"Berry",notes:"note",totalVolume:60,targetStrength:3,shotStrength:20,shotVolume:10,shotVgPercent:50,targetVgPercent:70,flavors:[{name:"Berry",percent:10,vgPercent:0}]};
test("scaling preserves strengths and proportions while rescaling ingredients",()=>{
 const a=calculateDIY(d), b=scaleRecipeData(d,120), c=calculateDIY(b);
 assert.equal(b.totalVolume,120);assert.equal(b.targetStrength,3);assert.equal(b.targetVgPercent,70);assert.equal(b.flavors[0].percent,10);assert.equal(c.nicotineVolume,2*a.nicotineVolume);assert.equal(c.flavorVolume,2*a.flavorVolume);
 assert.equal(d.totalVolume,60);
});
test("invalid volumes do not generate or persist new recipes",()=>{
 for(const amount of [0,-1,10001,NaN,Infinity,"120"]){assert.throws(()=>scaleRecipeData(d,amount));}
});
