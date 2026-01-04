import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Users, TrendingUp, PieChart, Briefcase, FileText, Download, Eye } from 'lucide-react';

export const HRAnalytics: React.FC = () => {
    const data = {
        headcount: 142,
        turnover: 4.2,
        activePostings: 8,
        deptBreakdown: [
            { name: 'Engineering', value: 60, color: 'bg-blue-500' },
            { name: 'Sales', value: 20, color: 'bg-green-500' },
            { name: 'HR', value: 10, color: 'bg-purple-500' },
            { name: 'Operations', value: 10, color: 'bg-orange-500' }
        ],
        hiringTrend: [4, 6, 3, 8, 12, 5] // Last 6 months
    };

    const DOCUMENT_TEMPLATES = [
        {
            id: 'doc-001',
            title: 'Employment Agreement',
            type: 'Contract',
            content: `EMPLOYMENT AGREEMENT

OperOS Private Limited (“the Company”), operating within the Indian technology and startup ecosystem, hereby appoints you to the position of Senior Engineer. Your role involves the design, development, testing, deployment, and maintenance of scalable software systems, including cloud-based, AI-driven, and enterprise-grade applications relevant to Indian and global markets.

You will collaborate with cross-functional teams such as Product, Engineering, DevOps, Security, and Customer Success. Given the dynamic nature of Indian startups, your responsibilities may evolve based on business needs, client requirements, and organizational growth.

You will be on probation for a period of six (6) months from the date of joining. During this period, your performance, technical competency, adaptability, and compliance with company policies will be assessed. Upon satisfactory completion, your employment will be confirmed in writing.

Your Cost to Company (CTC) shall be structured in accordance with applicable Indian income tax laws and labor regulations. The compensation may include Basic Salary, House Rent Allowance (HRA), Special Allowance, performance-linked incentives (if applicable), and statutory benefits such as Provident Fund, Gratuity, and other benefits mandated under Indian law. The Company reserves the right to revise compensation based on performance reviews, market benchmarks, and company growth.

OperOS follows a results-oriented work culture commonly practiced in Indian tech startups. While standard working hours apply, flexibility may be required based on project timelines, customer commitments, and operational needs.

Either party may terminate this agreement by providing sixty (60) days’ written notice or salary in lieu thereof. The Company reserves the right to terminate employment without notice in cases of misconduct, breach of trust, violation of confidentiality, or non-compliance with company policies or applicable laws.`
        },
        {
            id: 'doc-002',
            title: 'NDA & IP Assignment',
            type: 'Legal',
            content: `NON-DISCLOSURE & INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT

During the course of employment, you may have access to confidential information including, but not limited to, source code, system architecture, technical documentation, business strategies, pricing models, customer data, and internal processes.

You agree that all such information shall remain strictly confidential during and after your employment with OperOS. Disclosure to any third party without prior written consent from the Company is strictly prohibited.

All inventions, software code, designs, documents, algorithms, models, processes, and other work products created by you during the course of employment, whether individually or jointly, shall be the exclusive intellectual property of OperOS.

This assignment is governed by the Copyright Act, 1957, the Patents Act, 1970, and other applicable intellectual property laws in India. You agree to execute any documents required to confirm or protect such ownership.

Your obligations relating to confidentiality and intellectual property shall survive the termination of your employment. You shall not use OperOS’s proprietary knowledge for personal benefit or competitive advantage in any future engagement.`
        },
        {
            id: 'doc-003',
            title: 'POSH Policy (ICC)',
            type: 'Compliance',
            content: `POSH POLICY (PREVENTION OF SEXUAL HARASSMENT)

OperOS is committed to providing a safe, inclusive, and respectful workplace free from sexual harassment. This policy is framed in accordance with the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 and applies to all employees, interns, consultants, contractors, and visitors.

The policy covers all work-related interactions, including office premises, client locations, offsite meetings, business travel, virtual meetings, and work-from-home arrangements.

OperOS has constituted an Internal Complaints Committee (ICC) as mandated by law. Any employee who experiences or witnesses sexual harassment may raise a complaint in a confidential manner by writing to ipc@operos.com.

All complaints will be handled with strict confidentiality, sensitivity, and fairness. Investigations will be conducted within the timelines prescribed by law, and appropriate corrective or disciplinary action will be taken based on the findings.

OperOS strictly prohibits retaliation against any individual who files a complaint or participates in an investigation. Any act of retaliation shall be treated as a serious violation of company policy and applicable law.`
        },
        {
            id: 'doc-004',
            title: 'InfoSec & Remote Work',
            type: 'Policy',
            content: `INFORMATION SECURITY & REMOTE WORK POLICY

This policy is established to protect OperOS’s digital infrastructure, intellectual property, customer data, and internal systems, especially in a remote or hybrid work environment prevalent across Indian technology companies.

Employees must use only Company-approved devices for official work. Use of personal devices is permitted only with explicit written approval from the IT or Security team. All internal systems must be accessed using secure authentication mechanisms such as VPNs, multi-factor authentication (MFA), and role-based access controls.

Employees must comply with the Digital Personal Data Protection Act, 2023 (DPDP Act) and related data protection regulations. Confidential business information, source code, customer data, and personal data must not be stored on local drives, personal cloud storage, or external devices.

Any suspected security breach, data leakage, phishing attempt, or unauthorized access must be reported immediately to the IT or Security team.

Remote work is permitted subject to managerial approval. Employees must ensure secure internet connectivity, prevent unauthorized third-party access to systems or screens, and avoid handling confidential information in public or unsecured environments. Non-compliance with security practices may result in disciplinary action.`
        }
    ];

    const handleDownload = (doc: any) => {
        const element = document.createElement("a");
        const file = new Blob([doc.content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${doc.title.replace(/\s+/g, '_')}_OperOS.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handlePreview = (doc: any) => {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(`
             <html>
               <head>
                 <title>${doc.title} - Preview</title>
                 <style>
                   body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; background-color: #f3f4f6; margin: 0; }
                   .paper { background: white; padding: 60px; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; }
                   pre { white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 14px; color: #333; line-height: 1.6; tab-size: 4; }
                   h1 { font-size: 20px; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.5px; }
                   .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888; }
                 </style>
               </head>
               <body>
                 <div class="paper">
                   <h1>${doc.title}</h1>
                   <pre>${doc.content}</pre>
                   <div class="footer">
                     Generated by OperOS HR • ${new Date().toLocaleDateString()}
                   </div>
                 </div>
               </body>
             </html>
           `);
            newWindow.document.close();
        } else {
            alert("Please allow popups to view the document.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workforce Analytics</h2>
                <p className="text-slate-500 text-sm">Real-time data and compliance documentation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Key Metrics */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Total Headcount
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-slate-900 dark:text-white">{data.headcount}</div>
                        <p className="text-xs text-emerald-600 font-medium mt-1">+3 this month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Turnover Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-slate-900 dark:text-white">{data.turnover}%</div>
                        <p className="text-xs text-emerald-600 font-medium mt-1">-0.5% vs last qtr</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <PieChart className="w-4 h-4" /> Diversity Ratio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-slate-900 dark:text-white">50/50</div>
                        <p className="text-xs text-slate-500 mt-1">Gender Split</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Active Job Postings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-slate-900 dark:text-white">{data.activePostings}</div>
                        <p className="text-xs text-slate-400 mt-1">Includes 'Java Developer'</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dept Breakdown */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5" /> Department Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.deptBreakdown.map((dept, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{dept.name}</span>
                                        <span className="text-slate-500">{dept.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${dept.color}`} style={{ width: `${dept.value}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Compliance Folder */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-600" /> Compliance & Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {DOCUMENT_TEMPLATES.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-3" onClick={() => handlePreview(doc)}>
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-500">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{doc.title}</p>
                                            <p className="text-xs text-slate-500">{doc.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handlePreview(doc); }}
                                            className="text-slate-400 hover:text-brand-600 p-1"
                                            title="Preview"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                                            className="text-slate-400 hover:text-brand-600 p-1"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};