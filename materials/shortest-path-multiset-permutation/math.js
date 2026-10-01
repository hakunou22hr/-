export function countShortestPaths(right, up) {
  if (!Number.isInteger(right) || !Number.isInteger(up) || right < 0 || up < 0) return 0n
  const k = Math.min(right, up); const n = right + up
  let value = 1n
  for (let i = 1; i <= k; i++) value = value * BigInt(n - k + i) / BigInt(i)
  return value
}
export function countPathsViaPoint(a, c, b) {
  if (c.x < a.x || c.y < a.y || c.x > b.x || c.y > b.y) return 0n
  return countShortestPaths(c.x-a.x,c.y-a.y)*countShortestPaths(b.x-c.x,b.y-c.y)
}
export function countPathsAvoidPoint(a,c,b){ return countShortestPaths(b.x-a.x,b.y-a.y)-countPathsViaPoint(a,c,b) }
export function generateShortestRoutes(right, up) {
  const routes=[]
  function visit(r,u,path){ if(r===right&&u===up){routes.push(path);return} if(r<right)visit(r+1,u,path+'R'); if(u<up)visit(r,u+1,path+'U') }
  visit(0,0,''); return routes
}
