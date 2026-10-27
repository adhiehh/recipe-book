import React, {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';
const categories=['Breakfast','Lunch','Dinner','Snack','Dessert'];
const symbols={Breakfast:'☀',Lunch:'◒',Dinner:'☾',Snack:'✦',Dessert:'♡'};
const empty={name:'',category:'Breakfast',ingredients:'',steps:'',cookingTime:''};
const base=(import.meta.env.VITE_API_URL || '/api').replace(/\/$/,'');
async function api(path='',options={}){
 try{
  const response=await fetch(base+'/recipes'+path,{...options,headers:{'Content-Type':'application/json'}});
  const data=await response.json();
  if(!response.ok)throw new Error(data.message || 'Request failed.');
  return data;
 }catch(error){if(error instanceof TypeError)throw new Error('Cannot reach the server. Check that the backend is running.');throw error;}
}
function Modal({title,children,onClose,busy}){
 const ref=useRef();
 useEffect(()=>{const previous=document.activeElement;ref.current.showModal();return()=>{previous?.focus();};},[]);
 return <dialog ref={ref} onCancel={e=>{e.preventDefault();if(!busy)onClose();}} aria-labelledby="modal-title"><header className="modal-head"><h2 id="modal-title">{title}</h2><button className="icon" aria-label="Close" disabled={busy} onClick={onClose}>×</button></header>{children}</dialog>;
}
function App(){
 const [recipes,setRecipes]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [query,setQuery]=useState(''),[category,setCategory]=useState('All recipes'),[modal,setModal]=useState(null),[form,setForm]=useState(empty),[busy,setBusy]=useState(false),[formError,setFormError]=useState('');
 async function load(){setLoading(true);setError('');try{setRecipes(await api());}catch(e){setError(e.message);}finally{setLoading(false);}}
 useEffect(()=>{load();},[]);
 function close(){setModal(null);setFormError('');}
 function edit(recipe){setForm(recipe?{name:recipe.name,category:recipe.category,ingredients:recipe.ingredients,steps:recipe.steps,cookingTime:recipe.cookingTime}:{...empty});setFormError('');setModal({type:'form',recipe});}
 async function details(recipe){setBusy(true);setError('');try{const full=await api('/'+recipe._id);setModal({type:'details',recipe:full});}catch(e){setError(e.message);}finally{setBusy(false);}}
 async function save(e){
  e.preventDefault();
  const cookingTimeNum=Number(form.cookingTime);
  if(!form.name.trim()||!form.ingredients.trim()||!form.steps.trim()||form.cookingTime===''){
    setFormError('Please fill in all fields.');
    return;
  }
  if(isNaN(cookingTimeNum)||!Number.isInteger(cookingTimeNum)||cookingTimeNum<0){
    setFormError('Cooking time must be a non-negative whole number (0 or greater).');
    return;
  }
  setBusy(true);setFormError('');try{
  const id=modal.recipe?._id;const saved=await api(id?'/'+id:'',{method:id?'PUT':'POST',body:JSON.stringify({...form,cookingTime:cookingTimeNum})});
  setRecipes(list=>id?list.map(r=>r._id===id?saved:r):[saved,...list]);setQuery('');setCategory('All recipes');setNotice(id?'Recipe updated.':'Recipe added to your collection.');close();
  }catch(e){setFormError(e.message);}finally{setBusy(false);}}
 async function remove(){setBusy(true);setFormError('');try{await api('/'+modal.recipe._id,{method:'DELETE'});setRecipes(list=>list.filter(r=>r._id!==modal.recipe._id));setNotice('Recipe deleted.');close();}catch(e){setFormError(e.message);}finally{setBusy(false);}}
 const visible=recipes.filter(r=>(category==='All recipes'||r.category===category)&&r.name.toLowerCase().includes(query.toLowerCase()));
 const field=e=>setForm({...form,[e.target.name]:e.target.value});
 return <><nav><a href="/" className="brand"><span className="brand-icon">▤</span> Recipe Book<span className="brand-dot">.</span></a><span className="nav-note">A little inspiration. A lot of flavour.</span><button onClick={()=>edit()}>+ Add recipe</button></nav><main>
 <section className="hero"><div><p className="eyebrow">YOUR PERSONAL KITCHEN NOTEBOOK</p><h1>Good food.<br/><em>Worth remembering.</em></h1><p className="intro">Keep your favourites, collect new ideas, and make<br className="desktop"/> something delicious. Your recipes, all in one place.</p><button onClick={()=>edit()}>+ Create a recipe</button></div><div className="hero-art" aria-hidden="true"><div className="orbit"></div><div className="plate"><div className="food">✳<span>✦</span>✳</div></div><span className="art-label">Made with love ↗</span><span className="leaf">❧</span></div></section>
 <section className="collection"><div className="collection-head"><div><p className="eyebrow">COOK. SAVE. REPEAT.</p><h2>Your collection <span className="count">{recipes.length}</span></h2></div><label className="search"><span aria-hidden="true">⌕</span><input aria-label="Search recipes" placeholder="Find a favourite…" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
 <div className="filters" aria-label="Filter recipes">{['All recipes',...categories].map(c=><button key={c} aria-pressed={category===c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
 {notice&&<div className="notice" role="status">{notice}<button className="icon" aria-label="Dismiss message" onClick={()=>setNotice('')}>×</button></div>}
 {error&&<div className="error" role="alert">{error} <button onClick={load}>Retry</button></div>}
 {loading?<div className="empty">Loading your recipes…</div>:!error&&visible.length===0?<div className="empty"><span className="empty-icon">▤</span><h3>{recipes.length?'No recipes found':'Your next favourite starts here'}</h3><p>{recipes.length?'Try another name or category.':'Add your first recipe and start your own kitchen collection.'}</p><button onClick={()=>edit()}>+ Add a recipe</button></div>:<div className="grid">{visible.map(r=><article className={'card '+r.category.toLowerCase()} key={r._id}><button disabled={busy} className="card-main" onClick={()=>details(r)} aria-label={'View '+r.name}><div className="card-art" aria-hidden="true"><span>{symbols[r.category]}</span><small>THE RECIPE COLLECTION</small></div><div className="card-body"><span className="tag">{r.category}</span><h3>{r.name}</h3><p>◷ {r.cookingTime} min <span className="view">View recipe ↗</span></p></div></button><div className="card-actions"><button className="text-button" onClick={()=>edit(r)}>Edit recipe</button><button className="text-button danger" onClick={()=>{setFormError('');setModal({type:'delete',recipe:r});}}>Delete</button></div></article>)}</div>}
 </section><footer>Recipe Book<span>A home for every recipe you love.</span></footer></main>
 {modal&&<Modal title={modal.type==='form'?(modal.recipe?'Edit recipe':'Create a recipe'):modal.type==='delete'?'Delete this recipe?':modal.recipe.name} onClose={close} busy={busy}>
 {modal.type==='form'?<form onSubmit={save}><p className="muted">A favourite today. A tradition tomorrow.</p><label>Recipe name<input autoFocus name="name" required maxLength={120} placeholder="e.g. Creamy tomato pasta" value={form.name} onChange={field}/></label><div className="form-row"><label>Category<select name="category" value={form.category} onChange={field}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Cooking time (minutes)<input name="cookingTime" type="number" required min="0" max="10080" step="1" placeholder="30" value={form.cookingTime} onChange={field}/></label></div><label>Ingredients<textarea name="ingredients" required maxLength={10000} rows="4" placeholder="One ingredient per line, including quantities" value={form.ingredients} onChange={field}/></label><label>Preparation steps<textarea name="steps" required maxLength={20000} rows="5" placeholder="Describe each step on a new line" value={form.steps} onChange={field}/></label>{formError&&<p className="error" role="alert">{formError}</p>}<div className="modal-actions"><button type="button" className="secondary" disabled={busy} onClick={close}>Cancel</button><button disabled={busy}>{busy?'Saving…':'Save recipe'}</button></div></form>:modal.type==='delete'?<><p>Delete <strong>{modal.recipe.name}</strong> from your collection? This cannot be undone.</p>{formError&&<p className="error" role="alert">{formError}</p>}<div className="modal-actions"><button className="secondary" disabled={busy} onClick={close}>Keep recipe</button><button className="delete-button" disabled={busy} onClick={remove}>{busy?'Deleting…':'Delete recipe'}</button></div></>:<><p className="detail-meta"><span className="tag">{modal.recipe.category}</span> ◷ {modal.recipe.cookingTime} minutes</p><h3>Ingredients</h3><ul className="ingredients">{modal.recipe.ingredients.split('\n').filter(s=>s.trim()).map((s,i)=><li key={i}>{s}</li>)}</ul><h3>Preparation</h3><ol className="steps">{modal.recipe.steps.split('\n').filter(s=>s.trim()).map((s,i)=><li key={i}>{s}</li>)}</ol><div className="modal-actions"><button className="secondary" onClick={close}>Close</button><button onClick={()=>edit(modal.recipe)}>Edit recipe</button></div></>}
 </Modal>}</>;
}
createRoot(document.getElementById('root')).render(<App/>);
