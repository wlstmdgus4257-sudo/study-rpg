"use strict";

// Study Quest II is a local, offline game. No API calls or backend server.
const SAVE_KEY = 'study-quest-academy-v3';
const BUILTIN = window.STUDY_QUEST_PACKS || {};
const MONSTERS = [
  {name:'도서관 슬라임',first:'#cbffe5',last:'#38be9e'},
  {name:'암기 슬라임',first:'#ffcde5',last:'#d76dba'},
  {name:'논리 슬라임',first:'#c9dbff',last:'#537ed8'},
  {name:'시험의 수호자',first:'#ffeab6',last:'#e99b46'},
  {name:'지식의 파수꾼',first:'#e4cbff',last:'#8663df'}
];
const $ = id => document.getElementById(id);
const el = Object.fromEntries([
 'soundBtn','soundState','levelText','levelTitle','rankText','xpText','xpFill','heroHpText','heroHpFill',
 'coinText','killText','coreBtn','advancedBtn','jsonFile','jsonPaste','pasteBtn','importStatus',
 'floorText','modeText','battleScene','heroScene','monsterScene','attackBurst','monsterColor1','monsterColor2','monsterName','enemyLevel',
 'monsterHpText','monsterHpFill','battleCaption','damagePop','questionNumber','questionProgressFill',
 'sourceChip','comboChip','topicText','skillText','questionText','optionList','hintBtn','hintBox','feedbackBox',
 'nextBtn','missionProgress','missionPercent','missionCircle','accuracyText','bestComboText',
 'battleLog','wrongBadge','wrongList','reviewBtn','resetBtn','toast','summaryModal','summaryTitle',
 'summarySubtitle','resultScore','resultAccuracy','resultKills','modalReviewBtn','modalCloseBtn'
].map(id => [id,$(id)]));

function freshState(){return {
 packId:'core',title:'',questions:[],phase:'battle',index:0,wrong:[],reviewQueue:[],reviewIndex:0,
 answered:false,selected:-1,hintShown:false,level:1,xp:0,energy:100,coins:0,kills:0,
 monsterHp:60,monsterMaxHp:60,combo:0,bestCombo:0,sessionCorrect:0,
 soundEnabled:false,log:[]
};}
let state=freshState();
let toastHandle=null;
let audioContext=null;
let isRestoring=false;

function normalizePack(data){
 const raw=Array.isArray(data)?data:data?.questions;
 if(!Array.isArray(raw)||raw.length!==10) throw Error('문제는 정확히 10개여야 해.');
 const questions=raw.map((q,i)=>{
  if(!q||typeof q.question!=='string'||!q.question.trim()||!Array.isArray(q.options)||q.options.length!==4||
   !q.options.every(x=>typeof x==='string'&&x.trim())||!Number.isInteger(q.answerIndex)||q.answerIndex<0||q.answerIndex>3)
   throw Error(`${i+1}번 문제 형식을 확인해 줘. 보기 4개, answerIndex 0~3이 필요해.`);
  return {
   id:`q${i+1}`,question:q.question.trim().slice(0,600),
   options:q.options.map(x=>x.trim().slice(0,250)),answerIndex:q.answerIndex,
   explanation:typeof q.explanation==='string'?q.explanation.trim().slice(0,1200):'문제를 풀 때 사용한 개념을 다시 확인해 봐.',
   topic:typeof q.topic==='string'?q.topic.slice(0,35):'학습 문제',
   sourcePage:Number.isInteger(q.sourcePage)&&q.sourcePage>0?q.sourcePage:null,
   skill:q.skill==='적용'?'적용':'이해',hint:typeof q.hint==='string'?q.hint.slice(0,300):''
  };
 });
 return {title:typeof data?.title==='string'?data.title.slice(0,100):'나의 학습 퀘스트',questions};
}
function parseJson(str){
 const cleaned=str.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
 let data;
 try {data=JSON.parse(cleaned);}catch(_){throw Error('JSON 형식이 올바르지 않아. 파일을 다시 확인해 줘.');}
 return normalizePack(data);
}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch(e){console.warn('저장 실패:',e.message);}}
function hydrate(){
 try{
  const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
  if(!raw||!Array.isArray(raw.questions)||raw.questions.length!==10) return false;
  const pack=normalizePack({title:raw.title,questions:raw.questions});
  state={...freshState(),...raw,questions:pack.questions};
  if(!Array.isArray(state.log))state.log=[];
  if(!Array.isArray(state.reviewQueue))state.reviewQueue=[];
  if(!Array.isArray(state.wrong))state.wrong=[];
  state.index=Math.max(0,Math.min(10,Number(state.index)||0));
  state.energy=Math.min(100,Math.max(0,Number(state.energy)||100));
  state.monsterHp=Math.min(60,Math.max(0,Number(state.monsterHp)||60));
  if(!['battle','review','complete','reviewComplete'].includes(state.phase))state.phase='battle';
  state.answered=!!state.answered;
  state.soundEnabled=!!state.soundEnabled;
  return true;
 }catch(e){console.warn('이전 저장 내용을 읽지 못했어:',e.message);return false;}
}
function currentQuestions(){return state.phase==='review'||state.phase==='reviewComplete'?state.reviewQueue:state.questions;}
function currentIndex(){return state.phase==='review'||state.phase==='reviewComplete'?state.reviewIndex:state.index;}
function currentQ(){return currentQuestions()[currentIndex()]||null;}
function neededXp(){return state.level*100;}
function addXp(amount){
 state.xp+=amount;
 let leveled=false;
 while(state.xp>=neededXp()){
  state.xp-=neededXp();state.level++;state.energy=Math.min(100,state.energy+25);leveled=true;
 }
 if(leveled){addLog(`레벨 ${state.level} 달성! 에너지 +25`,'good');popup(`레벨 업! LV.${state.level} ✨`);}
}
function addLog(message,type='normal'){
 state.log.unshift({message,type});state.log=state.log.slice(0,12);
}
function popup(message){
 el.toast.textContent=message;el.toast.classList.add('show');
 clearTimeout(toastHandle);toastHandle=setTimeout(()=>el.toast.classList.remove('show'),2450);
}
function setImportStatus(message,type=''){el.importStatus.textContent=message;el.importStatus.className=`import-status ${type}`.trim();}
function selectPack(id,ask=true){
 const data=BUILTIN[id];
 if(!data)return;
 if(ask&&state.questions.length&&!['complete','reviewComplete'].includes(state.phase)&&state.index>0&&
 !confirm('다른 퀘스트를 시작하면 현재 문제 진행과 오답 노트는 초기화돼. 계속할까?'))return;
 startPack(normalizePack(data),id);
}
function startPack(pack,id='custom'){
 const {level,xp,energy,coins,kills,soundEnabled}=state;
 state={...freshState(),level,xp,energy,coins,kills,soundEnabled,packId:id,title:pack.title,questions:pack.questions};
 state.log=[];resetHeroPosition();
 addLog(`${pack.title} 입장! 10개의 지식 시험을 통과하자.`);
 save();render();setImportStatus(`「${pack.title}」 10문제를 불러왔어. 좋은 모험 되길!`,'good');
 el.jsonFile.value='';el.jsonPaste.value='';
 popup(id==='custom'?'내 문제 10개를 불러왔어! ✨':'새로운 던전에 입장했어! ✨');
}

function audio(type){
 if(!state.soundEnabled)return;
 try{
  const A=window.AudioContext||window.webkitAudioContext;
  if(!A)return;
  audioContext=audioContext||new A();
  if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
  const notes=type==='good'?[523,659,784]:type==='bad'?[240,205]:[610,824,988];
  notes.forEach((freq,i)=>{
   const t=audioContext.currentTime+i*.085;
   const osc=audioContext.createOscillator(),gain=audioContext.createGain();
   osc.type='sine';osc.frequency.setValueAtTime(freq,t);
   gain.gain.setValueAtTime(.035,t);gain.gain.exponentialRampToValueAtTime(.001,t+.15);
   osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+.16);
  });
 }catch(e){console.warn('효과음 재생 실패:',e.message);}
}
// Stage movement is intentionally independent of saved quiz progress.
let heroPosition={x:0,y:0};
let heroWalkingTimeout=null;
let heroAttacking=false;
let heroAttackTimeout=null;
let touchMoveInterval=null;
let touchMoveTimeout=null;
const MOVE_STEP=22;
function moveHero(direction){
 if(heroAttacking)return;
 const stage=el.battleScene;
 const hero=el.heroScene;
 const baseX=hero.offsetLeft;
 const width=hero.offsetWidth;
 const maxX=Math.max(0,stage.clientWidth-baseX-width-6);
 const minX=6-baseX;
 const delta={left:[-MOVE_STEP,0],right:[MOVE_STEP,0],up:[0,-12],down:[0,12]}[direction];
 if(!delta)return;
 heroPosition.x=Math.round(Math.max(minX,Math.min(maxX,heroPosition.x+delta[0])));
 heroPosition.y=Math.round(Math.max(-28,Math.min(17,heroPosition.y+delta[1])));
 if(delta[0])hero.style.setProperty('--hero-facing',delta[0]<0?'-1':'1');
 hero.style.setProperty('--hero-x',heroPosition.x+'px');
 hero.style.setProperty('--hero-y',heroPosition.y+'px');
 hero.classList.add('walking');
 clearTimeout(heroWalkingTimeout);
 heroWalkingTimeout=setTimeout(()=>hero.classList.remove('walking'),190);
}
function resetHeroPosition(){
 heroPosition={x:0,y:0};
 el.heroScene.style.setProperty('--hero-x','0px');
 el.heroScene.style.setProperty('--hero-y','0px');
 el.heroScene.style.setProperty('--hero-facing','1');
 el.heroScene.classList.remove('walking');
}
function animateHeroAttack(){
 if(heroAttacking)return;
 heroAttacking=true;
 clearTimeout(heroWalkingTimeout);
 clearTimeout(heroAttackTimeout);
 const hero=el.heroScene;
 // offsetLeft ignores the manual transform, giving a stable animation end point.
 const target=el.monsterScene.offsetLeft - hero.offsetLeft - hero.offsetWidth*.45;
 const max=el.battleScene.clientWidth-hero.offsetLeft-hero.offsetWidth;
 hero.style.setProperty('--attack-x',Math.max(0,Math.min(max,target))+'px');
 hero.style.setProperty('--hero-facing','1');
 hero.classList.remove('walking','charging');
 void hero.offsetWidth;
 hero.classList.add('charging');
 el.attackBurst.classList.remove('show');
 void el.attackBurst.offsetWidth;
 el.attackBurst.classList.add('show');
 heroAttackTimeout=setTimeout(()=>{
  hero.classList.remove('charging');
  el.attackBurst.classList.remove('show');
  heroAttacking=false;
 },710);
}
function bindMovement(){
 document.querySelectorAll('[data-move]').forEach(button=>{
  const direction=button.dataset.move;
  const stop=()=>{
   clearInterval(touchMoveInterval);
   clearTimeout(touchMoveTimeout);
   touchMoveInterval=null;
   touchMoveTimeout=null;
  };
  button.addEventListener('pointerdown',event=>{
   if(event.button!==0)return;
   event.preventDefault();stop();moveHero(direction);
   if(button.setPointerCapture)button.setPointerCapture(event.pointerId);
   touchMoveTimeout=setTimeout(()=>{touchMoveInterval=setInterval(()=>moveHero(direction),90);},280);
  });
  button.addEventListener('pointerup',stop);
  button.addEventListener('pointercancel',stop);
  button.addEventListener('lostpointercapture',stop);
  // Enter/Space activation from an accessible focused button.
  button.addEventListener('click',event=>{if(event.detail===0)moveHero(direction);});
 });
 window.addEventListener('blur',()=>{clearTimeout(heroWalkingTimeout);el.heroScene.classList.remove('walking');});
 window.addEventListener('resize',()=>{
  // Avoid leaving the hero outside the field after rotating a phone.
  const baseX=el.heroScene.offsetLeft;
  const min=6-baseX,max=Math.max(0,el.battleScene.clientWidth-baseX-el.heroScene.offsetWidth-6);
  heroPosition.x=Math.min(max,Math.max(min,heroPosition.x));
  el.heroScene.style.setProperty('--hero-x',heroPosition.x+'px');
 });
}

function animateHit(target,damage){
 const node=target==='monster'?el.monsterScene:el.heroScene;
 node.classList.remove('hit');void node.offsetWidth;node.classList.add('hit');
 setTimeout(()=>node.classList.remove('hit'),500);
 if(target==='monster'){
  el.damagePop.textContent=`−${damage}`;el.damagePop.classList.remove('show');void el.damagePop.offsetWidth;el.damagePop.classList.add('show');
 }
}
function answer(choice){
 const q=currentQ();if(!q||state.answered)return;
 state.selected=choice;state.answered=true;
 const correct=choice===q.answerIndex;
 if(correct){
  if(state.phase==='review'){
   state.wrong=state.wrong.filter(item=>item.id!==q.id);
   state.coins+=3;addXp(10);addLog(`복습 성공! 「${q.topic}」 오답 해결`,'good');
   popup('오답 정복! +10 EXP');
  }else{
   state.sessionCorrect++;state.combo++;state.bestCombo=Math.max(state.bestCombo,state.combo);
   const damage=30+(state.combo>=5?20:state.combo>=3?10:0);
   state.monsterHp-=damage;state.coins+=8;addXp(18);
   addLog(`정답! ${damage} 피해 · 콤보 ×${state.combo}`,'good');
   if(state.monsterHp<=0){
    state.kills++;state.monsterHp=60;state.coins+=20;addXp(25);
    addLog('몬스터 처치! +20 GOLD · +25 EXP','good');
    popup('몬스터 처치! +20 GOLD 🏆');audio('victory');
   }else audio('good');
   animateHeroAttack();animateHit('monster',damage);
  }
 }else{
  state.combo=0;
  if(!state.wrong.some(x=>x.id===q.id))state.wrong.push({...q});
  if(state.phase==='battle'){
   state.energy=Math.max(0,state.energy-15);
   addLog('오답! 몬스터 반격 · 에너지 −15','bad');
   animateHit('hero');
   if(state.energy===0){state.energy=60;addLog('캠프에서 휴식! 에너지 60 회복');popup('잠시 휴식 후 다시 출발해!');}
  }else addLog(`복습 오답 · 「${q.topic}」 다시 도전`,'bad');
  audio('bad');
 }
 save();render();
}
function next(){
 if(!state.answered)return;
 if(state.phase==='battle'){
  state.index++;
  if(state.index>=state.questions.length){state.phase='complete';save();render();showSummary();return;}
 }else if(state.phase==='review'){
  state.reviewIndex++;
  if(state.reviewIndex>=state.reviewQueue.length){state.phase='reviewComplete';popup(state.wrong.length?'복습 완료! 남은 오답에 다시 도전해 봐.':'완벽해! 모든 오답을 해결했어.');}
 }
 state.answered=false;state.selected=-1;state.hintShown=false;
 save();render();
}
function startReview(){
 if(!state.wrong.length)return;
 if(state.phase==='battle'&&state.index<state.questions.length){popup('먼저 현재 퀘스트를 완료해 줘.');return;}
 state.phase='review';state.reviewQueue=state.wrong.map(x=>({...x}));state.reviewIndex=0;
 state.answered=false;state.selected=-1;state.hintShown=false;
 addLog(`오답 ${state.reviewQueue.length}문제 복습 시작`);
 save();render();el.summaryModal.hidden=true;
 document.getElementById('questionCard').scrollIntoView({behavior:'smooth',block:'start'});
}
function showSummary(){
 el.summaryModal.hidden=false;
 el.summaryTitle.textContent='던전 클리어!';
 el.summarySubtitle.textContent=`「${state.title}」 퀘스트를 완료했어.`;
 el.resultScore.textContent=`${state.sessionCorrect} / ${state.questions.length}`;
 el.resultAccuracy.textContent=`${Math.round(100*state.sessionCorrect/state.questions.length)}%`;
 el.resultKills.textContent=String(state.kills);
 el.modalReviewBtn.disabled=state.wrong.length===0;
 el.modalReviewBtn.textContent=state.wrong.length?`오답 ${state.wrong.length}문제 복습하기 →`:'오답 없이 완료! 🎉';
 audio('victory');
}
function renderHero(){
 el.levelText.textContent=String(state.level).padStart(2,'0');
 const levelName=state.level>=8?'지식의 수호자':state.level>=5?'던전 연구가':state.level>=3?'견습 마법사':'견습 학자';
 el.levelTitle.textContent=levelName;
 el.rankText.textContent=state.level>=5?'MASTER SCHOLAR':state.level>=3?'RISING SCHOLAR':'NOVICE SCHOLAR';
 el.xpText.textContent=`${state.xp} / ${neededXp()}`;
 el.xpFill.style.width=`${Math.min(100,100*state.xp/neededXp())}%`;
 el.heroHpText.textContent=`${state.energy} / 100`;
 el.heroHpFill.style.width=`${state.energy}%`;
 el.coinText.textContent=String(state.coins);
 el.killText.textContent=String(state.kills);
 el.soundState.textContent=state.soundEnabled?'ON':'OFF';
 el.soundBtn.setAttribute('aria-label',state.soundEnabled?'효과음 끄기':'효과음 켜기');
}
function renderBattle(){
 const monster=MONSTERS[Math.min(MONSTERS.length-1,state.kills%MONSTERS.length)];
 el.monsterColor1.setAttribute('stop-color',monster.first);
 el.monsterColor2.setAttribute('stop-color',monster.last);
 el.monsterName.textContent=monster.name;
 el.enemyLevel.textContent=`LV.${String(Math.min(99,state.kills+1)).padStart(2,'0')}`;
 el.floorText.textContent=String(Math.min(99,state.kills+1)).padStart(2,'0');
 el.monsterHpText.textContent=`${state.monsterHp} / ${state.monsterMaxHp}`;
 el.monsterHpFill.style.width=`${Math.max(0,100*state.monsterHp/state.monsterMaxHp)}%`;
 el.modeText.textContent=state.phase==='review'?'REVIEW MODE':state.phase==='complete'||state.phase==='reviewComplete'?'QUEST CLEARED':'IN BATTLE';
 el.battleCaption.innerHTML='<span>⚔</span> '+(state.phase==='review'?'복습 정답은 경험치 +10, 오답 노트에서 제거!':state.phase==='complete'?'퀘스트 완료! 다른 문제 세트나 오답 복습에 도전해 봐.':`연속 정답 ${state.combo}회 · 3연속부터 추가 공격 피해!`);
}
function renderQuestion(){
 const q=currentQ();
 const index=currentIndex();
 const count=currentQuestions().length||10;
 const review=state.phase==='review'||state.phase==='reviewComplete';
 const pos=(q&&state.answered)?index+1:index;
 el.questionNumber.textContent=String(Math.min(count,Math.max(1,index+1))).padStart(2,'0');
 el.questionProgressFill.style.width=`${100*Math.min(count,pos)/count}%`;
 el.comboChip.textContent=`COMBO ×${state.combo}`;
 el.optionList.replaceChildren();el.feedbackBox.hidden=true;el.hintBox.hidden=true;
 el.nextBtn.disabled=true;
 el.hintBtn.hidden=false;el.hintBtn.disabled=false;
 el.nextBtn.textContent=review?'다음 복습 문제 →':'다음 문제 →';
 if(!q){
  el.sourceChip.textContent='QUEST COMPLETE';el.topicText.textContent='결과';el.skillText.textContent='복습 가능';
  el.questionText.textContent=state.phase==='reviewComplete'
    ?state.wrong.length?'복습 완료! 남은 오답을 다시 풀어 봐.':'완벽해! 오답을 모두 해결했어.'
    :'🎉 모든 문제를 풀었어! 퀘스트 완료!';
  el.questionText.classList.add('done-title');
  el.optionList.innerHTML='<div class="empty-placeholder">다른 퀘스트를 선택하거나 오른쪽 오답 노트에서 복습을 시작해 봐.</div>';
  el.hintBtn.hidden=true;el.nextBtn.disabled=true;el.nextBtn.textContent='퀘스트 완료';
  return;
 }
 el.questionText.classList.remove('done-title');
 el.sourceChip.textContent=q.sourcePage?`강의 PDF ${q.sourcePage}쪽`:'가져온 문제';
 el.topicText.textContent=q.topic;el.skillText.textContent=q.skill==='적용'?'실전 적용':'개념 이해';
 el.questionText.textContent=q.question;
 el.hintBtn.disabled=state.answered||!q.hint;
 el.hintBtn.textContent=state.hintShown?'✧ 힌트 접기':'✧ 힌트 보기';
 el.hintBox.hidden=!state.hintShown||state.answered;el.hintBox.textContent=q.hint||'';
 ['A','B','C','D'].forEach((letter,i)=>{
  const button=document.createElement('button');button.type='button';button.className='answer-option';
  const marker=document.createElement('span');marker.className='letter';marker.textContent=letter;
  const caption=document.createElement('span');caption.textContent=q.options[i];
  button.append(marker,caption);
  button.disabled=state.answered;
  if(state.answered){
   if(i===q.answerIndex)button.classList.add('correct');
   else if(i===state.selected)button.classList.add('wrong');
  }
  button.addEventListener('click',()=>answer(i));el.optionList.append(button);
 });
 if(state.answered){
  const correct=state.selected===q.answerIndex;
  el.feedbackBox.hidden=false;el.feedbackBox.className=`feedback-box ${correct?'is-good':'is-bad'}`;
  const headline=document.createElement('strong');headline.textContent=correct?'✓ 정답! 좋은 공격이었어.':'✕ 오답! 여기서 실력이 늘어.';
  const text=document.createElement('p');
  text.textContent=(correct?'':`정답: ${'ABCD'[q.answerIndex]}. ${q.options[q.answerIndex]} · `)+q.explanation;
  const source=document.createElement('small');source.textContent=q.sourcePage?`근거: 컴퓨터구조 9주차 강의 자료 ${q.sourcePage}쪽`: '문제 해설';
  el.feedbackBox.replaceChildren(headline,text,source);
  el.nextBtn.disabled=false;
  el.nextBtn.textContent=(index===count-1)?(review?'복습 마무리 →':'결과 확인 →'):(review?'다음 복습 문제 →':'다음 문제 →');
 }
}
function renderMission(){
 const done=state.phase==='review'||state.phase==='reviewComplete'||state.phase==='complete'?10:state.index+(state.answered?1:0);
 el.missionProgress.textContent=String(done);
 el.missionPercent.textContent=`${Math.round(100*done/10)}%`;
 el.missionCircle.style.strokeDashoffset=String(301.59*(1-done/10));
 const attempts=state.index+(state.answered&&state.phase==='battle'?1:0);
 el.accuracyText.textContent=attempts?`${Math.round(100*state.sessionCorrect/attempts)}%`:'—';
 el.bestComboText.textContent=String(state.bestCombo);
}
function renderLog(){
 el.battleLog.replaceChildren();
 if(!state.log.length){el.battleLog.innerHTML='<div class="log-empty">퀘스트가 시작되면 기록이 남아.</div>';return;}
 state.log.slice(0,6).forEach((entry,i)=>{
  const row=document.createElement('div');row.className=`log-entry ${entry.type||''}`;
  const mark=document.createElement('span');mark.className='log-time';mark.textContent=i===0?'NEW':'•';
  const note=document.createElement('span');note.textContent=entry.message;
  row.append(mark,note);el.battleLog.append(row);
 });
}
function renderWrong(){
 el.wrongBadge.textContent=String(state.wrong.length);
 el.wrongList.replaceChildren();
 if(!state.wrong.length){el.wrongList.innerHTML='<div class="review-empty">✧ 아직 오답이 없어.<br>정답을 맞혀 던전을 탐험해 봐!</div>';}
 else state.wrong.forEach((q,i)=>{
  const card=document.createElement('div');card.className='wrong-item';
  const title=document.createElement('strong');title.textContent=`${i+1}. ${q.question}`;
  const page=document.createElement('small');page.textContent=q.sourcePage?`PDF ${q.sourcePage}쪽 · ${q.topic}`:q.topic;
  const detail=document.createElement('details');
  const summary=document.createElement('summary');summary.textContent='정답과 해설 펼치기';
  const desc=document.createElement('p');desc.textContent=`정답: ${'ABCD'[q.answerIndex]}. ${q.options[q.answerIndex]}\n${q.explanation}`;
  detail.append(summary,desc);card.append(title,page,detail);el.wrongList.append(card);
 });
 const canReview=state.wrong.length>0&&(state.phase==='complete'||state.phase==='reviewComplete');
 el.reviewBtn.disabled=!canReview;
 el.reviewBtn.textContent=state.wrong.length?`오답 ${state.wrong.length}문제 다시 풀기 ↗`:'오답 다시 풀기 ↗';
}
function render(){renderHero();renderBattle();renderQuestion();renderMission();renderLog();renderWrong();
 el.coreBtn.classList.toggle('is-active',state.packId==='core');el.coreBtn.setAttribute('aria-pressed',String(state.packId==='core'));
 el.advancedBtn.classList.toggle('is-active',state.packId==='advanced');el.advancedBtn.setAttribute('aria-pressed',String(state.packId==='advanced'));
}

el.coreBtn.addEventListener('click',()=>selectPack('core'));
el.advancedBtn.addEventListener('click',()=>selectPack('advanced'));
el.pasteBtn.addEventListener('click',()=>{
 if(!el.jsonPaste.value.trim()){setImportStatus('먼저 JSON 문제를 붙여넣어 줘.','error');return;}
 try{
  const pack=parseJson(el.jsonPaste.value);
  if(state.index>0&&!['complete','reviewComplete'].includes(state.phase)&&!confirm('진행 중인 퀘스트를 새 문제로 교체할까?'))return;
  startPack(pack);
 }catch(e){setImportStatus(e.message,'error');}
});
el.jsonFile.addEventListener('change',async()=>{
 const file=el.jsonFile.files?.[0];if(!file)return;
 if(file.size>1024*1024){setImportStatus('JSON 파일 크기는 1MB 이하여야 해.','error');return;}
 try{
  const pack=parseJson(await file.text());
  if(state.index>0&&!['complete','reviewComplete'].includes(state.phase)&&!confirm('진행 중인 퀘스트를 새 문제로 교체할까?'))return;
  startPack(pack);
 }catch(e){setImportStatus(e.message,'error');}
});
el.nextBtn.addEventListener('click',next);
el.hintBtn.addEventListener('click',()=>{
 if(!currentQ()||state.answered)return;
 state.hintShown=!state.hintShown;save();renderQuestion();
});
el.reviewBtn.addEventListener('click',startReview);
el.modalReviewBtn.addEventListener('click',startReview);
el.modalCloseBtn.addEventListener('click',()=>el.summaryModal.hidden=true);
el.soundBtn.addEventListener('click',()=>{state.soundEnabled=!state.soundEnabled;save();renderHero();if(state.soundEnabled)audio('good');popup(`효과음 ${state.soundEnabled?'켜짐':'꺼짐'}`);});
el.resetBtn.addEventListener('click',()=>{
 if(!confirm('레벨·코인·진행 상황·오답 노트를 전부 초기화할까?'))return;
 state=freshState();selectPack('core',false);popup('모든 기록이 초기화됐어.');
});
document.addEventListener('keydown',e=>{
 const focus=document.activeElement;
 if(['INPUT','TEXTAREA'].includes(focus?.tagName)||focus?.isContentEditable)return;
 if(!el.summaryModal.hidden){if(e.key==='Escape')el.summaryModal.hidden=true;return;}
 const direction={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',A:'left',d:'right',D:'right',w:'up',W:'up',s:'down',S:'down'}[e.key];
 if(direction){e.preventDefault();moveHero(direction);return;}
 if(/^[1-4]$/.test(e.key)&&!state.answered&&currentQ())answer(Number(e.key)-1);
 else if(e.key==='Enter'&&state.answered&&!el.nextBtn.disabled){e.preventDefault();next();}
});

if(!hydrate()){
 const pack=normalizePack(BUILTIN.core);
 state.title=pack.title;state.questions=pack.questions;
 addLog('컴퓨터구조 핵심 던전 준비 완료! 문제를 선택해 봐.');
 save();
}else{isRestoring=true;}
render();
bindMovement();
if(isRestoring)setImportStatus('이전에 플레이한 진행 상황을 불러왔어.','good');
