// Shared RSS parsing utilities

export function extractTag(block,tag){
  const cd=new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`,'i');
  const pl=new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`,'i');
  const m=block.match(cd)||block.match(pl);
  return m?m[1].trim():'';
}

export function clean(s){
  return s.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
}

export function formatDate(d){
  if(!d) return '';
  try{
    const dt=new Date(d);
    if(isNaN(dt)) return d.slice(0,16);
    return dt.toLocaleDateString('nl-BE',{timeZone:'Europe/Brussels',day:'2-digit',month:'short'})+' '+
           dt.toLocaleTimeString('nl-BE',{timeZone:'Europe/Brussels',hour:'2-digit',minute:'2-digit',hour12:false});
  }catch{ return d.slice(0,16); }
}

export function parseDateMs(d){ try{return new Date(d).getTime()||0;}catch{return 0;} }

export function parseFeed(xml,src){
  const items=[];
  const raw=xml.split(/<item[\s>]/i).slice(1);
  for(const block of raw){
    const end=block.indexOf('</item>');
    const c=end>-1?block.slice(0,end):block;
    const title=clean(extractTag(c,'title'));
    const link=clean(extractTag(c,'link')||extractTag(c,'guid'));
    const desc=clean(extractTag(c,'description')).slice(0,220);
    const pub=extractTag(c,'pubDate')||extractTag(c,'dc:date')||'';
    if(!title) continue;
    items.push({title,link:link.startsWith('http')?link:'',description:desc,date:formatDate(pub),dateMs:parseDateMs(pub),source:src.name,color:src.color,bg:src.bg});
  }
  return items;
}
