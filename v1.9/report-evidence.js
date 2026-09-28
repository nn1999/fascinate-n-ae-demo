/* Medical-record evidence stays distinct from patient speech and physician confirmation. */
const ReportEvidence=(()=>{
 const prompts={hospital:'病历中没有看到医院名称，您还记得是哪家医院吗？',diagnosis:'病历中还没有写清楚医生的判断。医生当时怎么解释您的情况，有没有明确建议住院？',upload:'您辛苦了。可以先把这次医院的病历、处方和检查结果拍照发给我，上传窗口已经为您准备好了。病历里写清楚的内容，我就不重复问您了。如果暂时不方便上传，也可以继续说。',medication:'病历里的处方我已经记下了。回家后您有没有按处方实际用药？有没有改过用量，或者已经停了？',resume:'好的，病历已经收到了。接下来只补充病历没有写清楚的情况，以及您回家后的实际用药和恢复情况。'};
 const refs=[
 {id:1,title:'FDA. ABRAXANE Prescribing Information (2020), §6.1.',url:'https://www.accessdata.fda.gov/Drugsatfda_docs/Label/2020/021660s047lbl.Pdf',finding:'白蛋白结合型紫杉醇说明书已报告腹泻不良反应。',scope:'说明书安全性资料，不代表本四药方案的发生率。'},
 {id:2,title:'DailyMed. Carboplatin injection, Adverse Reactions — Gastrointestinal Toxicity.',url:'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5abfcb87-bb02-4384-9c9d-7d0e3e809311',finding:'卡铂说明书已报告腹泻等胃肠道不良反应。',scope:'说明书安全性资料，不代表本四药方案的发生率。'},
 {id:3,title:'SITC clinical practice guideline on immune checkpoint inhibitor-related adverse events. JITC. 2021;9:e002435.',url:'https://jitc.bmj.com/content/9/6/e002435',finding:'PD-(L)1抑制剂存在免疫相关腹泻／结肠炎风险；单凭腹泻不能诊断免疫性结肠炎。',scope:'药物类别证据，并非阿得贝利单抗在本方案中的直接发生率证据。'},
 {id:4,title:'Xu RH, et al. Famitinib versus placebo in refractory metastatic colorectal cancer. Chin J Cancer. 2017;36:97. Table 4.',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC5741870/',finding:'法米替尼随机Ⅱ期研究报告了腹泻不良反应。',scope:'其他癌种的法米替尼研究，不代表本四药乳腺癌方案的发生率。'}
 ];
 function care(raw=''){
 const t=String(raw);if(/^(无|未接受处置|尚未就医)[。！\s]*$/.test(t)||/^(?:没有|未)(?:做任何处理|接受处置)/.test(t))return '未接受处置';
 let out=[],clean=t.replace(/口服补液盐/g,'口服盐');
 if(/(?:补液|输液)/.test(clean)&&!/(?:没|未|没有|无需).{0,3}(?:补液|输液)/.test(clean))out.push(/静脉/.test(clean)?'接受静脉补液治疗':'接受补液治疗');
 for(const name of ['口服补液盐','蒙脱石散','洛哌丁胺','抗生素']){const s=t.split(/[，,；;。]/).find(x=>x.includes(name));if(!s||new RegExp('(?:没|未|没有|不需要).{0,6}'+name).test(s))continue;const prescribed=/医嘱|处方|建议|让.*(?:喝|吃|用)|开了|嘱/.test(s)&&!/已(?:经)?(?:喝|吃|用|服)|实际(?:服|用)/.test(s);out.push(prescribed?'医嘱'+name+'治疗，院外实际使用待确认':name==='抗生素'?'接受抗感染治疗':'使用'+name);}
 return out.join('；')||'具体处置待核实';
 }
 function parse(text){
 const t=String(text||'').replace(/\r/g,'').replace(/[ \t]+/g,' '),e={},d={},rx=[];
 const hospital=t.match(/医院\s*[：:]\s*([^\n；。]+)/);if(hospital)d.hospitalName=hospital[1].trim();
 const date=t.match(/(?:就诊日期|日期)\s*[：:]\s*(20\d\d)[年/.-](\d{1,2})[月/.-](\d{1,2})/);if(date)d.date=date[1]+'-'+date[2].padStart(2,'0')+'-'+date[3].padStart(2,'0');
 const diagnosis=t.match(/(?:诊断|评估)\s*[：:]([^\n。]+)/);if(diagnosis)d.diagnosis=diagnosis[1].trim();
 const noAdmission=/未办理住院|没有住院|未住院/.test(t),admission=/因腹泻(?:入院|住院)|办理住院手续/.test(t);
 if(noAdmission&&!admission){e.admission='没有住院';d.actualHospital='否';d.visited='已去门诊或急诊'}else if(admission&&!noAdmission){e.admission='因腹泻住院';d.actualHospital='是';d.visited='已住院'}
 if(/无生命危险/.test(t)&&/未抢救/.test(t)&&/未(?:进入|入)ICU|未重症监护/.test(t))e.lifeThreat='没有';else if(/实施抢救|转入ICU|存在生命危险/.test(t))e.lifeThreat='有';
 if(/无其他重要医学事件/.test(t))e.importantEvent='无其他重要医学事件；'+(d.diagnosis||'具体评估见病历');
 else if(/严重脱水|严重电解质紊乱|急性肾功能损伤/.test(t.replace(/无严重脱水|无严重电解质紊乱|无急性肾功能损伤/g,'')))e.importantEvent='报告提示：'+(d.diagnosis||'存在严重脱水或器官损伤线索，待医生核实');
 const measure=t.split('\n').filter(x=>/^(?:处置|治疗措施|予静脉|给予)/.test(x)).join('；');if(measure){d.measure=care(measure);d.care=d.measure;d.measureRaw=measure;}
 if(/检查|检验|血钾|血钠|肌酐|病因/.test(t))e.investigations=t;
 const line=t.split('\n').find(x=>/处方\s*[：:]/.test(x));if(line){const name=line.match(/口服补液盐(?:[ⅠⅡⅢI]{1,3})?|蒙脱石散|洛哌丁胺/)?.[0];if(name){rx.push({name,dose:line.match(/每次([^，；。\n]+)/)?.[1]||'待核实',freq:line.match(/每[日天][^，；。\n]+/)?.[0]||'待核实',route:/口服/.test(line)?'口服':'待核实',start:d.date||'待核实',end:'实际停药时间待核实',purpose:'医院处方用于腹泻，实际使用待确认'});}}
 return {text:t,data:d,evidence:e,medications:rx,fields:Object.keys(d).filter(k=>!['care','measureRaw'].includes(k))};
 }
 return {prompts,refs,care,parse};
})();
