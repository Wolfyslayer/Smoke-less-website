import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("print/share are user-triggered and do not send recipes to an external service",()=>{
 const code=readFileSync("apps/vape-calculator/src/components/RecipeCard.jsx","utf8");
 assert.ok(code.includes("window.print()"));
 assert.ok(code.includes("navigator.share("));
 assert.ok(code.includes("navigator.clipboard.writeText("));
 assert.ok(!code.includes("fetch("));
 assert.ok(code.includes('role="dialog"'));
 assert.ok(code.includes('onClose()'));
});
