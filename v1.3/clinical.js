/* Adult demonstration rules, traced to the NCI PDFs in work/evidence. No dose engine. */
const Clinical=(()=>{
 const drugs=['白蛋白结合型紫杉醇','卡铂','阿得贝利单抗','法米替尼'];
 const opts=['是','否','不清楚'];
 const q=(key,text,options=null,sample='')=>({key,text,options,sample});
 const yes=(key,text)=>q(key,text,opts,'否');
 const adl=q('adl','现在还能独立买菜、做饭吗？洗澡、穿衣、吃饭是否需要别人帮助？',['不影响日常活动','影响买菜做饭','影响洗澡穿衣等自理','不清楚'],'影响买菜做饭');
 const common=[q('start','这种不适从哪一天开始？发生在最近一次输液或服药后多久？请说出日期和变化。',null,'昨天开始，输液后第3天'),adl,yes('hospital','这次不适是否已经住院，或医生明确建议住院？'),q('care','已经做了什么处置或用了什么药？请说出名称、剂量、频率和效果；未处置请说“无”。',null,'无')];
 common.splice(1,0,q('continuity','这是新出现的不适，还是上次反馈的同一种不适持续或加重？',['本次新出现','原有不适持续或加重','不清楚'],'本次新出现'));
 const symptoms={
  diarrhea:{name:'腹泻',term:'Diarrhea',keys:[q('base','出现腹泻前，您平时一天排便几次？只填次数；不清楚可填写“不清楚”。',null,'1'),q('count','过去24小时最多排便几次？这里填写总次数，不是比平时增加的次数。',null,'8'),{...yes('loose','大便是不是稀便或水样便？'),sample:'是'},q('stool','有没有血或黏液、夜里被腹泻叫醒、腹痛或发热？还能喝水吗？尿量是否明显减少？',null,'水样便，没有血，没有发热，能喝水，尿量少了'),yes('iv','是否因腹泻，医生明确判断需要静脉补液或其他静脉干预？')]},
  nausea:{name:'恶心',term:'Nausea',keys:[q('intake','恶心对吃饭和喝水有什么影响？',['胃口差但吃喝如常','吃喝减少，无明显消瘦或脱水','吃喝明显不足，医生建议住院或管饲/静脉营养','不清楚'],'吃喝减少，无明显消瘦或脱水'),q('weight','这周体重变化多少？有没有口干、少尿、头晕？是否用过止吐药，效果如何？',null,'体重没有明显变化，少量多餐可以吃下'),yes('iv','是否因恶心，医生明确判断需要静脉干预？')]},
  vomiting:{name:'呕吐',term:'Vomiting',keys:[q('count','过去24小时吐了几次？两次之间是否至少间隔5分钟？',null,'3'),q('vomit','吐出来的是什么？有血、咖啡色内容物吗？能否留住水和药，尿量如何？',null,'食物，没有血，可以小口喝水'),q('intervention','医生对这次呕吐的处置判断是什么？',['不需医疗干预','需门诊静脉补液或药物干预','需住院、管饲或静脉营养','尚未评估'],'需门诊静脉补液或药物干预')]},
  fatigue:{name:'乏力',term:'Fatigue',keys:[yes('rest','休息或睡觉后，乏力能明显缓解吗？'),q('fatigue','每天持续多久？有没有发热、心慌、气短、头晕、怕冷，或口渴和尿量增多？',null,'大半天，休息不能明显缓解，无其他不适')]},
  fever:{name:'发热',term:'Fever',keys:[q('temp','最高实测体温是多少摄氏度？测量方式和时间请在下一题说明。',null,'38.2'),q('hours','如果超过40℃，超过40℃持续了多少小时？没有超过请填0。',null,'0'),q('infection','什么时候、用什么方式量的？有没有寒战、咳嗽、尿痛或导管周围红肿？最近血常规的中性粒细胞是多少？',null,'今晚腋温38.2℃，没有其他不适，血常规还没做')]},
  mouth:{name:'口腔黏膜炎',term:'Mucositis oral',keys:[q('oral','口腔疼痛、溃疡和进食情况怎样？',['轻微不适，不需干预','中度疼痛，需要软食但能进食','严重疼痛，影响进食饮水','不清楚'],'中度疼痛，需要软食但能进食'),q('mouth','溃疡在哪儿、有多少处？有没有出血、白斑、发热？请上传清晰照片。',null,'舌侧两处溃疡，没有发热')]},
  neuropathy:{name:'周围感觉神经病变',term:'Peripheral sensory neuropathy',keys:[q('nerve','哪里麻木或刺痛？单侧还是双侧，持续还是间歇？会不会扣不了扣子、拿不稳东西或走路不稳？',null,'两侧手指麻木，持续，拿东西不稳'),q('severity','麻木或感觉异常的程度如何？',['轻微症状','中度症状','严重症状','不清楚'],'中度症状')]},
  handfoot:{name:'手足皮肤反应',term:'Palmar-plantar erythrodysesthesia syndrome',keys:[q('skin','手掌脚底有没有发红、肿胀、脱皮、水疱或裂口？',['轻微皮肤改变','脱皮、水疱或裂口','严重脱皮、水疱或裂口','不清楚'],'脱皮、水疱或裂口'),yes('pain','这些皮肤改变会疼痛吗？'),q('feet','能不能正常走路、握东西？有没有渗液或感染？请上传手脚照片。',null,'走路会疼，没有渗液')]},
  pressure:{name:'血压升高',term:'Hypertension',keys:[q('sbp','休息后复测的收缩压（高压）是多少 mmHg？',null,'165'),q('dbp','舒张压（低压）是多少 mmHg？',null,'102'),q('baseSbp','治疗前或平时稳定时的收缩压是多少 mmHg？不知道请填不清楚。',null,'125'),q('baseDbp','治疗前或平时稳定时的舒张压是多少 mmHg？不知道请填不清楚。',null,'80'),q('bpDuration','复测后升高是否持续超过1小时？',['超过1小时','不足1小时','未复测或不清楚'],'超过1小时'),q('bpBase','平时血压是多少？在吃什么降压药？有没有头痛、视物模糊、胸痛、气短或肢体无力？',null,'平时125/80，没有用降压药，无胸痛')]},
  rash:{name:'皮疹或瘙痒',term:'Rash / Pruritus 待医生选词',keys:[q('rash','皮疹从哪里开始？覆盖哪些部位、约几个手掌大小？有无瘙痒、疼痛、水疱、脱皮及眼口生殖器黏膜受累？',null,'双前臂有红疹，约两个手掌，轻痒，无水疱'),q('sleep','有没有影响睡眠或日常活动？有没有新用药、发热、嘴唇或眼睑肿胀？请补充照片。',null,'没有影响睡眠，未新增用药')]},
  breathing:{name:'咳嗽或气促',term:'Dyspnea / Cough 待医学确认',keys:[q('breath','是新出现或明显加重的吗？静坐、说话或走路时是否气促？有没有胸痛、发热、咳血？',null,'新出现干咳，走路有点气促，没有胸痛'),q('oxygen','如有血氧仪，静息血氧是多少？有无肺部影像或医生诊断？不知道请明确说明。',null,'血氧不清楚，尚未就医')]},
  urine:{name:'尿量或尿液异常',term:'Proteinuria / renal event 待医学确认',keys:[q('urine','有无泡沫尿、血尿、尿量减少或眼睑腿部水肿？从何时出现？一天大概多少尿量？',null,'这两天泡沫尿，没有水肿，尿量正常'),q('kidney','最近尿蛋白、肌酐及参考范围是多少？是否有24小时尿蛋白或尿蛋白肌酐比？请上传完整化验单。',null,'尚未检查')]},
  endocrine:{name:'内分泌或肝脏相关不适',term:'待诊断与检验确认',keys:[q('endocrine','有无怕冷或怕热、心慌、体重变化、明显口渴多尿、食欲下降、头痛或眼睛皮肤发黄？逐项说明。',null,'怕冷，其他没有'),q('labs','最近甲功、血糖、肝功能或皮质醇检查结果如何？有没有医生诊断或新增治疗？',null,'没有近期报告')]},
  bleeding:{name:'出血或瘀斑',term:'按出血部位医学选词',keys:[q('bleeding','哪里出血？量有多少、持续多久，能否止住？有没有黑便、血尿、呕血、月经明显增多或大片瘀斑？',null,'刷牙牙龈少量出血，可以止住'),q('blood','有没有头晕、心慌或乏力？最近血小板、血红蛋白是多少？是否接受止血或输血？',null,'无头晕，化验还未出')]},
  other:{name:'其他不适',term:'待医生确定 AE 术语',keys:[q('other','还有哪些不适，例如疼痛、脱发、听力变化、食欲或睡眠变化？请描述部位、严重程度、持续时间和变化。',null,'最近脱发增加')]}
 };
 function grade(key,d,v){let g=null,b=[];const n=k=>d[k]!==undefined&&d[k]!==''&&Number.isFinite(Number(d[k]))?Number(d[k]):null,ad=d.adl==='影响洗澡穿衣等自理'?3:d.adl==='影响买菜做饭'?2:1;
  if(key==='diarrhea'){
   let base=n('base'),count=n('count'),delta=base!==null&&count!==null?count-base:null;
   if(delta!==null&&delta>0){g=delta>=7?3:delta>=4?2:1;b.push('较基线增加'+delta+'次/24小时')}
   if(v===6&&d.loose==='是'){g=Math.max(g||0,1);b.push('便性状改变')}
   if(ad>=2){g=Math.max(g||0,ad);b.push('活动影响：'+d.adl)}
   if(d.hospital==='是'){g=3;b.push('住院或医生建议住院')}
   if(v===6&&d.iv==='是'){g=3;b.push('需要静脉干预')}
  }
  if(key==='nausea'){g={'胃口差但吃喝如常':1,'吃喝减少，无明显消瘦或脱水':2,'吃喝明显不足，医生建议住院或管饲/静脉营养':3}[d.intake]||null;b.push(d.intake||'进食情况待补');if(v===6&&d.iv==='是'){g=Math.max(g||0,2);b.push('静脉干预指征')}}
  if(key==='vomiting'){g={'不需医疗干预':1,'需门诊静脉补液或药物干预':2,'需住院、管饲或静脉营养':3}[d.intervention]||null;b.push(d.intervention||'干预需求待医生评估')}
  if(key==='fatigue'){if(d.rest==='是')g=1;else if(d.rest==='否'&&ad>=2)g=ad;b.push('休息缓解：'+d.rest+'；'+d.adl)}
  if(key==='fever'){let t=n('temp'),h=n('hours');if(t!==null&&t>=38&&t<=43)g=t<=39?1:t<=40?2:h===null?null:h>24?4:3;b.push('实测体温'+(t??'未知')+'℃；超过40℃持续'+(h??'未知')+'小时')}
  if(key==='mouth'){g={'轻微不适，不需干预':1,'中度疼痛，需要软食但能进食':2,'严重疼痛，影响进食饮水':3}[d.oral]||null;b.push(d.oral||'缺少进食证据')}
  if(key==='neuropathy'){if(v===6&&d.severity==='轻微症状')g=1;else if(d.severity==='严重症状'&&ad===3)g=3;else if(d.severity==='中度症状'&&ad===2)g=2;b.push('症状程度：'+d.severity+'；'+d.adl)}
  if(key==='handfoot'){if(d.skin==='轻微皮肤改变'&&d.pain==='否')g=1;else if(d.pain==='是'&&d.skin==='严重脱皮、水疱或裂口'&&ad===3)g=3;else if(d.pain==='是'&&['脱皮、水疱或裂口','严重脱皮、水疱或裂口'].includes(d.skin)&&ad===2)g=2;b.push(d.skin+'；疼痛：'+d.pain+'；'+d.adl)}
  if(key==='pressure'){let s=n('sbp'),p=n('dbp');if(s!==null&&p!==null){if(v===5){if(s>=160||p>=100)g=3;else if(s>=140||p>=90)g=2;else if(s>=120||p>=80)g=1;}else {let bs=n('baseSbp'),bd=n('baseDbp'),delta=bs!==null&&(s-bs>20||bd!==null&&((s+2*p)-(bs+2*bd))/3>15);if(d.bpDuration==='超过1小时'){if(s>=180||p>=110)g=4;else if(s>=160||p>=100)g=3;else if(s>=140||p>=90)g=2;}if(s>140&&delta)g=Math.max(g||0,3);if(bs!==null)b.push('基线'+bs+'/'+(bd??'未知')+'mmHg');}b.push('复测'+s+'/'+p+'mmHg；'+d.bpDuration)}}
  if(key==='anc'){let x=n('value');if(x!==null&&x>=0&&d.verified==='是'){if(v===5)g=x<.5?4:x<1?3:x<1.5?2:n('lln')!==null&&x<n('lln')?1:null;else g=x<.1?4:x<.5?3:x<1?2:x<1.5?1:null;b.push('中性粒细胞绝对计数'+x+'×10⁹/L；参考下限'+d.lln)}}
  if(key==='platelets'){let x=n('value');if(x!==null&&x>=0&&d.verified==='是'){g=x<(v===5?25:10)?4:x<50?3:x<75?2:n('lln')!==null&&x<n('lln')?1:null;if(v===6&&d.transfusion==='是')g=Math.max(g||0,3);b.push('血小板'+x+'×10⁹/L；参考下限'+d.lln)}}
  return {version:v,grade:g,term:key==='platelets'?(v===5?'Platelet count decreased':'Thrombocytopenia'):key==='anc'?'Neutrophil count decreased':symptoms[key]?.term||'待医学选词',basis:b.filter(Boolean).join('；')||'需要检验、检查或诊断证据，暂不自动分级',status:g?'AI预分级，待医生确认':'证据不足或尚未达到该条目分级阈值，待医生确认'};
 }
 const redText='如果现在呼吸困难、胸痛、意识异常、出血不止或虚弱到站不稳，请立即就近急诊或拨打120，不要等随访结束。';
 const allowed=(key,v)=>key==='pressure'&&v===6?['2','3','4','5']:['nausea','fatigue','handfoot'].includes(key)?['1','2','3']:['neuropathy','anc'].includes(key)||key==='platelets'&&v===5?['1','2','3','4']:['1','2','3','4','5'];
 return {drugs,symptoms,common,q,yes,grade,redText,opts,allowed};
})();
