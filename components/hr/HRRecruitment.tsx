import React, { useState } from 'react';
import { Candidate } from '../../types';
import { getHRCandidates } from '../../services/workforceService';
import { analyzeResumeWithN8N } from '../../services/n8nService';
import { ResumeAnalysisResult } from '../../services/geminiService'; // Keeping type for now or can redefine if needed
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { BackButton } from '../ui/BackButton';
import {
    CheckCircle2,
    FileText,
    UploadCloud,
    Loader2,
    Briefcase,
    ArrowRight,
    Filter,
    Sparkles,
    X,
    TrendingUp,
    AlertCircle,
    EyeOff,
    ShieldCheck,
    UserPlus,
    UserMinus,
    ListChecks,
    Pencil,
    Check
} from 'lucide-react';

const useAntigravity = (key: string, initialValue: string) => {
    const [value, setValue] = useState(() => {
        const saved = localStorage.getItem(key);
        return saved || initialValue;
    });
    React.useEffect(() => {
        localStorage.setItem(key, value);
    }, [key, value]);
    return [value, setValue] as const;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'SCREENING':
        case 'OFFER':
        case 'Screen':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
        case 'REJECTED':
        case 'Reject':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
        case 'INTERVIEW':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
        default:
            return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
};

export const HRRecruitment: React.FC = () => {
    // --- EXISTING AI AGENT STATE ---
    const [jobDescription, setJobDescription] = useAntigravity('operos_active_jd', '');
    const [isEditingJD, setIsEditingJD] = useState(false);
    const [isJobSet, setIsJobSet] = useState(false);
    const [candidates, setCandidates] = useState<Candidate[]>([]);

    // Memory Leak Protection
    const isMounted = React.useRef(true);
    React.useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    React.useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const data = await getHRCandidates();
                if (isMounted.current) setCandidates(data);
            } catch (e) {
                console.error("Failed to fetch candidates", e);
            }
        };
        fetchCandidates();
    }, []);
    const [isAnonymized, setIsAnonymized] = useState(false);
    const [activeTab, setActiveTab] = useState<'ALL' | 'SCREENING' | 'INTERVIEW'>('ALL');
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

    const [isDragOver, setIsDragOver] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // --- NEW: LIFECYCLE & JOBS STATE ---
    const [activeModule, setActiveModule] = useState<'PIPELINE' | 'LIFECYCLE'>('PIPELINE');

    // --- NEW: 2-STEP UPLOAD & DECISION STATE ---
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [candidateEmail, setCandidateEmail] = useState('');
    const [isProcessingDecision, setIsProcessingDecision] = useState<string | null>(null);

    const confirmAnalysis = async () => {
        if (!pendingFile || !candidateEmail) {
            alert("Please provide a valid email address.");
            return;
        }

        // 1. Capture the file reference locally so we can pass it safely
        const fileToProcess = pendingFile;

        // 2. Close the modal IMMEDIATELY so the user sees the "Analyzing" loader
        setPendingFile(null);

        // 3. Start the analysis (The email state is still valid here)
        await processFile(fileToProcess);

        // 4. Reset email only after everything is done
        setCandidateEmail('');
    };

    const sendDecisionEmail = async (candidate: Candidate, status: 'HIRED' | 'REJECTED') => {
        if (!candidate.email) {
            alert("No email address found for this candidate.");
            return;
        }

        const decisionType = status === 'HIRED' ? 'INVITE' : 'REJECT';
        if (!confirm(`Are you sure you want to send a ${decisionType} email to ${candidate.name} (${candidate.email})?`)) return;

        setIsProcessingDecision(candidate.id);
        try {
            // Construct the new URL by replacing the analysis endpoint with the decision endpoint
            // If VITE_N8N_WEBHOOK_URL is '.../webhook/analyze-resume', this becomes '.../webhook/decision-email'
            const emailUrl = import.meta.env.VITE_N8N_WEBHOOK_URL.replace('analyze-resume', 'decision-email');

            const payload = {
                name: candidate.name,
                email: candidate.email,
                role: candidate.roleApplied,
                // Map 'HIRED' to 'ACCEPT' to match n8n workflow "Switch" node logic
                status: status === 'HIRED' ? 'ACCEPT' : status
            };

            console.log("📧 Sending Decision Email:", { url: emailUrl, payload });

            await fetch(emailUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            alert(`✅ ${status === 'HIRED' ? 'Interview Invitation' : 'Rejection Email'} sent!`);

            // Optimistic UI Update
            setCandidates(prev => prev.map(c =>
                c.id === candidate.id ? { ...c, status: status === 'HIRED' ? 'INTERVIEW' : 'REJECTED' } : c
            ));

        } catch (error) {
            alert("Failed to send email. Check console.");
            console.error(error);
        } finally {
            setIsProcessingDecision(null);
        }
    };


    const MOCK_JOBS = [
        { id: 1, title: 'Senior Backend Engineer', dept: 'Engineering', applicants: 12, status: 'Active' },
        { id: 2, title: 'Product Manager', dept: 'Product', applicants: 5, status: 'Active' },
        { id: 3, title: 'HR Associate', dept: 'People Ops', applicants: 45, status: 'Closing Soon' },
    ];

    const MOCK_ONBOARDING = [
        { id: 1, name: 'Alice Guo', role: 'Designer', start: 'Jan 15', status: 'Pending IT Setup' },
        { id: 2, name: 'David Kim', role: 'DevOps', start: 'Jan 22', status: 'Documents Signed' },
    ];

    const MOCK_OFFBOARDING = [
        { id: 3, name: 'Greg House', role: 'Analyst', end: 'Jan 10', status: 'Exit Interview Pending' },
    ];

    const toggleAnonymization = () => setIsAnonymized(!isAnonymized);

    const handleSetJob = () => {
        if (jobDescription.length > 10) {
            setIsJobSet(true);
            setCandidates([]);
        } else {
            alert("Please enter a valid job description.");
        }
    };

    const handleAutoAdvance = () => {
        let movedCount = 0;
        const updatedCandidates = candidates.map(c => {
            if (c.status === 'SCREENING' && c.compatibilityScore >= 80) {
                movedCount++;
                return { ...c, status: 'INTERVIEW' as const };
            }
            return c;
        });

        setCandidates(updatedCandidates);
        if (movedCount > 0) {
            alert(`Agent Report: ${movedCount} top-tier candidates were automatically advanced to the Interview stage based on JD compatibility.`);
            setActiveTab('INTERVIEW');
        } else {
            alert("No candidates met the threshold (>80%) for auto-advancement.");
        }
    };

    // --- UPLOAD HANDLERS ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            setPendingFile(files[0]);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setPendingFile(e.target.files[0]);
        }
    };

    const processFile = async (file: File) => {
        setIsAnalyzing(true);
        setUploadError('');

        // Validation - Prevent empty JD
        if (!jobDescription || jobDescription.length < 10) {
            alert("Please define a Job Description first");
            setIsAnalyzing(false);
            if (pendingFile) setPendingFile(null); // Reset if validation fails
            return;
        }

        try {
            console.log('Sending JD to n8n:', jobDescription);
            // Call n8n Service with the captured email
            // Note: If called directly from confirmAnalysis, candidateEmail state is used.
            // If processFile is called directly (legacy path), we might not have email, but flow ensures pendingFile checks.
            const emailToUse = candidateEmail || "mjyothiraditya@gmail.com"; // Fallback or strict requirement
            const response = await analyzeResumeWithN8N(file, jobDescription, emailToUse);

            if (!response.success || !response.data) {
                throw new Error(response.error || "Analysis failed");
            }

            let analysis = response.data;
            console.log('RAW N8N DATA:', analysis);

            // Handle double-encoded JSON if necessary
            if (typeof analysis === 'string') {
                try {
                    analysis = JSON.parse(analysis);
                } catch (e) {
                    // It might just be a plain string message
                }
            }

            // Check for embedded error
            if (analysis.error) {
                throw new Error(analysis.error);
            }

            const newCandidate: Candidate = {
                id: Math.random().toString(36).substr(2, 9),
                name: analysis.name || analysis.candidateName || "Parsed Candidate",
                email: candidateEmail, // Store the captured email
                roleApplied: "Applicant (JD Match)",
                status: analysis.recommendation === "Reject" ? "REJECTED" : "SCREENING",
                compatibilityScore: Number(analysis.matchScore) || Number(analysis.score) || 0,
                summary: analysis.summary || analysis.text || "No summary available.",
                strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
                areasForImprovement: Array.isArray(analysis.areasForImprovement) ? analysis.areasForImprovement : (Array.isArray(analysis.missingSkills) ? analysis.missingSkills : []),
                recommendation: (['Screen', 'Reject', 'Review Manually'].includes(analysis.recommendation) ? analysis.recommendation : 'Review Manually') as any
            };

            setCandidates(prev => [newCandidate, ...prev]);
        } catch (err: any) {
            console.error("Upload Error:", err);
            const errorMessage = err.message || "";

            // --- FALLBACK FOR FREE TIER LIMIT ---
            if (errorMessage.includes("AI is currently overloaded") || errorMessage.includes("503") || errorMessage.includes("429")) {
                // Show a gentle toast/alert
                alert("⚠️ AI Rate Limited (Free Tier). Switching to Simulated Mode so you can keep testing.");

                const mockCandidate: Candidate = {
                    id: "sim-" + Math.random().toString(36).substr(2, 9),
                    name: "Jyothiraditya Mamidala (Simulated)",
                    email: candidateEmail, // Persist captured email even in simulation
                    roleApplied: "Applicant (Back-up)",
                    status: "SCREENING",
                    compatibilityScore: 89,
                    summary: "[SIMULATED RESULT] The AI service is currently cooling down due to high traffic/free tier limits. This mock result proves the frontend logic works perfectly.",
                    strengths: ["Rapid Prototyping", "Frontend Architecture", "Crisis Management"],
                    areasForImprovement: ["Waiting for API Cooldown"]
                };
                setCandidates(prev => [mockCandidate, ...prev]);
                setUploadError(""); // Clear error since we handled it gracefully
            } else {
                setUploadError("Failed to analyze file. " + errorMessage);
                alert("Error: AI Analysis failed. " + errorMessage);
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const filteredCandidates = candidates.filter(c => {
        if (activeTab === 'ALL') return true;
        return c.status === activeTab;
    });

    // --- RENDER ---
    return (
        <div className="space-y-6 animate-in fade-in">

            {/* Sub-Nav for Recruitment Module */}
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 overflow-x-auto">
                <button
                    onClick={() => setActiveModule('PIPELINE')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeModule === 'PIPELINE' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    <UserPlus className="w-4 h-4" /> Recruitment Pipeline
                </button>
                <button
                    onClick={() => setActiveModule('LIFECYCLE')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeModule === 'LIFECYCLE' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    <ListChecks className="w-4 h-4" /> Lifecycle (On/Offboarding)
                </button>
            </div>

            {activeModule === 'PIPELINE' && (
                <>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Talent Acquisition</h2>
                            <p className="text-slate-500 text-sm">Manage job openings and process applications.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={toggleAnonymization} className={`gap-2 ${isAnonymized ? 'bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700'} text-white transition-colors`}>
                                {isAnonymized ? <ShieldCheck className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                {isAnonymized ? 'Disable Bias Shield' : 'Anonymize Resumes'}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* LEFT COL: Job Openings List */}
                        <Card className="lg:col-span-1 h-fit">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-sm uppercase text-slate-500">Active Job Openings</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                {MOCK_JOBS.map(job => (
                                    <div key={job.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{job.title}</span>
                                            {job.status === 'Closing Soon' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                                        </div>
                                        <p className="text-xs text-slate-500">{job.dept}</p>
                                        <div className="mt-2 flex items-center justify-between text-xs">
                                            <span className="text-brand-600 font-medium bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded">{job.applicants} Applicants</span>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full text-xs mt-2 border-dashed">
                                    + Create New Posting
                                </Button>
                            </CardContent>
                        </Card>

                        {/* RIGHT COL: The Agent Pipeline (Existing Logic) */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* STAGE 1: Job Description Input */}
                            {!isJobSet ? (
                                <Card className="border-brand-200 dark:border-brand-900 shadow-xl shadow-brand-500/5">
                                    <CardHeader className="bg-brand-50/50 dark:bg-brand-900/10 border-b border-brand-100 dark:border-brand-900">
                                        <CardTitle className="flex items-center gap-2 text-brand-700 dark:text-brand-400">
                                            <Briefcase className="w-5 h-5" />
                                            Step 1: Define Job Context
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-6">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Paste the Job Description below. The AI Agent will use this to score resumes.
                                        </p>
                                        <textarea
                                            className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none text-sm leading-relaxed"
                                            placeholder="e.g. Seeking a Senior React Developer with 5+ years experience..."
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                        />
                                        <div className="flex justify-end">
                                            <Button onClick={handleSetJob} className="bg-brand-600 hover:bg-brand-700 text-white">
                                                Initialize Pipeline <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                /* STAGE 2: Upload & Analysis */
                                <div className="space-y-6">
                                    {/* Back Button for Job Context */}
                                    <div className="flex flex-col space-y-2">
                                        <BackButton onClick={() => setIsJobSet(false)} label="Back to Job Setup" className="!mb-2" />
                                        <div className="flex flex-col bg-slate-100 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-brand-100 dark:bg-brand-900/30 p-2 rounded text-brand-600">
                                                        <Briefcase className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Job Context</h3>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" onClick={() => setIsEditingJD(!isEditingJD)} className="h-8 w-8 p-0">
                                                    {isEditingJD ? <Check className="w-4 h-4 text-green-600" /> : <Pencil className="w-4 h-4 text-slate-500" />}
                                                </Button>
                                            </div>
                                            {isEditingJD ? (
                                                <textarea
                                                    className="w-full h-24 p-2 text-sm rounded-md border border-slate-700 bg-slate-900 text-white focus:ring-1 focus:ring-brand-500 outline-none resize-none"
                                                    value={jobDescription}
                                                    onChange={(e) => setJobDescription(e.target.value)}
                                                />
                                            ) : (
                                                <p className="text-xs text-slate-500 max-w-md line-clamp-2 px-1">{jobDescription}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Resume Upload Agent */}
                                        <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                            <CardContent className="flex flex-col justify-center items-center p-6 text-center transition-colors">
                                                {isAnalyzing ? (
                                                    <div className="flex flex-col items-center animate-pulse">
                                                        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-2" />
                                                        <h3 className="text-sm font-semibold">AI Analyzing Match...</h3>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onDragOver={handleDragOver}
                                                        onDragLeave={handleDragLeave}
                                                        onDrop={handleDrop}
                                                        className={`w-full flex flex-col items-center justify-center cursor-pointer ${isDragOver ? 'opacity-50' : ''}`}
                                                        onClick={() => document.getElementById('resume-upload')?.click()}
                                                    >
                                                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                                                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Upload Candidates</h3>
                                                        <p className="text-xs text-slate-500">Drag & Drop Resume (PDF, TXT)</p>
                                                        <input type="file" id="resume-upload" className="hidden" accept=".txt,.pdf" onChange={handleFileSelect} />
                                                        {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Email Input Modal */}
                                    {pendingFile && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                                            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-bold">Enter Candidate Details</h3>
                                                    <button onClick={() => setPendingFile(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-slate-500 mb-4">Enter the candidate's email address found in <strong>{pendingFile.name}</strong> to enable automated communication.</p>

                                                <input
                                                    type="email"
                                                    placeholder="candidate@example.com"
                                                    className="w-full p-2 border rounded mb-4 text-sm"
                                                    value={candidateEmail}
                                                    onChange={(e) => setCandidateEmail(e.target.value)}
                                                />

                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" onClick={() => setPendingFile(null)}>Cancel</Button>
                                                    <Button onClick={confirmAnalysis} disabled={!candidateEmail}>Analyze Resume</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Results Table */}
                                    <Card className="overflow-hidden">
                                        <div className="border-b border-slate-100 dark:border-slate-800 flex items-center px-4 gap-4">
                                            {['ALL', 'SCREENING', 'INTERVIEW'].map(tab => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab as any)}
                                                    className={`py-3 text-xs font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400'}`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                            <div className="ml-auto py-2">
                                                <Button size="sm" onClick={handleAutoAdvance} className="text-xs h-8 bg-purple-600 hover:bg-purple-700">
                                                    <Sparkles className="w-3 h-3 mr-1" /> Auto-Advance
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/50">
                                                    <tr>
                                                        <th className="px-4 py-2">Candidate</th>
                                                        <th className="px-4 py-2">Match</th>
                                                        <th className="px-4 py-2">Status</th>
                                                        <th className="px-4 py-2">Action</th>
                                                        <th className="px-4 py-2">Decision</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {filteredCandidates.map((c) => (
                                                        <tr key={c.id}>
                                                            <td className="px-4 py-3 font-medium flex items-center gap-2">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isAnonymized ? 'bg-slate-200 text-slate-500' : 'bg-brand-100 text-brand-600'}`}>
                                                                    {isAnonymized ? '?' : c.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div>{isAnonymized ? `ID-${c.id.substring(0, 4)}` : c.name}</div>
                                                                    {c.email && <div className="text-[10px] text-slate-400">{c.email}</div>}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`font-bold ${c.compatibilityScore > 80 ? 'text-emerald-600' : 'text-slate-600'}`}>{c.compatibilityScore}%</span>
                                                            </td>
                                                            <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded border ${getStatusColor(c.status)}`}>{c.status}</span></td>
                                                            <td className="px-4 py-3">
                                                                <Button size="sm" variant="ghost" onClick={() => setSelectedCandidate(c)} className="h-6 text-xs">View</Button>
                                                            </td>
                                                            <td className="px-4 py-3 flex gap-2">
                                                                {isProcessingDecision === c.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                                                                ) : (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => sendDecisionEmail(c, 'HIRED')}
                                                                            className="h-8 w-8 p-0 rounded-full bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                                                                            title="Hire (Send Interview Invite)"
                                                                            disabled={c.status === 'INTERVIEW'}
                                                                        >
                                                                            <Check className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => sendDecisionEmail(c, 'REJECTED')}
                                                                            className="h-8 w-8 p-0 rounded-full bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                                                                            title="Reject (Send Rejection Email)"
                                                                            disabled={c.status === 'REJECTED'}
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {filteredCandidates.length === 0 && (
                                                        <tr><td colSpan={4} className="p-4 text-center text-slate-400 text-xs">No candidates.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Candidate Detail Modal */}
                    {selectedCandidate && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                                    <BackButton onClick={() => setSelectedCandidate(null)} label="Close Report" className="!mb-0" />
                                </div>
                                <div className="p-6 overflow-y-auto">
                                    <h3 className="font-bold text-lg mb-2">{isAnonymized ? 'Anonymous' : selectedCandidate.name}</h3>
                                    <p className="text-sm text-slate-500 mb-4">{selectedCandidate.summary}</p>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase text-emerald-600 mb-1">Strengths</h4>
                                            <ul className="list-disc pl-4 text-sm text-slate-600">{selectedCandidate.strengths?.map(s => <li key={s}>{s}</li>)}</ul>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase text-orange-600 mb-1">Improvements</h4>
                                            <ul className="list-disc pl-4 text-sm text-slate-600">{selectedCandidate.areasForImprovement?.map(s => <li key={s}>{s}</li>)}</ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeModule === 'LIFECYCLE' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 text-emerald-600"><UserPlus className="w-5 h-5" /> Onboarding Tracker</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {MOCK_ONBOARDING.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</p>
                                            <p className="text-xs text-slate-500">{p.role} • Starts: {p.start}</p>
                                        </div>
                                        <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-slate-900 rounded shadow-sm text-emerald-700">{p.status}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><UserMinus className="w-5 h-5" /> Offboarding Tracker</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {MOCK_OFFBOARDING.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</p>
                                            <p className="text-xs text-slate-500">{p.role} • Ends: {p.end}</p>
                                        </div>
                                        <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-slate-900 rounded shadow-sm text-red-700">{p.status}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};