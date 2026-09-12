(() => {
  const audio=document.querySelector('#preview-audio');
  const toggle=document.querySelector('#music-toggle');
  const seek=document.querySelector('#music-seek');
  const status=document.querySelector('#music-status');
  const list=document.querySelector('#listening-tracks');
  const retry=document.querySelector('#music-retry');
  if(!audio)return;
  let tracks=[],selected=-1;
  const safeURL=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch{return '';}};
  const time=s=>`${Math.floor((s||0)/60)}:${String(Math.floor((s||0)%60)).padStart(2,'0')}`;
  const sync=()=>{toggle.textContent=audio.paused?'▶':'Ⅱ';toggle.setAttribute('aria-label',audio.paused?'Play preview':'Pause preview');document.querySelector('.listening-player').classList.toggle('is-playing',!audio.paused);};
  async function play(){try{await audio.play();status.textContent='Playing an Apple Music preview.';}catch{status.textContent='Preview couldn’t play. Try again or open the full playlist.';sync();}}
  function select(index,autoplay){
    selected=index;const t=tracks[index];audio.pause();
    const url=safeURL(t.previews?.[0]?.url);audio.src=url;
    toggle.disabled=!url;seek.disabled=!url;
    document.querySelector('#playing-name').textContent=t.name||'Untitled';
    document.querySelector('#playing-artist').textContent=t.artistName||'';
    const art=safeURL(t.artwork?.url?.replace('{w}','400').replace('{h}','400').replace('{f}','jpg'));
    if(art)document.querySelector('#record-art').src=art;
    document.querySelectorAll('.listening-track').forEach((b,i)=>b.classList.toggle('selected',i===index));
    status.textContent=url?'Ready to preview.':'No preview available for this track. Open it in Apple Music ↗';
    seek.value=0;document.querySelector('#music-time').textContent='0:00';
    if(autoplay&&url)play();
  }
  toggle.addEventListener('click',()=>audio.paused?play():audio.pause());
  audio.addEventListener('play',sync);audio.addEventListener('pause',sync);audio.addEventListener('ended',()=>{sync();status.textContent='Preview finished. Pick another track.';});
  audio.addEventListener('loadedmetadata',()=>{document.querySelector('#music-duration').textContent=time(audio.duration);});
  audio.addEventListener('timeupdate',()=>{seek.value=audio.duration?audio.currentTime/audio.duration*100:0;document.querySelector('#music-time').textContent=time(audio.currentTime);});
  audio.addEventListener('error',()=>{if(selected>=0){status.textContent='This preview is unavailable. Try another track.';sync();}});
  seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=seek.value/100*audio.duration;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause();});
  async function load(){
    retry.hidden=true;status.textContent='Loading Ashley’s playlist…';
    try{
      const base='https://apple-music-data.wunjingchang-work.workers.dev';
      let response=await fetch(base+'?resource=tracks',{signal:AbortSignal.timeout(12000)});
      if(!response.ok)response=await fetch(base+'?endpoint='+encodeURIComponent('catalog/us/playlists/pl.u-8aAVZ6qho0lEWVJ/tracks?limit=100'),{signal:AbortSignal.timeout(12000)});
      if(!response.ok)throw Error('playlist unavailable');
      const data=await response.json();
      tracks=(data.data||[]).map(t=>t.attributes).filter(Boolean).slice(0,8);
      if(!tracks.length)throw Error('empty playlist');
      list.replaceChildren();
      tracks.forEach((t,i)=>{
        const row=document.createElement('div');row.className='listening-row';
        const b=document.createElement('button');b.type='button';b.className='listening-track';
        const num=document.createElement('span');num.textContent=String(i+1).padStart(2,'0');
        const text=document.createElement('span');const name=document.createElement('strong');name.textContent=t.name;const artist=document.createElement('small');artist.textContent=t.artistName;text.append(name,artist);
        const playIcon=document.createElement('span');playIcon.textContent=t.previews?.[0]?.url?'▶':'—';b.append(num,text,playIcon);b.addEventListener('click',()=>select(i,true));
        const a=document.createElement('a');a.href=safeURL(t.url)||'https://music.apple.com/us/playlist/pl.u-8aAVZ6qho0lEWVJ';a.target='_blank';a.rel='noopener noreferrer';a.textContent='↗';a.setAttribute('aria-label','Open '+t.name+' in Apple Music');
        row.append(b,a);list.append(row);
      });
      select(0,false);
    }catch{status.textContent='The playlist is unavailable right now. You can still open it in Apple Music.';retry.hidden=false;}
  }
  retry.addEventListener('click',load);
  new IntersectionObserver((entries,observer)=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();load();}},{rootMargin:'200px'}).observe(document.querySelector('#music'));
})();
