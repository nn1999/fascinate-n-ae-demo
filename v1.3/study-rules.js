/* Demo-only trial adapters around the Cx chemotherapy task/calendar pattern. */
const TrialUI=(()=>{
 const reportKinds=(stage,context)=>context==='assessment'||stage===3?['gene','second']:stage<3?['record','lab','imaging','baseline']:['gene','second','outside'];
 const phase=stage=>stage===0?'待筛选':stage<4?'导入期':stage===4?'分层治疗':'治疗结束';
 const medKey=(s,drug,day=s.day)=>`${s.stage===3?2:s.stage}-${s.cycle}-${day}-${drug}`;
 const evidence=[
 '既往病理资料：林女士，女性，56岁。',
 '首次病理及筛选附件：HR阳性、HER2阴性；内分泌敏感、肿瘤及淋巴结条件均符合本模拟方案。',
 '影像及筛选附件：有可测量病灶，报告在计划首次给药前28天内；实际给药日期变化后需复核。',
 '化验及筛选附件：血液、肝肾及凝血各项均满足本模拟方案。',
 '患者明确同意研究规定的穿刺采样。',
 '两份模拟知情已签，患者已确认愿意并能够配合研究。',
 '患者否认方案规定时间窗内的其他恶性肿瘤史。',
 '患者否认近期严重或活动性感染。',
 '患者否认方案排除的自身免疫病。',
 '患者否认器官或异基因造血干细胞移植史。',
 '患者否认规定时间窗内的系统性抗肿瘤治疗。',
 '影像及筛选附件：无远处转移证据。',
 '化验及筛选附件：无方案排除的病毒学及感染筛查异常。',
 '患者否认酒精或药物滥用史。'];
 const sources=['record','baseline','imaging','lab','history','consent','history','history','history','history','history','imaging','lab','history'];
 function item(s,i){const override=s.criteriaReview?.[i];if(override)return {...override,reviewed:true};let src=sources[i],known=false,flag='待核',reason='缺少足够证据，不能将未提及记为“无”。';if(src==='history'){flag=s.screenAnswers?.[i]||'待核';known=flag!=='待核';reason=known?evidence[i]:'患者尚未逐项回答。';if(known&&flag!==(i<6?'有':'无'))reason='患者报告的情况与本项要求不符，请查看病史补充原文。';}else if(src==='consent'){known=!!(s.consents.project&&s.consents.epclin&&s.screenAnswers?.[5]==='有');flag=known?'有':'待核';reason=known?evidence[i]:'请完成双知情及配合能力确认。';}else{let r=[...s.reports].reverse().find(r=>r.type===src);known=!!(r?.sample&&r.screeningEvidence?.includes(i));if(known){flag=i<6?'有':'无';reason=evidence[i];}else reason=r?'原文已保存，待逐项提取核对。':'尚未上传'+src+'对应资料。';}return {flag,reason,reviewed:false};}
 function eligibility(s){let items=sources.map((_,i)=>item(s,i)),unknown=items.filter(v=>v.flag==='待核').length,failed=items.filter((v,i)=>v.flag!=='待核'&&v.flag!==(i<6?'有':'无')).length;return{items,unknown,failed,passed:14-unknown-failed,eligible:!unknown&&!failed,conclusion:failed?'不符合入组条件':unknown?'暂无法确认符合入组条件':'符合入组条件（待研究医生确认）'};}
 function prescreen(s){let items=sources.map((_,i)=>item(s,i));items[5]={flag:s.screenAnswers?.[5]||'待核',reason:'患者研究意愿及配合能力。'};let unknown=items.filter(v=>v.flag==='待核').length,failed=items.filter((v,i)=>v.flag!=='待核'&&v.flag!==(i<6?'有':'无')).length;return{items,unknown,failed,passed:14-unknown-failed,eligible:!unknown&&!failed,conclusion:failed?'不符合预审条件':unknown?'资料不足，暂无法确认':'符合医学预审条件，建议同意入组'};}

 return{reportKinds,phase,medKey,evidence,sources,item,eligibility,prescreen};
})();
