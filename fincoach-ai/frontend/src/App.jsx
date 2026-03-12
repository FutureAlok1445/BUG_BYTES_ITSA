import { useState, useEffect, useRef, useCallback } from "react";

// ── API ──────────────────────────────────────────────────────
async function webSearch(query) {
  try {
    console.log("Searching the web for: " + query);
    // Using DuckDuckGo's public API for snippets
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    const data = await response.json();
    
    let snippets = [];
    if (data.AbstractText) snippets.push(data.AbstractText);
    if (data.RelatedTopics) {
      data.RelatedTopics.slice(0, 3).forEach(topic => {
        if (topic.Text) snippets.push(topic.Text);
      });
    }
    
    if (snippets.length === 0) {
        // Fallback or secondary search logic can go here
        return "No direct search results found, but I can provide general information.";
    }
    
    return snippets.join("\n\n");
  } catch (error) {
    console.error("Web search failed", error);
    return "Search failed. Please try again later.";
  }
}

async function multiModelAI(prompt, isJson = false) {
  const models = [
    "gpt-4o",
    "gpt-4o-mini",
    "claude-3-5-sonnet",
    "gemini-1.5-flash",
    "llama-3-1-70b"
  ];
  
  if (!window.puter) {
    console.warn("Puter.js not loaded, using fallback mock.");
    throw new Error("Puter.js not loaded");
  }

  // AI Reasoning: Check if we need to search the web
  let searchContext = "";
  const needsSearchPrompt = `Review the user request and determine if it requires CURRENT real-time data from the internet (e.g., travel prices, news, stock quotes, weather, world tour packages).
  
  User Request: "${prompt.slice(0, 500)}"
  
  If it needs real-time info, answer exactly: "YES: <search query>". 
  Example: "YES: best world tour packages 2024"
  If it does NOT need real-time info, answer "NO".`;
  
  try {
    // Try without specific model first for reasoning (Puter default)
    let resObj = await window.puter.ai.chat(needsSearchPrompt);
    console.log("Raw reasoning response:", resObj);
    
    // Extract string correctly
    let decision = typeof resObj === "string" ? resObj : (resObj?.message?.content || resObj?.text || String(resObj));
    console.log("Search reasoning decision:", decision);
    
    if (decision && decision.toUpperCase().includes("YES")) {
        const query = decision.split(":")[1]?.trim() || prompt.slice(0, 50);
        searchContext = await webSearch(query);
    }
  } catch (e) {
    console.error("Reasoning layer failed, continuing without search", e);
  }

  let finalPrompt = prompt;
  if (searchContext) {
      finalPrompt = `SYSTEM: You have just performed a web search. Here are the search results:
---
${searchContext}
---
Using the live information above, answer the user's request. Provide links or prices if found.

User Request: ${prompt}`;
  }
  
  if (isJson) {
      finalPrompt += "\n\nIMPORTANT: Return ONLY a valid JSON block, starting with { or [. No markdown text allowed.";
  }

  // Try default model first
  try {
    console.log("Trying default model...");
    let response = await window.puter.ai.chat(finalPrompt);
    const strRes = typeof response === "string" ? response : (response?.message?.content || response?.text || String(response));
    if (strRes) return strRes;
  } catch (e) {
    console.log("Default model failed, trying fallback list...");
  }

  for (let model of models) {
    try {
      console.log("Trying model: " + model);
      let response = await window.puter.ai.chat(finalPrompt, { model });
      const strRes = typeof response === "string" ? response : (response?.message?.content || response?.text || String(response));
      if (strRes) {
        console.log("Success with model: " + model);
        return strRes;
      }
    } catch (error) {
      console.log("Model failed: " + model, error);
    }
  }
  
  throw new Error("All AI models failed.");
}

async function streamClaude(system, messages, onChunk, abortRef) {
  let promptStr = system + "\n\n";
  for (const m of messages) {
    promptStr += (m.role === "user" ? "User: " : "AI: ") + (m.content || m.text || "") + "\n";
  }
  promptStr += "AI: ";

  let fullResponse = "";
  try {
    fullResponse = await multiModelAI(promptStr, false);
  } catch (e) {
    fullResponse = "Sorry, all AI models failed or Puter.js wasn't loaded: " + e.message;
  }
  
  let currentText = "";
  const chunkSize = 2;
  for (let i = 0; i < fullResponse.length; i += chunkSize) {
    if (abortRef?.current) break;
    currentText += fullResponse.slice(i, i + chunkSize);
    onChunk?.(currentText);
    await new Promise(r => setTimeout(r, 10)); 
  }
  return currentText;
}

async function askClaude(system, user) {
  const promptStr = system + "\n\nUser: " + user;
  
  try {
    const fullResponse = await multiModelAI(promptStr, true);
    return JSON.parse(fullResponse.replace(/```json|```/g, "").trim());
  } catch (e) {
    console.error("Failed to parse JSON or models failed", e);
    if (system.includes("analyzer")) {
      return {"type":"impulsive","label":"High risk","title":"Puter AI Failed","description":"API call to puter.js failed or returned invalid JSON data. " + e.message};
    } else {
      return [{type:"danger",icon:"🚨",text:"Puter AI API Failed",category:"System",urgency:"High"}];
    }
  }
}

// ── FINANCIAL DATA ───────────────────────────────────────────
const FIN = `Current Month Financial Summary:
Income: Rs. 85,000 (ACME Corp)
Spent: Rs. 73,500 (86.5%, 18 of 31 days)
Remaining: Rs. 11,500

Spending by category:
- Food & Dining: Rs. 14,200 / Rs. 9,000 budget (58% over, 11 Swiggy orders @ Rs. 450 avg)
- Shopping: Rs. 18,500 (3 late-night Amazon orders this week)
- Rent/EMI: Rs. 22,000
- Entertainment: Rs. 6,200
- Subscriptions: Rs. 3,400 (5 active: Netflix, Spotify, Prime, Notion, ChatGPT)
- Transport: Rs. 4,800
- Groceries: Rs. 4,400 (down 23% vs last month — good)

Key signals:
- Suspicious: Rs. 4,500 at 2:34 AM, unrecognized merchant
- Weekend spending 3.4x higher than weekdays
- 73% of impulse buys after 9 PM
- Emergency fund: 1.8 months (target: 6)
- No investments this month`;

// ── STYLES ───────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: #f5f6f8; color: #111827; min-height: 100vh; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

  .nav { position: fixed; top: 0; left: 0; right: 0; height: 58px; background: #fff; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; padding: 0 28px; z-index: 100; }
  .nav-brand { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #111827; letter-spacing: -0.3px; margin-right: 36px; }
  .nav-brand-icon { width: 30px; height: 30px; background: #111827; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .nav-tabs { display: flex; gap: 2px; }
  .nav-tab { padding: 7px 15px; border-radius: 8px; font-size: 13px; font-weight: 500; color: #6b7280; cursor: pointer; border: none; background: transparent; transition: all 0.15s; }
  .nav-tab:hover { background: #f9fafb; color: #374151; }
  .nav-tab.active { background: #f3f4f6; color: #111827; font-weight: 600; }
  .nav-right { margin-left: auto; }
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #374151; cursor: pointer; }

  .page { padding-top: 58px; min-height: 100vh; }
  .container { max-width: 1100px; margin: 0 auto; padding: 28px 24px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

  .card { background: #fff; border: 1px solid #f0f0f0; border-radius: 14px; overflow: hidden; }
  .card-pad { padding: 20px 22px; }
  .card-title { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 16px; }
  .section-label { font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: #9ca3af; margin-bottom: 12px; }

  .stat-card { padding: 20px 22px; }
  .stat-label { font-size: 12px; color: #9ca3af; font-weight: 500; margin-bottom: 6px; }
  .stat-value { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: #111827; line-height: 1; }
  .stat-sub { font-size: 12px; color: #9ca3af; margin-top: 4px; }
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-top: 8px; }
  .badge-red { background: #fef2f2; color: #ef4444; }
  .badge-green { background: #f0fdf4; color: #16a34a; }
  .badge-orange { background: #fff7ed; color: #ea580c; }
  .badge-blue { background: #eff6ff; color: #2563eb; }
  .badge-gray { background: #f9fafb; color: #6b7280; }

  .pcard { padding: 22px; }
  .ptype-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
  .ptype { font-size: 17px; font-weight: 700; color: #111827; letter-spacing: -0.3px; margin-top: 6px; }
  .picon { font-size: 26px; }
  .pdesc { font-size: 13px; color: #6b7280; line-height: 1.6; }
  .pscore-row { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
  .score-track { flex: 1; height: 4px; background: #f3f4f6; border-radius: 2px; overflow: hidden; }
  .score-fill { height: 100%; border-radius: 2px; transition: width 1s ease; }
  .score-num { font-size: 12px; font-weight: 600; white-space: nowrap; }

  .forecast-pad { padding: 20px 22px; }
  .frow { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; }
  .fspent { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
  .fof { font-size: 13px; color: #9ca3af; }
  .fpct { font-size: 14px; font-weight: 600; }
  .prog-track { height: 7px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
  .prog-fill { height: 100%; border-radius: 4px; transition: width 1.2s cubic-bezier(.25,1,.5,1); }
  .prog-safe { background: #22c55e; }
  .prog-warn { background: #f97316; }
  .prog-danger { background: #ef4444; }
  .fstats { display: flex; gap: 20px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #f9fafb; }
  .fstat-v { font-size: 14px; font-weight: 600; }
  .fstat-k { font-size: 11px; color: #9ca3af; margin-top: 2px; }

  .ins-item { padding: 13px 15px; border-radius: 10px; margin-bottom: 8px; display: flex; gap: 11px; align-items: flex-start; }
  .ins-item.danger { background: #fef2f2; }
  .ins-item.warning { background: #fff7ed; }
  .ins-item.positive { background: #f0fdf4; }
  .ins-item.info { background: #eff6ff; }
  .ins-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }
  .ins-text { font-size: 13px; line-height: 1.55; color: #374151; }
  .ins-meta { font-size: 11px; color: #9ca3af; margin-top: 3px; font-weight: 500; }

  .loader { display: flex; align-items: center; gap: 10px; padding: 18px 0; color: #9ca3af; font-size: 13px; }
  .spin { width: 15px; height: 15px; border: 2px solid #e5e7eb; border-top-color: #6366f1; border-radius: 50%; animation: rot .7s linear infinite; flex-shrink: 0; }
  @keyframes rot { to { transform: rotate(360deg); } }

  .chat-wrap { display: flex; flex-direction: column; height: 490px; background: #fff; border: 1px solid #f0f0f0; border-radius: 14px; overflow: hidden; }
  .chat-hdr { padding: 14px 18px; border-bottom: 1px solid #f5f5f5; display: flex; align-items: center; gap: 10px; }
  .chat-av { width: 32px; height: 32px; border-radius: 50%; background: #111827; display: flex; align-items: center; justify-content: center; font-size: 13px; }
  .chat-name { font-size: 14px; font-weight: 600; color: #111827; }
  .chat-status { font-size: 11px; color: #22c55e; font-weight: 500; margin-top: 1px; }
  .chat-msgs { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .mrow { display: flex; gap: 8px; max-width: 85%; }
  .mrow.user { align-self: flex-end; flex-direction: row-reverse; }
  .mrow.ai { align-self: flex-start; }
  .mav { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0; margin-top: 2px; }
  .mav.ai { background: #111827; color: #fff; }
  .mav.user { background: #6366f1; color: #fff; }
  .mbubble { padding: 9px 13px; border-radius: 14px; font-size: 13px; line-height: 1.55; white-space: pre-wrap; word-break: break-word; }
  .mrow.user .mbubble { background: #6366f1; color: #fff; border-bottom-right-radius: 4px; }
  .mrow.ai .mbubble { background: #f9fafb; color: #374151; border-bottom-left-radius: 4px; border: 1px solid #f0f0f0; }
  .mtime { font-size: 10px; color: #d1d5db; margin-top: 3px; }
  .mrow.user .mtime { text-align: right; }
  .typing { display: flex; gap: 3px; align-items: center; padding: 11px 14px; background: #f9fafb; border-radius: 14px; border-bottom-left-radius: 4px; border: 1px solid #f0f0f0; width: fit-content; }
  .dot { width: 5px; height: 5px; border-radius: 50%; background: #9ca3af; animation: bou 1.4s infinite ease-in-out; }
  .dot:nth-child(2) { animation-delay: .2s; } .dot:nth-child(3) { animation-delay: .4s; }
  @keyframes bou { 0%,80%,100% { transform: scale(.6); opacity: .4; } 40% { transform: scale(1); opacity: 1; } }
  .chips { padding: 8px 14px; display: flex; gap: 6px; flex-wrap: wrap; border-top: 1px solid #f5f5f5; background: #fafafa; }
  .chip { padding: 5px 11px; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 11px; color: #6b7280; cursor: pointer; background: #fff; transition: all 0.15s; font-weight: 500; }
  .chip:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }
  .chip:disabled { opacity: .5; cursor: not-allowed; }
  .chat-inp-row { padding: 10px 14px; border-top: 1px solid #f5f5f5; display: flex; gap: 8px; align-items: flex-end; }
  .cinp { flex: 1; border: 1px solid #e5e7eb; border-radius: 10px; padding: 9px 13px; font-family: 'Inter', sans-serif; font-size: 13px; color: #111827; background: #fff; resize: none; outline: none; transition: border-color 0.15s; max-height: 88px; }
  .cinp:focus { border-color: #6366f1; }
  .cinp::placeholder { color: #d1d5db; }
  .sbtn { width: 36px; height: 36px; border-radius: 10px; background: #111827; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .15s; flex-shrink: 0; }
  .sbtn:hover { background: #374151; }
  .sbtn:disabled { background: #e5e7eb; cursor: not-allowed; }
  .stopbtn { width: 36px; height: 36px; border-radius: 10px; background: #fef2f2; border: 1px solid #fecaca; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #ef4444; flex-shrink: 0; }

  .aitem { display: flex; gap: 12px; padding: 14px 16px; border-radius: 10px; margin-bottom: 8px; align-items: flex-start; border: 1px solid transparent; }
  .aitem.danger { background: #fef2f2; border-color: #fecaca; }
  .aitem.warning { background: #fff7ed; border-color: #fed7aa; }
  .aitem.ok { background: #f0fdf4; border-color: #bbf7d0; }
  .aico { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
  .aico.danger { background: #fee2e2; }
  .aico.warning { background: #ffedd5; }
  .aico.ok { background: #dcfce7; }
  .atitle { font-size: 13px; font-weight: 600; margin-bottom: 3px; }
  .atitle.danger { color: #dc2626; }
  .atitle.warning { color: #c2410c; }
  .atitle.ok { color: #15803d; }
  .abody { font-size: 12px; color: #6b7280; line-height: 1.5; }

  .fpad { padding: 20px 22px; }
  .flbl { font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 6px; display: block; }
  .finp, .fsel { width: 100%; padding: 10px 13px; border: 1px solid #e5e7eb; border-radius: 9px; font-family: 'Inter', sans-serif; font-size: 13px; color: #111827; background: #fff; outline: none; transition: all 0.15s; appearance: none; }
  .finp:focus, .fsel:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
  .finp::placeholder { color: #d1d5db; }
  .finp.err, .fsel.err { border-color: #fca5a5; }
  .ferr { font-size: 11px; color: #ef4444; margin-top: 4px; }
  .apfx { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 13px; color: #9ca3af; pointer-events: none; }
  .amtw { position: relative; }
  .amtw .finp { padding-left: 24px; }
  .trow { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .tbtn { padding: 9px; border-radius: 9px; border: 1px solid #e5e7eb; background: transparent; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: #9ca3af; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 5px; }
  .tbtn.income.on { background: #f0fdf4; border-color: #86efac; color: #15803d; }
  .tbtn.expense.on { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }
  .subbtn { width: 100%; padding: 11px; background: #111827; color: #fff; border: none; border-radius: 9px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .subbtn:hover { background: #374151; }
  .subbtn:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }
  .toast { display: flex; align-items: center; gap: 8px; padding: 10px 13px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 9px; font-size: 12px; color: #15803d; font-weight: 500; margin-top: 10px; }

  .txrow { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid #f9fafb; }
  .txrow:last-child { border-bottom: none; }
  .txico { width: 34px; height: 34px; border-radius: 9px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
  .txname { font-size: 13px; font-weight: 500; color: #111827; }
  .txcat { font-size: 11px; color: #9ca3af; margin-top: 1px; }

  .ph { margin-bottom: 24px; }
  .ptitle { font-size: 22px; font-weight: 700; letter-spacing: -0.4px; }
  .psub { font-size: 13px; color: #9ca3af; margin-top: 3px; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  .fu { animation: fadeUp 0.25s ease forwards; }

  @media (max-width: 768px) { .grid-2, .grid-3 { grid-template-columns: 1fr; } .chat-wrap { height: 420px; } }
`;

const now = () => { const d = new Date(); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); };
const CATS = ["Food & Dining","Transport","Shopping","Entertainment","Healthcare","Utilities","Rent / EMI","Investments","Salary","Freelance","Other"];
const CICO = {"Food & Dining":"🍽️",Transport:"🚗",Shopping:"🛍️",Entertainment:"🎬",Healthcare:"💊",Utilities:"💡","Rent / EMI":"🏠",Investments:"📈",Salary:"💼",Freelance:"💻",Other:"📋"};

const PCFG = {
  impulsive:{ bar:"#ef4444", score:8.4, badge:"badge-red" },
  smart:    { bar:"#6366f1", score:7.8, badge:"badge-blue" },
  saver:    { bar:"#22c55e", score:9.1, badge:"badge-green" },
  cautious: { bar:"#f97316", score:6.9, badge:"badge-orange" },
};
const PICO = {impulsive:"🔥",smart:"⚡",saver:"🏦",cautious:"🛡️"};

const PersonalityCard = ({ data, loading }) => {
  if (loading) return <div className="loader"><div className="spin"/>Analyzing your spending profile…</div>;
  if (!data) return null;
  const c = PCFG[data.type] || PCFG.impulsive;
  return (
    <div className="pcard fu">
      <div className="ptype-row">
        <div>
          <span className={`badge ${c.badge}`}>{data.label}</span>
          <div className="ptype">{data.title}</div>
        </div>
        <div className="picon">{PICO[data.type]||"💡"}</div>
      </div>
      <div className="pdesc">{data.description}</div>
      <div className="pscore-row">
        <div className="score-track"><div className="score-fill" style={{width:`${(c.score/10)*100}%`,background:c.bar}}/></div>
        <div className="score-num" style={{color:c.bar}}>{c.score}/10</div>
      </div>
import React, { useState } from 'react';
import { useDashboard } from './hooks/useDashboard';
import { THEME } from './styles/theme';
import { downloadReport } from './api';

import LoadingScreen from './components/layout/LoadingScreen';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import AICoach from './components/coach/AICoach';
import Alerts from './components/alerts/Alerts';

// Placeholders until built
const DashboardPlaceholder = () => <div style={{padding:'40px', textAlign:'center'}}>Dashboard Building...</div>;
const CoachPlaceholder = () => <div style={{padding:'40px', textAlign:'center'}}>AI Coach Building...</div>;

function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { data, loading, error, refetch } = useDashboard();

  const handleReportDownload = async () => {
    try {
      const blob = await downloadReport();
      if (blob) {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'fincoach_report.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert("Failed to download report. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error downloading report");
    }
  };

  // Keep showing loader if data is still fetching even after anim is done
  if (showLoader) {
    return <LoadingScreen onComplete={() => setShowLoader(false)} />;
  }

  // Very edge case fallback
  if (!data && !loading) {
    return <div style={{color:'white'}}>Fatal Error: Data not initializing.</div>;
  }

  return (
    <div className="App" style={{ backgroundColor: THEME.COLORS.bg, color: THEME.COLORS.text, minHeight: '100vh' }}>
      
      {/* Fixed Sticky Header */}
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userData={data?.profile}
        onReportDownload={handleReportDownload}
      />

      {/* Backend Offline Warning Banner */}
      {error && !loading && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          backgroundColor: THEME.COLORS.danger,
          color: '#000',
          textAlign: 'center',
          padding: '6px',
          fontFamily: THEME.FONTS.heading,
          fontSize: '13px',
          fontWeight: 600,
          zIndex: 999
        }}>
          ⚠️ Backend is offline — Displaying demo snapshot data
        </div>
      )}

      {/* Tab Content Area (with padding for sticky header) */}
      <main style={{ 
        paddingTop: error ? '100px' : '84px', // 64px header + 20px space (more if error banner)
        paddingBottom: '60px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        minHeight: 'calc(100vh - 64px)'
      }}>
        
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'coach' && <AICoach data={data} />}
        {activeTab === 'alerts' && <Alerts data={data} onRefresh={refetch} />}

      </main>

    </div>
  );
};

const InsightsPanel = ({ insights, loading }) => (
  <div className="card">
    <div className="card-pad" style={{paddingBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div className="card-title" style={{marginBottom:0}}>AI Insights</div>
        <span className="badge badge-blue" style={{fontSize:10}}>Live</span>
      </div>
      {loading
        ? <div className="loader"><div className="spin"/>Analyzing your patterns…</div>
        : insights.map((ins,i)=>(
            <div key={i} className={`ins-item ${ins.type} fu`} style={{animationDelay:`${i*0.07}s`}}>
              <span className="ins-icon">{ins.icon}</span>
              <div>
                <div className="ins-text">{ins.text}</div>
                <div className="ins-meta">{ins.category} · {ins.urgency}</div>
              </div>
            </div>
          ))
      }
    </div>
  </div>
);

const ForecastBar = ({ spent=73500, income=85000 }) => {
  const pct = Math.min(100, Math.round((spent/income)*100));
  const z = pct>=90?"danger":pct>=75?"warn":"safe";
  const msgs = {safe:"On track this month.",warn:"Spending is elevated — review discretionary costs.",danger:"Critical: over 90% of income spent."};
  const col = {safe:"#16a34a",warn:"#c2410c",danger:"#dc2626"}[z];
  return (
    <div className="card">
      <div className="forecast-pad">
        <div className="section-label">Monthly Burn</div>
        <div className="frow">
          <div>
            <div className="fspent">Rs. {spent.toLocaleString()} <span className="fof">of Rs. {income.toLocaleString()}</span></div>
            <div style={{fontSize:12,color:"#9ca3af",marginTop:4}}>{msgs[z]}</div>
          </div>
          <div className="fpct" style={{color:col}}>{pct}%</div>
        </div>
        <div className="prog-track"><div className={`prog-fill prog-${z}`} style={{width:`${pct}%`}}/></div>
        <div className="fstats">
          {[["Rs. "+spent.toLocaleString(),"Spent","#ef4444"],["Rs. "+(income-spent).toLocaleString(),"Remaining","#16a34a"],["18 days","This month","#9ca3af"]].map(([v,k,c],i)=>(
            <div key={i}><div className="fstat-v" style={{color:c}}>{v}</div><div className="fstat-k">{k}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SUGG = ["Where am I overspending?","How to save Rs. 10k this month?","Analyze my food spend","Full risk summary"];

const ChatWindow = () => {
  const [messages, setMessages] = useState([{role:"ai",time:now(),text:"Hi! I've reviewed your finances. Dining is 58% over budget and there's an unusual 2 AM charge you should check. What would you like to explore?"}]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const abortRef = useRef(false);
  const histRef = useRef([]);
  const endRef = useRef(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,streamText]);

  const send = useCallback(async (txt)=>{
    if(!txt.trim()||streaming) return;
    const t=txt.trim();
    setMessages(p=>[...p,{role:"user",text:t,time:now()}]);
    setInput(""); setStreaming(true); setStreamText(""); abortRef.current=false;
    histRef.current=[...histRef.current,{role:"user",content:t}];
    try {
      const full = await streamClaude(
        `You are a financial advisor AI. You know the user's finances completely. Give specific, actionable advice with real numbers. Max 3 sentences. Plain text, no markdown.\n\n${FIN}`,
        histRef.current,
        (chunk)=>{ if(!abortRef.current) setStreamText(chunk); },
        abortRef
      );
      histRef.current=[...histRef.current,{role:"assistant",content:full}];
      setMessages(p=>[...p,{role:"ai",text:full,time:now()}]);
    } catch {
      setMessages(p=>[...p,{role:"ai",text:"Something went wrong. Please try again.",time:now()}]);
    } finally { setStreaming(false); setStreamText(""); }
  },[streaming]);

  return (
    <div className="chat-wrap">
      <div className="chat-hdr">
        <div className="chat-av">🤖</div>
        <div><div className="chat-name">AI Coach</div><div className="chat-status">● Online</div></div>
      </div>
      <div className="chat-msgs">
        {messages.map((m,i)=>(
          <div key={i} className={`mrow ${m.role}`}>
            <div className={`mav ${m.role}`}>{m.role==="user"?"U":"AI"}</div>
            <div><div className="mbubble">{m.text}</div><div className="mtime">{m.time}</div></div>
          </div>
        ))}
        {streaming && (
          <div className="mrow ai">
            <div className="mav ai">AI</div>
            <div>
              {streamText ? <div className="mbubble">{streamText}<span style={{opacity:.4}}>▊</span></div> : <div className="typing"><div className="dot"/><div className="dot"/><div className="dot"/></div>}
              <div className="mtime">{now()}</div>
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div className="chips">
        {SUGG.map((s,i)=><button key={i} className="chip" onClick={()=>send(s)} disabled={streaming}>{s}</button>)}
      </div>
      <div className="chat-inp-row">
        <textarea className="cinp" rows={1} placeholder="Ask about your finances…" value={input}
          onChange={e=>setInput(e.target.value)} disabled={streaming}
          onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(input);} }}/>
        {streaming
          ? <button className="stopbtn" onClick={()=>{abortRef.current=true;}}>■</button>
          : <button className="sbtn" onClick={()=>send(input)} disabled={!input.trim()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
        }
      </div>
    </div>
  );
};

const AlertCard = ({a}) => (
  <div className={`aitem ${a.severity} fu`}>
    <div className={`aico ${a.severity}`}>{a.icon}</div>
    <div><div className={`atitle ${a.severity}`}>{a.title}</div><div className="abody">{a.body}</div></div>
  </div>
);

const AddTransactionForm = ({onAdd}) => {
  const [form, setForm] = useState({amount:"",category:"",type:"expense",date:new Date().toISOString().split("T")[0],note:""});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const set=(k,v)=>{ setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:null})); };
  const validate=()=>{
    const e={};
    if(!form.amount||isNaN(form.amount)||+form.amount<=0) e.amount="Enter a valid amount";
    if(!form.category) e.category="Select a category";
    setErrors(e); return !Object.keys(e).length;
  };
  const submit=async()=>{
    if(!validate()) return;
    setLoading(true);
    try {
      await new Promise(r=>setTimeout(r,700));
      onAdd?.({...form,amount:+form.amount,id:Date.now()});
      setSuccess(true);
      setForm({amount:"",category:"",type:"expense",date:new Date().toISOString().split("T")[0],note:""});
      setTimeout(()=>setSuccess(false),3000);
    } finally { setLoading(false); }
  };
  return (
    <div className="card">
      <div className="fpad">
        <div className="card-title">Add Transaction</div>
        <div style={{marginBottom:14}}>
          <label className="flbl">Amount</label>
          <div className="amtw">
            <span className="apfx">Rs.</span>
            <input type="number" className={`finp${errors.amount?" err":""}`} placeholder="0.00" value={form.amount} onChange={e=>set("amount",e.target.value)}/>
          </div>
          {errors.amount&&<div className="ferr">{errors.amount}</div>}
        </div>
        <div style={{marginBottom:14}}>
          <label className="flbl">Type</label>
          <div className="trow">
            {["income","expense"].map(t=>(
              <button key={t} className={`tbtn ${t}${form.type===t?" on":""}`} onClick={()=>set("type",t)}>
                {t==="income"?"↑ Income":"↓ Expense"}
              </button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label className="flbl">Category</label>
          <select className={`fsel${errors.category?" err":""}`} value={form.category} onChange={e=>set("category",e.target.value)}>
            <option value="">Select a category</option>
            {CATS.map(c=><option key={c}>{c}</option>)}
          </select>
          {errors.category&&<div className="ferr">{errors.category}</div>}
        </div>
        <div style={{marginBottom:14}}>
          <label className="flbl">Date</label>
          <input type="date" className="finp" value={form.date} onChange={e=>set("date",e.target.value)}/>
        </div>
        <div style={{marginBottom:14}}>
          <label className="flbl">Note <span style={{color:"#d1d5db",fontWeight:400}}>(optional)</span></label>
          <input type="text" className="finp" placeholder="e.g. Lunch at office" value={form.note} onChange={e=>set("note",e.target.value)}/>
        </div>
        <button className="subbtn" onClick={submit} disabled={loading}>
          {loading?<><div className="spin" style={{borderTopColor:"#9ca3af",width:13,height:13}}/>Adding…</>:"Add Transaction"}
        </button>
        {success&&<div className="toast">✓ Transaction added</div>}
      </div>
    </div>
  );
};

const AICoachPage = () => {
  const [personality, setPersonality] = useState(null);
  const [pLoad, setPLoad] = useState(true);
  const [insights, setInsights] = useState([]);
  const [iLoad, setILoad] = useState(true);

  useEffect(()=>{
    askClaude(
      "Financial personality analyzer. Return ONLY valid JSON, no markdown.",
      `Return: {"type":"impulsive","label":"High risk","title":"Impulsive Spender","description":"2 specific sentences with real numbers."}\nTypes: impulsive, smart, saver, cautious\n${FIN}`
    ).then(d=>{setPersonality(d);setPLoad(false);}).catch(()=>{
      setPersonality({type:"impulsive",label:"High risk",title:"Impulsive Spender",description:"Dining budget exceeded for 3 straight months, with 73% of purchases after 9 PM. Late-night Amazon orders averaged Rs. 2,300 this week alone."});
      setPLoad(false);
    });
    askClaude(
      "Financial insights generator. Return ONLY a valid JSON array, no markdown.",
      `Return 4 insights: [{"type":"danger","icon":"🍔","text":"specific with numbers","category":"CATEGORY","urgency":"urgency"},...]
Types: danger, warning, positive, info\n${FIN}`
    ).then(d=>{setInsights(Array.isArray(d)?d:[]);setILoad(false);}).catch(()=>{
      setInsights([
        {type:"danger",icon:"🍔",text:"Dining at Rs. 14,200 — 58% over your Rs. 9,000 budget. 11 Swiggy orders this month at Rs. 450 avg.",category:"Food & Dining",urgency:"Critical"},
        {type:"warning",icon:"⚠️",text:"Rs. 4,500 unrecognized charge at 2:34 AM. Verify immediately or dispute the transaction.",category:"Security",urgency:"Review now"},
        {type:"positive",icon:"🛒",text:"Groceries down 23% vs last month. Your meal-prep habit saved you Rs. 1,300.",category:"Groceries",urgency:"Positive trend"},
        {type:"info",icon:"📈",text:"No SIP this month. Rs. 5,000/month in an index fund today = Rs. 6.2L in 10 years at 12% CAGR.",category:"Investments",urgency:"Opportunity"},
      ]);
      setILoad(false);
    });
  },[]);

  return (
    <div className="container">
      <div className="ph">
        <div className="ptitle">AI Coach</div>
        <div className="psub">Personalized insights based on your spending</div>
      </div>
      <div className="grid-3" style={{marginBottom:16}}>
        {[
          {label:"Spent this month",value:"Rs. 73,500",sub:"of Rs. 85,000 income",badge:"badge-red",btxt:"86.5%"},
          {label:"Remaining budget",value:"Rs. 11,500",sub:"12 days left",badge:"badge-green",btxt:"On track"},
          {label:"Biggest category",value:"Rs. 18,500",sub:"Shopping",badge:"badge-orange",btxt:"Review needed"},
        ].map((s,i)=>(
          <div key={i} className="card">
            <div className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
              <span className={`badge ${s.badge}`}>{s.btxt}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid-2" style={{marginBottom:16,alignItems:"start"}}>
        <div className="card"><PersonalityCard data={personality} loading={pLoad}/></div>
        <ForecastBar/>
      </div>
      <div className="grid-2" style={{alignItems:"start"}}>
        <div>
          <div className="section-label">Chat</div>
          <ChatWindow/>
        </div>
        <div>
          <div className="section-label">Insights</div>
          <InsightsPanel insights={insights} loading={iLoad}/>
        </div>
      </div>
    </div>
  );
};

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [aLoad, setALoad] = useState(true);
  const [txns, setTxns] = useState([]);

  const load = useCallback(()=>{
    setALoad(true);
    askClaude(
      "Financial risk alert system. Return ONLY valid JSON array, no markdown.",
      `Generate 5 alerts: [{"severity":"danger","icon":"🚨","title":"title","body":"specific body with numbers"},...]
Severity: danger, warning, ok. Include 1 ok.\n${FIN}`
    ).then(d=>{setAlerts(Array.isArray(d)?d:[]);setALoad(false);}).catch(()=>{
      setAlerts([
        {severity:"danger",icon:"🚨",title:"Dining budget exceeded",body:"Rs. 14,200 spent vs Rs. 9,000 budget — 58% over with 12 days left. Consider pausing restaurant spending."},
        {severity:"danger",icon:"⚠️",title:"Suspicious transaction",body:"Rs. 4,500 at 2:34 AM from an unrecognized merchant. Verify this charge or dispute it immediately."},
        {severity:"warning",icon:"📉",title:"Low savings rate",body:"Only 13.5% saved this month vs 30% recommended. Emergency fund covers just 1.8 months."},
        {severity:"warning",icon:"📅",title:"Weekend spending spike",body:"3.4× higher than weekdays, adding Rs. 8,500 in unplanned monthly costs for 6 weeks running."},
        {severity:"ok",icon:"✅",title:"Salary credited",body:"Rs. 85,000 received from ACME Corp. Groceries also down 23% — your meal-prep habit is working."},
      ]);
      setALoad(false);
    });
  },[]);

  useEffect(()=>{load();},[]);

  return (
    <div className="container">
      <div className="ph" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div className="ptitle">Alerts</div>
          <div className="psub">{alerts.filter(a=>a.severity==="danger").length} critical · {alerts.filter(a=>a.severity==="warning").length} warnings</div>
        </div>
        <button onClick={load} style={{padding:"8px 16px",background:"#fff",border:"1px solid #e5e7eb",borderRadius:9,fontSize:13,fontFamily:"Inter,sans-serif",fontWeight:500,color:"#374151",cursor:"pointer"}}>
          Refresh
        </button>
      </div>
      <div className="grid-2" style={{alignItems:"start"}}>
        <div>
          <ForecastBar/>
          <div style={{marginTop:16}}>
            <div className="section-label">{alerts.length} Active Alerts</div>
            {aLoad
              ? <div className="card"><div className="card-pad"><div className="loader"><div className="spin"/>Generating alerts…</div></div></div>
              : alerts.map((a,i)=><AlertCard key={i} a={a}/>)
            }
          </div>
        </div>
        <div>
          <AddTransactionForm onAdd={t=>setTxns(p=>[t,...p])}/>
          {txns.length>0&&(
            <div className="card" style={{marginTop:14}}>
              <div className="card-pad" style={{paddingBottom:8}}>
                <div className="card-title">Just Added</div>
                {txns.slice(0,5).map((t,i)=>(
                  <div key={i} className="txrow">
                    <div className="txico">{CICO[t.category]||"📋"}</div>
                    <div><div className="txname">{t.category}</div><div className="txcat">{t.date}{t.note?` · ${t.note}`:""}</div></div>
                    <div style={{marginLeft:"auto",fontSize:13,fontWeight:600,color:t.type==="income"?"#16a34a":"#ef4444"}}>
                      {t.type==="income"?"+":"−"}Rs. {Number(t.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [tab, setTab] = useState("coach");
  const [isAiConnected, setIsAiConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (window.puter) {
        try {
          const signedIn = await window.puter.auth.isSignedIn();
          setIsAiConnected(signedIn);
        } catch (e) {
          console.error("Auth check failed", e);
        }
      }
    };
    const timer = setInterval(checkAuth, 3000);
    checkAuth();
    return () => clearInterval(timer);
  }, []);

  const connectAi = async () => {
    if (!window.puter) return;
    setIsConnecting(true);
    try {
      await window.puter.auth.signIn();
      const signedIn = await window.puter.auth.isSignedIn();
      setIsAiConnected(signedIn);
    } catch (e) {
      console.error("Sign in failed", e);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-brand-icon">💰</div>
          FinanceOS
        </div>
        <div className="nav-tabs">
          {[{id:"coach",label:"AI Coach"},{id:"alerts",label:"Alerts"}].map(t=>(
            <button key={t.id} className={`nav-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <div className="nav-right" style={{display:"flex", alignItems:"center", gap:"12px"}}>
          {!isAiConnected ? (
            <button 
              onClick={connectAi} 
              disabled={isConnecting}
              style={{
                padding: "6px 12px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                opacity: isConnecting ? 0.7 : 1
              }}
            >
              {isConnecting ? "Connecting..." : "Connect AI"}
            </button>
          ) : (
            <div style={{display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"#16a34a", fontWeight:"600"}}>
              <div style={{width:8, height:8, background:"#16a34a", borderRadius:"50%"}} />
              AI Active
            </div>
          )}
          <div className="avatar">A</div>
        </div>
      </nav>
      <div className="page">
        {tab==="coach"&&<AICoachPage/>}
        {tab==="alerts"&&<AlertsPage/>}
      </div>
    </>
  );
}
