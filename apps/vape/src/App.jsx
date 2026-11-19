import React, { useEffect, useMemo, useState } from "react";
import { LanguageContext, makeTranslator } from "./i18n.js";
import { Navigation } from "./components/Navigation.jsx";
import Home from "./pages/Home.jsx";
import Strength from "./pages/Strength.jsx";
import Shots from "./pages/Shots.jsx";
import DIY, { emptyDraft } from "./pages/DIY.jsx";
import Recipes from "./pages/Recipes.jsx";
import Guide from "./pages/Guide.jsx";
import { getRecipes, importRecipes, persistRecipes, sanitizeRecipe } from "./lib/recipes.js";

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
  const [recipes, setRecipes] = useState(getRecipes);
  const [draft, setDraft] = useState(emptyDraft);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
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
  const commitRecipes = next => {
    persistRecipes(next);
    setRecipes(next);
  };
  const onSave = value => {
    try {
      const item = sanitizeRecipe({id:"draft",data:value});
      const previous = recipes.find(recipe => recipe.id === editing);
      const record = previous ? {...item,id:previous.id,createdAt:previous.createdAt} : item;
      const next = previous ? recipes.map(recipe => recipe.id === editing ? record : recipe) : [record,...recipes];
      commitRecipes(next);
      setEditing(null);setDraft(emptyDraft());setMessage("");
      navigate("recipes");
    } catch {setMessage(t("saveError"));}
  };
  const onEdit = recipe => {
    setDraft({...recipe.data,flavors:recipe.data.flavors.map(f => ({...f}))});
    setEditing(recipe.id);setMessage("");navigate("diy");
  };
  const cancelEdit = () => {setDraft(emptyDraft());setEditing(null);setMessage("");};
  const onDelete = id => {
    try {commitRecipes(recipes.filter(recipe => recipe.id !== id));}
    catch {setMessage(t("saveError"));}
  };
  const onDuplicate = recipe => {
    try {
      const duplicated = sanitizeRecipe(recipe);
      duplicated.data.name = (duplicated.data.name + (lang === "sv" ? " (kopia)" : " (copy)")).slice(0,120);
      commitRecipes([duplicated,...recipes]);
      setMessage("");
    } catch {setMessage(t("saveError"));}
  };
  const onImport = payload => {
    const {next,count} = importRecipes(payload,recipes);
    commitRecipes(next);
    return count;
  };
  return <LanguageContext.Provider value={language}>
    <div className="app-shell" data-theme={theme}>
      <a href="#main" className="skip-link">{lang === "sv" ? "Hoppa till innehållet" : "Skip to content"}</a>
      <Navigation page={page} navigate={navigate} lang={lang} changeLang={changeLang} theme={theme} changeTheme={changeTheme}/>
      <main id="main" className="main-content" tabIndex={-1}>
        {page === "home" && <Home navigate={navigate} count={recipes.length}/>}
        {page === "strength" && <Strength/>}
        {page === "shots" && <Shots/>}
        {page === "diy" && <DIY draft={draft} setDraft={setDraft} editing={editing} onSave={onSave} cancelEdit={cancelEdit} message={message}/>}
        {page === "recipes" && <Recipes recipes={recipes} navigate={navigate} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} onImport={onImport}/>}
        {page === "guide" && <Guide/>}
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} · {t("footer")}</span>
        <span>{t("notMedical")}</span>
        <a href="/">{t("backHub")}</a>
      </footer>
    </div>
  </LanguageContext.Provider>;
}
