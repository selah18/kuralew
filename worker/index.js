const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Content-Type': 'application/json; charset=utf-8'
};
const json = (data, status=200) => new Response(JSON.stringify(data), {status, headers:cors});
const clean = (v, max=1200) => String(v ?? '').trim().slice(0,max);
const validCategories = new Set(['Phones','Fashion','Home','Vehicles','Property','Electronics','Books','Services','Other']);
export default {
 async fetch(request, env) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null,{headers:cors});
  if (url.pathname === '/api/health') return json({ok:true,app:'Kuralew ቁራሌው',storage:!!env.DB});
  if (!url.pathname.startsWith('/api/') && env.ASSETS) return env.ASSETS.fetch(request);
  if (!env.DB) return json({error:'Database is not configured. Create a D1 database and bind it as DB.'},503);
  if (url.pathname === '/api/listings' && request.method === 'GET') {
   const q=clean(url.searchParams.get('q'),100), category=clean(url.searchParams.get('category'),40), city=clean(url.searchParams.get('city'),100);
   let sql='SELECT id,title,price,category,condition,city,seller,description,image_url AS image,created_at FROM listings WHERE status = ?';
   const args=['active'];
   if(q){sql+=' AND (title LIKE ? OR description LIKE ? OR city LIKE ?)';args.push(`%${q}%`,`%${q}%`,`%${q}%`)}
   if(category && category!=='All'){sql+=' AND category = ?';args.push(category)}
   if(city && city!=='All Ethiopia'){sql+=' AND city LIKE ?';args.push(`%${city}%`)}
   sql+=' ORDER BY created_at DESC LIMIT 100';
   const {results=[]}=await env.DB.prepare(sql).bind(...args).all();
   return json({listings:results.map(x=>({...x,posted:new Date(x.created_at).getTime(),time:'Recently posted',emoji:'📦',verified:false}))});
  }
  if (url.pathname === '/api/listings' && request.method === 'POST') {
   let b; try{b=await request.json()}catch{return json({error:'Invalid JSON'},400)}
   const title=clean(b.title,90), category=clean(b.category,40), condition=clean(b.condition,30), city=clean(b.city,100), seller=clean(b.seller,50), description=clean(b.description,1200), image=clean(b.image,1000), price=Number(b.price);
   if(title.length<3||!validCategories.has(category)||!Number.isFinite(price)||price<=0||!condition||!city||!seller||description.length<5) return json({error:'Please provide valid listing details.'},400);
   if(image && !/^https:\/\//i.test(image)) return json({error:'Image URL must use HTTPS.'},400);
   // Public posting is intentionally rate-limited until Telegram initData signature verification is configured.
   // Set ALLOW_UNAUTHENTICATED_POSTS=true only for controlled testing; never use it for a public production launch.
   if(env.ALLOW_UNAUTHENTICATED_POSTS !== 'true') return json({error:'Posting requires Telegram initData verification before public launch. Demo posting remains available in the Mini App.'},401);
   const id=crypto.randomUUID();
   await env.DB.prepare('INSERT INTO listings (id,title,price,category,condition,city,seller,description,image_url,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id,title,Math.round(price),category,condition,city,seller,description,image,'active',new Date().toISOString()).run();
   return json({listing:{id,title,price,category,condition,city,seller,description,image}},201);
  }
  if (url.pathname === '/api/reports' && request.method === 'POST') {
   let b;try{b=await request.json()}catch{return json({error:'Invalid JSON'},400)}
   const listingId=clean(b.listingId,80), reason=clean(b.reason,100), note=clean(b.note,1000);
   if(!listingId||!reason)return json({error:'Listing and reason are required.'},400);
   const id=crypto.randomUUID();
   await env.DB.prepare('INSERT INTO reports (id,listing_id,reason,note,created_at) VALUES (?,?,?,?,?)').bind(id,listingId,reason,note,new Date().toISOString()).run();
   return json({ok:true,id},201);
  }
  return json({error:'Not found'},404);
 }
};
