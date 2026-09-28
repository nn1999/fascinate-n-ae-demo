/* NeoMARS demo domain state. No clinical services are contacted. */
const N=(()=>{
 const KEY='cx-fudan-fascinate-ae-v1.9-public';
 const stages=['筛选期 · Day−28','导入期 · 入组准备','来曲唑导入','两周评估','分层治疗','治疗结束 / 手术'];
 const arms={1:'来曲唑＋达尔西利',2:'来曲唑',3:'来曲唑＋达尔西利',4:'来曲唑'};
 const docs={record:'既往病理',baseline:'首次穿刺病理',gene:'EPclin基因报告',second:'第二次穿刺病理',outside:'外院处方 / 病历',lab:'化验报告',imaging:'影像报告',image:'症状照片',surgery:'术后病理',operation:'手术记录',discharge:'出院记录',followup:'复查资料'};
 const initial=()=>({version:1,patient:{name:'林女士',id:'NM-001',age:56},stage:4,day:7,cycle:1,firstDose:'2026-09-01',treatmentStart:'2026-09-01',screen:'已入组',screenReason:'',facts:false,consents:{project:null,epclin:null},qlq:{},qlqDraft:{},reports:[],meds:{},tasks:{},aes:[],conmeds:[],calls:[],messages:[],logs:[],quality:{},favorite:[],risk:'低危',baseKi:30,nextKi:18,arm:1,groupConfirmed:true,randomNo:'',treatmentReady:false,weeklyDone:false,mode:'AI电话',started:false});
 let s;try{s=JSON.parse(localStorage.getItem(KEY))||initial()}catch{s=initial()}
 const save=()=>localStorage.setItem(KEY,JSON.stringify(s));
 const time=()=>new Date().toLocaleString('zh-CN',{hour12:false});
 const log=(text,role='研究系统')=>{s.logs.unshift({text,role,time:time()});save()};
 const reduction=(b,r)=>Number.isFinite(b)&&Number.isFinite(r)&&b>0&&b<=100&&r>=0&&r<=100?(b-r)/b*100:null;
 const stratify=(risk,b,r)=>{let n=reduction(b,r);return n===null?null:risk==='低危'&&n>=20?4:risk==='高危'&&n<20?1:'random'};
 const medPlan=()=>s.stage<2||s.stage>4?[]:[{key:'let',name:'来曲唑',rest:false},...(s.stage===4&&[1,3].includes(s.arm)?[{key:'dal',name:'达尔西利',rest:s.day>21}]:[])];
 const medKey=(drug)=>`${s.stage===3?2:s.stage}-${s.cycle}-${s.day}-${drug}`;
 const sampleReport=(type)=>({id:'R'+Date.now()+Math.random().toString(36).slice(2,5),type,name:docs[type]+'',date:time(),sample:true,screeningEvidence:({record:[0],baseline:[1],imaging:[2,11],lab:[3,12]})[type]||[],confirmed:true});
 const cohort=[{id:'NM-001',name:'林女士',age:56,arm:3,stage:'C3',scores:{A:[68,74,79],B:[28,22,18]}},{id:'NM-002',studyStage:5,name:'赵女士',age:52,arm:1,stage:'C6',scores:{A:[62,68,73],B:[34,30,25]}},{id:'NM-003',name:'周女士',age:61,arm:2,stage:'C3',scores:{A:[74,78,null],B:[22,18,null]}},{id:'NM-004',name:'陈女士',age:48,arm:4,stage:'C6',scores:{A:[72,81,86],B:[25,17,12]}},{id:'NM-005',name:'李女士',age:58,arm:3,stage:'C6',scores:{A:[66,71,77],B:[32,27,22]}},{id:'NM-006',studyStage:2,name:'吴女士',age:54,arm:null,stage:'D7',scores:{A:[60,null,null],B:[38,null,null]}}];
 function scenario(type){s=initial();const positions={start:[1,1],weekly:[1,7],chatAE:[1,7],ae:[1,7],aefollow:[1,8],lab:[2,7],clinic:[2,3],c3end:[3,28],c6end:[6,28]};[s.cycle,s.day]=positions[type]||[1,7];if(type==='clinic'){let date=Schedule.month(s.treatmentStart,1),days=Math.round((Date.parse(date)-Date.parse(s.treatmentStart))/86400000);s.cycle=Math.floor(days/28)+1;s.day=days%28+1;}s.reports=[];if(type!=='start')for(let k of ['A','B'])s.qlq['基线-'+k]={answers:[2,2,1],date:time()};save();return s;}
 const today=()=>{let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 function syncIntro(now=today()){if(s.stage===1&&s.introConfirmed&&s.firstDose<=now){s.stage=2;s.day=Math.min(14,Math.max(1,Math.floor((Date.parse(now)-Date.parse(s.firstDose))/86400000)+1));s.started=true;s.screen='已入组';}}
 function confirmIntroDate(date,now=today()){if(s.stage!==1)return '当前不处于导入准备';if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)return '请填写有效日期';s.firstDose=date;s.introConfirmed={date,at:time(),role:'研究医生'};syncIntro(now);save();return '';}
 return {today,syncIntro,confirmIntroDate,get s(){return s},KEY,stages,arms,docs,initial,save,log,time,reduction,stratify,medPlan,medKey,sampleReport,scenario,cohort};
})();
