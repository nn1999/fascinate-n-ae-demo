/* Guided interview: only actual browser recognition results become patient evidence. */
const LiveCall=(()=>{
 const weekly=[
 '林女士您好，我是复旦肿瘤医院乳腺外科的助手，最近 1 周有什么不舒服的地方？',
 '拉肚子挺难受的，我陪您仔细梳理一下。大概从哪天开始的？是在最近一次治疗前，还是治疗后？',
 '了解了。您平时一天大便几次？从昨天到现在，最多的二十四小时一共拉了几次？',
 '您拉了这么多次，一定很难受。现在有没有口干、明显头晕心慌、站不稳，或者喝不进水？身边有人能陪您吗？',
 '好的。大便是水样的吗？有没有血或黏液？夜里会不会因为拉肚子醒过来？',
 '明白。有没有发烧或明显肚子痛？这两天尿量比平时少了吗？',
 '谢谢您说得这么清楚。现在买菜、做饭还做得了吗？洗澡、穿衣、吃饭，需要家人帮忙吗？',
 '了解了。这次不舒服，医生有没有明确建议住院？后来实际住院了吗？没有看过医生也可以直接告诉我。',
 '好的。如果去过医院，是哪家医院、哪一天去的？医生说了什么，给您做了哪些检查和处理？没去过的话，直接告诉我就好。',
 '明白了。现在有没有因为这次腹泻在使用的药？如果不记得名字，晚点把处方拍给我也可以。没有用药就告诉我没有。',
 '好的，我们记一下实际用法。药叫什么名字、每次多少、一天几次，是口服还是其他方式？从什么时候开始，现在还在用吗？',
 '了解了。现在腹泻比开始时好些、差不多，还是更严重了？今天到现在拉了几次，尿量和精神怎么样？',
 '我记下了。请现在就安排家人陪您去急诊，不要为了等这通电话耽误就医。除了腹泻，这周还有恶心呕吐、口腔溃疡、手脚麻木、皮疹、出血、咳嗽气短，或者其他新不舒服吗？',
 '好的。这周是否有自服与研究无关的药物？比如自己买的止痛药、止泻药、中药或保健品。刚才提过的药不用重复。',
 '了解了。之前登记的常用药，这周有停用或改过用法吗？研究治疗有没有被医生要求暂停或调整？',
 '好的，您说的情况我都记下了，研究医生会一起核对。您还有什么情况想告诉我？',
 null
 ];
 const outcome=[
 '林女士您回来了，想问一下您的腹泻情况怎么样了？',
 '了解了，我们再具体看看。过去二十四小时一共拉了几次？大便还是水样的吗？有没有完全恢复到您平时的样子？',
 '明白。有没有发烧、便血、明显腹痛，或者头晕站不稳？喝水和尿量怎么样？',
 '好的。现在做饭、走动、洗澡穿衣这些事，能自己完成了吗？',
 '了解了。上次建议您就医以后，有没有去医院？如果去了，是门诊、急诊，还是住院？',
 '明白。是哪家医院？医生有没有明确建议住院，或者告诉您检查发现了什么？',
 '了解了。医院实际给您做了什么处理？输液、用药，或其他处理都可以告诉我。没有做任何处理就说无。',
 '好的。实际用了什么药？每次多少，一天几次，通过什么方式使用？什么时候开始，现在还在用吗？记不清的地方可以稍后看药盒核对。',
 '明白了。除了刚才提到的药，还有其他新药吗？包括自己买的药、中药和保健品。',
 '好的。研究用药有没有被医生要求停用、减量或延期？请不要自己改变用法。',
 '谢谢您告诉我这些，我会把这次变化交给研究医生。结束通话后，您可以在聊天里上传就诊病历和处方；若出现发热、喝不进水或明显头晕，请及时就医。您还有什么情况想告诉我？',
 null
 ];
 const urgent='腹泻比平时明显增多，需要今天联系研究医生并到急诊评估。如果站不稳、喝不进水或有明显心慌头晕，请立即就医，必要时拨打120。';
 const close='好的，您的回答已经记下。研究医生会核对这些信息，有新的变化可以随时在聊天里告诉我。今天就先聊到这里，祝您慢慢恢复。';
 const other='您的问题我记下了，会保留给研究团队核对。需要医学判断的内容，由研究医生回复您。';
 const number=s=>{if(/^\d+$/.test(s))return +s;const m={'零':0,'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};if(s==='十')return 10;if(s.includes('十')){let[a,b]=s.split('十');return (a?m[a]:1)*10+(b?m[b]:0)}return m[s]??null};
 const nums=t=>[...t.matchAll(/([\d零一二两三四五六七八九十]+)次/g)].map(x=>number(x[1]));
 function date(t,now){const m=t.match(/(20\d{2})[年/.-](\d{1,2})[月/.-](\d{1,2})/);if(m)return m[1]+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0');const short=t.match(/(\d{1,2})月(\d{1,2})[日号]?/);if(short)return now.slice(0,4)+'-'+short[1].padStart(2,'0')+'-'+short[2].padStart(2,'0');return /前天/.test(t)?Schedule.addDays(now,-2):/昨天/.test(t)?Schedule.addDays(now,-1):/今天/.test(t)?now:undefined}
 function outcomeOf(t){if(/没.*好|还没.*恢复/.test(t)&&!/(好些|好一些|好一点|好多|好转)/.test(t))return '持续';if(/加重|更严重|更差/.test(t))return '加重';if(/好些|好一些|好一点|好多|好转/.test(t))return '好转';if(/完全.*(?:好了|恢复)|恢复正常|恢复了|已经好了/.test(t))return '恢复';if(/差不多|没.*变化|还.*稀|没完全好/.test(t))return '持续';return '无法判断'}
 function extract(kind,answers,now){
 const d={},q=i=>answers[i]?.text||'',all=Object.values(answers).map(a=>a.text).join('；'),isW=kind==='weekly';
 const start=q(isW?1:0);if(isW)d.start=date(start,now);d.continuity=isW?'新出现的不适':'原有不适持续或加重';
 const count=q(isW?2:1),ns=nums(count),base=count.match(/平时[^，。；]*?([\d一二两三四五六七八九十]+)次/),max=count.match(/(?:最多|一共|总共)[^，。；]*?([\d一二两三四五六七八九十]+)次/);
 if(base)d.base=String(number(base[1]));if(max)d.count=String(number(max[1]));else if(ns.length>=2&&isW)d.count=String(ns[ns.length-1]);else if(!isW&&ns.length)d.count=String(ns[0]);
 const stool=q(isW?4:1);if(/(?:不|没|不是).{0,3}水样/.test(stool))d.loose=/稀/.test(stool)?'是':'不清楚';else if(/水样|有点稀|还是稀|稀便/.test(stool))d.loose='是';d.stool=stool||'待核';
 d.redSymptoms=(isW?[q(3),q(5)].filter(Boolean).join('；'):q(2))||'待核';const danger=q(isW?3:2);let positive=danger.replace(/没有站不稳|没有喝不进水|没有(?:明显)?头晕心慌|没有头晕|没有心慌|没有呼吸困难|没有便血|没有发热|没有发烧|没发烧|能喝水|这些都没有/g,'');d.urgent=/站不稳|喝不进水|呼吸困难|意识不清|出血不止/.test(positive);
 const adl=q(isW?6:3);if(/洗澡.{0,8}(?:需要|要).*帮|穿衣.{0,8}(?:需要|要).*帮|不能自理/.test(adl))d.adl='影响洗澡穿衣等自理';else if(/家里人.*做|影响买菜|影响做饭|不能做饭|没法做饭|不太想做饭|做不了饭/.test(adl))d.adl='影响买菜做饭';else if(/自己.*来|自己完成|都可以|可以了|不影响/.test(adl))d.adl='不影响日常活动';
 const hosp=q(isW?7:4)+'；'+(isW?'':q(5));if(/没让我住院|没让.*住院|没有.*建议住院|没建议住院/.test(hosp))d.hospitalRecommended='否';else if(/建议住院|让.*住院/.test(hosp))d.hospitalRecommended='是';
 if(/没有住院|没住院|未住院|补完液就回家|没让我住院/.test(hosp))d.actualHospital='否';else if(/住院了|已住院|正在住院|办理.*住院|住了.*天/.test(hosp))d.actualHospital='是';
 d.hospital=d.actualHospital==='是'||d.hospitalRecommended==='是'?'是':d.actualHospital==='否'&&d.hospitalRecommended==='否'?'否':'不清楚';
 const visit=q(isW?8:4),measure=q(isW?8:6);d.visited=d.actualHospital==='是'?'已住院':/没去|没有去|没看过|未就医/.test(visit)?'没去医院':/急诊|门诊|去过.*医院|去了.*医院/.test(visit)?'已去门诊或急诊':'待核';d.date=date(visit,now)||'';d.hospitalName=visit.match(/([^，。；\s]{2,25}(?:医院|卫生院|医疗中心))/)?.[1]||'名称待核';d.diagnosis=q(isW?8:5)||'待核';d.measure=measure||'待核';
 if(/(?:没|未|没有)(?:有)?输液|没有静脉/.test(measure))d.iv='否';else if(/输液|静脉/.test(measure))d.iv='是';
 const med=q(isW?9:6)+'；'+q(isW?10:7);d.medUse=/补液盐|吃.*药|用.*药|口服|胶囊|片剂/.test(med)?'有用药或已开药':/没有用药|没用药|没吃药|^无[；。]?|没有做.*处理/.test(med)?'没有用药':'不清楚';
 const current=q(isW?11:1);d.current=current||'待核';d.outcome=outcomeOf(current);if(!isW&&d.outcome==='持续'&&outcomeOf(q(0))==='好转')d.outcome='好转';d.selfMedication=q(isW?13:8)||'待核';d.treatmentChanges=q(isW?14:9)||'待核';d.care=measure||'待核';d.raw=all;return d;
 }
 function drugs(kind,answers,now){let t=[answers[kind==='weekly'?9:6]?.text,answers[kind==='weekly'?10:7]?.text].filter(Boolean).join('；');if(!t||/^(没有用药|没用药|没有吃药|无)[；。\s]*$/.test(t))return [];let name=t.match(/口服补液盐|洛哌丁胺|蒙脱石散|布洛芬|氨氯地平|昂丹司琼/)?.[0];if(!name)return [];const dose=t.match(/每次([^，。；]*?)(?=[，。；]|$)/)?.[1]||'不清楚';const freq=t.match(/(?:一天|每天|每日)([\d一二两三四五六七八九十]+)次/);return [{name,start:date(t,now)||'不清楚',end:/还在|仍在|继续|未停/.test(t)?'仍在用':/停了|停用/.test(t)?date(t,now)||'不清楚':'不清楚',dose,freq:freq?'每日'+number(freq[1])+'次':'不清楚',route:/口服|喝|吃/.test(t)?'口服':'不清楚',purpose:'患者报告用于本次腹泻，待核'}]}
 function question(f,s){if(f.notice)return f.notice;const list=f.kind==='outcome'?outcome:weekly;if(f.index===list.length-1){const last=f.answers[f.index-1]?.text||'';return /化验|抽血|血常规/.test(last)?Dialogue14.labText(s):/没有|没了|不用|谢谢/.test(last)?close:other}return list[f.index]}
 function next(f){let n=f.index+1;if(f.kind==='weekly'){if(f.index===0&&/没有.*不舒服|没.*不舒服/.test(f.answers[0]?.text||''))n=13;if(f.index===9&&/^(没有[，, ]*)?(没有用药|没用药|没有吃药|没吃药|没有|无|没有其他药)[。！!\s]*$/.test(f.answers[9]?.text||''))n=11;}else{if(f.index===4&&/没去|没有去|未就医/.test(f.answers[4]?.text||''))n=6;if(f.index===6&&/^(无|没有|未处置|没有做任何处理)[。\s]*$/.test(f.answers[6]?.text||''))n=8;}return n}
 return {weekly,outcome,urgent,close,other,number,nums,date,extract,drugs,question,next};
})();
