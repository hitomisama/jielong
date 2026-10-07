// Run deliberately once against your own local preview. Adds copies; never overwrites existing activities.
import fs from 'node:fs';
const file=process.argv[2];
if(!file)throw Error('请提供备份文件路径：node restore-backup.mjs "团购数据备份.json"');
const backup=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
if(backup.format!=='jielong-backup-v1'||!Array.isArray(backup.activities)||backup.activities.some(a=>!a.state||!a.state.title||!Array.isArray(a.state.orders)||!Array.isArray(a.state.products)||!Array.isArray(a.state.log)))throw Error('备份文件格式不正确');
const base='http://127.0.0.1:5173/api/board';
async function request(method,body){const r=await fetch(base,{method,headers:{'Content-Type':'application/json',Origin:'http://127.0.0.1:5173'},body:JSON.stringify(body)});const result=await r.json();if(!r.ok)throw Error(result.error||'恢复失败');return result;}
for(const a of backup.activities){
 const empty={...a.state,orders:[],log:[]};
 const created=await request('POST',{state:empty});
 try{await request('PUT',{id:created.id,revision:created.revision,state:a.state});console.log('已恢复：'+a.state.title+'（'+a.state.orders.length+'单）');}
 catch(e){console.error('活动副本已创建但订单尚未恢复，活动编号：'+created.id);throw e;}
}
console.log('恢复完成。刷新页面，在“活动列表”打开恢复的活动。再次执行会产生重复副本。');
