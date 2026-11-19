export const BUCKET = 'vape-recipes'
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export function recipePath(userId,recipeId){
  if(!UUID.test(userId)||!UUID.test(recipeId))throw new Error('Invalid recipe path')
  return userId+'/'+recipeId+'.json'
}
