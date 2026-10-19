import { useEffect } from 'react';
import StarfieldButton from './StarfieldButton';

const JobPortalDetails = ({ onBack }) => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="project-details-page">
            {/* Header / Navigation */}
            <div className="details-header">
                <div className="container details-nav">
                    <button className="back-btn" onClick={onBack}>
                        <i className="fas fa-arrow-left"></i> Back to Portfolio
                    </button>
                    <div className="details-logo">UpYourJob<span>.</span></div>
                </div>
            </div>

            {/* Hero Section */}
            <section className="details-hero">
                <div className="container">
                    <div className="hero-badge">Enterprise AI Platform</div>
                    <h1>UpYourJob</h1>
                    <h2>AI-Powered Recruitment, Proctoring & Mobile Ecosystem</h2>
                    <p className="lead-text">
                        A multi-module enterprise ecosystem automating the entire recruitment lifecycle—from semantic resume screening via LLMs to client-side facial proctoring and real-time candidate communications.
                    </p>
                    <div className="meta-stats">
                        <div className="stat-box">
                            <h3>7</h3>
                            <p>Sub-Modules</p>
                        </div>
                        <div className="stat-box">
                            <h3>100%</h3>
                            <p>Privacy Compliant</p>
                        </div>
                        <div className="stat-box">
                            <h3>&lt; 100ms</h3>
                            <p>Proctoring Loops</p>
                        </div>
                        <div className="stat-box">
                            <h3>PostgreSQL</h3>
                            <p>Core Database</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Container */}
            <div className="details-content-container">
                <div className="container">
                    {/* Section 1: Architecture */}
                    <div className="details-card-section">
                        <h3 className="details-sec-title">
                            <i className="fas fa-network-wired"></i> 1. Microservice Architecture
                        </h3>
                        <p>UpYourJob operates as a decoupled microservice monorepo structure separating frontend client experiences, API coordinators, and machine learning scoring microservices.</p>
                        
                        <div className="architecture-grid">
                            <div className="arch-card">
                                <div className="arch-badge client">Client Frontend</div>
                                <h4>portal-frontend</h4>
                                <p>Main web client built with <strong>React 19</strong> and <strong>Vite</strong>. Serves job seekers (browsing, gap-analysis) and recruiters (job CRUD, applicant pipeline).</p>
                            </div>
                            <div className="arch-card">
                                <div className="arch-badge proctor">AI Assessment</div>
                                <h4>exam-frontend</h4>
                                <p>Secure exam browser running client-side <strong>TensorFlow.js</strong> and <strong>BlazeFace</strong> face detection for real-time local proctoring.</p>
                            </div>
                            <div className="arch-card">
                                <div className="arch-badge admin">Administration</div>
                                <h4>admin-frontend</h4>
                                <p>Super-Admin dashboard using <strong>React</strong> and <strong>Recharts</strong> for system analytics and subscription package controls.</p>
                            </div>
                            <div className="arch-card">
                                <div className="arch-badge mobile">Mobile Ecosystem</div>
                                <h4>mobile-app</h4>
                                <p>Cross-platform iOS & Android mobile application built with <strong>React Native</strong> and <strong>Expo SDK 56</strong> using TypeScript.</p>
                            </div>
                            <div className="arch-card font-bold">
                                <div className="arch-badge backend">API Core</div>
                                <h4>backend</h4>
                                <p>Node.js Express backend serving as the central API gateway. Integrates <strong>Socket.IO</strong>, <strong>Razorpay</strong>, and file uploads via <strong>Cloudinary</strong>.</p>
                            </div>
                            <div className="arch-card">
                                <div className="arch-badge admin">Admin API Gateway</div>
                                <h4>admin-backend</h4>
                                <p>Isolated Node.js Express backend service dedicated specifically to super-admin API operations and system configurations.</p>
                            </div>
                            <div className="arch-card">
                                <div className="arch-badge ml">AI Engine</div>
                                <h4>ai-interview-backend</h4>
                                <p>High-performance backend powered by <strong>Python FastAPI</strong> and <strong>SQLAlchemy ORM</strong>. Scores exams and logs candidate proctoring events.</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Facial Proctoring */}
                    <div className="details-card-section">
                        <h3 className="details-sec-title">
                            <i className="fas fa-eye"></i> 2. In-Browser AI Facial Proctoring
                        </h3>
                        <p>A privacy-first, zero-video-upload proctoring engine. All video frames are processed transiently in browser memory using client-side WebGL acceleration via TensorFlow.js.</p>
                        
                        <div className="proctor-rules">
                            <div className="rule-item">
                                <div className="rule-header warning">
                                    <span className="rule-icon"><i className="fas fa-exclamation-triangle"></i></span>
                                    <h4>Eyes Look Away</h4>
                                </div>
                                <p>If candidate focuses outside the screen boundaries for &gt;4 seconds, a warning overlay is shown and a violation is logged.</p>
                            </div>
                            <div className="rule-item">
                                <div className="rule-header warning">
                                    <span className="rule-icon"><i className="fas fa-users"></i></span>
                                    <h4>Multiple Faces</h4>
                                </div>
                                <p>Instant detection triggers warnings to prevent external assistance or helper proxy test-takers.</p>
                            </div>
                            <div className="rule-item">
                                <div className="rule-header danger">
                                    <span className="rule-icon"><i className="fas fa-times-circle"></i></span>
                                    <h4>No Face / Left Screen</h4>
                                </div>
                                <p>If no face is detected for &gt;7 seconds, the examination session is automatically terminated and flagged.</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: n8n AI Resume Parser */}
                    <div className="details-card-section">
                        <h3 className="details-sec-title">
                            <i className="fas fa-robot"></i> 3. n8n + Groq LLM Resume Screening
                        </h3>
                        <p>Automated candidate filtering and scoring running asynchronously outside the main API thread:</p>
                        <ol className="pipeline-steps">
                            <li>
                                <strong>Submission:</strong> Job Seeker uploads a resume PDF, which is uploaded to Cloudinary, and the URL is passed to the Node.js database.
                            </li>
                            <li>
                                <strong>n8n Webhook:</strong> Express fires a webhook to n8n workflow canvas.
                            </li>
                            <li>
                                <strong>Groq LLaMA 3.1 Engine:</strong> n8n runs semantic analysis, comparing candidate skills, education, and experiences against the job specifications.
                            </li>
                            <li>
                                <strong>Auto-Shortlist Callback:</strong> n8n POSTs the match score back to Express. High-scoring candidates (e.g. &gt;80%) are automatically advanced to the "Shortlisted" phase.
                            </li>
                        </ol>
                    </div>

                    {/* Section 4: Database Infrastructure */}
                    <div className="details-card-section">
                        <h3 className="details-sec-title">
                            <i className="fas fa-database"></i> 4. Secure Database Infrastructure (Supabase & PostgreSQL)
                        </h3>
                        <p>The persistence layer is architected using a relational database hosted on <strong>Supabase</strong> (managed PostgreSQL), utilizing cloud-scale security and networking best practices:</p>
                        <ul className="modal-list">
                            <li><strong>Supabase Cloud Database:</strong> Fully managed PostgreSQL engine providing real-time data streaming and instant database scaling.</li>
                            <li><strong>Connection Pooling (PgBouncer):</strong> Integrated connection poolers to handle concurrently executing REST requests from the Express API backend without database connection fatigue.</li>
                            <li><strong>Row-Level Security (RLS):</strong> High-end data isolation policies ensuring that recruiters can only read applications for their posted jobs, and job seekers can only view their own candidate profiles.</li>
                            <li><strong>Data Hashing:</strong> Sensitive data fields are encrypted and hashed locally using bcrypt (10 rounds) before database insertion, protecting user credentials.</li>
                        </ul>
                    </div>
                    {/* Back Button */}
                    <div style={{ textAlign: 'center', marginTop: '5rem', marginBottom: '2rem' }}>
                        <StarfieldButton 
                            onClick={onBack}
                            addIcon={true}
                            icon={{
                                type: "symbol",
                                symbol: "←",
                                size: 16,
                                side: "left"
                            }}
                        >
                            Back to Portfolio
                        </StarfieldButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobPortalDetails;
