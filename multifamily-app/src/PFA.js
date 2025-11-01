// PropertyAnalyzerPage.jsx - Health Check Version with Subscription Controls
import React, { useState, useEffect } from "react";
import {
 Upload, ArrowRight, ArrowLeft, AlertCircle, Loader, Check, TrendingUp,
 DollarSign, Building, FileText, Home, AlertTriangle, Target, Activity,
 CheckCircle, XCircle, RefreshCw, Download, BarChart3, Zap, Gauge,
 Users, Briefcase, HomeIcon, MapPin, Clock, Database, Eye, Lock, Crown
} from "lucide-react";
import { supabase } from './lib/supabase';

const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://marketfinder-ai.onrender.com";
// Health check endpoints are on a SEPARATE Render service (health_check_app.py)
const HEALTH_CHECK_API = process.env.REACT_APP_HEALTH_CHECK_API || "https://marketfinder-ai-1.onrender.com";

const styles = {
 page: { minHeight: "100vh", background: "linear-gradient(to bottom, #f8fafc, #ffffff)" },
 container: { maxWidth: 1400, margin: "0 auto", padding: 20 },
 h1: { fontSize: "2.5rem", fontWeight: 800, color: "#111827", marginBottom: 8, textAlign: "center" },
 card: { 
   background: "#fff", 
   border: "1px solid #e5e7eb", 
   boxShadow: "0 4px 6px rgba(0,0,0,.04)", 
   borderRadius: 16, 
   padding: 24,
   marginBottom: 20
 },
 button: {
   display: "inline-flex",
   alignItems: "center",
   gap: 8,
   padding: "12px 24px",
   background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
   color: "#fff",
   border: "none",
   borderRadius: 10,
   fontSize: 15,
   fontWeight: 600,
   cursor: "pointer",
   transition: "all 0.2s ease",
 },
 homeButton: {
   display: "inline-flex",
   alignItems: "center",
   gap: 8,
   padding: "10px 18px",
   background: "#ffffff",
   color: "#374151",
   border: "1px solid #e5e7eb",
   borderRadius: 10,
   fontSize: 14,
   fontWeight: 600,
   cursor: "pointer",
   transition: "all 0.2s ease",
   boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
 },
 input: {
   width: "100%",
   padding: "10px 14px",
   border: "2px solid #e5e7eb",
   borderRadius: 8,
   fontSize: 14,
   transition: "border-color 0.2s",
   outline: "none",
 },
 metricCard: {
   background: "#fff",
   border: "1px solid #e5e7eb",
   borderRadius: 12,
   padding: 16,
   textAlign: "center"
 }
};

function pagesToSpec(sortedPages) {
 if (!sortedPages.length) return "";
 const ranges = [];
 let start = sortedPages[0];
 let prev = sortedPages[0];
 for (let i = 1; i < sortedPages.length; i++) {
   const cur = sortedPages[i];
   if (cur === prev + 1) {
     prev = cur;
     continue;
   }
   ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
   start = cur;
   prev = cur;
 }
 ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
 return ranges.join(",");
}

const PropertyAnalyzerPage = ({ setCurrentPage }) => {
 // Subscription and user state
 const [currentUser, setCurrentUser] = useState(null);
 const [userPlan, setUserPlan] = useState(null);
 const [userLimits, setUserLimits] = useState(null);
 const [userUsage, setUserUsage] = useState(null);
 const [loading, setLoading] = useState(true);
 const [subscriptionError, setSubscriptionError] = useState("");

 // Existing state
 const [error, setError] = useState("");
 const [showUpgradeModal, setShowUpgradeModal] = useState(false);
 const [isLimitReached, setIsLimitReached] = useState(false);
 const [step, setStep] = useState("upload");
 const [file, setFile] = useState(null);
 const [pdfPages, setPdfPages] = useState([]);
 const [selectedPages, setSelectedPages] = useState(new Set());
 const [loadingPreview, setLoadingPreview] = useState(false);
 const [progress, setProgress] = useState(0);
 const [processingMsg, setProcessingMsg] = useState("");
 const [verificationResult, setVerificationResult] = useState(null);
 const [healthCheckResult, setHealthCheckResult] = useState(null);
 const [userFixes, setUserFixes] = useState({});
 const [showUserFixForm, setShowUserFixForm] = useState(false);

 // Check user access and load subscription info
 useEffect(() => {
   const checkUserAccess = async () => {
     try {
       const { data: { session } } = await supabase.auth.getSession();
       
       if (!session) {
         setSubscriptionError('Please log in to access PFA features');
         setLoading(false);
         return;
       }

       // Get user profile
       const { data: profile, error: profileError } = await supabase
         .from('profiles')
         .select('*')
         .eq('id', session.user.id)
         .single();

       if (profileError) {
         setSubscriptionError('Error loading user profile');
         setLoading(false);
         return;
       }

       const userId = session.user.id;

       setCurrentUser({
         id: userId,
         email: session.user.email,
         ...profile
       });
       setUserPlan('subscribed'); // Single subscription tier

       // Get usage data from backend API
       try {
         const response = await fetch(`${API_BASE}/user/usage?user_id=${userId}`);
         if (response.ok) {
           const usageData = await response.json();
           setUserLimits(usageData.limits);
           setUserUsage(usageData.usage);
         }
       } catch (err) {
         console.warn('Could not load usage data:', err);
         // Set defaults if API fails
         setUserLimits({ pages_per_month: 50, max_pages_per_pdf: 25 });
         setUserUsage({ pages_processed: 0, om_pdfs_parsed: 0 });
       }

     } catch (err) {
       console.error('Error checking user access:', err);
       setSubscriptionError('Error loading user access');
     } finally {
       setLoading(false);
     }
   };

   checkUserAccess();
 }, []);

 // Check 60-page limit before processing
 const checkPageLimit = async () => {
   try {
     const currentMonth = new Date().toISOString().slice(0, 7);
     const { data: usage, error } = await supabase
       .from('user_usage')
       .select('pages_processed')
       .eq('user_id', currentUser.id)
       .eq('month_year', currentMonth)
       .single();

     if (error && error.code !== 'PGRST116') {
       console.error('Error checking usage:', error);
       return { allowed: true }; // Allow if can't check
     }

     const pagesUsed = usage?.pages_processed || 0;
     const pagesRemaining = 60 - pagesUsed;

     if (pagesRemaining <= 0) {
       setIsLimitReached(true);
       return { 
         allowed: false, 
         pagesUsed, 
         message: 'You have reached your 60-page limit for this month. Purchase 60 more pages to continue.' 
       };
     }

     setIsLimitReached(false);
     return { allowed: true, pagesUsed, pagesRemaining };
   } catch (error) {
     console.error('Error checking page limit:', error);
     return { allowed: true }; // Allow if error
   }
 };

 const onFileInput = async (e) => {
   const f = e.target.files?.[0];
   if (!f) return;
   if (f.type !== "application/pdf" && f.type !== "text/csv" && 
       !f.type.includes("spreadsheet") && !f.type.includes("excel")) {
     setError(`Unsupported file type: ${f.type || "unknown"}`);
     return;
   }
   setError("");
   setFile(f);
   
   if (f.type === "application/pdf") {
     await genPdfThumbs(f);
   } else {
     setStep("pageSelect");
     setSelectedPages(new Set([1]));
   }
 };

 const genPdfThumbs = async (pdfFile) => {
   setStep("pageSelect");
   setLoadingPreview(true);
   try {
     let pdfjsLib = window.pdfjsLib;
     if (!pdfjsLib) {
       await new Promise((resolve, reject) => {
         const s = document.createElement("script");
         s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
         s.onload = () => {
           pdfjsLib = window.pdfjsLib;
           if (pdfjsLib) {
             pdfjsLib.GlobalWorkerOptions.workerSrc =
               "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
             resolve();
           } else reject(new Error("Failed to load pdf.js"));
         };
         s.onerror = () => reject(new Error("Failed to load pdf.js"));
         document.head.appendChild(s);
       });
     }
     const ab = await pdfFile.arrayBuffer();
     const doc = await window.pdfjsLib.getDocument({ data: ab }).promise;

     const pages = [];
     const MAX = Math.min(doc.numPages, 100);
     for (let p = 1; p <= MAX; p++) {
       const page = await doc.getPage(p);
       const viewport = page.getViewport({ scale: 0.3 });
       const canvas = document.createElement("canvas");
       const ctx = canvas.getContext("2d");
       canvas.height = viewport.height;
       canvas.width = viewport.width;
       await page.render({ canvasContext: ctx, viewport }).promise;
       pages.push({ pageNum: p, thumbnail: canvas.toDataURL() });
     }
     setPdfPages(pages);
   } catch (e) {
     setError(`PDF preview failed: ${e.message}`);
     setStep("upload");
   } finally {
     setLoadingPreview(false);
   }
 };

 const togglePage = (n) =>
   setSelectedPages((prev) => {
     const s = new Set(prev);
     s.has(n) ? s.delete(n) : s.add(n);
     return s;
   });

 const selectAll = () => setPdfPages.length && setSelectedPages(new Set(pdfPages.map((p) => p.pageNum)));
 const clearAll = () => setSelectedPages(new Set());

 const processNow = async () => {
   setError("");
   setShowUserFixForm(false);
   
   try {
     if (!file) {
       setError("No file loaded");
       return;
     }

     // Check 60-page limit before processing
     const limitCheck = await checkPageLimit();
     if (!limitCheck.allowed) {
       setError(limitCheck.message);
       setShowUpgradeModal(true);
       setIsLimitReached(true);
       return;
     }

     if (file.type === "application/pdf" && selectedPages.size === 0) {
       setError("Select at least one page to process.");
       return;
     }
     
     setStep("processing");
     setProgress(10);
     setProcessingMsg("Uploading document for OCR processing...");

     const pages = file.type === "application/pdf" ? 
       pagesToSpec(Array.from(selectedPages).sort((a, b) => a - b)) : "";

     const fd = new FormData();
     fd.append("file", file);
     if (pages) fd.append("pages", pages);
     fd.append("user_fixes", JSON.stringify(userFixes));
     fd.append("user_id", currentUser.id); // Include user ID for backend tracking

     setProgress(30);
     setProcessingMsg("Extracting and verifying property data...");

     const verifyRes = await fetch(`${HEALTH_CHECK_API}/api/health-check/verify`, {
       method: "POST",
       body: fd,
     });

     if (!verifyRes.ok) {
       const t = await verifyRes.text().catch(() => "");
       throw new Error(`Verification failed ${verifyRes.status}: ${t || verifyRes.statusText}`);
     }

     const verifyJson = await verifyRes.json();
     setVerificationResult(verifyJson.verification);

     setProgress(60);
     setProcessingMsg("Checking data completeness...");

     // Check if verification passed
     if (!verifyJson.verification.can_run_healthcheck) {
       setProgress(100);
       setProcessingMsg("Missing critical data - user input required");
       setShowUserFixForm(true);
       setStep("verification");
       return;
     }

     setProgress(80);
     setProcessingMsg("Generating health check analysis...");

     // Run health check analysis
     const analysisRes = await fetch(`${HEALTH_CHECK_API}/api/health-check/analyze`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         verified_payload: verifyJson.verification.verified_payload,
         user_id: currentUser.id
       })
     });

     if (!analysisRes.ok) {
       const t = await analysisRes.text().catch(() => "");
       throw new Error(`Analysis failed ${analysisRes.status}: ${t || analysisRes.statusText}`);
     }

     const analysisJson = await analysisRes.json();
     setHealthCheckResult(analysisJson.health_check);

     // Usage tracking is now handled by the backend automatically

     setProgress(100);
     setProcessingMsg("Health check complete!");
     setStep("results");
   } catch (e) {
     console.error("Process error:", e);
     setError(e.message || String(e));
     setStep(file?.type === "application/pdf" ? "pageSelect" : "upload");
   }
 };

 const handleUserFixSubmit = async () => {
   // Re-run verification with user fixes
   setStep("processing");
   setProgress(10);
   setProcessingMsg("Re-verifying with your corrections...");

   try {
     const pages = file.type === "application/pdf" ? 
       pagesToSpec(Array.from(selectedPages).sort((a, b) => a - b)) : "";

     const fd = new FormData();
     fd.append("file", file);
     if (pages) fd.append("pages", pages);
     fd.append("user_fixes", JSON.stringify(userFixes));
     fd.append("user_id", currentUser.id);

     const verifyRes = await fetch(`${HEALTH_CHECK_API}/api/health-check/verify`, {
       method: "POST",
       body: fd,
     });

     if (!verifyRes.ok) {
       throw new Error(`Re-verification failed`);
     }

     const verifyJson = await verifyRes.json();
     setVerificationResult(verifyJson.verification);

     if (!verifyJson.verification.can_run_healthcheck) {
       setError("Still missing critical data after corrections");
       setStep("verification");
       return;
     }

     setProgress(60);
     setProcessingMsg("Running health check analysis...");

     const analysisRes = await fetch(`${HEALTH_CHECK_API}/api/health-check/analyze`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         verified_payload: verifyJson.verification.verified_payload,
         user_id: currentUser.id
       })
     });

     if (!analysisRes.ok) {
       throw new Error(`Analysis failed`);
     }

     const analysisJson = await analysisRes.json();
     setHealthCheckResult(analysisJson.health_check);

     // Usage tracking is now handled by the backend automatically

     setProgress(100);
     setProcessingMsg("Health check complete!");
     setStep("results");
   } catch (e) {
     setError(e.message || String(e));
     setStep("verification");
   }
 };

 const reset = () => {
   setError("");
   setStep("upload");
   setFile(null);
   setPdfPages([]);
   setSelectedPages(new Set());
   setVerificationResult(null);
   setHealthCheckResult(null);
   setUserFixes({});
   setShowUserFixForm(false);
 };

 const getSeverityColor = (severity) => {
   switch (severity) {
     case "high": return "#dc2626";
     case "medium": return "#d97706";
     case "low": return "#059669";
     default: return "#6b7280";
   }
 };

 const getImpactColor = (impact) => {
   switch (impact) {
     case "high": return "#10b981";
     case "medium": return "#f59e0b";
     case "low": return "#6b7280";
     default: return "#6b7280";
   }
 };

 // Loading state
 if (loading) {
   return (
     <div style={styles.page}>
       <div style={styles.container}>
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
           <div>Loading your subscription details...</div>
         </div>
       </div>
     </div>
   );
 }

 // Access denied state
 if (subscriptionError) {
   return (
     <div style={styles.page}>
       <div style={styles.container}>
         <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
           <button 
             onClick={() => setCurrentPage ? setCurrentPage('underwrite') : window.location.href = '/'} 
             style={styles.homeButton}
           >
             <ArrowLeft size={16} /> Back to Underwriting Options
           </button>
         </div>
         
         <div style={{ maxWidth: 600, margin: '50px auto', textAlign: 'center' }}>
           <div style={{ 
             ...styles.card,
             background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
             border: '2px solid #ef4444'
           }}>
             <Lock size={64} color="#dc2626" style={{ margin: '0 auto 24px' }} />
             
             <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626', marginBottom: '16px' }}>
               PFA Access Required
             </h2>
             
             <p style={{ color: '#991b1b', marginBottom: '24px', fontSize: '16px' }}>
               {subscriptionError}
             </p>

             <button
               onClick={() => setCurrentPage ? setCurrentPage('dashboard') : window.location.href = '/dashboard'}
               style={{
                 ...styles.button,
                 background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
               }}
             >
               <ArrowLeft size={18} /> Back to Dashboard
             </button>
           </div>
         </div>
       </div>
     </div>
   );
 }

 // RENDER FUNCTIONS
 if (step === "upload") {
   return (
     <div style={styles.page}>
       <div style={styles.container}>
         <div style={{ padding: "20px 0" }}>
           <button 
             onClick={() => setCurrentPage ? setCurrentPage('underwrite') : window.location.href = '/'} 
             style={styles.homeButton}
           >
             <ArrowLeft size={16} /> Back to Underwriting Options
           </button>
         </div>
         
         <div style={{ padding: "20px 0" }}>
           <h1 style={styles.h1}>Financial Health Check</h1>
           <p style={{ fontSize: 16, color: "#6b7280", textAlign: "center", marginBottom: 24 }}>
             Upload your P&L, T12, or Rent Roll to get an AI-powered property health analysis
           </p>

           {error && (
             <div style={{ marginBottom: 20, padding: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, display: "flex", gap: 12, alignItems: "center" }}>
               <AlertCircle size={20} color="#b91c1c" />
               <span style={{ color: "#991b1b", fontSize: 14 }}>
                 {error}
               </span>
             </div>
           )}

           <div style={styles.card}>
             <div 
               style={{
                 border: "2px dashed #cbd5e1",
                 borderRadius: 12,
                 padding: 48,
                 textAlign: "center",
                 background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
               }}
               onDragOver={(e) => e.preventDefault()}
               onDrop={(e) => {
                 e.preventDefault();
                 const f = e.dataTransfer.files[0];
                 if (f) onFileInput({ target: { files: [f] } });
               }}
             >
               <div style={{ margin: "0 auto 16px", width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", display: "grid", placeItems: "center" }}>
                 <Gauge size={40} color="#fff" />
               </div>
               <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 20, color: "#111827" }}>
                 Upload Property Financial Documents
               </div>
               <div style={{ marginBottom: 16, fontSize: 14, color: "#6b7280" }}>
                 P&L statements, T12 reports, rent rolls, offering memorandums
               </div>
               <input 
                 id="fileInput" 
                 type="file" 
                 accept=".pdf,.csv,.xlsx,.xls" 
                 onChange={onFileInput} 
                 style={{ display: "none" }} 
               />
               <label htmlFor="fileInput" style={{ 
                 ...styles.button, 
                 cursor: "pointer", 
                 background: "linear-gradient(135deg, #3b82f6, #1d4ed8)"
               }}>
                 <Upload size={18} /> Choose File
               </label>
             </div>
           </div>

           <div style={{
               marginTop: '24px',
               padding: '24px',
               background: 'linear-gradient(135deg, #f59e0b, #d97706)',
               borderRadius: '12px',
               textAlign: 'center',
               color: 'white',
               display: 'none'
             }}>
               <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', color: 'white' }}>
                 Monthly Limit Reached
               </h3>
               <p style={{ marginBottom: '20px', opacity: 0.9 }}>
                 Placeholder - hidden
               </p>
               <button
                 onClick={() => setCurrentPage ? setCurrentPage('dashboard') : window.location.href = '/dashboard'}
                 style={{
                   padding: '12px 32px',
                   backgroundColor: 'white',
                   color: '#f59e0b',
                   border: 'none',
                   borderRadius: '8px',
                   fontSize: '16px',
                   fontWeight: '600',
                   cursor: 'pointer'
                 }}
               >
                 Upgrade to Power Plan
               </button>
             </div>
         </div>
       </div>
     </div>
   );
 }

 if (step === "pageSelect") {
   return (
     <div style={styles.page}>
       <div style={styles.container}>
         <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
           <button 
             onClick={() => setCurrentPage ? setCurrentPage('underwrite') : window.location.href = '/'} 
             style={styles.homeButton}
           >
             <ArrowLeft size={16} /> Back to Underwriting Options
           </button>
           <button style={{ ...styles.button, background: "#f3f4f6", color: "#374151" }} onClick={() => setStep("upload")}>
             <ArrowLeft size={16} /> Back to Upload
           </button>
         </div>
         
         <h1 style={styles.h1}>
           {file?.type === "application/pdf" ? "Select Pages to Analyze" : "Ready to Analyze"}
         </h1>

         {error && (
           <div style={{ marginBottom: 20, padding: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12 }}>
             <AlertCircle size={20} color="#b91c1c" />
             <span style={{ color: "#991b1b", fontSize: 14 }}>{error}</span>
           </div>
         )}

         <div style={styles.card}>
           {file?.type === "application/pdf" ? (
             <>
               <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
                 <button style={{ ...styles.button, background: "#10b981" }} onClick={selectAll}>
                   Select All
                 </button>
                 <button style={{ ...styles.button, background: "#6b7280" }} onClick={clearAll}>
                   Clear All
                 </button>
                 <span style={{ alignSelf: "center", fontSize: 14, color: "#6b7280", fontWeight: 600 }}>
                   {selectedPages.size} selected
                 </span>
               </div>

               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, maxHeight: 400, overflowY: "auto" }}>
                 {loadingPreview ? (
                   <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60 }}>
                     <Loader size={32} />
                     <div>Generating previews...</div>
                   </div>
                 ) : (
                   pdfPages.map((p) => (
                     <div
                       key={p.pageNum}
                       onClick={() => togglePage(p.pageNum)}
                       style={{
                         border: selectedPages.has(p.pageNum) ? "3px solid #10b981" : "2px solid #e5e7eb",
                         borderRadius: 12,
                         padding: 8,
                         cursor: "pointer",
                         background: selectedPages.has(p.pageNum) ? "#ecfdf5" : "#fff",
                         position: "relative",
                       }}
                     >
                       <img src={p.thumbnail} alt={`Page ${p.pageNum}`} style={{ width: "100%", borderRadius: 8 }} />
                       <div style={{ textAlign: "center", marginTop: 8, fontSize: 13, fontWeight: 600 }}>
                         Page {p.pageNum}
                       </div>
                       {selectedPages.has(p.pageNum) && (
                         <div style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "#10b981", display: "grid", placeItems: "center" }}>
                           <Check size={16} color="#fff" />
                         </div>
                       )}
                     </div>
                   ))
                 )}
               </div>
             </>
           ) : (
             <div style={{ textAlign: "center", padding: 40 }}>
               <CheckCircle size={64} color="#10b981" />
               <div style={{ marginTop: 16, fontSize: 18, fontWeight: 600 }}>
                 Spreadsheet ready for analysis
               </div>
               <div style={{ marginTop: 8, color: "#6b7280" }}>
                 File: {file?.name}
               </div>
             </div>
           )}

           <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
             <button
               style={{ ...styles.button, background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
               disabled={file?.type === "application/pdf" && selectedPages.size === 0}
               onClick={processNow}
             >
               Start Health Check <ArrowRight size={18} />
             </button>
           </div>
         </div>
       </div>
     </div>
   );
 }

 if (step === "verification") {
   return (
     <div style={styles.page}>
       <div style={styles.container}>
         <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
           <button 
             onClick={() => setCurrentPage ? setCurrentPage('underwrite') : window.location.href = '/'} 
             style={styles.homeButton}
           >
             <ArrowLeft size={16} /> Back to Underwriting Options
           </button>
           <button style={{ ...styles.button, background: "#f3f4f6", color: "#374151" }} onClick={reset}>
             <ArrowLeft size={16} /> Start Over
           </button>
         </div>
         
         <h1 style={styles.h1}>Data Verification Required</h1>

         {error && (
           <div style={{ marginBottom: 20, padding: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12 }}>
             <AlertCircle size={20} color="#b91c1c" />
             <span style={{ color: "#991b1b", fontSize: 14 }}>{error}</span>
           </div>
         )}

         <div style={styles.card}>
           <div style={{ marginBottom: 20 }}>
             <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
               <Database size={20} /> Missing Critical Information
             </h3>
             <p style={{ color: "#6b7280", marginBottom: 16 }}>
               Please provide the missing information below to continue with the health check analysis.
             </p>
           </div>

           {verificationResult?.missing_critical_fields?.length > 0 && (
             <div style={{ marginBottom: 24 }}>
               <h4 style={{ marginBottom: 12, color: "#dc2626" }}>Required Fields:</h4>
               <div style={{ display: "grid", gap: 12 }}>
                 {verificationResult.missing_critical_fields.map((field, i) => (
                   <div key={i}>
                     <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                       {field.replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                     </label>
                     <input
                       type="text"
                       value={userFixes[field] || ""}
                       onChange={(e) => setUserFixes({...userFixes, [field]: e.target.value})}
                       style={styles.input}
                       placeholder={`Enter ${field.split('.').pop()}`}
                     />
                   </div>
                 ))}
               </div>
             </div>
           )}

           {verificationResult?.weak_confidence_fields?.length > 0 && (
             <div style={{ marginBottom: 24 }}>
               <h4 style={{ marginBottom: 12, color: "#d97706" }}>Optional Improvements:</h4>
               <div style={{ display: "grid", gap: 12 }}>
                 {verificationResult.weak_confidence_fields.map((field, i) => (
                   <div key={i}>
                     <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                       {field.field.replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                     </label>
                     <input
                       type="text"
                       value={userFixes[field.field] || ""}
                       onChange={(e) => setUserFixes({...userFixes, [field.field]: e.target.value})}
                       style={styles.input}
                       placeholder={field.reason}
                     />
                   </div>
                 ))}
               </div>
             </div>
           )}

           <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
             <button
               style={{ ...styles.button, background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
               onClick={handleUserFixSubmit}
             >
               Continue Health Check <ArrowRight size={18} />
             </button>
           </div>
         </div>
       </div>
     </div>
   );
 }

 if (step === "processing") {
   return (
     <div style={styles.page}>
       <div style={styles.container}>
         <div style={{ maxWidth: 600, margin: "100px auto" }}>
           <div style={styles.card}>
             <div style={{ textAlign: "center" }}>
               <div style={{ margin: "0 auto 24px", width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", display: "grid", placeItems: "center" }}>
                 <Gauge size={40} color="#fff" className="animate-pulse" />
               </div>
               <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Running Health Check</h2>
               <div style={{ width: "100%", height: 12, background: "#e5e7eb", borderRadius: 999, overflow: "hidden", marginBottom: 16 }}>
                 <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #1d4ed8)", transition: "width 0.5s ease" }} />
               </div>
               <div style={{ fontSize: 14, color: "#6b7280" }}>{processingMsg}</div>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 }

 if (step === "results") {
   const health = healthCheckResult || {};
   
   return (
     <div style={styles.page}>
       <div style={styles.container}>
         <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
           <button 
             onClick={() => setCurrentPage ? setCurrentPage('underwrite') : window.location.href = '/'} 
             style={styles.homeButton}
           >
             <ArrowLeft size={16} /> Back to Underwriting Options
           </button>
           <button style={{ ...styles.button, background: "#f3f4f6", color: "#374151" }} onClick={reset}>
             <RefreshCw size={16} /> Analyze Another Property
           </button>
         </div>
         
         <h1 style={styles.h1}>Financial Health Check Results</h1>

         {/* Property Snapshot */}
         {health.snapshot && (
           <div style={{ ...styles.card, background: "linear-gradient(135deg, #f0f9ff, #ffffff)", borderColor: "#3b82f6", borderWidth: 2 }}>
             <h3 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
               <Building size={20} /> Property Snapshot
             </h3>
             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
               <div style={styles.metricCard}>
                 <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Property</div>
                 <div style={{ fontSize: 16, fontWeight: 600 }}>{health.snapshot.property_name || "Not specified"}</div>
                 <div style={{ fontSize: 12, color: "#6b7280" }}>{health.snapshot.address || ""}</div>
               </div>
               <div style={styles.metricCard}>
                 <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Built/Renovated</div>
                 <div style={{ fontSize: 16, fontWeight: 600 }}>{health.snapshot.year_built_or_renovated || "Not provided"}</div>
               </div>
               <div style={styles.metricCard}>
                 <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Units</div>
                 <div style={{ fontSize: 16, fontWeight: 600 }}>{health.snapshot.unit_count || "Not specified"}</div>
                 <div style={{ fontSize: 12, color: "#6b7280" }}>{health.snapshot.unit_mix || ""}</div>
               </div>
               <div style={styles.metricCard}>
                 <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Occupancy</div>
                 <div style={{ fontSize: 16, fontWeight: 600 }}>{health.snapshot.occupancy || "Not provided"}</div>
               </div>
               <div style={styles.metricCard}>
                 <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Financials Present</div>
                 <div style={{ fontSize: 14, fontWeight: 600 }}>{health.snapshot.financials_present || "Limited data"}</div>
               </div>
             </div>
             {health.snapshot.rent_notes && (
               <div style={{ marginTop: 16, padding: 12, background: "#f0f9ff", borderRadius: 8 }}>
                 <div style={{ fontSize: 14, color: "#1e40af" }}>
                   <strong>Rent Notes:</strong> {health.snapshot.rent_notes}
                 </div>
               </div>
             )}
           </div>
         )}

         {/* Operational Issues */}
         {health.operational_issues?.length > 0 && (
           <div style={styles.card}>
             <h3 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
               <AlertTriangle size={20} color="#dc2626" /> Operational Issues
             </h3>
             <div style={{ display: "grid", gap: 12 }}>
               {health.operational_issues.map((issue, i) => (
                 <div key={i} style={{ 
                   padding: 12, 
                   background: "#fef2f2", 
                   borderRadius: 8,
                   borderLeft: `4px solid ${getSeverityColor(issue.severity)}`
                 }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                     <div style={{ flex: 1 }}>
                       <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{issue.text}</div>
                       <div style={{ fontSize: 12, color: getSeverityColor(issue.severity), fontWeight: 600, textTransform: "uppercase" }}>
                         {issue.severity} Priority
                       </div>
                     </div>
                     {issue.pages?.length > 0 && (
                       <div style={{ fontSize: 11, color: "#6b7280" }}>
                         Page{issue.pages.length > 1 ? 's' : ''} {issue.pages.join(', ')}
                       </div>
                     )}
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* NOI Levers */}
         {(health.noi_levers?.revenue?.length > 0 || health.noi_levers?.expenses?.length > 0) && (
           <div style={styles.card}>
             <h3 style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
               <TrendingUp size={20} color="#10b981" /> NOI Improvement Opportunities
             </h3>
             
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
               {/* Revenue Levers */}
               {health.noi_levers.revenue?.length > 0 && (
                 <div>
                   <h4 style={{ marginBottom: 12, color: "#10b981", display: "flex", alignItems: "center", gap: 8 }}>
                     <DollarSign size={16} /> Revenue Enhancement
                   </h4>
                   <div style={{ display: "grid", gap: 12 }}>
                     {health.noi_levers.revenue.map((lever, i) => (
                       <div key={i} style={{ 
                         padding: 12, 
                         background: "#ecfdf5", 
                         borderRadius: 8,
                         borderLeft: `4px solid ${getImpactColor(lever.impact_level)}`
                       }}>
                         <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{lever.text}</div>
                         {lever.estimated_annual_impact && (
                           <div style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>
                             Impact: {lever.estimated_annual_impact}
                           </div>
                         )}
                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                           <div style={{ fontSize: 11, color: getImpactColor(lever.impact_level), fontWeight: 600, textTransform: "uppercase" }}>
                             {lever.impact_level} Impact
                           </div>
                           {lever.pages?.length > 0 && (
                             <div style={{ fontSize: 11, color: "#6b7280" }}>
                               Page{lever.pages.length > 1 ? 's' : ''} {lever.pages.join(', ')}
                             </div>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Expense Levers */}
               {health.noi_levers.expenses?.length > 0 && (
                 <div>
                   <h4 style={{ marginBottom: 12, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
                     <BarChart3 size={16} /> Expense Reduction
                   </h4>
                   <div style={{ display: "grid", gap: 12 }}>
                     {health.noi_levers.expenses.map((lever, i) => (
                       <div key={i} style={{ 
                         padding: 12, 
                         background: "#fef2f2", 
                         borderRadius: 8,
                         borderLeft: `4px solid ${getImpactColor(lever.impact_level)}`
                       }}>
                         <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{lever.text}</div>
                         {lever.estimated_annual_impact && (
                           <div style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
                             Savings: {lever.estimated_annual_impact}
                           </div>
                         )}
                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                           <div style={{ fontSize: 11, color: getImpactColor(lever.impact_level), fontWeight: 600, textTransform: "uppercase" }}>
                             {lever.impact_level} Impact
                           </div>
                           {lever.pages?.length > 0 && (
                             <div style={{ fontSize: 11, color: "#6b7280" }}>
                               Page{lever.pages.length > 1 ? 's' : ''} {lever.pages.join(', ')}
                             </div>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
           </div>
         )}

         {/* Market Position */}
         {(health.market_position?.competitive_advantages?.length > 0 || health.market_position?.competitive_disadvantages?.length > 0) && (
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
             {health.market_position.competitive_advantages?.length > 0 && (
               <div style={styles.card}>
                 <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontWeight: 600, color: "#059669" }}>
                   <CheckCircle size={20} /> Competitive Advantages
                 </div>
                 {health.market_position.competitive_advantages.map((advantage, i) => (
                   <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
                     <Check size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                     <div>
                       <span>{advantage.text}</span>
                       {advantage.pages?.length > 0 && (
                         <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                           Page{advantage.pages.length > 1 ? 's' : ''} {advantage.pages.join(', ')}
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             )}
             
             {health.market_position.competitive_disadvantages?.length > 0 && (
               <div style={styles.card}>
                 <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontWeight: 600, color: "#dc2626" }}>
                   <XCircle size={20} /> Competitive Challenges
                 </div>
                 {health.market_position.competitive_disadvantages.map((disadvantage, i) => (
                   <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
                     <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                     <div>
                       <span>{disadvantage.text}</span>
                       {disadvantage.pages?.length > 0 && (
                         <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                           Page{disadvantage.pages.length > 1 ? 's' : ''} {disadvantage.pages.join(', ')}
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         )}

         {/* Strengths and Weak Spots */}
         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
           {health.strengths?.length > 0 && (
             <div style={styles.card}>
               <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontWeight: 600, color: "#059669" }}>
                 <CheckCircle size={20} /> Property Strengths
               </div>
               {health.strengths.map((strength, i) => (
                 <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
                   <Check size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                   <div>
                     <span>{strength.text}</span>
                     {strength.pages?.length > 0 && (
                       <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                         Page{strength.pages.length > 1 ? 's' : ''} {strength.pages.join(', ')}
                       </div>
                     )}
                   </div>
                 </div>
               ))}
             </div>
           )}
           
           {health.weak_spots?.length > 0 && (
             <div style={styles.card}>
               <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontWeight: 600, color: "#dc2626" }}>
                 <AlertTriangle size={20} /> Areas for Improvement
               </div>
               {health.weak_spots.map((spot, i) => (
                 <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
                   <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                   <div>
                     <span>{spot.text}</span>
                     {spot.pages?.length > 0 && (
                       <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                         Page{spot.pages.length > 1 ? 's' : ''} {spot.pages.join(', ')}
                       </div>
                     )}
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>

         {/* Force Appreciation */}
         {health.force_appreciation?.length > 0 && (
           <div style={styles.card}>
             <h3 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
               <Zap size={20} color="#f59e0b" /> Value Enhancement Opportunities
             </h3>
             <div style={{ display: "grid", gap: 12 }}>
               {health.force_appreciation.map((opportunity, i) => (
                 <div key={i} style={{ 
                   padding: 12, 
                   background: "#fefbef", 
                   borderRadius: 8,
                   borderLeft: `4px solid ${getImpactColor(opportunity.value_impact)}`
                 }}>
                   <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{opportunity.text}</div>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <div style={{ fontSize: 11, color: getImpactColor(opportunity.value_impact), fontWeight: 600, textTransform: "uppercase" }}>
                       {opportunity.value_impact} Value Impact
                     </div>
                     {opportunity.pages?.length > 0 && (
                       <div style={{ fontSize: 11, color: "#6b7280" }}>
                         Page{opportunity.pages.length > 1 ? 's' : ''} {opportunity.pages.join(', ')}
                       </div>
                     )}
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* Tenant Retention */}
         {health.tenant_retention?.length > 0 && (
           <div style={styles.card}>
             <h3 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
               <Users size={20} color="#3b82f6" /> Tenant Retention Analysis
             </h3>
             <div style={{ display: "grid", gap: 12 }}>
               {health.tenant_retention.map((item, i) => (
                 <div key={i} style={{ 
                   padding: 12, 
                   background: "#f0f9ff", 
                   borderRadius: 8,
                   borderLeft: "4px solid #3b82f6"
                 }}>
                   <div style={{ fontSize: 14, fontWeight: 600 }}>{item.text}</div>
                   {item.pages?.length > 0 && (
                     <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                       Page{item.pages.length > 1 ? 's' : ''} {item.pages.join(', ')}
                     </div>
                   )}
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* Missing Items */}
         {health.missing_items?.length > 0 && (
           <div style={styles.card}>
             <h3 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
               <FileText size={20} color="#6b7280" /> Additional Data Needed
             </h3>
             <div style={{ display: "grid", gap: 8 }}>
               {health.missing_items.map((item, i) => (
                 <div key={i} style={{ 
                   padding: 12, 
                   background: "#f9fafb", 
                   borderRadius: 8,
                   fontSize: 14
                 }}>
                   • {item}
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* Action Buttons */}
         <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
           <button style={styles.button} onClick={reset}>
             <Upload size={18} /> Analyze Another Property
           </button>
           <button style={{ ...styles.button, background: "linear-gradient(135deg, #10b981, #059669)" }} onClick={() => {
             const report = {
               snapshot: health.snapshot,
               operational_issues: health.operational_issues,
               noi_levers: health.noi_levers,
               market_position: health.market_position,
               strengths: health.strengths,
               weak_spots: health.weak_spots,
               force_appreciation: health.force_appreciation,
               tenant_retention: health.tenant_retention,
               missing_items: health.missing_items,
               source_check: health.source_check,
               verification_data: verificationResult,
               analysis_date: new Date().toISOString()
             };
             const dataStr = JSON.stringify(report, null, 2);
             const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
             const linkElement = document.createElement('a');
             linkElement.setAttribute('href', dataUri);
             linkElement.setAttribute('download', `health_check_report_${Date.now()}.json`);
             linkElement.click();
           }}>
             <Download size={18} /> Export Health Check Report
           </button>
         </div>

         {/* Source Check */}
         {health.source_check && (
           <div style={{ marginTop: 24, padding: 12, background: "#f3f4f6", borderRadius: 8, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
             {health.source_check}
           </div>
         )}

         {/* Upgrade Modal */}
         {showUpgradeModal && (
           <div style={{
             position: 'fixed',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             background: 'rgba(0, 0, 0, 0.5)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             zIndex: 9999,
           }}>
             <div style={{
               background: '#fff',
               borderRadius: 16,
               padding: 32,
               maxWidth: 500,
               width: '90%',
               boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
             }}>
               <div style={{ textAlign: 'center', marginBottom: 24 }}>
                 <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                 <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
                   60-Page Limit Reached
                 </h2>
                 <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.6 }}>
                   You've processed 60 pages this month. Purchase 60 more pages to continue analyzing deals.
                 </p>
               </div>

               <div style={{ 
                 background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                 border: '2px solid #0ea5e9',
                 borderRadius: 12,
                 padding: 24,
                 marginBottom: 24,
                 textAlign: 'center',
               }}>
                 <div style={{ fontSize: 14, color: '#0369a1', fontWeight: 600, marginBottom: 8 }}>
                   60 PAGE PACK
                 </div>
                 <div style={{ fontSize: 36, fontWeight: 800, color: '#0369a1' }}>
                   $29
                 </div>
                 <div style={{ fontSize: 14, color: '#0369a1', marginTop: 4 }}>
                   One-time purchase • No subscription
                 </div>
               </div>

               <div style={{ display: 'flex', gap: 12 }}>
                 <button
                   onClick={async () => {
                     const userId = currentUser?.id;
                     if (!userId) {
                       alert('Please log in to purchase additional pages');
                       return;
                     }
                     
                     try {
                       const response = await fetch('/api/proxy?endpoint=/api/purchase-additional-pages', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ user_id: userId })
                       });
                       
                       if (!response.ok) {
                         const errorData = await response.json().catch(() => ({}));
                         throw new Error(errorData.detail || 'Failed to create checkout session');
                       }
                       
                       const data = await response.json();
                       if (data.url || data.checkout_url) {
                         window.location.href = data.url || data.checkout_url;
                       } else {
                         throw new Error('No checkout URL returned');
                       }
                     } catch (error) {
                       console.error('Purchase error:', error);
                       alert('Failed to start purchase. Please try again.');
                     }
                   }}
                   style={{
                     flex: 1,
                     padding: '14px 28px',
                     background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                     color: '#fff',
                     border: 'none',
                     borderRadius: 10,
                     fontSize: 16,
                     fontWeight: 700,
                     cursor: 'pointer',
                     boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                   }}
                 >
                   Buy 60 Pages - $29
                 </button>
               </div>
               <button
                 onClick={() => window.location.href = '/'}
                 style={{
                   width: '100%',
                   marginTop: 12,
                   padding: '10px',
                   background: 'transparent',
                   color: '#6b7280',
                   border: 'none',
                   fontSize: 14,
                   cursor: 'pointer',
                   textDecoration: 'underline',
                 }}
               >
                 Go to Dashboard
               </button>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 }

 return null;
};

export default PropertyAnalyzerPage;