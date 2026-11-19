import test from "node:test";
import assert from "node:assert/strict";
import { strengthFromShots, shotsNeeded, calculateDIY } from "../src/lib/calculations.js";

const approx = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, String(actual) + " != " + String(expected));

test("one 20mg 10ml shot in 50ml zero-nic gives 3.333mg/ml", () => {
  const result = strengthFromShots({ baseVolume: 50, shotVolume: 10, shotStrength: 20, shotCount: 1 });
  assert.equal(result.ok, true);
  approx(result.strength, 200 / 60);
  approx(result.totalVolume, 60);
  approx(result.nicotineMg, 200);
});

test("two 18mg shots in 40ml zero-nic give 6mg/ml", () => {
  const result = strengthFromShots({ baseVolume: 40, shotVolume: 10, shotStrength: 18, shotCount: 2 });
  approx(result.strength, 6);
});

test("zero shots give zero nicotine, without division by zero", () => {
  const result = strengthFromShots({ baseVolume: 50, shotVolume: 10, shotStrength: 20, shotCount: 0 });
  approx(result.strength, 0);
});

test("base mode solves for added shots rather than replacing zero-nic liquid", () => {
  const result = shotsNeeded({ mode: "base", volume: 50, targetStrength: 3, shotStrength: 20, shotVolume: 10 });
  approx(result.nicotineVolume, 150 / 17);
  approx(result.totalVolume, 50 + 150 / 17);
  assert.equal(result.bottlesToBuy, 1);
});

test("final mode preserves exact requested final volume", () => {
  const result = shotsNeeded({ mode: "final", volume: 60, targetStrength: 6, shotStrength: 20, shotVolume: 10 });
  approx(result.nicotineVolume, 18);
  approx(result.baseVolume, 42);
  assert.equal(result.bottlesToBuy, 2);
  approx(result.leftoverShotVolume, 2);
});

test("unreachable base target and too-strong nicotine are rejected", () => {
  assert.equal(shotsNeeded({ mode: "base", volume: 50, targetStrength: 20, shotStrength: 20, shotVolume: 10 }).ok, false);
  assert.equal(strengthFromShots({ baseVolume: 50, shotCount: 1, shotVolume: 10, shotStrength: 72 }).ok, false);
});

test("DIY components add exactly to finished volume and preserve VG ratio", () => {
  const result = calculateDIY({
    totalVolume: 100, targetStrength: 3, shotStrength: 20, shotVolume: 10,
    shotVgPercent: 50, targetVgPercent: 70,
    flavors: [{ name: "Jordgubb", percent: 8, vgPercent: 0 }, { name: "Vanilj", percent: 2, vgPercent: 0 }]
  });
  assert.equal(result.ok, true);
  assert.equal(result.feasible, true);
  approx(result.nicotineVolume, 15);
  approx(result.flavorVolume, 10);
  approx(result.vgVolume, 62.5);
  approx(result.pgVolume, 12.5);
  approx(result.nicotineVolume + result.flavorVolume + result.vgVolume + result.pgVolume, 100);
});

test("DIY reports impossible requested VG instead of showing negative ingredients", () => {
  const result = calculateDIY({
    totalVolume: 60, targetStrength: 10, shotStrength: 20, shotVolume: 10,
    shotVgPercent: 100, targetVgPercent: 20,
    flavors: [{ name: "Mango", percent: 10, vgPercent: 0 }]
  });
  assert.equal(result.ok, true);
  assert.equal(result.feasible, false);
  assert.ok(result.closestVgPercent > 20);
});

test("DIY refuses mixes where the ingredients exceed the final capacity", () => {
  const result = calculateDIY({
    totalVolume: 60, targetStrength: 18, shotStrength: 20, shotVolume: 10,
    shotVgPercent: 50, targetVgPercent: 50,
    flavors: [{ name: "Smak", percent: 20, vgPercent: 0 }]
  });
  assert.equal(result.ok, false);
});

test("DIY 0mg result has no shots", () => {
  const result = calculateDIY({
    totalVolume: 30, targetStrength: 0, shotStrength: 20, shotVolume: 10,
    shotVgPercent: 50, targetVgPercent: 70, flavors: []
  });
  assert.equal(result.bottlesToBuy, 0);
  approx(result.nicotineVolume, 0);
  approx(result.vgVolume, 21);
});
