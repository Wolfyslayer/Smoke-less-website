import test from "node:test";
import assert from "node:assert/strict";
import {loadRecipeDraft,saveRecipeDraft,clearRecipeDraft,isMeaningfulDraft} from "../src/lib/draft.js";
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const owner="00112233-4455-6677-8899-aabbccddeeff",other="ffeeddcc-bbaa-9988-7766-554433221100";
const data={name:"Berry",notes:"",totalVolume:60,targetStrength:3,shotStrength:20,shotVolume:10,shotVgPercent:50,targetVgPercent:70,flavors:[{id:"one",name:"Berry",percent:10,vgPercent:0}]};
test("drafts remain on device and isolated per account",()=>{
 saveRecipeDraft(owner,{data,editing:null});assert.equal(loadRecipeDraft(owner).data.name,"Berry");assert.equal(loadRecipeDraft(other),null);assert.equal(loadRecipeDraft("guest"),null);clearRecipeDraft(owner);assert.equal(loadRecipeDraft(owner),null);
});
test("empty drafts are discarded; malformed storage is ignored",()=>{
 assert.equal(isMeaningfulDraft({...data,name:"",notes:"",flavors:[{id:"one",name:"",percent:10,vgPercent:0}]},null),false);
 assert.equal(isMeaningfulDraft({...data,name:"",notes:"",flavors:[{id:"one",name:"",percent:10,vgPercent:0}],totalVolume:100},null),true);
 saveRecipeDraft(owner,{data:{...data,name:"",notes:"",flavors:[{id:"one",name:"",percent:10,vgPercent:0}],totalVolume:60},editing:null});assert.equal(loadRecipeDraft(owner),null);
 store.set("vapecalc:draft:v1:"+owner,"invalid json");assert.equal(loadRecipeDraft(owner),null);
});
