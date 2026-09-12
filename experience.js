(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const portrait = document.querySelector('.avatar-portrait');
  const pose = document.querySelector('.avatar-pose');
  // Nine rendered head/gaze poses; the top row's directions are reversed
  // in the generated sheet, so map them explicitly to screen direction.
  const cells = [[2,1,0],[3,4,5],[6,7,8]];
  let poseIndex = 4;
  const choosePose = (x,y) => {
    const col = x < -.22 ? 0 : x > .22 ? 2 : 1;
    const row = y < -.26 ? 0 : y > .3 ? 2 : 1;
    const next = cells[row][col];
    if (next !== poseIndex) {
      pose.style.backgroundPosition = `${next % 3 * 50}% ${Math.floor(next / 3) * 50}%`;
      poseIndex = next;
    }
    portrait.style.transform = `perspective(850px) rotateY(${x*7}deg) rotateX(${-y*5}deg)`;
  };
  let pointerFrame = 0, px=0, py=0;
  window.addEventListener('pointermove', e => {
    if (reduced.matches || !fine.matches || !portrait || e.pointerType === 'touch') return;
    const r=portrait.getBoundingClientRect();
    if(r.bottom<0 || r.top>innerHeight) return;
    px=Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2)/300));
    py=Math.max(-1,Math.min(1,(e.clientY-r.top-r.height*.42)/260));
    if(!pointerFrame) pointerFrame=requestAnimationFrame(()=>{pointerFrame=0;choosePose(px,py);});
  },{passive:true});
  const resetPose=()=>portrait && choosePose(0,0);
  document.documentElement.addEventListener('pointerleave',resetPose);
  window.addEventListener('blur',resetPose);
  portrait?.addEventListener('keydown',e=>{
    if(reduced.matches) return;
    const keys={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],Escape:[0,0]};
    if(keys[e.key]){e.preventDefault();choosePose(...keys[e.key]);}
  });
  portrait?.addEventListener('blur',resetPose);
  if(!fine.matches && portrait){
    document.querySelector('.avatar-stage .character-note').textContent='Tap to say hi.';
    portrait.addEventListener('click',()=>{if(!reduced.matches){choosePose(poseIndex===5?-1:1,0);}});
  }

  const story=document.querySelector('.echo-story');
  const frame=document.querySelector('.snapshot-viewport iframe');
  const viewport=document.querySelector('.snapshot-viewport');
  const note=document.querySelector('.story-note');
  const notes=[
    ['One place.','Not ten group chats.','WeChat groups and RedNote have plenty of information. Finding it again is the hard part.'],
    ['Find your neighborhood.','Skip the noise.','Browse Houston, Katy, Sugar Land, and more. Narrow the conversation to places that matter to you.'],
    ['More context.','Clearer expectations.','Community rules and posting guides encourage useful details, transparent interests, and responsible sharing.']
  ];
  let currentStep=-1, frameReady=false, manualProgress=null;
  function setStep(n){
    if(n===currentStep)return;
    currentStep=n;
    note.querySelector('.note-index').textContent=`0${n+1}`;
    note.querySelector('h4').replaceChildren(document.createTextNode(notes[n][0]),document.createElement('br'),document.createTextNode(notes[n][1]));
    note.querySelector('p').textContent=notes[n][2];
    document.querySelector('.story-count').textContent=`0${n+1} / 03`;
    document.querySelectorAll('[data-step]').forEach(b=>{const active=Number(b.dataset.step)===n;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    story.dataset.step=String(n);
    document.querySelectorAll('[data-ad-step]').forEach(panel=>{panel.hidden=Number(panel.dataset.adStep)!==n;});
    frame.style.visibility=n===0?'visible':'hidden';
    document.querySelector('.scroll-cue').textContent=n===0?'Real site capture · Scroll to explore ↓':'Houston Echo campaign · Scroll to explore ↓';
  }
  function renderStory(){
    if(!story)return;
    const r=story.getBoundingClientRect();
    const progress=manualProgress??((innerWidth<768 || reduced.matches)?0:Math.max(0,Math.min(1,-r.top/Math.max(1,story.offsetHeight-innerHeight))));
    setStep(Math.min(2,Math.floor(progress*3)));
    const frameWidth=innerWidth<768?768:1280;
    frame.style.width=`${frameWidth}px`;
    const scale=viewport.clientWidth/frameWidth;
    frame.style.transform=`scale(${scale})`;
    frame.style.height=`${viewport.clientHeight/scale}px`;
    const surface=document.querySelector('.story-browser');
    surface.style.transform=reduced.matches?'none':`perspective(1400px) rotateX(${(1-Math.min(progress*4,1))*5}deg) scale(${.94+Math.min(progress*4,1)*.06})`;
    if(frameReady){
      const doc=frame.contentDocument;
      const max=Math.max(0,doc.documentElement.scrollHeight-frame.clientHeight);
      frame.contentWindow.scrollTo(0,Math.min(max,progress*1100));
    }
  }
  frame?.addEventListener('load',()=>{frameReady=true;renderStory();});
  let scrollFrame=0;
  window.addEventListener('scroll',()=>{if(innerWidth>=768&&!reduced.matches)manualProgress=null;if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;renderStory();});},{passive:true});
  window.addEventListener('resize',renderStory);
  document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{
    const p=(Number(b.dataset.step)+.1)/3;
    if(reduced.matches || innerWidth<768){manualProgress=p;renderStory();return;}
    const top=story.getBoundingClientRect().top+scrollY;
    window.scrollTo({top:top+p*(story.offsetHeight-innerHeight),behavior:'smooth'});
  }));
  reduced.addEventListener('change',()=>{resetPose();renderStory();});
  renderStory();

  const rail=document.querySelector('.photo-rail');
  const movePhotos=direction=>rail.scrollBy({left:direction*(rail.clientWidth*.7),behavior:reduced.matches?'instant':'smooth'});
  document.querySelector('#photos-prev')?.addEventListener('click',()=>movePhotos(-1));
  document.querySelector('#photos-next')?.addEventListener('click',()=>movePhotos(1));
  rail?.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();movePhotos(e.key==='ArrowRight'?1:-1);}});
  const dialog=document.querySelector('#photo-dialog');
  document.querySelectorAll('.photo-tile').forEach(b=>b.addEventListener('click',()=>{dialog.querySelector('img').src=b.querySelector('img').src;dialog.showModal();}));
  dialog?.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});

  // One-time, staggered headline reveal; content stays visible without JS.
  const findingHeadline = document.querySelector('.finding-headline');
  if (findingHeadline && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const headlineObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        findingHeadline.classList.add('is-revealing');
        headlineObserver.disconnect();
      }
    }, { threshold: 0.35 });
    headlineObserver.observe(findingHeadline);
  }

  // Actual product screenshots, including the current local development builds.
  document.querySelectorAll('.projects-grid .project-card').forEach(card=>{
    const link=card.querySelector('.project-link');
    const name=card.querySelector('h4').textContent;
    link.classList.add('real-project-preview');
    link.setAttribute('aria-label',`Open ${name}`);
    if(card.classList.contains('monu-project')){
      link.innerHTML='<img src="images/monu-landscape.png" alt="MONU planner website hero, with promotional buttons removed" loading="lazy">';
    }else{
      const shot=document.createElement('img');
      shot.src='images/'+(card.classList.contains('ai-chat-project')?'chat-landscape.png':card.classList.contains('merchant-dashboard-project')?'merchant-landscape.png':'memoria-real.png');
      shot.alt=`Actual ${name} interface`;
      shot.loading='lazy';
      link.replaceChildren(shot);
    }
  });
})();
