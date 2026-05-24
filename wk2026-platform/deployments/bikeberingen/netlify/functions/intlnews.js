// /api/intlnews  — International EN+NL WC 2026 news
import { parseFeed } from './feedutils.js';

const SOURCES = [
  // English — top-tier global football media
  { id:'bbc-football',  name:'BBC Sport',   url:'https://feeds.bbci.co.uk/sport/football/rss.xml', color:'#bb1919', bg:'rgba(187,25,25,.15)', strict:true },
  { id:'skysports',     name:'Sky Sports',  url:'https://www.skysports.com/rss/12040', color:'#e8120c', bg:'rgba(232,18,12,.15)', strict:true },
  { id:'goal',          name:'Goal.com',    url:'https://www.goal.com/feeds/en/news', color:'#00a550', bg:'rgba(0,165,80,.15)', strict:true },
  { id:'football365',   name:'Football365', url:'https://www.football365.com/feed', color:'#ff6600', bg:'rgba(255,102,0,.15)', strict:true },
  { id:'guardian-foot', name:'The Guardian',url:'https://www.theguardian.com/football/rss', color:'#005689', bg:'rgba(0,86,137,.15)', strict:true },
  // Dutch — NL football media
  { id:'vi-nl',         name:'Voetbal Intl',url:'https://www.vi.nl/feeds/latest-news.rss', color:'#ff6600', bg:'rgba(255,102,0,.15)', strict:true },
  { id:'telegraaf',     name:'De Telegraaf',url:'https://www.telegraaf.nl/sport/voetbal/rss', color:'#cc0000', bg:'rgba(204,0,0,.15)', strict:true },
  { id:'ad-voetbal',    name:'AD Sport',    url:'https://www.ad.nl/sport/voetbal/rss.xml', color:'#e4002b', bg:'rgba(228,0,43,.15)', strict:true },
];

// WC 2026 general keywords — world cup, tournament, all teams, all groups
const WC_KW = [
  'world cup','world cup 2026','wc 2026','wk 2026','fifa 2026','mundial 2026',
  'wereldkampioenschap','groep a','groep b','groep c','groep d','groep e','groep f',
  'groep g','groep h','groep i','groep j','groep k','groep l',
  'group a','group b','group c','group d','group e','group f',
  'group g','group h','group i','group j','group k','group l',
  'round of 32','round of 16','knockout','quarter-final','semi-final','final',
  'messi','ronaldo','mbappe','haaland','bellingham','vinicius','yamal',
  'argentina','france','brazil','england','germany','spain','portugal',
  'netherlands','netherlands','usa','canada','mexico','morocco','japan',
  'lamine yamal','erling haaland','jude bellingham','kylian mbappe',
  'neymar','lewandowski','salah','modric',
  'squad','lineup','selectie','opstelling','transfer wk','world cup squad',
  'mexico city','new york','los angeles','seattle','toronto','dallas','miami',
  'estadio azteca','metlife','sofi stadium',
  'fifa','var','offside','penalty','goal','result','score',
];

function matches(text){ const l=text.toLowerCase(); return WC_KW.some(k=>l.includes(k)); }

async function fetchFeed(src){
  try{
    const r=await fetch(src.url,{headers:{'User-Agent':'BelgiumWC2026/2.0','Accept':'application/rss+xml,application/xml,text/xml,*/*'},signal:AbortSignal.timeout(9000)});
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
  return new Response(JSON.stringify({items:unique.slice(0,60),total:unique.length,sources:[...new Set(unique.map(i=>i.source))]}),{
    status:200,headers:{'Content-Type':'application/json','Cache-Control':'public,s-maxage=240','Access-Control-Allow-Origin':'*'}
  });
};
export const config={path:'/api/intlnews'};
