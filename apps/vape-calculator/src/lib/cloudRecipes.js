import { supabase } from './supabaseClient.js'
import { isRecipe } from './recipes.js'
import { BUCKET, recipePath } from './cloudRecipePaths.js'

async function requireAuthenticatedUser(userId){
  const {data,error}=await supabase.auth.getUser()
  if(error||!data.user||data.user.id!==userId)throw new Error('Not authenticated for recipe storage')
}
const bucket=()=>supabase.storage.from(BUCKET)

export async function loadCloudRecipes(userId){
  await requireAuthenticatedUser(userId)
  const files=[]
  for(let offset=0;offset<=200;offset+=100){
    const {data,error}=await bucket().list(userId,{limit:100,offset,sortBy:{column:'name',order:'asc'}})
    if(error)throw error
    const page=(data||[]).filter(f=>/^[a-f0-9-]{36}\.json$/i.test(f.name))
    files.push(...page)
    if(files.length>200)throw new Error('Cloud recipe limit exceeded')
    if(!data||data.length<100)break
  }
  const result=[]
  // Controlled concurrency prevents excessively many simultaneous requests.
  for(let i=0;i<files.length;i+=5){
    const batch=files.slice(i,i+5)
    const saved=await Promise.all(batch.map(async f=>{
      const path=recipePath(userId,f.name.slice(0,-5))
      const {data,error}=await bucket().download(path)
      if(error)throw error
      const blobText=await data.text()
      if(blobText.length>262144)throw new Error('Recipe file is too large')
      let recipe
      try{recipe=JSON.parse(blobText)}catch{throw new Error('Invalid cloud recipe JSON')}
      if(!isRecipe(recipe)||recipe.id!==f.name.slice(0,-5))throw new Error('Invalid cloud recipe')
      return recipe
    }))
    result.push(...saved)
  }
  return result.sort((a,b)=>(Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0))
}
export async function saveCloudRecipe(userId,recipe){
  await requireAuthenticatedUser(userId)
  if(!isRecipe(recipe))throw new Error('Invalid recipe')
  const path=recipePath(userId,recipe.id)
  const content=JSON.stringify(recipe)
  if(new TextEncoder().encode(content).byteLength>262144)throw new Error('Recipe too large')
  const {error}=await bucket().upload(path,new Blob([content],{type:'application/json'}),{
    contentType:'application/json',cacheControl:'0',upsert:true
  })
  if(error)throw error
}
export async function deleteCloudRecipe(userId,recipeId){
  await requireAuthenticatedUser(userId)
  const path=recipePath(userId,recipeId)
  const {error}=await bucket().remove([path])
  if(error)throw error
}
