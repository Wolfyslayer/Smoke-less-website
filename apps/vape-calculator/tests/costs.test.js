import test from "node:test";
import assert from "node:assert/strict";
import {calculateRecipeCost} from "../src/lib/recipeCosts.js";
import {sanitizeRecipe,isRecipe} from "../src/lib/recipes.js";
const data={name:"Berry",notes:"",totalVolume:100,targetStrength:3,shotStrength:20,shotVolume:10,shotVgPercent:50,targetVgPercent:70,flavors:[{name:"Berry",percent:10,vgPercent:0,pricePerMl:2}],costs:{vg:.1,pg:.2,shot:1}};
test("ingredient prices scale with actual volumes",()=>{
 const r=calculateRecipeCost(data);assert.equal(r.ok,true);assert.equal(r.hasPrices,true);
 assert.equal(r.nicotineVolume,undefined);assert.ok(r.totalCost>20);assert.equal(r.costPerMl,r.totalCost/100);
 const doubled=calculateRecipeCost({...data,totalVolume:200});assert.ok(Math.abs(doubled.totalCost-r.totalCost*2)<1e-9);
});
test("legacy recipes without cost fields remain valid; invalid prices rejected",()=>{
 const old={id:"x",data:{...data,costs:undefined,flavors:[{name:"Berry",percent:10,vgPercent:0}]}};
 assert.equal(isRecipe(old),true);
 const saved=sanitizeRecipe({id:"x",data});assert.equal(saved.data.costs.shot,1);assert.equal(saved.data.flavors[0].pricePerMl,2);
 assert.equal(isRecipe({id:"x",data:{...data,costs:{shot:-2}}}),false);
});
