/* Rule-based provisional assessment. Patient observations, AI recommendations and signed review are separate. */
const Assessment=(()=>{
 const regimen=[
 {name:'白蛋白结合型紫杉醇',dose:'100 mg/m²',freq:'每28天周期第1、8、15天',route:'静脉输注',days:[1,8,15]},
 {name:'卡铂',dose:'AUC 1.5',freq:'每28天周期第1、8、15天',route:'静脉输注',days:[1,8,15]},
 {name:'阿得贝利单抗',dose:'10 mg/kg',freq:'每28天周期第1、15天',route:'静脉输注',days:[1,15]},
 {name:'法米替尼',dose:'10 mg',freq:'每日一次',route:'口服',days:[]}];
 const questions=[
 {key:'admission',label:'住院情况',text:'了解了。这次腹泻有没有实际办理住院，或者因此延长了原来的住院？如果只是急诊处理后回家，告诉我没有住院就好。',options:['没有住院','因腹泻住院','因此延长住院','不清楚']},
 {key:'admissionInfo',label:'住院原因与时间',text:'辛苦您了。是哪天、在哪家医院住院的？医生说主要是因为什么需要住院，现在出院了吗？',when:'admission',upload:true},
 {key:'lifeThreat',label:'危及生命及抢救',text:'我再确认一下，医生有没有说这次腹泻让您有生命危险，或者因此进行抢救、送进重症监护室？',options:['没有','有','不清楚']},
 {key:'disability',label:'持续或显著功能损害',text:'现在洗澡、穿衣和走动，能自己完成吗？有没有因为这次腹泻，一直需要别人照顾，或者医生说留下了明显的功能损害？',options:['能自理，没有持续功能损害','仍需照顾或存在功能损害','不清楚']},
 {key:'importantEvent',label:'重要医学事件',text:'除了刚才说的情况，医生有没有说存在严重脱水、电解质紊乱、肾功能损伤，或者必须紧急处理才能避免危险？有的话请说说，没有或记不清也可以告诉我。',upload:true},
 {key:'priorGI',label:'既往肠道情况',text:'明白了。开始研究治疗以前，有没有反复腹泻、肠炎，或者其他肠道疾病？如果有，这次和平时相比有什么不同？'},
 {key:'food',label:'饮食及接触史',text:'腹泻前有没有吃过不新鲜的食物？家里人、一起吃饭的人有没有也拉肚子？'},
 {key:'otherDrugs',label:'其他药物线索',text:'最近有没有用过抗生素、泻药，或者其他可能让大便变稀的药？有的话说一下药名和开始时间，没有就说没有。'},
 {key:'investigations',label:'病因检查及医生意见',text:'医生有没有解释腹泻的可能原因？做过便常规、病原检查、血常规或电解质检查吗？结果怎么样？没有检查或记不清也没关系，稍后可以把病历发到聊天里。',upload:true},
 {key:'regimenChange',label:'研究用药是否变化',text:'之前确认的四种研究药物，我这里有记录，不用您再重复。和原来的方案相比，这周有没有停药、减量、推迟输液，或者恢复用药？',options:['没有调整','医生要求调整','自行调整过','不清楚']},
 {key:'changeInfo',label:'调整药物及症状变化',text:'了解了。具体是哪一种药、哪一天改的，由谁决定，改成了多少？调整之后腹泻有没有减轻？当时是否也做了补液或用了止泻药？',when:'change'},
 {key:'restart',label:'调整后再次用药',text:'后来有没有按医生安排再次使用调整过的药？我们只记录已经发生的情况，不需要为了判断原因尝试停药或再用药。',when:'change',options:['没有再次使用','已经再次使用','不清楚']},
 {key:'restartInfo',label:'再次用药后变化',text:'再次用的是哪种药、哪一天、多少剂量？腹泻有没有又出现或加重，隔了多久？',when:'restart'}
 ];
 const unknown=t=>!t||/^(不清楚|不知道|不确定|记不清|待核|无法判断|没有听清)[。！\s]*$/.test(t);
 const negative=t=>!unknown(t)&&!/(但是|但|不过|只是|有点|确诊)/.test(t)&&/^(没有|无|没[有用吃发做住抢]|未|都没有|这些都没有)|(?:都|均)没有/.test(t);
 function normal(key,t){t=t.trim();if(unknown(t))return '不清楚';if(key==='admission'){if(/没有住院|没住院|未住院|回家|^没有[。！]?$/.test(t))return '没有住院';if(/延长/.test(t))return '因此延长住院';if(/住院/.test(t))return '因腹泻住院'}if(key==='lifeThreat')return negative(t)?'没有':/有|抢救|重症|生命危险/.test(t)?'有':t;if(key==='disability')return /能自理|自己完成|自己.*做|没有|都可以/.test(t)?'能自理，没有持续功能损害':/不能|需要.*照顾|功能损害/.test(t)?'仍需照顾或存在功能损害':t;if(key==='regimenChange'){if(negative(t)||/没.*调整|没有变化|按原.*方案/.test(t))return '没有调整';if(/医生/.test(t))return '医生要求调整';if(/自己|自行/.test(t))return '自行调整过'}if(key==='restart'){if(negative(t)||/没.*再|未恢复/.test(t))return '没有再次使用';if(/再次|恢复|又用/.test(t))return '已经再次使用'}return t}
 function skip(q,d){return q.when==='admission'&&!['因腹泻住院','因此延长住院'].includes(d.admission)||q.when==='change'&&!['医生要求调整','自行调整过'].includes(d.regimenChange)||q.when==='restart'&&d.restart!=='已经再次使用'}
 function missing(d){return questions.filter(q=>!skip(q,d)&&unknown(d[q.key])).map(q=>q.label)}
 function care(t=''){if(typeof ReportEvidence!=='undefined')return ReportEvidence.care(t);let xs=[];if(/(?:没|未|没有)(?:有)?(?:做任何处理|处置|处理)|^无[。！]?$/.test(t))return '未接受处置';if(/补液|输液/.test(t))xs.push('接受补液治疗');if(/蒙脱石散/.test(t))xs.push('使用蒙脱石散');if(/口服补液盐/.test(t))xs.push('使用口服补液盐');if(/抗生素|抗感染/.test(t))xs.push('接受抗感染治疗');if(/洛哌丁胺/.test(t))xs.push('使用洛哌丁胺');return xs.join('，')||'具体处置待核实'}
 function follow(e){if(!e)return '';let v=e.visited==='已住院'?'因本事件住院':e.visited==='已去门诊或急诊'?'曾于门急诊就诊':e.visited==='没去医院'?'尚未就诊':'就医情况待核实';const current=String(e.current||''),count=current.match(/(?:一共|总共)?\s*(\d+)次/)?.[1]||(/^\d+$/.test(current)?current:null);return v+'；'+care(e.measure)+(count?'；最新随访24小时排便'+count+'次':'')+'；目前转归：'+(e.outcome||'无法判断')+'。'}
 function summary(key,d={},a={}){if(key!=='diarrhea')return a.summary&&!/[？?]|[：:]\s*(哦|我)|您|您的|什么时候/.test(a.summary)?a.summary:((a.medicalName||a.name||'不适')+'；起始日期：'+(a.start||d.start||'待核实')+'。相关表现与处置待医学核对。');let xs=['患者'+(d.start?'于'+(/^\d{4}-\d{2}-\d{2}$/.test(d.start)?d.start:'待核实日期'):'起始日期待核实，')+'出现腹泻'];if(/^\d+$/.test(d.base||''))xs.push('基线排便'+d.base+'次/日');if(/^\d+$/.test(d.count||''))xs.push('事件发生时24小时最多排便'+d.count+'次'+(/^\d+$/.test(d.base||'')?'，较基线增加'+Math.max(0,+d.count-+d.base)+'次':''));let stool=d.stool||'';if(d.loose==='是')xs.push('稀便或水样便');if(/(?:没有|无)(?:血|便血)/.test(stool))xs.push('否认便血');else if(/便血|有血/.test(stool))xs.push('报告便血');if(/夜里|夜间|半夜/.test(stool)&&!/没有.*(?:夜里|夜间)|夜里没有/.test(stool))xs.push('伴夜间排便');if(/口干/.test(d.redSymptoms||'')&&!/没有口干|无口干/.test(d.redSymptoms))xs.push('伴口干');if(/尿量.*(?:少|减少)|少尿/.test(d.redSymptoms||'')&&!/尿量没有减少|尿量不少/.test(d.redSymptoms))xs.push('报告尿量减少');if(d.adl&&d.adl!=='不清楚')xs.push(d.adl);if(d.actualHospital==='是')xs.push('已实际住院');else if(d.actualHospital==='否')xs.push('未实际住院');return xs.join('；')+'。'+(a.external?follow(a.external):d.care?care(d.care)+'。':'')}
 function assess(a,record){const d=a.patientEvidence?.values||{},support=[],limits=[],miss=[];let sae='证据不足，继续核实';const serious=['因腹泻住院','因此延长住院'].includes(d.admission)||a.data?.actualHospital==='是'||a.external?.visited==='已住院';
 if(serious){sae='SAE';support.push('患者报告因本事件实际住院或延长住院，符合严重性触发条件，需核对病历。')}
 if(d.lifeThreat==='有'){sae='SAE';support.push('报告危及生命、抢救或重症监护经历。')}
 if(d.disability==='仍需照顾或存在功能损害'){sae='SAE';support.push('报告持续或显著功能损害，需医学核实。')}
 if(!unknown(d.importantEvent)&&!negative(d.importantEvent)&&/严重脱水|严重电解质紊乱|急性肾功能损伤|紧急.*(?:处理|干预)|医生.*危险/.test(d.importantEvent.replace(/(?:没有|未见|无)(?:严重脱水|严重电解质紊乱|急性肾功能损伤|生命危险)/g,''))){sae='SAE';support.push('存在重要医学事件线索，需研究医生核实临床意义。')}
 if(a.finalOutcome==='死亡'){sae='SAE';support.push('事件转归记录为死亡。')}
 const negativeSet=d.admission==='没有住院'&&d.lifeThreat==='没有'&&d.disability==='能自理，没有持续功能损害'&&negative(d.importantEvent);
 if(sae!=='SAE'&&negativeSet&&!(a.currentAssessment18?.urgent??a.data?.urgent)){sae='非SAE';support.push('已明确否认住院/延长住院、危及生命及持续功能损害；未报告其他重要医学事件。');limits.push('基于患者口述的预判，仍需医生结合病历确认。')}
 if(sae==='证据不足，继续核实')miss.push(...questions.filter(q=>['admission','lifeThreat','disability','importantEvent'].includes(q.key)&&unknown(d[q.key])).map(q=>q.label));
 if(sae==='证据不足，继续核实'&&!miss.length)miss.push('严重性信息尚不明确或存在冲突，需补充病历核实');
 if(a.currentAssessment18?.urgent??a.data?.urgent)limits.push('有急症信号，需紧急医学评估；症状等级本身不直接确定SAE。');
 const drugs=regimen.map((drug,i)=>{const yes=[],no=[],need=[],start=record?.confirmed&&record?.started?record.date:null,onset=a.data?.start||a.start;let value='无法判定';
 if(!start)need.push('D1实际起始用药确认');if(!/^\d{4}-\d{2}-\d{2}$/.test(onset||''))need.push('事件起始日期');
 if(start&&/^\d{4}-\d{2}-\d{2}$/.test(onset||'')){
 if(onset<start){if(/未加重|没有加重/.test(a.raw||'')){value='肯定无关';no.push('事件发生在该药首次暴露之前，且未报告用药后加重。')}else need.push('治疗前症状是否在给药后加重');}
 else if(a.key==='diarrhea'){value='可能有关';yes.push('腹泻发生于已确认首次用药之后，存在合理时间先后关系。');yes.push(i===2?'PD-L1抑制剂存在免疫相关腹泻/结肠炎风险，单凭腹泻不能诊断免疫性结肠炎。':i===3?'靶向治疗安全性资料存在腹泻风险。':'该药安全性资料包含腹泻等胃肠道不良反应。');no.push('四药同期暴露，不能仅凭时间关系确定单一责任药物。');}
 else need.push('该AE的逐药风险与时间窗需专门核实');}
 const change=d.changeInfo||'',re=d.restartInfo||'',alias=[/白紫|紫杉醇/,/卡铂/,/阿[得德]贝利/,/法米替尼/][i];
 if(alias.test(change)){if(/减轻|好转|减少|好一些/.test(change)&&!/没有好转|未减轻|没.*减少/.test(change)){yes.push('该药调整后症状改善，为支持线索。');if(/补液|止泻|同时/.test(change))no.push('同时存在对症治疗，改善不能单独归因于调整研究药。')}else no.push('已报告该药调整，调整后的效果尚需核实。');}
 if(alias.test(re)&&/再.*(?:腹泻|加重)|又.*(?:拉|腹泻)/.test(re)&&!/没有|未/.test(re))yes.push('自然再次用药后症状复现，为支持线索，仍需排除混杂因素。');
 if(d.regimenChange==='没有调整')no.push('未发生停药/减量，去激发不适用；不作为不相关证据。');
 if(d.restart==='没有再次使用'||d.regimenChange==='没有调整')no.push('未发生再次暴露验证，不降低为不相关。');
 if(!negative(d.food)&&!unknown(d.food))no.push('存在饮食或接触相关的竞争原因线索，尚待核实。');
 if(!negative(d.otherDrugs)&&!unknown(d.otherDrugs)||!negative(d.concomitant)&&!unknown(d.concomitant))no.push('存在其他药物暴露线索，需评估竞争性药物原因。');
 if(!negative(d.priorGI)&&!unknown(d.priorGI))no.push('需考虑既往肠道疾病或基线症状。');
 if(!unknown(d.investigations)&&/确诊.*(?:感染性肠炎|细菌性肠炎|食物中毒)|培养阳性/.test(d.investigations)&&value==='可能有关'){value='可能无关';no.push('报告已有明确替代病因线索，更支持非研究药原因；尚不能完全排除药物参与。')}
 for(let key of ['priorGI','food','otherDrugs','investigations','regimenChange'])if(unknown(d[key]))need.push(questions.find(q=>q.key===key).label);
 if(!unknown(d.investigations)&&/没检查|未检查|未完成|尚无|没做|待取|记不清|不知道/.test(d.investigations))need.push('可核实的病因检查或病历证据');
 return {name:drug.name,value,support:yes,limits:no,missing:need};});
 return {sae:{value:sae,support,limits,missing:miss},drugs,missing:missing(d)};
 }
 return {regimen,questions,unknown,negative,normal,skip,missing,care,follow,summary,assess};
})();
