import { useState, useEffect } from 'react';
import StarfieldButton from './StarfieldButton';

const Certifications = () => {
    const [selectedCert, setSelectedCert] = useState(null);

    // Close modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedCert(null);
            }
        };
        if (selectedCert) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [selectedCert]);

    const certsList = [
        {
            title: 'Intel® AI for Manufacturing',
            courseName: 'AI for Manufacturing Certificate Course',
            org: 'Intel India & Gujarat Technological University (GTU)',
            credentialId: 'AI4MGTUS1507250221',
            date: 'Feb 2025 – July 2025',
            desc: 'Hands-on training in AI, computer vision, and predictive maintenance for manufacturing applications under the collaboration of GTU and Intel India.',
            icon: 'fas fa-award',
            certificateUrl: '/certificates/intel-ai-for-manufacturing.jpg',
            certificateName: 'Ayush_Trikmani_Intel_AI_Certificate.jpg',
            tags: ['AI', 'Computer Vision', 'Predictive Maintenance']
        },
        {
            title: 'Code Unnati Program',
            courseName: 'Emerging Technologies Course',
            org: 'Edunet Foundation',
            date: 'Sep 2024 – Apr 2025',
            desc: 'Covered emerging technologies including Machine Learning, Internet of Things (IoT), and Deep Learning.',
            icon: 'fas fa-graduation-cap',
            tags: ['Machine Learning', 'IoT', 'Deep Learning']
        }
    ];

    return (
        <section id="certifications" className="certifications-section">
            <div id="courses"></div>
            <div className="container">
                <h2 className="section-title">Certifications & <span>Courses</span></h2>
                <div className="certifications-grid">
                    {certsList.map((cert, idx) => (
                        <div className="cert-card" key={idx}>
                            <div className="cert-icon">
                                <i className={cert.icon}></i>
                            </div>
                            <h3>{cert.title}</h3>
                            <h4>{cert.org}</h4>
                            <p className="cert-date">{cert.date}</p>
                            
                            {cert.credentialId && (
                                <div className="cert-credential-badge">
                                    <i className="fas fa-check-circle"></i> ID: {cert.credentialId}
                                </div>
                            )}

                            <p className="cert-desc">{cert.desc}</p>

                            {cert.tags && (
                                <div className="cert-tags">
                                    {cert.tags.map((tag, tIdx) => (
                                        <span className="cert-tag" key={tIdx}>{tag}</span>
                                    ))}
                                </div>
                            )}

                            {cert.certificateUrl && (
                                <div className="cert-actions">
                                    <StarfieldButton 
                                        link={cert.certificateUrl}
                                        newTab={true}
                                        addIcon={true}
                                        icon={{
                                            type: "symbol",
                                            symbol: "↗",
                                            size: 16,
                                            side: "right"
                                        }}
                                        style={{ marginTop: '0.8rem' }}
                                    >
                                        View Certificate
                                    </StarfieldButton>
                                    <button 
                                        type="button" 
                                        className="cert-preview-trigger" 
                                        onClick={() => setSelectedCert(cert)}
                                        title="Quick Preview"
                                    >
                                        <i className="fas fa-eye"></i> Preview
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Certificate Preview Modal */}
            {selectedCert && (
                <div 
                    className="cert-modal-backdrop" 
                    onClick={() => setSelectedCert(null)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div 
                        className="cert-modal-content" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="cert-modal-header">
                            <div>
                                <h3>{selectedCert.title}</h3>
                                <p className="cert-modal-sub">{selectedCert.courseName} • {selectedCert.org}</p>
                            </div>
                            <button 
                                type="button" 
                                className="cert-modal-close" 
                                onClick={() => setSelectedCert(null)}
                                aria-label="Close Preview"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="cert-modal-body">
                            <img 
                                src={selectedCert.certificateUrl} 
                                alt={`${selectedCert.title} Certificate`}
                                className="cert-modal-img"
                            />
                        </div>
                        <div className="cert-modal-footer">
                            {selectedCert.credentialId && (
                                <span className="cert-modal-id">
                                    <i className="fas fa-shield-alt"></i> Credential: {selectedCert.credentialId}
                                </span>
                            )}
                            <div className="cert-modal-btn-group">
                                <a 
                                    href={selectedCert.certificateUrl} 
                                    download={selectedCert.certificateName || 'certificate.jpg'} 
                                    className="cert-modal-action-btn"
                                >
                                    <i className="fas fa-download"></i> Download
                                </a>
                                <a 
                                    href={selectedCert.certificateUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="cert-modal-action-btn primary"
                                >
                                    <i className="fas fa-external-link-alt"></i> Open Full Image
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Certifications;

