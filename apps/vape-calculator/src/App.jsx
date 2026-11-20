import React, { useEffect, useMemo, useRef, useState } from "react";
import { LanguageContext, makeTranslator } from "./i18n.js";
import { Navigation } from "./components/Navigation.jsx";
import Home from "./pages/Home.jsx";
import Strength from "./pages/Strength.jsx";
import Shots from "./pages/Shots.jsx";
import DIY, { emptyDraft } from "./pages/DIY.jsx";
import Recipes from "./pages/Recipes.jsx";
import Guide from "./pages/Guide.jsx";
import { getRecipes, importRecipes, persistRecipes, sanitizeRecipe } from "./lib/recipes.js";
import { scaleRecipeData } from "./lib/recipeScale.js";
import { loadRecipeDraft, saveRecipeDraft, clearRecipeDraft } from "./lib/draft.js";
import { supabase } from "./lib/supabaseClient.js";
import { loadCloudRecipes, saveCloudRecipe, deleteCloudRecipe } from "./lib/cloudRecipes.js";

const PAGE_IDS = ["home","strength","shots","diy","recipes","guide"];
const readPage = () => {
  const id = window.location.hash.replace(/^#\/?/,"").split("/")[0];
  return PAGE_IDS.includes(id) ? id : "home";
};
const readSetting = (name, fallback) => {
  try { return localStorage.getItem(name) || fallback; } catch {return fallback;}
};

export default function App() {
  const [lang, setLang] = useState(() => ["sv","en"].includes(readSetting("wolfyslayer:language","sv")) ? readSetting("wolfyslayer:language","sv") : "sv");
  const [theme, setTheme] = useState(() => {
    const stored = readSetting("vapecalc:theme","");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });
  const [page, setPage] = useState(readPage);
  const [user,setUser] = useState(null);
  const [checkingAuth,setCheckingAuth] = useState(true);
  const [cloudReady,setCloudReady] = useState(false);
  const [cloudError,setCloudError] = useState("");
  const [syncBusy,setSyncBusy] = useState(false);
  const [guestCount,setGuestCount] = useState(()=>getRecipes().length);
  const userIdRef=useRef(null);
  const [recipes, setRecipes] = useState([]);
  const [recipeOwner,setRecipeOwner] = useState(undefined);
  const [draft, setDraft] = useState(emptyDraft);
  const [editing, setEditing] = useState(null);
  const [loadedDraftOwner,setLoadedDraftOwner]=useState(null);
  const draftOwner=user?.id??"guest";
  const [message, setMessage] = useState("");
  useEffect(()=>{
    if(checkingAuth)return;
    const saved=loadRecipeDraft(draftOwner);
    setDraft(saved?.data??emptyDraft());
    setEditing(saved?.editing??null);
    setLoadedDraftOwner(draftOwner);
  },[draftOwner,checkingAuth]);
  useEffect(()=>{
    if(checkingAuth||loadedDraftOwner!==draftOwner)return;
    saveRecipeDraft(draftOwner,{data:draft,editing});
  },[draft,editing,loadedDraftOwner,draftOwner,checkingAuth]);
  const displayedRecipes = !checkingAuth && cloudReady && recipeOwner === (user?.id ?? null) ? recipes : [];
  const t = useMemo(() => makeTranslator(lang),[lang]);
  const language = useMemo(() => ({lang,t}),[lang,t]);

  useEffect(() => {
    const sync = () => setPage(readPage());
    window.addEventListener("hashchange",sync);
    return () => window.removeEventListener("hashchange",sync);
  },[]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = (page === "home" ? "VapeCalc" : t(page) + " · VapeCalc");
  },[lang,page,t]);

  useEffect(() => {
    let active=true;
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(active){setUser(session?.user??null);setCheckingAuth(false);}
    });
    void supabase.auth.getUser().then(({data,error})=>{
      if(active){setUser(error?null:data.user??null);setCheckingAuth(false);}
    }).catch(()=>{if(active){setUser(null);setCheckingAuth(false);}});
    return()=>{active=false;subscription.unsubscribe();};
  },[]);
  useEffect(()=>{
    if(checkingAuth)return;
    let active=true;
    const userId=user?.id??null;
    userIdRef.current=userId;
    setRecipes(userId?[]:getRecipes());
    setRecipeOwner(userId?undefined:null);
    setCloudError("");
    setCloudReady(!userId);
    setGuestCount(getRecipes().length);
    if(userId){
      void loadCloudRecipes(userId).then(data=>{
        if(active){setRecipes(data);setRecipeOwner(userId);setCloudReady(true);}
      }).catch(()=>{
        if(active){setCloudError(lang==="sv"?"Kunde inte läsa dina privata molnrecept. Kontrollera Supabase-konfigurationen eller anslutningen.":"Could not load your private cloud recipes. Check Supabase configuration or connection.");setCloudReady(false);}
      });
    }
    return()=>{active=false;};
  },[user?.id,checkingAuth]);

  const reloadCloud=async()=>{
    const owner=user?.id;
    if(!owner||syncBusy)return;
    setSyncBusy(true);
    try{
      const data=await loadCloudRecipes(owner);
      if(userIdRef.current===owner){setRecipes(data);setRecipeOwner(owner);setCloudReady(true);setCloudError("");}
    }catch{
      if(userIdRef.current===owner){setCloudReady(false);setCloudError(lang==="sv"?"Molnlagringen kunde inte nås.":"Cloud storage could not be reached.");}
    }finally{setSyncBusy(false);}
  };
  const saveOne=async(record,next)=>{
    const owner=user?.id??null;
    if(owner){await saveCloudRecipe(owner,record);}
    else{persistRecipes(next);}
    if(owner===userIdRef.current){
      setRecipes(next);
      setRecipeOwner(owner);
      if(!owner)setGuestCount(getRecipes().length);
    }
  };
  const errorMessage=()=>lang==="sv"?"Kunde inte spara i Supabase. Inga ändringar har bekräftats. Försök igen.":"Could not save to Supabase. No changes were confirmed. Please retry.";
  const changeLang = value => {
    if (!["sv","en"].includes(value)) return;
    setLang(value);try{localStorage.setItem("wolfyslayer:language",value);}catch{}
  };
  const changeTheme = () => setTheme(current => {
    const next = current === "dark" ? "light" : "dark";
    try {localStorage.setItem("vapecalc:theme",next);}catch{}
    return next;
  });
  const navigate = id => {
    if (!PAGE_IDS.includes(id)) return;
    setPage(id); window.location.hash = id === "home" ? "#/" : "#/" + id;
    window.scrollTo({top:0,behavior:"instant"});
  };
  const onSave = async value => {
    if(syncBusy||checkingAuth||!cloudReady||recipeOwner!==(user?.id??null))return;
    setSyncBusy(true);setMessage("");
    try{
      const item=sanitizeRecipe({id:"draft",data:value});
      const previous=recipes.find(recipe=>recipe.id===editing);
      const record=previous?{...item,id:previous.id,createdAt:previous.createdAt,favorite:previous.favorite===true}:item;
      const next=previous?recipes.map(recipe=>recipe.id===editing?record:recipe):[record,...recipes];
      if(next.length>200)throw Error("Recipe limit");
      await saveOne(record,next);
      clearRecipeDraft(draftOwner);
      setEditing(null);setDraft(emptyDraft());setMessage("");
      navigate("recipes");
    }catch{setMessage(errorMessage());}
    finally{setSyncBusy(false);}
  };
  const onEdit=recipe=>{
    setDraft({...recipe.data,flavors:recipe.data.flavors.map(f=>({...f}))});
    setEditing(recipe.id);setMessage("");navigate("diy");
  };
  const cancelEdit=()=>{setDraft(emptyDraft());setEditing(null);setMessage("");clearRecipeDraft(draftOwner);};
  const clearDraft=()=>{setDraft(emptyDraft());setEditing(null);setMessage("");clearRecipeDraft(draftOwner);};
  const onDelete=async id=>{
    if(syncBusy||!cloudReady||recipeOwner!==(user?.id??null))return;
    const owner=user?.id??null;
    setSyncBusy(true);setCloudError("");
    try{
      const next=recipes.filter(recipe=>recipe.id!==id);
      if(owner)await deleteCloudRecipe(owner,id);
      else persistRecipes(next);
      if(userIdRef.current===owner){setRecipes(next);setRecipeOwner(owner);if(!owner)setGuestCount(getRecipes().length);}
    }catch{setCloudError(errorMessage());}
    finally{setSyncBusy(false);}
  };
  const toggleFavorite=async recipe=>{
    if(syncBusy||checkingAuth||!cloudReady||recipeOwner!==(user?.id??null))return;
    setSyncBusy(true);setCloudError("");
    try{
      const record={...recipe,favorite:recipe.favorite!==true};
      await saveOne(record,recipes.map(r=>r.id===recipe.id?record:r));
    }catch{setCloudError(errorMessage());}
    finally{setSyncBusy(false);}
  };
  const onScale=async(recipe,volume)=>{
    if(syncBusy||checkingAuth||!cloudReady||recipeOwner!==(user?.id??null))return;
    setSyncBusy(true);setCloudError("");
    try{
      const item=sanitizeRecipe({id:"new",data:scaleRecipeData(recipe.data,volume,lang)});
      const next=[item,...recipes];
      if(next.length>200)throw Error("Recipe limit");
      await saveOne(item,next);
    }catch{setCloudError(errorMessage());}
    finally{setSyncBusy(false);}
  };
  const onDuplicate=async recipe=>{
    if(syncBusy||!cloudReady)return;
    setSyncBusy(true);setCloudError("");
    try{
      const item=sanitizeRecipe(recipe);
      item.data.name=(item.data.name+(lang==="sv"?" (kopia)":" (copy)")).slice(0,120);
      const next=[item,...recipes];
      if(next.length>200)throw Error("Recipe limit");
      await saveOne(item,next);
    }catch{setCloudError(errorMessage());}
    finally{setSyncBusy(false);}
  };
  const onImport=async payload=>{
    if(syncBusy||!cloudReady||recipeOwner!==(user?.id??null))throw Error("Storage not ready");
    const owner=user?.id??null;
    const {next,count}=importRecipes(payload,recipes);
    setSyncBusy(true);setCloudError("");
    try{
      if(owner){
        for(const item of next.slice(0,count))await saveCloudRecipe(owner,item);
      }else persistRecipes(next);
      if(owner===userIdRef.current){setRecipes(next);if(!owner)setGuestCount(getRecipes().length);}
      return count;
    }catch{
      if(owner)await reloadAfterFailure(owner);
      throw Error("Import failed");
    }finally{setSyncBusy(false);}
  };
  const reloadAfterFailure=async owner=>{
    try{
      const updated=await loadCloudRecipes(owner);
      if(userIdRef.current===owner){setRecipes(updated);setRecipeOwner(owner);}
    }catch{setCloudReady(false);setCloudError(errorMessage());}
  };
  const importGuest=async()=>{
    const owner=user?.id;
    if(!owner||syncBusy||!cloudReady||recipeOwner!==owner)return;
    const guest=getRecipes();
    const existing=new Set(recipes.map(item=>JSON.stringify(item.data)));
    const missing=guest.filter(item=>!existing.has(JSON.stringify(item.data)));
    if(!missing.length)return;
    if(recipes.length+missing.length>200){setCloudError(errorMessage());return;}
    setSyncBusy(true);setCloudError("");
    try{
      const newItems=missing.map(item=>sanitizeRecipe({id:"draft",data:item.data,favorite:item.favorite===true}));
      for(const item of newItems)await saveCloudRecipe(owner,item);
      const updated=await loadCloudRecipes(owner);
      if(userIdRef.current===owner){setRecipes(updated);setRecipeOwner(owner);setGuestCount(getRecipes().length);}
    }catch{await reloadAfterFailure(owner);setCloudError(errorMessage());}
    finally{setSyncBusy(false);}
  };
  return <LanguageContext.Provider value={language}>
    <div className="app-shell" data-theme={theme}>
      <a href="#main" className="skip-link">{lang === "sv" ? "Hoppa till innehållet" : "Skip to content"}</a>
      <Navigation page={page} navigate={navigate} lang={lang} changeLang={changeLang} theme={theme} changeTheme={changeTheme} user={user} checkingAuth={checkingAuth}/>
      <main id="main" className="main-content" tabIndex={-1}>
        {cloudError&&<div className="cloud-feedback error" role="alert">{cloudError}{user&&<button type="button" onClick={()=>void reloadCloud()}>{lang==="sv"?"Försök igen":"Retry"}</button>}</div>}
        {checkingAuth&&<div className="cloud-feedback" role="status">{lang==="sv"?"Kontrollerar konto…":"Checking account…"}</div>}
        {user&&!cloudReady&&!cloudError&&<div className="cloud-feedback" role="status">{lang==="sv"?"Hämtar privata recept från Supabase…":"Loading private recipes from Supabase…"}</div>}
        {page === "home" && <Home navigate={navigate} count={displayedRecipes.length} user={user}/>}
        {page === "strength" && <Strength/>}
        {page === "shots" && <Shots/>}
        {page === "diy" && <DIY draft={draft} setDraft={setDraft} editing={editing} onSave={onSave} cancelEdit={cancelEdit} clearDraft={clearDraft} message={message} busy={syncBusy||!cloudReady||checkingAuth||loadedDraftOwner!==draftOwner||recipeOwner!==(user?.id??null)}/>}
        {page === "recipes" && <Recipes recipes={displayedRecipes} navigate={navigate} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} onToggleFavorite={toggleFavorite} onScale={onScale} theme={theme} onImport={onImport} importGuest={importGuest} user={user} guestCount={guestCount} busy={syncBusy||!cloudReady||checkingAuth} reloadCloud={reloadCloud}/>}
        {page === "guide" && <Guide/>}
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} · {t("footer")}</span>
        <span>{t("notMedical")}</span>
        <a href="/">{t("backHub")}</a><a href={"/vape-calculator/account/?returnTo="+encodeURIComponent(window.location.pathname + window.location.hash)}>{user?(lang==="sv"?"Mitt konto":"My account"):(lang==="sv"?"Logga in":"Sign in")}</a>
      </footer>
    </div>
  </LanguageContext.Provider>;
}
