// /api/news  — Belgian sources, STRICT Red Devils & squad-only filter
import { parseFeed, formatDate, parseDateMs } from './feedutils.js';

const SOURCES = [
  { id:'sporza-duivels', name:'Sporza', url:'https://sporza.be/nl/tag/voetbal/ploegen/rode-duivels~3004.rss.xml', color:'#e8a020', bg:'rgba(232,160,32,.15)', strict:false },
  { id:'sporza-voetbal', name:'Sporza', url:'https://sporza.be/nl/categorie/voetbal.rss.xml', color:'#e8a020', bg:'rgba(232,160,32,.15)', strict:true },
  { id:'voetbalkrant',   name:'Voetbalkrant', url:'https://www.voetbalkrant.com/nl/rss', color:'#3b82f6', bg:'rgba(59,130,246,.15)', strict:true },
  { id:'hln',            name:'HLN', url:'https://www.hln.be/sport/voetbal/rss.xml', color:'#e31e24', bg:'rgba(227,30,36,.15)', strict:true },
  { id:'hbvl',           name:'HBVL', url:'https://www.hbvl.be/rss.xml', color:'#0066cc', bg:'rgba(0,102,204,.15)', strict:true },
  { id:'nieuwsblad',     name:'Nieuwsblad', url:'https://www.nieuwsblad.be/rss/section/c4f77e13-3d2d-4218-8b40-134eb8e38e97', color:'#cc0000', bg:'rgba(204,0,0,.15)', strict:true },
];

// STRICT Red Devils + squad players only — no general WK or Belgian football
const STRICT_KW = [
  'rode duivels','red devils','belgisch nationaal','nationale ploeg',
  'garcia','rudi garcia','bondscoach',
  'lukaku','de bruyne','courtois','doku','trossard','tielemans','onana',
  'debast','theate','witsel','vanaken','saelemaekers','de ketelaere',
  'stassin','fernandez-pardo','meunier','mechele','castagne','de cuyper',
  'de winter','ngoy','seys','raskin','lammens','penders','lukebakio',
  'wk-selectie','wk selectie','rode duivel',
];

function matches(text){ const l=text.toLowerCase(); return STRICT_KW.some(k=>l.includes(k)); }

async function fetchFeed(src){
  try{
    const r=await fetch(src.url,{headers:{'User-Agent':'BelgiumWC2026/2.0'},signal:AbortSignal.timeout(8000)});
    if(!r.ok) return [];
    const xml=await r.text();
    return parseFeed(xml,src).filter(i=>!src.strict||matches(i.title+' '+(i.description||'')));
  }catch(e){ console.warn(src.id,e.message); return []; }
}

export default async()=>{
  const results=await Promise.allSettled(SOURCES.map(fetchFeed));
  const all=results.filter(r=>r.status==='fulfilled').flatMap(r=>r.value);
  const seen=new Set();
  const unique=all.filter(i=>{ const k=i.title.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,70); if(seen.has(k))return false; seen.add(k); return true; });
  unique.sort((a,b)=>(b.dateMs||0)-(a.dateMs||0));
  return new Response(JSON.stringify({items:unique.slice(0,40),total:unique.length}),{
    status:200,headers:{'Content-Type':'application/json','Cache-Control':'public,s-maxage=300','Access-Control-Allow-Origin':'*'}
  });
};
export const config={path:'/api/news'};
