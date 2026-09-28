const Schedule=(()=>{
 const iso=d=>d.toISOString().slice(0,10),parse=s=>new Date(s+'T12:00:00Z');
 function addDays(s,n){let d=parse(s);d.setUTCDate(d.getUTCDate()+n);return iso(d)}
 function month(s,n){let d=parse(s),y=d.getUTCFullYear(),m=d.getUTCMonth()+n;return iso(new Date(Date.UTC(y,m,Math.min(d.getUTCDate(),new Date(Date.UTC(y,m+1,0)).getUTCDate()),12)))}
 const date=(s,d=s.day)=>addDays(s.treatmentStart,(s.cycle-1)*28+d-1);
 const weekKey=(s,d=s.day)=>`weekly-C${s.cycle}-D${d}`;
 const visits=s=>Array.from({length:6},(_,i)=>({date:month(s.treatmentStart,i+1),n:i+1}));
 function tasks(s,d=s.day){let a=[],push=(id,title,action,value,hint)=>a.push({id,title,action,value,hint,done:!!s.tasks[id]});
 if(s.cycle===1&&d===1)a.push({id:'d1-regimen',title:'首次用药确认',action:'a17D1',value:'',hint:'核对医生处方及实际开始情况',done:!!s.regimen17?.confirmed});
 if(d%7===0){push(weekKey(s,d),'每周身体情况随访','weeklyChoice','','电话或图文，选择您方便的方式');a.at(-1).weekly=true;push('lab-'+date(s,d),'每周血常规','fUpload','lab','按研究团队安排检查，上传完整报告')}
 if(d===1)push('cycle-'+s.cycle,'本周期治疗前安全检查','fVisit','cycle-'+s.cycle,'血常规、尿常规、生化；生命体征、ECOG、上一周期不良反应及合并用药');
 if(d===28&&s.cycle%2===0)push('imaging-C'+s.cycle,'本周期影像评估','fUpload','imaging','乳腺 MRI，沿用同一影像方法评估');
 if([3,6].includes(s.cycle)&&d===28)for(let k of ['A','B'])a.push({id:'C'+s.cycle+'-'+k,title:'生活质量问卷 '+k,action:'openQLQ',value:'C'+s.cycle+'-'+k,done:!!s.qlq['C'+s.cycle+'-'+k]});
 if(s.cycle===1&&d===1)for(let k of ['A','B'])a.push({id:'基线-'+k,title:'基线生活质量问卷 '+k,action:'openQLQ',value:'基线-'+k,done:!!s.qlq['基线-'+k]});
 for(let v of visits(s))if((s.appointments?.[v.date]?.date||v.date)===date(s,d))push('visit-'+v.date,'每月门诊复查','fVisit',v.date,'核对本次检验、检查及实际处置');
 if(s.cycle===6&&d===28)push('end','治疗结束综合评估','fVisit','end','体检、血尿常规、生化、心电图、乳腺影像及肿瘤标志物');
 return a;
 }
 const qlqOpen=(s,key)=>!!s.qlq[key]||key.startsWith('基线')||s.cycle>+key[1]||s.cycle===+key[1]&&s.day===28;
 return {addDays,month,date,weekKey,visits,tasks,qlqOpen,complete:(s,d)=>{let a=tasks(s,d);return a.length>0&&a.every(t=>t.done)},efsVisits:()=>[],restKey:()=>''};
})();

const FascinateScheduleBase={...Schedule};
