import { useState, useEffect, useRef, useCallback } from "react";

var NAV_ITEMS = [
  {id:"nav-summary",label:"Summary"},
  {id:"nav-params",label:"Parameters"},
  {id:"nav-parcels",label:"Parcels"},
  {id:"nav-save",label:"Save / Share"},
  {id:"nav-sources",label:"Sources"},
];

const PARCELS = [
  {id:"pta_federal",name:"Pohakuloa Training Area (Federal Parcel)",island:"Hawaii Island",acres:84057,tenure:"federal_owned",acquisitionYear:1964,acquisitionMethod:"Presidential Executive Order 11167",startYear:1964,cededLand:true,notes:"EO 11167 (LBJ, Aug 15, 1964) set aside 84,057 ac of Crown Land of Humu'ula and Government Lands of Kaohe/Pu'uanahulu. Largest single federal seizure of ceded land. Contains 51,000-ac impact area with depleted uranium contamination.",zoning:"conservation",category:"federal",sources:[{label:"EO 11167 Full Text",url:"https://www.presidency.ucsb.edu/documents/executive-order-11167-setting-aside-for-the-use-the-united-states-certain-public-lands-and"},{label:"Final EIS (2025)",url:"https://www.federalregister.gov/documents/2025/04/18/2025-06686/final-environmental-impact-statement-for-army-training-land-retention-at-phakuloa-training-area-in"},{label:"BLNR Rejects EIS (May 2025)",url:"https://dlnr.hawaii.gov/blog/2025/05/10/nr25-71/"},{label:"Record of Decision (Aug 2025)",url:"https://www.federalregister.gov/documents/2025/08/06/2025-14919/record-of-decision-for-army-training-land-retention-at-phakuloa-training-area-in-hawaii-id"},{label:"1969 Historical Analysis, Table 9",url:""}]},
  {id:"schofield",name:"Schofield Barracks & East Range",island:"Oahu",acres:17725,tenure:"federal_owned",acquisitionYear:1908,acquisitionMethod:"EO of July 20, 1899 (McKinley), retained per 5(d)",startYear:1908,cededLand:true,notes:"Established 1908 on ceded Crown/Government lands. Largest Army post in Hawaii. Home of 25th Infantry Division.",zoning:"military",category:"federal",sources:[{label:"Wikipedia (17,725 ac)",url:"https://en.wikipedia.org/wiki/Schofield_Barracks"},{label:"Military.com",url:"https://www.military.com/base-guide/schofield-barracksfort-shafter"}]},
  {id:"jbphh",name:"Joint Base Pearl Harbor-Hickam",island:"Oahu",acres:12200,tenure:"federal_owned",acquisitionYear:1887,acquisitionMethod:"Ceded at annexation (1898), retained per 5(d)",startYear:1898,cededLand:true,notes:"Pearl Harbor ceded 1887 (reciprocity treaty). Hickam est. 1935. 6 Superfund sites. Red Hill fuel spill contaminated drinking water (2021). Ke'awalau o Pu'uloa once supported 36+ fishponds.",zoning:"military",category:"federal",sources:[{label:"Cultural Survival",url:"https://www.culturalsurvival.org/publications/cultural-survival-quarterly/nation-under-gun-militarism-and-resistance-hawaii"},{label:"Hawaii Business",url:"https://www.hawaiibusiness.com/hawaiian-kingdom-ceded-lands-history-debate-solutions/"}]},
  {id:"mcbh",name:"Marine Corps Base Hawaii (Kane'ohe Bay / Mokapu)",island:"Oahu",acres:2951,tenure:"federal_owned",acquisitionYear:1941,acquisitionMethod:"Wartime seizure of ceded land, retained per 5(d)",startYear:1941,cededLand:true,notes:"Mokapu Peninsula. Hundreds of iwi kupuna unearthed by military housing construction. Ceded Crown lands seized during WWII.",zoning:"military",category:"federal",sources:[{label:"Cultural Survival",url:"https://www.culturalsurvival.org/publications/cultural-survival-quarterly/nation-under-gun-militarism-and-resistance-hawaii"}]},
  {id:"wheeler",name:"Wheeler Army Airfield",island:"Oahu",acres:1389,tenure:"federal_owned",acquisitionYear:1922,acquisitionMethod:"Federal reservation on ceded land, retained per 5(d)",startYear:1922,cededLand:true,notes:"Adjacent to Schofield Barracks. Est. 1922 on ceded Government lands. Primary Army aviation facility.",zoning:"military",category:"federal",sources:[{label:"HMLUMP 2021",url:"https://drive.google.com/file/d/1Uov0HevmHkfMG-ma-iEzxYgECHue67aY/view"}]},
  {id:"lualualei",name:"Naval Magazine Lualualei",island:"Oahu",acres:8200,tenure:"federal_owned",acquisitionYear:1931,acquisitionMethod:"Executive Order on ceded land, retained per 5(d)",startYear:1931,cededLand:true,notes:"Ammunition storage. 1,356 ac improperly withdrawn from Hawaiian Home Lands. 1999 land swap gave DHHL only 580 ac at Barber's Point — net loss of 770 ac from Native land base.",zoning:"military",category:"federal",sources:[{label:"Cultural Survival",url:"https://www.culturalsurvival.org/publications/cultural-survival-quarterly/nation-under-gun-militarism-and-resistance-hawaii"},{label:"HMLUMP 2021",url:"https://drive.google.com/file/d/1Uov0HevmHkfMG-ma-iEzxYgECHue67aY/view"}]},
  {id:"fort_shafter",name:"Fort Shafter / Camp Smith",island:"Oahu",acres:798,tenure:"federal_owned",acquisitionYear:1907,acquisitionMethod:"EO of July 20, 1899; EO 2521 (1917); EO 11165 (1964, +0.5 ac)",startYear:1907,cededLand:true,notes:"Fort Shafter (~574 ac) est. 1907, HQ US Army Pacific. Camp Smith (224 ac) HQ US Indo-Pacific Command. EO 11165 set aside 0.5 additional ac in 1964.",zoning:"military",category:"federal",sources:[{label:"EO 11165 (1964)",url:"https://www.presidency.ucsb.edu/documents/executive-order-11165-setting-aside-for-the-use-the-united-states-certain-public-lands-and"},{label:"EO 2521 / 10404 (Shafter)",url:"https://www.presidency.ucsb.edu/documents/executive-order-10404-resorting-certain-land-reserved-for-military-purposes-the-territory"}]},
  {id:"pmrf_federal",name:"Pacific Missile Range Facility (Federal Parcel)",island:"Kauai",acres:3600,tenure:"federal_owned",acquisitionYear:1940,acquisitionMethod:"Wartime seizure, retained per 5(d)",startYear:1940,cededLand:true,notes:"Barking Sands. Navy's primary missile testing range in Pacific. Includes oceanfront land at Nohili.",zoning:"military",category:"federal",sources:[{label:"OHA: Military Leased Lands",url:"https://www.oha.org/aloha-aina/"},{label:"HMLUMP 2021",url:"https://drive.google.com/file/d/1Uov0HevmHkfMG-ma-iEzxYgECHue67aY/view"}]},
  {id:"makua_federal",name:"Makua Military Reservation (Federal Parcel)",island:"Oahu",acres:3236,tenure:"federal_owned",acquisitionYear:1943,acquisitionMethod:"EO 11166 (Aug 15, 1964) — 3,236 ac of Government Lands of Makua and Kahanahaiki",startYear:1943,cededLand:true,notes:"Sacred valley. Families forcibly evicted during WWII — never allowed return. Live-fire suspended since 2004 per court order.",zoning:"conservation",category:"federal",sources:[{label:"EO 11166 (1964)",url:"https://www.presidency.ucsb.edu/documents/executive-order-11166-setting-aside-for-the-use-the-united-states-certain-public-lands-and"},{label:"1969 Historical Analysis, Table 9",url:""},{label:"Malama Makua",url:"https://www.malamamakua.org/"},{label:"Noho Hewa",url:"https://nohohewa.com/occupied-areas/"}]},
  {id:"bellows_federal",name:"Bellows Air Force Station (Federal Parcel)",island:"Oahu",acres:1500,tenure:"federal_owned",acquisitionYear:1917,acquisitionMethod:"Federal reservation on ceded/HHCA land, retained per 5(d)",startYear:1917,cededLand:true,notes:"Waimanalo beachfront. Includes land improperly withdrawn from Hawaiian Home Lands. Some of Oahu's most valuable beachfront.",zoning:"mixed",category:"federal",sources:[{label:"Bellows AFS ROD (1996)",url:"https://www.govinfo.gov/content/pkg/FR-1996-06-05/html/96-14067.htm"},{label:"HMLUMP 2021",url:"https://drive.google.com/file/d/1Uov0HevmHkfMG-ma-iEzxYgECHue67aY/view"}]},
  {id:"kahoolawe",name:"Kaho'olawe (Former Federal — Returned 1994)",island:"Kaho'olawe",acres:28800,tenure:"returned",acquisitionYear:1941,acquisitionMethod:"Navy seizure (1941), returned to State 1994",startYear:1941,endOverride:1994,cededLand:true,notes:"Sacred island seized by Navy 1941. Bombed 53 years. Returned 1994. Congress provided $400M for partial cleanup (75% surface). Entire island on National Register. Still largely unusable.",zoning:"conservation",category:"returned",sources:[{label:"EO 10436 (Kahoolawe)",url:"https://www.presidency.ucsb.edu/documents/executive-order-10436-reserving-kahoolawe-island-territory-hawaii-for-the-use-the-united"},{label:"Noho Hewa",url:"https://nohohewa.com/occupied-areas/"},{label:"Wikipedia: Ceded Lands",url:"https://en.wikipedia.org/wiki/Ceded_lands_(Hawaii)"}]},
  {id:"pta_leased",name:"Pohakuloa Training Area (State Lease)",island:"Hawaii Island",acres:22971,tenure:"state_leased",acquisitionYear:1964,acquisitionMethod:"65-year lease from DLNR at $1 total",startYear:1964,leaseEnd:2029,leaseCost:1,cededLand:true,notes:"22,971 ac (3 parcels). Connective tissue between federal parcels. Conservation-zoned. BLNR rejected FEIS May 2025.",zoning:"conservation",category:"leased",sources:[{label:"DLNR 2026 Leg Report",url:"https://files.hawaii.gov/dlnr/reports-to-the-legislature/2026/LD26-Comprehensive-Economic-Analysis-of-All-Military-Leased-Lands-FY25.pdf"},{label:"BLNR Rejects EIS",url:"https://dlnr.hawaii.gov/blog/2025/05/10/nr25-71/"},{label:"Ka Wai Ola",url:"https://kawaiola.news/aina/the-army-and-pohakuloa/"},{label:"Fed Register EIS (2020)",url:"https://www.federalregister.gov/documents/2020/09/23/2020-20966/environmental-impact-statement-for-army-training-land-retention-at-phakuloa-training-area-in-hawaii"}]},
  {id:"makua_leased",name:"Makua Military Reservation (State Lease)",island:"Oahu",acres:1510,tenure:"state_leased",acquisitionYear:1964,acquisitionMethod:"65-year lease from DLNR at $1 total (2 parcels)",startYear:1964,leaseEnd:2029,leaseCost:1,cededLand:true,notes:"1,509.6 ac (2 parcels) per 1969 Table 9. DLNR 2026 shows ~782 ac in current tracts. BLNR rejected EIS June 2025.",zoning:"conservation",category:"leased",sources:[{label:"DLNR 2026 Leg Report",url:"https://files.hawaii.gov/dlnr/reports-to-the-legislature/2026/LD26-Comprehensive-Economic-Analysis-of-All-Military-Leased-Lands-FY25.pdf"},{label:"EO 11166 (Makua)",url:"https://www.presidency.ucsb.edu/documents/executive-order-11166-setting-aside-for-the-use-the-united-states-certain-public-lands-and"}]},
  {id:"poamoho",name:"Kawailoa-Poamoho Training Area (State Lease)",island:"Oahu",acres:4401,tenure:"state_leased",acquisitionYear:1964,acquisitionMethod:"65-year lease from DLNR at $1 total (2 parcels)",startYear:1964,leaseEnd:2029,leaseCost:1,cededLand:true,notes:"'Kawailewa' in 1964 lease (4,401.36 ac, 2 parcels) per 1969 Table 9. DLNR 2026: Poamoho (~3,170 ac) and NAR (~1,220 ac).",zoning:"conservation",category:"leased",sources:[{label:"DLNR 2026 Leg Report",url:"https://files.hawaii.gov/dlnr/reports-to-the-legislature/2026/LD26-Comprehensive-Economic-Analysis-of-All-Military-Leased-Lands-FY25.pdf"},{label:"Big Island Now (Nov 2025)",url:"https://bigislandnow.com/2025/11/28/military-leased-lands-panel-begins-laying-groundwork-for-future-talks-with-u-s-army/"}]},
  {id:"kahuku",name:"Kahuku Training Area (State Lease)",island:"Oahu",acres:1150,tenure:"state_leased",acquisitionYear:1964,acquisitionMethod:"65-year lease from DLNR at $1 total (2 parcels)",startYear:1964,leaseEnd:2029,leaseCost:1,cededLand:true,notes:"1,150 ac (2 parcels) per 1969 Table 9. North Shore Oahu.",zoning:"conservation",category:"leased",sources:[{label:"DLNR 2026 Leg Report",url:"https://files.hawaii.gov/dlnr/reports-to-the-legislature/2026/LD26-Comprehensive-Economic-Analysis-of-All-Military-Leased-Lands-FY25.pdf"},{label:"HPR: 30K Acres",url:"https://www.hawaiipublicradio.org/the-conversation/2021-08-25/military-leaders-30k-acres-of-land-national-security-state-training-diplomacy"}]},
  {id:"pmrf_leased",name:"Pacific Missile Range Facility (State Lease)",island:"Kauai",acres:2385,tenure:"state_leased",acquisitionYear:1964,acquisitionMethod:"65-year lease from DLNR at $1 total",startYear:1964,leaseEnd:2029,leaseCost:1,cededLand:true,notes:"Barking Sands. State-leased portion adjacent to federal parcel.",zoning:"military",category:"leased",sources:[{label:"OHA: Military Leased Lands",url:"https://www.oha.org/aloha-aina/"},{label:"HMLUMP 2021",url:"https://drive.google.com/file/d/1Uov0HevmHkfMG-ma-iEzxYgECHue67aY/view"}]},
  {id:"kuaekala",name:"Kuaekala, Oahu (State Lease)",island:"Oahu",acres:86,tenure:"state_leased",acquisitionYear:1964,acquisitionMethod:"65-year lease from DLNR at $1 total (3 parcels)",startYear:1964,leaseEnd:2029,leaseCost:1,cededLand:true,notes:"86.4 ac (3 parcels) per 1969 Table 9. Waianae range.",zoning:"conservation",category:"leased",sources:[{label:"1969 Historical Analysis, Table 9",url:""},{label:"DLNR 2026 Leg Report",url:"https://files.hawaii.gov/dlnr/reports-to-the-legislature/2026/LD26-Comprehensive-Economic-Analysis-of-All-Military-Leased-Lands-FY25.pdf"}]},
  {id:"lualualei_leased",name:"Lualualei, Oahu (State Lease)",island:"Oahu",acres:58,tenure:"state_leased",acquisitionYear:1964,acquisitionMethod:"65-year lease from DLNR at $1 total (2 parcels)",startYear:1964,leaseEnd:2029,leaseCost:1,cededLand:true,notes:"57.825 ac (2 parcels) per 1969 Table 9. Adjacent to federal Naval Magazine Lualualei (8,200 ac).",zoning:"military",category:"leased",sources:[{label:"1969 Historical Analysis, Table 9",url:""},{label:"DLNR 2026 Leg Report",url:"https://files.hawaii.gov/dlnr/reports-to-the-legislature/2026/LD26-Comprehensive-Economic-Analysis-of-All-Military-Leased-Lands-FY25.pdf"}]},
];

const BENCHMARKS = {
  conservation_low:{label:"Pasture (HI DoA 2024)",rate:8.7,source:"HI Dept of Agriculture, 2024 avg cash rent for pasture: $8.70/ac"},
  agricultural:{label:"Cropland (HI DoA 2024)",rate:326,source:"HI Dept of Agriculture, 2024 avg cash rent for cropland: $326/ac"},
  agricultural_irrigated:{label:"Irrigated Cropland (HI DoA 2024)",rate:452,source:"HI Dept of Agriculture, 2024 avg cash rent for irrigated cropland: $452/ac"},
  usda_pacific:{label:"USDA Pacific Cropland (10% cap)",rate:983,source:"USDA ERS 2025 Pacific region cropland: $9,830/ac x 10% cap rate"},
  market_median:{label:"Median HI Land Value (10% cap)",rate:1136,source:"Land.com median HI price/ac $11,363 x 10% cap rate"},
  market_ag_tract:{label:"Ag Tract Value (10% cap)",rate:740,source:"Large ag tract avg $7,400/ac (2020) x 10% cap rate"},
  market_high:{label:"Avg HI Land Value (2.5% cap)",rate:5060,source:"Avg $202,400/ac x 2.5% cap rate (reflects dev potential)"},
  custom:{label:"Custom Rate",rate:0,source:"User-defined"},
};

const CPI={1887:8.2,1898:8.6,1900:8.8,1907:9.6,1908:9.5,1917:12.8,1922:16.8,1931:15.2,1935:13.7,1940:14.0,1941:14.7,1943:17.3,1956:27.2,1964:31.0,1965:31.5,1966:32.4,1967:33.4,1968:34.8,1969:36.7,1970:38.8,1971:40.5,1972:41.8,1973:44.4,1974:49.3,1975:53.8,1976:56.9,1977:60.6,1978:65.2,1979:72.6,1980:82.4,1981:90.9,1982:96.5,1983:99.6,1984:103.9,1985:107.6,1986:109.6,1987:113.6,1988:118.3,1989:124.0,1990:130.7,1991:136.2,1992:140.3,1993:144.5,1994:148.2,1995:152.4,1996:156.9,1997:160.5,1998:163.0,1999:166.6,2000:172.2,2001:177.1,2002:179.9,2003:184.0,2004:188.9,2005:195.3,2006:201.6,2007:207.3,2008:215.3,2009:214.5,2010:218.1,2011:224.9,2012:229.6,2013:233.0,2014:236.7,2015:237.0,2016:240.0,2017:245.1,2018:251.1,2019:255.7,2020:258.8,2021:271.0,2022:292.7,2023:304.7,2024:313.5,2025:320.0,2026:326.0};
function getCPI(y){if(CPI[y])return CPI[y];var ks=Object.keys(CPI).map(Number).sort(function(a,b){return a-b});for(var i=0;i<ks.length-1;i++){if(y>ks[i]&&y<ks[i+1]){var t=(y-ks[i])/(ks[i+1]-ks[i]);return CPI[ks[i]]+t*(CPI[ks[i+1]]-CPI[ks[i]])}}return CPI[ks[ks.length-1]]}
function fmt(n){if(n>=1e12)return "$"+(n/1e12).toFixed(2)+"T";if(n>=1e9)return "$"+(n/1e9).toFixed(2)+"B";if(n>=1e6)return "$"+(n/1e6).toFixed(2)+"M";if(n>=1e3)return "$"+(n/1e3).toFixed(1)+"K";return "$"+n.toFixed(2)}
function fmtFull(n){return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
function compute(p,rate,method,interest,sO,eO){var s=sO||p.startYear,e=eO||p.endOverride||2026,yrs=e-s;if(yrs<=0)return{total:0,breakdown:[],years:0,annualBase:0,startYear:s,endYear:e};var ab=p.acres*rate,bd=[],tot=0;for(var y=s;y<e;y++){var r;if(method==="simple")r=ab;else if(method==="compound")r=ab*Math.pow(1+interest/100,y-s);else r=ab*(getCPI(y)/getCPI(s));bd.push({year:y,rent:r});tot+=r}return{total:tot,breakdown:bd,years:yrs,annualBase:ab,startYear:s,endYear:e}}

var storage = {
  get: function(key) { try { var v = localStorage.getItem(key); return v ? { value: v } : null; } catch(e) { return null; } },
  set: function(key, value) { try { localStorage.setItem(key, value); } catch(e) {} },
};

var ALL_IDS = PARCELS.map(function(p){return p.id});
var CATS = [{k:"federal",h:"Federal-Owned Seized Ceded Lands",c:"#b44"},{k:"leased",h:"State-Leased Ceded Lands ($1 / 65 years)",c:"#c8a96e"},{k:"returned",h:"Returned Lands (Historical)",c:"#668"},{k:"custom",h:"Custom Parcels",c:"#6a8"}];
var catColorMap={federal:"#b44",leased:"#c8a96e",returned:"#668",custom:"#6a8"};
var catLabelMap={federal:"FEDERAL-OWNED",leased:"STATE LEASE",returned:"RETURNED",custom:"CUSTOM"};

export default function App(){
  var [selected,setSelected]=useState(ALL_IDS);
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
  var [activeNav,setActiveNav]=useState("nav-summary");
  var navRef=useRef(null);
  var sectionRefs=useRef({});

  var scrollTo=function(id){
    var el=sectionRefs.current[id];
    if(el){
      var navH=navRef.current?navRef.current.offsetHeight:48;
      var top=el.getBoundingClientRect().top+window.scrollY-navH-12;
      window.scrollTo({top:top,behavior:"smooth"});
    }
  };

  useEffect(function(){
    var handler=function(){
      var navH=navRef.current?navRef.current.offsetHeight:48;
      var best=null;var bestDist=Infinity;
      NAV_ITEMS.forEach(function(item){
        var el=sectionRefs.current[item.id];
        if(el){var r=el.getBoundingClientRect();var d=Math.abs(r.top-navH-20);if(r.top<=navH+80&&d<bestDist){bestDist=d;best=item.id}}
      });
      if(best)setActiveNav(best);
    };
    window.addEventListener("scroll",handler,{passive:true});
    return function(){window.removeEventListener("scroll",handler)};
  },[]);
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

  useEffect(function(){(async function(){try{var r=storage.get("br3-saved");if(r&&r.value)setSaved(JSON.parse(r.value))}catch(e){}try{var r2=storage.get("br3-custom");if(r2&&r2.value){var cp=JSON.parse(r2.value);setCustomParcels(cp);setSelected(function(prev){return ALL_IDS.concat(cp.map(function(p){return p.id}))})}}catch(e){}})()},[]);

  var allParcels=[].concat(PARCELS,customParcels);
  var rate=rateKey==="custom"?customRate:BENCHMARKS[rateKey].rate;
  var rateLabel=rateKey==="custom"?"Custom ($"+customRate+"/ac/yr)":BENCHMARKS[rateKey].label;

  // Build a lookup of results for all parcels (selected or not)
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

  var I={background:"#111",border:"1px solid #333",color:"#e0d5c1",padding:"6px 10px",fontFamily:"'DM Mono',monospace",fontSize:13,width:"100%",outline:"none",boxSizing:"border-box"};
  var S=Object.assign({},I,{appearance:"none",WebkitAppearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center",paddingRight:28,cursor:"pointer"});
  var L={color:"#888",fontSize:11,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4,display:"block"};
  var B1={background:"#c8a96e",color:"#000",border:"none",padding:"8px 18px",fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:"0.05em",textTransform:"uppercase"};
  var B2={background:"transparent",color:"#c8a96e",border:"1px solid #c8a96e",padding:"8px 18px",fontFamily:"'DM Mono',monospace",fontSize:12,cursor:"pointer",letterSpacing:"0.05em",textTransform:"uppercase"};

  return (
    <div style={{minHeight:"100vh",background:"#0d0d0d",color:"#e0d5c1",fontFamily:"'DM Mono','IBM Plex Mono','Courier New',monospace"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Serif+Display&display=swap" rel="stylesheet"/>

      <header style={{borderBottom:"1px solid #2a2a2a",padding:"28px 32px",background:"linear-gradient(180deg,#111 0%,#0d0d0d 100%)"}}>
        <div style={{maxWidth:1020,margin:"0 auto"}}>
          <div style={{color:"#c8a96e",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>Financial Analysis - Public Record</div>
          <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:28,fontWeight:400,color:"#e0d5c1",margin:0}}>Back Rent Computation</h1>
          <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:18,fontWeight:400,color:"#888",margin:"4px 0 0"}}>Federal-Seized & State-Leased Ceded Public Trust Lands - Hawaii</h2>
          <div style={{color:"#666",fontSize:11,marginTop:12,lineHeight:1.6,maxWidth:720}}>At statehood (1959), federal agencies controlled 432,726 acres of Hawaii's public domain. Under Section 5(d) of the Admission Act, 87,237 acres were seized by executive order and 30,176 acres placed under $1/65-year leases. HMLUMP 2021 reports 221,981 total military-controlled acres statewide.</div>
        </div>
      </header>


      {/* STICKY NAV */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:"#0d0d0dee",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderBottom:"1px solid #1a1a1a",padding:"0 32px"}}>
        <div style={{maxWidth:1020,margin:"0 auto",display:"flex",gap:0,overflow:"auto"}}>
          {NAV_ITEMS.map(function(n){
            var isActive=activeNav===n.id;
            return <button key={n.id} onClick={function(){scrollTo(n.id)}} style={{
              background:"none",border:"none",borderBottom:isActive?"2px solid #c8a96e":"2px solid transparent",
              color:isActive?"#c8a96e":"#666",padding:"10px 16px",cursor:"pointer",
              fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.06em",
              textTransform:"uppercase",whiteSpace:"nowrap",transition:"all 0.15s",
            }}>{n.label}</button>
          })}
          <div style={{flex:1}}/>
          <div style={{display:"flex",alignItems:"center",padding:"0 4px"}}>
            <span style={{color:"#c8a96e",fontSize:13,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{fmt(grandTotal)}</span>
            <span style={{color:"#555",fontSize:10,marginLeft:8}}>{totalAcres.toLocaleString()} ac</span>
          </div>
        </div>
      </nav>

      <main style={{maxWidth:1020,margin:"0 auto",padding:"24px 32px 60px"}}>

        {/* SUMMARY BAR — always visible */}
        <div ref={function(el){sectionRefs.current["nav-summary"]=el}} id="section-summary" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:1,background:"#1a1a1a",border:"1px solid #1a1a1a",marginBottom:24,scrollMarginTop:52}}>
          {[{l:"Federal-Owned",v:fedAcres.toLocaleString()+" ac"},{l:"State-Leased",v:leaseAcres.toLocaleString()+" ac"},{l:"Returned",v:retAcres.toLocaleString()+" ac"},{l:"Total Acreage",v:totalAcres.toLocaleString()+" ac"},{l:"Total Paid",v:fmtFull(totalPaid)},{l:"Back Rent Owed",v:fmt(grandTotal),hi:true}].map(function(x,i){
            return <div key={i} style={{background:"#0f0f0f",padding:"14px 10px",textAlign:"center"}}>
              <div style={{color:"#666",fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{x.l}</div>
              <div style={{color:x.hi?"#c8a96e":"#e0d5c1",fontSize:x.hi?22:15,fontWeight:700}}>{x.v}</div>
            </div>
          })}
        </div>

        {/* PARAMETERS */}
        <section ref={function(el){sectionRefs.current["nav-params"]=el}} id="section-parameters" style={{marginBottom:24,scrollMarginTop:52}}>
          <h3 style={{color:"#c8a96e",fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12}}>Parameters</h3>
          <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",padding:20}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:16}}>
              <div>
                <label style={L}>Rental Rate Benchmark</label>
                <select style={S} value={rateKey} onChange={function(e){setRateKey(e.target.value)}}>
                  {Object.keys(BENCHMARKS).map(function(k){var v=BENCHMARKS[k];return <option key={k} value={k}>{v.label}{k!=="custom"?" ($"+v.rate+"/ac/yr)":""}</option>})}
                </select>
                <div style={{color:"#555",fontSize:10,marginTop:4}}>{BENCHMARKS[rateKey].source}</div>
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
              <div style={{display:"flex",alignItems:"flex-end"}}><div style={{color:"#555",fontSize:11,lineHeight:1.5,paddingBottom:6}}>Leave blank to use each parcel's acquisition date.</div></div>
            </div>
          </div>
        </section>

        {/* COMBINED PARCEL LIST + RESULTS */}
        <section ref={function(el){sectionRefs.current["nav-parcels"]=el}} id="section-parcels" style={{marginBottom:24,scrollMarginTop:52}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <h3 style={{color:"#c8a96e",fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase",margin:0}}>Parcels & Computed Back Rent</h3>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[["all","All"],["federal","Federal"],["leased","Leased"],["returned","Returned"]].map(function(pair){
                return <button key={pair[0]} onClick={function(){setFilter(pair[0])}} style={Object.assign({},B2,{padding:"4px 10px",fontSize:10,background:filter===pair[0]?"#c8a96e11":"transparent"})}>{pair[1]}</button>
              })}
              <button onClick={function(){setSelected(filtered.map(function(p){return p.id}))}} style={Object.assign({},B2,{padding:"4px 10px",fontSize:10})}>Select Shown</button>
              <button onClick={function(){setSelected([])}} style={Object.assign({},B2,{padding:"4px 10px",fontSize:10})}>None</button>
              <button onClick={function(){setShowAdd(!showAdd)}} style={Object.assign({},B2,{padding:"4px 10px",fontSize:10})}>+ Custom</button>
            </div>
          </div>

          {showAdd&&<div style={{background:"#141410",border:"1px solid #2a2a2a",padding:16,marginBottom:12}}>
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
                <div style={{color:cat.c,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em"}}>{cat.h}</div>
                <div style={{display:"flex",gap:16,alignItems:"baseline"}}>
                  <span style={{color:"#666",fontSize:11}}>{catAcres.toLocaleString()} ac</span>
                  <span style={{color:cat.c,fontSize:16,fontWeight:700}}>{fmt(catTotal)}</span>
                </div>
              </div>

              {parcelsInCat.map(function(p){
                var isSel=selected.includes(p.id);
                var res=resultMap[p.id];
                var isExpanded=expandedParcel===p.id;
                return <div key={p.id} style={{background:isSel?"#12110e":"#0a0a0a",border:"1px solid "+(isSel?cat.c+"33":"#151515"),borderLeft:"2px solid "+(isSel?cat.c:"#222"),marginBottom:2,transition:"all 0.1s"}}>
                  <div onClick={function(){toggle(p.id)}} style={{display:"grid",gridTemplateColumns:"28px 1fr 120px",alignItems:"start",padding:"10px 14px",cursor:"pointer",gap:8}}>
                    <div style={{width:14,height:14,marginTop:2,border:isSel?"2px solid "+cat.c:"2px solid #444",background:isSel?cat.c:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#000",flexShrink:0}}>{isSel&&"\u2713"}</div>
                    <div style={{minWidth:0}}>
                      <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
                        <span style={{color:"#e0d5c1",fontSize:13,fontWeight:600}}>{p.name}</span>
                        <span style={{color:"#555",fontSize:11}}>{p.island}</span>
                        <span style={{fontSize:9,padding:"1px 5px",background:cat.c+"18",color:cat.c,border:"1px solid "+cat.c+"33"}}>{catLabelMap[p.category]}</span>
                      </div>
                      <div style={{color:"#666",fontSize:10,marginTop:2}}>{p.acres.toLocaleString()} ac | {p.acquisitionMethod} | {res.startYear}-{res.endYear} ({res.years} yrs)</div>
                      {isSel&&<div style={{color:"#888",fontSize:10,marginTop:2}}>Base: {fmtFull(res.annualBase)}/yr</div>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{color:isSel?"#c8a96e":"#555",fontSize:isSel?16:14,fontWeight:700}}>{isSel?fmt(res.total):"--"}</div>
                      <div style={{color:"#555",fontSize:10}}>{p.acres.toLocaleString()} ac</div>
                    </div>
                  </div>
                  {/* Expandable detail */}
                  {isSel&&<div style={{padding:"0 14px 10px 42px"}}>
                    {p.notes&&<div style={{color:"#444",fontSize:10,lineHeight:1.4,marginBottom:4}}>{p.notes}</div>}
                    {p.sources&&p.sources.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>
                      {p.sources.map(function(src,si){return src.url?<a key={si} href={src.url} target="_blank" rel="noopener noreferrer" onClick={function(e){e.stopPropagation()}} style={{fontSize:9,color:"#7a8a6e",textDecoration:"none",borderBottom:"1px dotted #7a8a6e44"}}>{src.label}</a>:<span key={si} style={{fontSize:9,color:"#7a8a6e"}}>{src.label}</span>})}
                    </div>}
                    <button onClick={function(e){e.stopPropagation();setExpandedParcel(isExpanded?null:p.id)}} style={{background:"none",border:"1px solid #2a2a2a",color:"#666",padding:"2px 8px",fontSize:9,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>{isExpanded?"Hide":"Show"} year-by-year</button>
                    {isExpanded&&<div style={{maxHeight:200,overflowY:"auto",background:"#080808",border:"1px solid #1a1a1a",fontSize:11,marginTop:6}}>
                      <div style={{display:"grid",gridTemplateColumns:"70px 1fr 110px",padding:"4px 10px",color:"#555",borderBottom:"1px solid #1a1a1a",position:"sticky",top:0,background:"#080808",fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em"}}><div>Year</div><div></div><div style={{textAlign:"right"}}>Annual Rent</div></div>
                      {res.breakdown.map(function(row){var mx=res.breakdown[res.breakdown.length-1]?res.breakdown[res.breakdown.length-1].rent:1;return <div key={row.year} style={{display:"grid",gridTemplateColumns:"70px 1fr 110px",padding:"2px 10px",borderBottom:"1px solid #111"}}><div style={{color:"#888"}}>{row.year}</div><div style={{position:"relative",height:8}}><div style={{position:"absolute",left:0,top:0,height:8,background:"#c8a96e22",width:Math.min(100,(row.rent/mx)*100)+"%"}}/></div><div style={{color:"#e0d5c1",textAlign:"right"}}>{fmtFull(row.rent)}</div></div>})}
                    </div>}
                  </div>}
                </div>
              })}
            </div>
          })}
        </section>

        {/* SAVE & SHARE */}
        <section ref={function(el){sectionRefs.current["nav-save"]=el}} id="section-save" style={{marginBottom:24,scrollMarginTop:52}}>
          <h3 style={{color:"#c8a96e",fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12}}>Save & Share</h3>
          <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",padding:20}}>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <input style={Object.assign({},I,{flex:1})} placeholder="Name this computation" value={saveName} onChange={function(e){setSaveName(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")saveComp()}}/>
              <button onClick={saveComp} style={B1}>Save</button>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <button onClick={function(){setShowSaved(!showSaved)}} style={B2}>{showSaved?"Hide":"View"} Saved ({saved.length})</button>
              <button onClick={genShare} style={B2}>Generate Share Sheet</button>
            </div>
            {showSaved&&(saved.length===0?<div style={{color:"#555",fontSize:12,padding:16}}>No saved computations.</div>:saved.map(function(c){return <div key={c.id} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",padding:"12px 16px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{color:"#c8a96e",fontWeight:600,fontSize:13}}>{c.name}</div><div style={{color:"#888",fontSize:11}}>{c.parcels.length} parcels | {c.method} | {c.rateLabel}</div><div style={{color:"#e0d5c1",fontSize:15,fontWeight:700}}>{fmt(c.totalOwed)}</div></div><div style={{display:"flex",gap:8}}><button onClick={function(){loadComp(c)}} style={Object.assign({},B2,{padding:"4px 10px",fontSize:10})}>Load</button><button onClick={function(){delComp(c.id)}} style={Object.assign({},B2,{padding:"4px 10px",fontSize:10,color:"#664"})}>x</button></div></div></div>}))}
            {shareText&&<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{color:"#888",fontSize:11}}>Share Sheet</span><button onClick={function(){navigator.clipboard.writeText(shareText).catch(function(){})}} style={Object.assign({},B2,{padding:"4px 12px",fontSize:10})}>Copy</button></div><pre style={{background:"#0a0a0a",border:"1px solid #1a1a1a",padding:16,color:"#e0d5c1",fontSize:11,lineHeight:1.6,whiteSpace:"pre-wrap",maxHeight:400,overflowY:"auto",margin:0}}>{shareText}</pre></div>}
          </div>
        </section>

        {/* METHODOLOGY */}
        <section ref={function(el){sectionRefs.current["nav-sources"]=el}} id="section-methodology" style={{scrollMarginTop:52}}>
          <h3 style={{color:"#c8a96e",fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12}}>Methodology & Sources</h3>
          <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",padding:20,color:"#777",fontSize:12,lineHeight:1.7}}>
            <p style={{margin:"0 0 12px"}}><strong style={{color:"#999"}}>Federal-owned parcel data.</strong> Section 5(d) parcels verified against Table 9 of "Public Land Policy in Hawaii: An Historical Analysis" (1969): EO 11167 (PTA, 84,057 ac), EO 11166 (Makua, 3,236 ac), EO 11165 (Fort Shafter, 0.5 ac). 65-year leases per Table 9: Lualualei (57.8 ac), Makua (1,509.6 ac), PTA (22,971 ac), Kawailewa (4,401.4 ac), Kahuku (1,150 ac), Kuaekala (86.4 ac). Pre-statehood C-2 set-asides include Schofield (17,725 ac), JBPHH (~12,200 ac), MCBH (~2,951 ac), Wheeler (~1,389 ac), Lualualei (~8,200 ac), Bellows (~1,500 ac), PMRF (~3,600 ac). C-1B at statehood: 117,412.74 ac. Total federal at statehood: 432,725.91 ac.</p>
            <p style={{margin:"0 0 12px"}}><strong style={{color:"#999"}}>Rental benchmarks.</strong> Hawaii Dept of Agriculture 2024 cash rents. USDA NASS/ERS 2025 Pacific region values. Cap-rate analysis (2.5%-10%) on assessed land values.</p>
            <p style={{margin:"0 0 12px"}}><strong style={{color:"#999"}}>CPI data.</strong> BLS CPI-U annual average (1982-84=100). Pre-1964 values from historical tables. 2025-2026 projected.</p>
            <p style={{margin:"0 0 12px"}}><strong style={{color:"#999"}}>Limitations.</strong> Estimates for analytical/advocacy purposes. Not legal advice or appraisal. Does not account for remediation costs, cultural destruction, UXO clearance, depleted uranium, Red Hill damages, or ecological losses.</p>
            <div style={{marginTop:16,borderTop:"1px solid #222",paddingTop:12}}>
              <div style={{color:"#999",fontSize:11,fontWeight:600,marginBottom:8}}>PRIMARY SOURCE DOCUMENTS</div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {[
                  {l:"1969 Public Land Policy in Hawaii: An Historical Analysis — Table 9",u:""},
                  {l:"EO 11167: PTA (84,057 ac)",u:"https://www.presidency.ucsb.edu/documents/executive-order-11167-setting-aside-for-the-use-the-united-states-certain-public-lands-and"},
                  {l:"EO 11166: Makua (3,236 ac)",u:"https://www.presidency.ucsb.edu/documents/executive-order-11166-setting-aside-for-the-use-the-united-states-certain-public-lands-and"},
                  {l:"EO 11165: Fort Shafter",u:"https://www.presidency.ucsb.edu/documents/executive-order-11165-setting-aside-for-the-use-the-united-states-certain-public-lands-and"},
                  {l:"EO 10436: Kahoolawe",u:"https://www.presidency.ucsb.edu/documents/executive-order-10436-reserving-kahoolawe-island-territory-hawaii-for-the-use-the-united"},
                  {l:"Admission Act Sec 5(b), 5(d), 5(f)",u:"https://www.law.cornell.edu/topn/hawaii_admission_act"},
                  {l:"PL 103-150: Apology Resolution (1993)",u:"https://www.congress.gov/bill/103rd-congress/senate-joint-resolution/19/text"},
                  {l:"DLNR Report to 33rd Legislature (2026)",u:"https://files.hawaii.gov/dlnr/reports-to-the-legislature/2026/LD26-Comprehensive-Economic-Analysis-of-All-Military-Leased-Lands-FY25.pdf"},
                  {l:"HMLUMP 2021",u:"https://drive.google.com/file/d/1Uov0HevmHkfMG-ma-iEzxYgECHue67aY/view"},
                  {l:"Final EIS for PTA Retention (Apr 2025)",u:"https://www.federalregister.gov/documents/2025/04/18/2025-06686/final-environmental-impact-statement-for-army-training-land-retention-at-phakuloa-training-area-in"},
                  {l:"PTA Record of Decision (Aug 2025)",u:"https://www.federalregister.gov/documents/2025/08/06/2025-14919/record-of-decision-for-army-training-land-retention-at-phakuloa-training-area-in-hawaii-id"},
                  {l:"BLNR Rejects PTA EIS (May 2025)",u:"https://dlnr.hawaii.gov/blog/2025/05/10/nr25-71/"},
                  {l:"OHA: Military Leased Lands",u:"https://www.oha.org/aloha-aina/"},
                  {l:"HR 199 (2025)",u:"https://data.capitol.hawaii.gov/sessions/session2025/bills/HR199_.HTM"},
                  {l:"Noho Hewa: Occupied Areas",u:"https://nohohewa.com/occupied-areas/"},
                  {l:"Cultural Survival: Nation Under The Gun",u:"https://www.culturalsurvival.org/publications/cultural-survival-quarterly/nation-under-gun-militarism-and-resistance-hawaii"},
                  {l:"HI GIS: DoD Lands Layer (2025)",u:"https://geodata.hawaii.gov/arcgis/rest/services/ParcelsZoning/MapServer/34"},
                ].map(function(s,i){return s.u?<a key={i} href={s.u} target="_blank" rel="noopener noreferrer" style={{color:"#7a8a6e",fontSize:11,textDecoration:"none",borderBottom:"1px dotted #7a8a6e44",lineHeight:1.7}}>{s.l}</a>:<span key={i} style={{color:"#7a8a6e",fontSize:11,lineHeight:1.7}}>{s.l}</span>})}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{borderTop:"1px solid #1a1a1a",padding:"16px 32px",textAlign:"center",color:"#444",fontSize:10}}>
        Public domain analytical tool. Data from EO 11167, EO 11166, EO 11165, 1969 Historical Analysis, DLNR records, HMLUMP 2021, Federal Register. Not legal or financial advice.
      </footer>
    </div>
  );
}
