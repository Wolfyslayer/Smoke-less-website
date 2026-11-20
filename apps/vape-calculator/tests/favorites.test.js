import test from "node:test";
import assert from "node:assert/strict";
import {sanitizeRecipe,isRecipe} from "../src/lib/recipes.js";
const data={name:"Test",notes:"",totalVolume:60,targetStrength:3,shotStrength:20,shotVolume:10,shotVgPercent:50,targetVgPercent:70,flavors:[{name:"Berry",percent:5,vgPercent:0}]};
test("favorite field remains optional and compatible with old recipes",()=>{
 const old={id:"foo",data};assert.equal(isRecipe(old),true);
 const newer=sanitizeRecipe({...old,favorite:true});assert.equal(newer.favorite,true);assert.equal(isRecipe(newer),true);
 assert.equal(sanitizeRecipe(old).favorite,false);
 assert.equal(isRecipe({...old,favorite:"true"}),false);
});
