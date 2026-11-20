import test from "node:test";
import assert from "node:assert/strict";
import {translateCalcError} from "../src/lib/translateErrors.js";
import {strengthFromShots,shotsNeeded,calculateDIY} from "../src/lib/calculations.js";
test("all validation errors used by calculators can be shown in English",()=>{
 const cases=[strengthFromShots({baseVolume:-1,shotVolume:10,shotStrength:20,shotCount:1}), shotsNeeded({mode:"base",volume:50,targetStrength:20,shotStrength:20,shotVolume:10}), calculateDIY({totalVolume:100,targetStrength:25,shotStrength:20,shotVolume:10,shotVgPercent:50,targetVgPercent:70,flavors:[]})];
 for(const result of cases){assert.equal(result.ok,false);const en=translateCalcError(result.error,"en");assert.ok(en!==result.error);assert.ok(en.length>10);}
});
test("Swedish errors are retained and unknown errors have an English fallback",()=>{
 assert.equal(translateCalcError("Ett fel","sv"),"Ett fel");
 assert.equal(translateCalcError("okänt","en"),"Please check the entered values.");
});
