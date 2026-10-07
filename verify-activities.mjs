import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initial,totals,amount} from './lib/orders.ts';
const base='http://127.0.0.1:5173/api/board';
const read=async id=>{const r=await fetch(base+'?id='+id);assert.equal(r.status,200);return r.json()};
const write=async(id,state,revision)=>fetch(base,{method:'PUT',headers:{'Content-Type':'application/json',Origin:'http://127.0.0.1:5173'},body:JSON.stringify({id,state,revision})});
const ids=[];const original=await read('main');
try{
 const template=initial();template.title='[自动测试]第一期';template.activityDate='2026-10-08';template.orders=[];template.log=[];template.products.forEach(p=>{if(p.name==='鸡爪'){p.rule='两种';p.price=100}});
 const create=async s=>{const r=await fetch(base,{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://127.0.0.1:5173'},body:JSON.stringify({state:s})});assert.equal(r.status,201);const b=await r.json();ids.push(b.id);return b.id};
 const a=await create(template);const second=structuredClone(template);second.title='[自动测试]第二期';second.activityDate='2026-10-15';const b=await create(second);
 let first=await read(a);assert.equal(first.state.orders.length,0);
 const order={id:crypto.randomUUID(),name:'测试顾客',raw:'测试数据',point:'测试取货点',items:[{product:'鸡爪',qty:2,unit:'份',flavor:'辣'}],issues:[],confirmed:true,picked:null,note:''};
 first.state.orders.push(order);assert.equal((await write(a,first.state,first.revision)).status,200);
 first=await read(a);first.state.orders[0].picked=new Date().toISOString();assert.equal((await write(a,first.state,first.revision)).status,200);
 let next=await read(b);next.state.products.find(p=>p.name==='鸡爪').price=500;assert.equal((await write(b,next.state,next.revision)).status,200);
 first=await read(a);next=await read(b);assert.equal(first.state.products.find(p=>p.name==='鸡爪').price,100);assert.equal(first.state.orders.length,1);assert(first.state.orders[0].picked);assert.equal(next.state.orders.length,0);assert.equal(totals(first.state,true)[0].qty,2);assert.equal(totals(next.state,true).length,0);assert.equal(amount(first.state.orders[0],first.state),400);
 assert.equal((await write(a,first.state,first.revision-1)).status,409);
 const listing=await (await fetch(base+'?list=1')).json();assert(listing.activities.some(x=>x.id===a&&x.orders===1));assert(listing.activities.some(x=>x.id===b&&x.orders===0));
 assert.equal((await fetch(base+'?id=missing-activity')).status,404);
 assert.deepEqual(await read('main'),original);
 console.log('PASS: separate orders, prices, pickup, procurement, dates, history, conflict handling; original activity unchanged');
}finally{fs.writeFileSync('../../work/activity-test-ids.json',JSON.stringify(ids));}
