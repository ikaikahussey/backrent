import { useState, useEffect, useRef, useCallback } from "react";
import { PARCELS, BENCHMARKS, CPI, PRIMARY_SOURCES, CATEGORIES, CATEGORY_COLORS, CATEGORY_LABELS, ALL_PARCEL_IDS } from "./parcels.js";

var storage = {
  get: function(key) { try { var v = localStorage.getItem(key); return v ? { value: v } : null; } catch(e) { return null; } },
  set: function(key, value) { try { localStorage.setItem(key, value); } catch(e) {} },
};

function getCPI(y){if(CPI[y])return CPI[y];var ks=Object.keys(CPI).map(Number).sort(function(a,b){return a-b});for(var i=0;i<ks.length-1;i++){if(y>ks[i]&&y<ks[i+1]){var t=(y-ks[i])/(ks[i+1]-ks[i]);return CPI[ks[i]]+t*(CPI[ks[i+1]]-CPI[ks[i]])}}return CPI[ks[ks.length-1]]}
function fmt(n){if(n>=1e12)return "$"+(n/1e12).toFixed(2)+"T";if(n>=1e9)return "$"+(n/1e9).toFixed(2)+"B";if(n>=1e6)return "$"+(n/1e6).toFixed(2)+"M";if(n>=1e3)return "$"+(n/1e3).toFixed(1)+"K";return "$"+n.toFixed(2)}
function fmtFull(n){return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
function compute(p,rate,method,interest,sO,eO){var s=sO||p.startYear,e=eO||p.endOverride||2026,yrs=e-s;if(yrs<=0)return{total:0,breakdown:[],years:0,annualBase:0,startYear:s,endYear:e};var ab=p.acres*rate,bd=[],tot=0;for(var y=s;y<e;y++){var r;if(method==="simple")r=ab;else if(method==="compound")r=ab*Math.pow(1+interest/100,y-s);else r=ab*(getCPI(y)/getCPI(s));bd.push({year:y,rent:r});tot+=r}return{total:tot,breakdown:bd,years:yrs,annualBase:ab,startYear:s,endYear:e}}

var CATS = CATEGORIES.map(function(c){return {k:c.key,h:c.heading,c:c.color}});

var THEMES={
  dark:{
    bg:"#0d0d0d",bgAlt:"#0f0f0f",bgCard:"#111",bgInput:"#111",bgExpand:"#080808",
    bgParcelOn:"#12110e",bgParcelOff:"#0a0a0a",bgCustomForm:"#141410",bgOverlay:"#1a1a1a",
    text:"#e0d5c1",textMuted:"#888",textFaint:"#666",textFaintest:"#555",textFooter:"#444",
    accent:"#c8a96e",accentText:"#000",
    border:"#1a1a1a",borderLight:"#2a2a2a",borderInput:"#333",borderFaint:"#151515",borderDark:"#111",
    navBg:"#0d0d0dee",headerGrad:"linear-gradient(180deg,#111 0%,#0d0d0d 100%)",
    link:"#7a8a6e",savedBg:"#1a1a1a",savedBorder:"#2a2a2a",shareBg:"#0a0a0a",
    barBg:"#c8a96e22",methodBg:"#999",checkBorder:"#444",
    fontBody:"'DM Mono','IBM Plex Mono','Courier New',monospace",
    fontMono:"'DM Mono',monospace",
    fontDisplay:"'DM Serif Display',Georgia,serif",
  },
  light:{
    bg:"#f4f1eb",bgAlt:"#eae7e0",bgCard:"#fff",bgInput:"#fff",bgExpand:"#f0ede6",
    bgParcelOn:"#faf8f4",bgParcelOff:"#f0ede6",bgCustomForm:"#f7f5f0",bgOverlay:"#e8e4dc",
    text:"#1a1a1a",textMuted:"#555",textFaint:"#777",textFaintest:"#999",textFooter:"#999",
    accent:"#8b6914",accentText:"#fff",
    border:"#ddd",borderLight:"#ccc",borderInput:"#bbb",borderFaint:"#e0ddd6",borderDark:"#ddd",
    navBg:"#f4f1ebee",headerGrad:"linear-gradient(180deg,#fff 0%,#f4f1eb 100%)",
    link:"#4a6a3e",savedBg:"#eae7e0",savedBorder:"#ddd",shareBg:"#f7f5f0",
    barBg:"#8b691422",methodBg:"#555",checkBorder:"#bbb",
    fontBody:"'DM Mono','IBM Plex Mono','Courier New',monospace",
    fontMono:"'DM Mono',monospace",
    fontDisplay:"'DM Serif Display',Georgia,serif",
  },
  helvetica:{
    bg:"#f4f1eb",bgAlt:"#eae7e0",bgCard:"#fff",bgInput:"#fff",bgExpand:"#f0ede6",
    bgParcelOn:"#faf8f4",bgParcelOff:"#f0ede6",bgCustomForm:"#f7f5f0",bgOverlay:"#e8e4dc",
    text:"#1a1a1a",textMuted:"#555",textFaint:"#777",textFaintest:"#999",textFooter:"#999",
    accent:"#8b6914",accentText:"#fff",
    border:"#ddd",borderLight:"#ccc",borderInput:"#bbb",borderFaint:"#e0ddd6",borderDark:"#ddd",
    navBg:"#f4f1ebee",headerGrad:"linear-gradient(180deg,#fff 0%,#f4f1eb 100%)",
    link:"#4a6a3e",savedBg:"#eae7e0",savedBorder:"#ddd",shareBg:"#f7f5f0",
    barBg:"#8b691422",methodBg:"#555",checkBorder:"#bbb",
    fontBody:"'Helvetica Neue',Helvetica,Arial,sans-serif",
    fontMono:"'Helvetica Neue',Helvetica,Arial,sans-serif",
    fontDisplay:"'Helvetica Neue',Helvetica,Arial,sans-serif",
  }
};

export default function App(){
  var [theme,setTheme]=useState(function(){var s=storage.get("br3-theme");return s?s.value:"dark"});
  var [fontScale,setFontScale]=useState(function(){var s=storage.get("br3-fontscale");return s?parseFloat(s.value):1});
  var T=THEMES[theme]||THEMES.dark;
  var fs=function(size){return Math.round(size*fontScale)};
  var THEME_ORDER=["dark","light","helvetica"];
  var toggleTheme=function(){var i=THEME_ORDER.indexOf(theme);var next=THEME_ORDER[(i+1)%THEME_ORDER.length];setTheme(next);storage.set("br3-theme",next)};
  var adjustFont=function(delta){var next=Math.min(1.4,Math.max(0.8,Math.round((fontScale+delta)*10)/10));setFontScale(next);storage.set("br3-fontscale",String(next))};

  var [selected,setSelected]=useState(ALL_PARCEL_IDS);
  var [rateKey,setRateKey]=useState("agricultural");
  var [customRate,setCustomRate]=useState(300);
  var [method,setMethod]=useState("cpi");
  var [interest,setInterest]=useState(3.5);
  var [sOverride,setSOverride]=useState("");
  var [eOverride,setEOverride]=useState("");
  var [saved,setSaved]=useState([]);
  var [saveName,setSaveName]=useState("");
  var [showSaved,setShowSaved]=useState(false);
  var [expandedParcel,setExpandedParcel]=useState(null);
  var [customParcels,setCustomParcels]=useState([]);
  var [showAdd,setShowAdd]=useState(false);
  var [newP,setNewP]=useState({name:"",island:"",acres:"",startYear:"1964",notes:""});
  var [shareText,setShareText]=useState("");
  var [filter,setFilter]=useState("all");
  var [activeNav,setActiveNav]=useState("summary");

  var NAV_ITEMS=[{id:"summary",label:"Summary"},{id:"parameters",label:"Parameters"},{id:"parcels",label:"Parcels"},{id:"save",label:"Save & Share"},{id:"methodology",label:"Sources"}];

  var observerRef=useRef(null);
  useEffect(function(){
    var sections=NAV_ITEMS.map(function(n){return document.getElementById("section-"+n.id)}).filter(Boolean);
    if(!sections.length)return;
    observerRef.current=new IntersectionObserver(function(entries){
      var visible=entries.filter(function(e){return e.isIntersecting}).sort(function(a,b){return a.boundingClientRect.top-b.boundingClientRect.top});
      if(visible.length>0){var id=visible[0].target.id.replace("section-","");setActiveNav(id)}
    },{rootMargin:"-80px 0px -60% 0px",threshold:0});
    sections.forEach(function(s){observerRef.current.observe(s)});
    return function(){if(observerRef.current)observerRef.current.disconnect()};
  },[]);

  var scrollTo=function(id){
    var el=document.getElementById("section-"+id);
    if(el)el.scrollIntoView({behavior:"smooth",block:"start"});
  };

  useEffect(function(){document.body.style.background=T.bg;document.documentElement.style.background=T.bg},[theme]);

  useEffect(function(){(async function(){try{var r=storage.get("br3-saved");if(r&&r.value)setSaved(JSON.parse(r.value))}catch(e){}try{var r2=storage.get("br3-custom");if(r2&&r2.value){var cp=JSON.parse(r2.value);setCustomParcels(cp);setSelected(function(prev){return ALL_PARCEL_IDS.concat(cp.map(function(p){return p.id}))})}}catch(e){}})()},[]);

  var allParcels=[].concat(PARCELS,customParcels);
  var rate=rateKey==="custom"?customRate:BENCHMARKS[rateKey].rate;
  var rateLabel=rateKey==="custom"?"Custom ($"+customRate+"/ac/yr)":BENCHMARKS[rateKey].label;

  var resultMap={};
  allParcels.forEach(function(p){
    resultMap[p.id]=compute(p,rate,method,interest,sOverride?parseInt(sOverride):null,eOverride?parseInt(eOverride):null);
  });

  var results=selected.map(function(id){var p=allParcels.find(function(x){return x.id===id});if(!p)return null;return{parcel:p,result:resultMap[id]}}).filter(Boolean);
  var grandTotal=results.reduce(function(s,r){return s+r.result.total},0);
  var totalAcres=results.reduce(function(s,r){return s+r.parcel.acres},0);
  var totalPaid=results.reduce(function(s,r){return s+(r.parcel.leaseCost||0)},0);
  var fedAcres=results.filter(function(r){return r.parcel.tenure==="federal_owned"}).reduce(function(s,r){return s+r.parcel.acres},0);
  var leaseAcres=results.filter(function(r){return r.parcel.tenure==="state_leased"}).reduce(function(s,r){return s+r.parcel.acres},0);
  var retAcres=results.filter(function(r){return r.parcel.tenure==="returned"}).reduce(function(s,r){return s+r.parcel.acres},0);

  var toggle=function(id){setSelected(function(p){return p.includes(id)?p.filter(function(x){return x!==id}):[].concat(p,[id])})};
  var saveComp=async function(){if(!saveName.trim())return;var c={id:Date.now().toString(),name:saveName.trim(),parcels:selected,rateKey:rateKey,customRate:customRate,method:method,interest:interest,sOverride:sOverride,eOverride:eOverride,rateLabel:rateLabel,totalOwed:grandTotal,totalAcres:totalAcres,savedAt:new Date().toISOString()};var u=[].concat(saved,[c]);setSaved(u);setSaveName("");try{storage.set("br3-saved",JSON.stringify(u))}catch(e){}};
  var delComp=async function(id){var u=saved.filter(function(c){return c.id!==id});setSaved(u);try{storage.set("br3-saved",JSON.stringify(u))}catch(e){}};
  var loadComp=function(c){setSelected(c.parcels);setRateKey(c.rateKey);setCustomRate(c.customRate);setMethod(c.method);setInterest(c.interest);setSOverride(c.sOverride||"");setEOverride(c.eOverride||"");setShowSaved(false)};
  var addCustom=async function(){if(!newP.name||!newP.acres)return;var p={id:"c_"+Date.now(),name:newP.name,island:newP.island||"Custom",acres:parseInt(newP.acres),startYear:parseInt(newP.startYear)||1964,tenure:"federal_owned",notes:newP.notes||"",leaseCost:0,cededLand:true,category:"custom",sources:[]};var u=[].concat(customParcels,[p]);setCustomParcels(u);setSelected(function(prev){return[].concat(prev,[p.id])});setShowAdd(false);setNewP({name:"",island:"",acres:"",startYear:"1964",notes:""});try{storage.set("br3-custom",JSON.stringify(u))}catch(e){}};

  var genShare=function(){var t="BACK RENT COMPUTATION - FEDERAL-SEIZED CEDED LANDS\nState of Hawaii - "+new Date().toLocaleDateString()+"\n"+"=".repeat(52)+"\n\nMethod: "+(method==="simple"?"Flat":method==="compound"?"Compound ("+interest+"%)":"CPI-Adjusted")+"\nRate: "+rateLabel+" - $"+rate.toFixed(2)+"/acre/year\n\n";CATS.forEach(function(cat){var cr=results.filter(function(r){return r.parcel.category===cat.k});if(!cr.length)return;t+="-- "+cat.h+" "+"-".repeat(Math.max(0,40-cat.h.length))+"\n";cr.forEach(function(r){t+="  > "+r.parcel.name+"\n    "+r.parcel.acres.toLocaleString()+" ac - "+r.parcel.island+" - "+r.result.startYear+"-"+r.result.endYear+"\n    Owed: "+fmtFull(r.result.total)+"\n\n"})});t+="=".repeat(52)+"\nFEDERAL-OWNED: "+fedAcres.toLocaleString()+" ac\nSTATE-LEASED:  "+leaseAcres.toLocaleString()+" ac\nRETURNED:      "+retAcres.toLocaleString()+" ac\nTOTAL ACREAGE: "+totalAcres.toLocaleString()+" ac\nTOTAL PAID:    "+fmtFull(totalPaid)+"\nBACK RENT:     "+fmtFull(grandTotal)+"\n\nSOURCES: EO 11167, EO 11166, EO 11165, 1969 Historical Analysis Table 9,\nDLNR 2026 Leg Report, HMLUMP 2021, Admission Act Sec 5(b)(d)(f)\n";setShareText(t)};

  var filtered=filter==="all"?allParcels:allParcels.filter(function(p){return p.category===filter});

  var I={background:T.bgInput,border:"1px solid "+T.borderInput,color:T.text,padding:"6px 10px",fontFamily:T.fontMono,fontSize:fs(13),width:"100%",outline:"none",boxSizing:"border-box"};
  var S=Object.assign({},I,{appearance:"none",WebkitAppearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center",paddingRight:28,cursor:"pointer"});
  var L={color:T.textMuted,fontSize:fs(11),textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4,display:"block"};
  var B1={background:T.accent,color:T.accentText,border:"none",padding:"8px 18px",fontFamily:T.fontMono,fontSize:fs(12),fontWeight:700,cursor:"pointer",letterSpacing:"0.05em",textTransform:"uppercase"};
  var B2={background:"transparent",color:T.accent,border:"1px solid "+T.accent,padding:"8px 18px",fontFamily:T.fontMono,fontSize:fs(12),cursor:"pointer",letterSpacing:"0.05em",textTransform:"uppercase"};

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:T.fontBody,transition:"background 0.2s,color 0.2s"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Serif+Display&display=swap" rel="stylesheet"/>

      <header style={{borderBottom:"1px solid "+T.borderLight,padding:"28px 32px",background:T.headerGrad}}>
        <div style={{maxWidth:1020,margin:"0 auto"}}>
          <div style={{color:T.accent,fontSize:fs(10),letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>Financial Analysis - Public Record</div>
          <h1 style={{fontFamily:T.fontDisplay,fontSize:fs(28),fontWeight:400,color:T.text,margin:0}}>Back Rent Computation</h1>
          <h2 style={{fontFamily:T.fontDisplay,fontSize:fs(18),fontWeight:400,color:T.textMuted,margin:"4px 0 0"}}>Federal-Seized & State-Leased Ceded Public Trust Lands - Hawaii</h2>
          <div style={{color:T.textFaint,fontSize:fs(11),marginTop:12,lineHeight:1.6,maxWidth:720}}>At statehood (1959), federal agencies controlled 432,726 acres of Hawaii's public domain. Under Section 5(d) of the Admission Act, 87,237 acres were seized by executive order and 30,176 acres placed under $1/65-year leases. HMLUMP 2021 reports 221,981 total military-controlled acres statewide.</div>
        </div>
      </header>


      {/* STICKY NAV */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:T.navBg,backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderBottom:"1px solid "+T.border,padding:"0 32px"}}>
        <div style={{maxWidth:1020,margin:"0 auto",display:"flex",gap:0,overflow:"auto"}}>
          {NAV_ITEMS.map(function(n){
            var isActive=activeNav===n.id;
            return <button key={n.id} onClick={function(){scrollTo(n.id)}} style={{
              background:"none",border:"none",borderBottom:isActive?"2px solid "+T.accent:"2px solid transparent",
              color:isActive?T.accent:T.textFaint,padding:"10px 16px",cursor:"pointer",
              fontFamily:T.fontMono,fontSize:fs(11),letterSpacing:"0.06em",
              textTransform:"uppercase",whiteSpace:"nowrap",transition:"all 0.15s",
            }}>{n.label}</button>
          })}
          <div style={{flex:1}}/>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"0 4px"}}>
            <span style={{color:T.accent,fontSize:fs(13),fontWeight:700,fontFamily:T.fontMono}}>{fmt(grandTotal)}</span>
            <span style={{color:T.textFaintest,fontSize:fs(10),marginRight:8}}>{totalAcres.toLocaleString()} ac</span>
            <button onClick={function(){adjustFont(-0.1)}} title="Decrease text size" style={{background:"none",border:"1px solid "+T.borderInput,color:T.textMuted,width:26,height:26,cursor:"pointer",fontFamily:T.fontMono,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",padding:0,opacity:fontScale<=0.8?0.3:1}}>A-</button>
            <button onClick={function(){adjustFont(0.1)}} title="Increase text size" style={{background:"none",border:"1px solid "+T.borderInput,color:T.textMuted,width:26,height:26,cursor:"pointer",fontFamily:T.fontMono,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",padding:0,opacity:fontScale>=1.4?0.3:1}}>A+</button>
            <button onClick={toggleTheme} title={theme==="dark"?"Switch to light":theme==="light"?"Switch to Helvetica":"Switch to dark"} style={{background:"none",border:"1px solid "+T.borderInput,color:T.textMuted,width:26,height:26,cursor:"pointer",fontSize:theme==="helvetica"?11:14,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>{theme==="dark"?"\u2600":theme==="light"?"H":"\u263D"}</button>
          </div>
        </div>
      </nav>

      <main style={{maxWidth:1020,margin:"0 auto",padding:"24px 32px 60px"}}>

        {/* SUMMARY BAR */}
        <div id="section-summary" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:1,background:T.bgOverlay,border:"1px solid "+T.border,marginBottom:24,scrollMarginTop:52}}>
          {[{l:"Federal-Owned",v:fedAcres.toLocaleString()+" ac"},{l:"State-Leased",v:leaseAcres.toLocaleString()+" ac"},{l:"Returned",v:retAcres.toLocaleString()+" ac"},{l:"Total Acreage",v:totalAcres.toLocaleString()+" ac"},{l:"Total Paid",v:fmtFull(totalPaid)},{l:"Back Rent Owed",v:fmt(grandTotal),hi:true}].map(function(x,i){
            return <div key={i} style={{background:T.bgAlt,padding:"14px 10px",textAlign:"center"}}>
              <div style={{color:T.textFaint,fontSize:fs(9),textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{x.l}</div>
              <div style={{color:x.hi?T.accent:T.text,fontSize:x.hi?fs(22):fs(15),fontWeight:700}}>{x.v}</div>
            </div>
          })}
        </div>

        {/* PARAMETERS */}
        <section id="section-parameters" style={{marginBottom:24,scrollMarginTop:52}}>
          <h3 style={{color:T.accent,fontSize:fs(12),letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12}}>Parameters</h3>
          <div style={{background:T.bgAlt,border:"1px solid "+T.border,padding:20}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:16}}>
              <div>
                <label style={L}>Rental Rate Benchmark</label>
                <select style={S} value={rateKey} onChange={function(e){setRateKey(e.target.value)}}>
                  {Object.keys(BENCHMARKS).map(function(k){var v=BENCHMARKS[k];return <option key={k} value={k}>{v.label}{k!=="custom"?" ($"+v.rate+"/ac/yr)":""}</option>})}
                </select>
                <div style={{color:T.textFaintest,fontSize:fs(10),marginTop:4}}>{BENCHMARKS[rateKey].source}</div>
              </div>
              <div>
                <label style={L}>Computation Method</label>
                <select style={S} value={method} onChange={function(e){setMethod(e.target.value)}}>
                  <option value="simple">Flat Annual (no adjustment)</option>
                  <option value="compound">Compound Interest</option>
                  <option value="cpi">CPI-Adjusted (BLS CPI-U)</option>
                </select>
              </div>
            </div>
            {rateKey==="custom"&&<div style={{marginBottom:16}}><label style={L}>Custom Rate ($/acre/year)</label><input style={Object.assign({},I,{width:160})} type="number" value={customRate} onChange={function(e){setCustomRate(parseFloat(e.target.value)||0)}}/></div>}
            {method==="compound"&&<div style={{marginBottom:16}}><label style={L}>Annual Interest Rate (%)</label><input style={Object.assign({},I,{width:120})} type="number" step="0.1" value={interest} onChange={function(e){setInterest(parseFloat(e.target.value)||0)}}/></div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:20}}>
              <div><label style={L}>Override Start Year</label><input style={I} type="number" placeholder="Per-parcel default" value={sOverride} onChange={function(e){setSOverride(e.target.value)}}/></div>
              <div><label style={L}>Override End Year</label><input style={I} type="number" placeholder="Default: 2026" value={eOverride} onChange={function(e){setEOverride(e.target.value)}}/></div>
              <div style={{display:"flex",alignItems:"flex-end"}}><div style={{color:T.textFaintest,fontSize:fs(11),lineHeight:1.5,paddingBottom:6}}>Leave blank to use each parcel's acquisition date.</div></div>
            </div>
          </div>
        </section>

        {/* COMBINED PARCEL LIST + RESULTS */}
        <section id="section-parcels" style={{marginBottom:24,scrollMarginTop:52}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <h3 style={{color:T.accent,fontSize:fs(12),letterSpacing:"0.15em",textTransform:"uppercase",margin:0}}>Parcels & Computed Back Rent</h3>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[["all","All"],["federal","Federal"],["leased","Leased"],["returned","Returned"]].map(function(pair){
                return <button key={pair[0]} onClick={function(){setFilter(pair[0])}} style={Object.assign({},B2,{padding:"4px 10px",fontSize:fs(10),background:filter===pair[0]?T.accent+"11":"transparent"})}>{pair[1]}</button>
              })}
              <button onClick={function(){setSelected(filtered.map(function(p){return p.id}))}} style={Object.assign({},B2,{padding:"4px 10px",fontSize:fs(10)})}>Select Shown</button>
              <button onClick={function(){setSelected([])}} style={Object.assign({},B2,{padding:"4px 10px",fontSize:fs(10)})}>None</button>
              <button onClick={function(){setShowAdd(!showAdd)}} style={Object.assign({},B2,{padding:"4px 10px",fontSize:fs(10)})}>+ Custom</button>
            </div>
          </div>

          {showAdd&&<div style={{background:T.bgCustomForm,border:"1px solid "+T.borderLight,padding:16,marginBottom:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 100px 80px",gap:10,marginBottom:10}}>
              <div><label style={L}>Name</label><input style={I} value={newP.name} onChange={function(e){setNewP(Object.assign({},newP,{name:e.target.value}))}}/></div>
              <div><label style={L}>Island</label><input style={I} value={newP.island} onChange={function(e){setNewP(Object.assign({},newP,{island:e.target.value}))}}/></div>
              <div><label style={L}>Acres</label><input style={I} type="number" value={newP.acres} onChange={function(e){setNewP(Object.assign({},newP,{acres:e.target.value}))}}/></div>
              <div><label style={L}>Start Yr</label><input style={I} type="number" value={newP.startYear} onChange={function(e){setNewP(Object.assign({},newP,{startYear:e.target.value}))}}/></div>
            </div>
            <div style={{marginBottom:10}}><label style={L}>Notes</label><input style={I} value={newP.notes} onChange={function(e){setNewP(Object.assign({},newP,{notes:e.target.value}))}}/></div>
            <button onClick={addCustom} style={B1}>Add Parcel</button>
          </div>}

          {/* Grouped by category */}
          {CATS.map(function(cat){
            var parcelsInCat=filtered.filter(function(p){return p.category===cat.k});
            if(!parcelsInCat.length)return null;
            var catSelectedResults=parcelsInCat.filter(function(p){return selected.includes(p.id)}).map(function(p){return resultMap[p.id]});
            var catTotal=catSelectedResults.reduce(function(s,r){return s+r.total},0);
            var catAcres=parcelsInCat.filter(function(p){return selected.includes(p.id)}).reduce(function(s,p){return s+p.acres},0);

            return <div key={cat.k} style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"8px 0",borderBottom:"1px solid "+cat.c+"33",marginBottom:4}}>
                <div style={{color:cat.c,fontSize:fs(11),fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em"}}>{cat.h}</div>
                <div style={{display:"flex",gap:16,alignItems:"baseline"}}>
                  <span style={{color:T.textFaint,fontSize:fs(11)}}>{catAcres.toLocaleString()} ac</span>
                  <span style={{color:cat.c,fontSize:fs(16),fontWeight:700}}>{fmt(catTotal)}</span>
                </div>
              </div>

              {parcelsInCat.map(function(p){
                var isSel=selected.includes(p.id);
                var res=resultMap[p.id];
                var isExpanded=expandedParcel===p.id;
                return <div key={p.id} style={{background:isSel?T.bgParcelOn:T.bgParcelOff,border:"1px solid "+(isSel?cat.c+"33":T.borderFaint),borderLeft:"2px solid "+(isSel?cat.c:T.borderLight),marginBottom:2,transition:"all 0.1s"}}>
                  <div onClick={function(){toggle(p.id)}} style={{display:"grid",gridTemplateColumns:"28px 1fr 120px",alignItems:"start",padding:"10px 14px",cursor:"pointer",gap:8}}>
                    <div style={{width:14,height:14,marginTop:2,border:isSel?"2px solid "+cat.c:"2px solid "+T.checkBorder,background:isSel?cat.c:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:fs(10),color:T.accentText,flexShrink:0}}>{isSel&&"\u2713"}</div>
                    <div style={{minWidth:0}}>
                      <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
                        <span style={{color:T.text,fontSize:fs(13),fontWeight:600}}>{p.name}</span>
                        <span style={{color:T.textFaintest,fontSize:fs(11)}}>{p.island}</span>
                        <span style={{fontSize:fs(9),padding:"1px 5px",background:cat.c+"18",color:cat.c,border:"1px solid "+cat.c+"33"}}>{CATEGORY_LABELS[p.category]}</span>
                      </div>
                      <div style={{color:T.textFaint,fontSize:fs(10),marginTop:2}}>{p.acres.toLocaleString()} ac | {p.acquisitionMethod} | {res.startYear}-{res.endYear} ({res.years} yrs)</div>
                      {isSel&&<div style={{color:T.textMuted,fontSize:fs(10),marginTop:2}}>Base: {fmtFull(res.annualBase)}/yr</div>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{color:isSel?T.accent:T.textFaintest,fontSize:isSel?fs(16):fs(14),fontWeight:700}}>{isSel?fmt(res.total):"--"}</div>
                      <div style={{color:T.textFaintest,fontSize:fs(10)}}>{p.acres.toLocaleString()} ac</div>
                    </div>
                  </div>
                  {/* Expandable detail */}
                  {isSel&&<div style={{padding:"0 14px 10px 42px"}}>
                    {p.notes&&<div style={{color:T.textFaintest,fontSize:fs(10),lineHeight:1.4,marginBottom:4}}>{p.notes}</div>}
                    {p.sources&&p.sources.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>
                      {p.sources.map(function(src,si){return src.url?<a key={si} href={src.url} target="_blank" rel="noopener noreferrer" onClick={function(e){e.stopPropagation()}} style={{fontSize:fs(9),color:T.link,textDecoration:"none",borderBottom:"1px dotted "+T.link+"44"}}>{src.label}</a>:<span key={si} style={{fontSize:fs(9),color:T.link}}>{src.label}</span>})}
                    </div>}
                    <button onClick={function(e){e.stopPropagation();setExpandedParcel(isExpanded?null:p.id)}} style={{background:"none",border:"1px solid "+T.borderLight,color:T.textFaint,padding:"2px 8px",fontSize:fs(9),cursor:"pointer",fontFamily:T.fontMono}}>{isExpanded?"Hide":"Show"} year-by-year</button>
                    {isExpanded&&<div style={{maxHeight:200,overflowY:"auto",background:T.bgExpand,border:"1px solid "+T.border,fontSize:fs(11),marginTop:6}}>
                      <div style={{display:"grid",gridTemplateColumns:"70px 1fr 110px",padding:"4px 10px",color:T.textFaintest,borderBottom:"1px solid "+T.border,position:"sticky",top:0,background:T.bgExpand,fontSize:fs(9),textTransform:"uppercase",letterSpacing:"0.06em"}}><div>Year</div><div></div><div style={{textAlign:"right"}}>Annual Rent</div></div>
                      {res.breakdown.map(function(row){var mx=res.breakdown[res.breakdown.length-1]?res.breakdown[res.breakdown.length-1].rent:1;return <div key={row.year} style={{display:"grid",gridTemplateColumns:"70px 1fr 110px",padding:"2px 10px",borderBottom:"1px solid "+T.borderDark}}><div style={{color:T.textMuted}}>{row.year}</div><div style={{position:"relative",height:8}}><div style={{position:"absolute",left:0,top:0,height:8,background:T.barBg,width:Math.min(100,(row.rent/mx)*100)+"%"}}/></div><div style={{color:T.text,textAlign:"right"}}>{fmtFull(row.rent)}</div></div>})}
                    </div>}
                  </div>}
                </div>
              })}
            </div>
          })}
        </section>

        {/* SAVE & SHARE */}
        <section id="section-save" style={{marginBottom:24,scrollMarginTop:52}}>
          <h3 style={{color:T.accent,fontSize:fs(12),letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12}}>Save & Share</h3>
          <div style={{background:T.bgAlt,border:"1px solid "+T.border,padding:20}}>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <input style={Object.assign({},I,{flex:1})} placeholder="Name this computation" value={saveName} onChange={function(e){setSaveName(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")saveComp()}}/>
              <button onClick={saveComp} style={B1}>Save</button>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <button onClick={function(){setShowSaved(!showSaved)}} style={B2}>{showSaved?"Hide":"View"} Saved ({saved.length})</button>
              <button onClick={genShare} style={B2}>Generate Share Sheet</button>
            </div>
            {showSaved&&(saved.length===0?<div style={{color:T.textFaintest,fontSize:fs(12),padding:16}}>No saved computations.</div>:saved.map(function(c){return <div key={c.id} style={{background:T.savedBg,border:"1px solid "+T.savedBorder,padding:"12px 16px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{color:T.accent,fontWeight:600,fontSize:fs(13)}}>{c.name}</div><div style={{color:T.textMuted,fontSize:fs(11)}}>{c.parcels.length} parcels | {c.method} | {c.rateLabel}</div><div style={{color:T.text,fontSize:fs(15),fontWeight:700}}>{fmt(c.totalOwed)}</div></div><div style={{display:"flex",gap:8}}><button onClick={function(){loadComp(c)}} style={Object.assign({},B2,{padding:"4px 10px",fontSize:fs(10)})}>Load</button><button onClick={function(){delComp(c.id)}} style={Object.assign({},B2,{padding:"4px 10px",fontSize:fs(10),color:T.textFaintest})}>x</button></div></div></div>}))}
            {shareText&&<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{color:T.textMuted,fontSize:fs(11)}}>Share Sheet</span><button onClick={function(){navigator.clipboard.writeText(shareText).catch(function(){})}} style={Object.assign({},B2,{padding:"4px 12px",fontSize:fs(10)})}>Copy</button></div><pre style={{background:T.shareBg,border:"1px solid "+T.border,padding:16,color:T.text,fontSize:fs(11),lineHeight:1.6,whiteSpace:"pre-wrap",maxHeight:400,overflowY:"auto",margin:0}}>{shareText}</pre></div>}
          </div>
        </section>

        {/* METHODOLOGY */}
        <section id="section-methodology" style={{scrollMarginTop:52}}>
          <h3 style={{color:T.accent,fontSize:fs(12),letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12}}>Methodology & Sources</h3>
          <div style={{background:T.bgAlt,border:"1px solid "+T.border,padding:20,color:T.textFaint,fontSize:fs(12),lineHeight:1.7}}>
            <p style={{margin:"0 0 12px"}}><strong style={{color:T.methodBg}}>Federal-owned parcel data.</strong> Section 5(d) parcels verified against Table 9 of "Public Land Policy in Hawaii: An Historical Analysis" (1969): EO 11167 (PTA, 84,057 ac), EO 11166 (Makua, 3,236 ac), EO 11165 (Fort Shafter, 0.5 ac). 65-year leases per Table 9: Lualualei (57.8 ac), Makua (1,509.6 ac), PTA (22,971 ac), Kawailewa (4,401.4 ac), Kahuku (1,150 ac), Kuaekala (86.4 ac). Pre-statehood C-2 set-asides include Schofield (17,725 ac), JBPHH (~12,200 ac), MCBH (~2,951 ac), Wheeler (~1,389 ac), Lualualei (~8,200 ac), Bellows (~1,500 ac), PMRF (~3,600 ac). C-1B at statehood: 117,412.74 ac. Total federal at statehood: 432,725.91 ac.</p>
            <p style={{margin:"0 0 12px"}}><strong style={{color:T.methodBg}}>Rental benchmarks.</strong> Hawaii Dept of Agriculture 2024 cash rents. USDA NASS/ERS 2025 Pacific region values. Cap-rate analysis (2.5%-10%) on assessed land values.</p>
            <p style={{margin:"0 0 12px"}}><strong style={{color:T.methodBg}}>CPI data.</strong> BLS CPI-U annual average (1982-84=100). Pre-1964 values from historical tables. 2025-2026 projected.</p>
            <p style={{margin:"0 0 12px"}}><strong style={{color:T.methodBg}}>Limitations.</strong> Estimates for analytical/advocacy purposes. Not legal advice or appraisal. Does not account for remediation costs, cultural destruction, UXO clearance, depleted uranium, Red Hill damages, or ecological losses.</p>
            <div style={{marginTop:16,borderTop:"1px solid "+T.borderLight,paddingTop:12}}>
              <div style={{color:T.methodBg,fontSize:fs(11),fontWeight:600,marginBottom:8}}>PRIMARY SOURCE DOCUMENTS</div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {PRIMARY_SOURCES.map(function(s,i){return s.url?<a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{color:T.link,fontSize:fs(11),textDecoration:"none",borderBottom:"1px dotted "+T.link+"44",lineHeight:1.7}}>{s.label}</a>:<span key={i} style={{color:T.link,fontSize:fs(11),lineHeight:1.7}}>{s.label}</span>})}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{borderTop:"1px solid "+T.border,padding:"16px 32px",textAlign:"center",color:T.textFooter,fontSize:fs(10)}}>
        Public domain analytical tool. Data from EO 11167, EO 11166, EO 11165, 1969 Historical Analysis, DLNR records, HMLUMP 2021, Federal Register. Not legal or financial advice.
      </footer>
    </div>
  );
}
