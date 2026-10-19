import { useState, useEffect, useRef } from 'react';
import StarfieldButton from './StarfieldButton';

const ROLES = [
    'MERN Stack Developer',
    'React.js Developer',
    'Full-Stack Developer',
];

const Hero = () => {
    const prefersReduced = useRef(
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    // Typewriter — cycles through roles slowly
    const [text, setText] = useState('');
    const [roleIndex, setRoleIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [speed, setSpeed] = useState(120);

    useEffect(() => {
        if (prefersReduced.current) {
            setText(ROLES[0]);
            return;
        }
        const current = ROLES[roleIndex];
        const handle = setTimeout(() => {
            if (isDeleting) {
                setText(current.substring(0, charIndex - 1));
                setCharIndex(p => p - 1);
                setSpeed(55);
            } else {
                setText(current.substring(0, charIndex + 1));
                setCharIndex(p => p + 1);
                setSpeed(120);
            }

            if (!isDeleting && charIndex === current.length) {
                setIsDeleting(true);
                setSpeed(1800); // pause at end
            } else if (isDeleting && charIndex === 0) {
                setIsDeleting(false);
                setRoleIndex(p => (p + 1) % ROLES.length);
                setSpeed(500);
            }
        }, speed);
        return () => clearTimeout(handle);
    }, [charIndex, isDeleting, roleIndex, speed]);

    return (
        <section id="home" className="hero">
            <div className="container">
                <div className="hero-content">
                    {/* LEFT: text */}
                    <div className="hero-text">

                        {/* Availability badge */}
                        <div className="hero-badge">
                            <span className="hero-badge-dot"></span>
                            Available for full-time roles
                        </div>

                        <h3 className="hero-greeting">Hello, I'm</h3>
                        <h1>Ayush Trikmani</h1>
                        <h3>
                            And I'm a&nbsp;
                            <span className="typewriter">{text}</span>
                            {!prefersReduced.current && (
                                <span className="hero-cursor" aria-hidden="true">|</span>
                            )}
                        </h3>

                        <p>
                            Computer Engineering graduate (AIT, 2026) with internship experience at
                            Krupa Info Services. I build complete full-stack products — job boards
                            with AI mock interviews, healthcare booking platforms, and computer
                            vision defect-detection systems — using React, Node.js, Express,
                            PostgreSQL, MongoDB, and Python (FastAPI).
                        </p>

                        <div className="social-icons">
                            <a href="mailto:ayushtrikmani@gmail.com" aria-label="Email">
                                <i className="fas fa-envelope"></i>
                            </a>
                            <a href="tel:+916352243970" aria-label="Phone">
                                <i className="fas fa-phone"></i>
                            </a>
                            <a href="https://www.instagram.com/ayush_trikmani110/" target="_blank" rel="noreferrer" aria-label="Instagram">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="https://github.com/AyushTrikmani" target="_blank" rel="noreferrer" aria-label="GitHub">
                                <i className="fab fa-github"></i>
                            </a>
                            <a href="https://www.linkedin.com/in/ayush-trikmani/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                                <i className="fab fa-linkedin"></i>
                            </a>
                        </div>

                        <StarfieldButton 
                            link="/Ayush_Trikmani_Resume.pdf" 
                            download="Ayush_Trikmani_Resume.pdf"
                            className="download-btn"
                            style={{ marginTop: '1.5rem' }}
                            addIcon={true}
                            icon={{
                                type: "symbol",
                                symbol: "↓",
                                size: 18,
                                side: "right"
                            }}
                        >
                            Download Resume
                        </StarfieldButton>
                    </div>

                    {/* RIGHT: profile image */}
                    <div className="hero-image">
                        <div className="image-wrapper">
                            <img src="/myface.png" alt="Ayush Trikmani" className="profile-img" />
                            <div className="blob"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
