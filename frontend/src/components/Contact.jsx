import { useState } from 'react';
import StarfieldButton from './StarfieldButton';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    
    const [toastState, setToastState] = useState({
        show: false,
        title: '',
        desc: '',
        success: true
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const triggerToast = (title, desc, success = true) => {
        setToastState({
            show: true,
            title,
            desc,
            success
        });
        
        setTimeout(() => {
            setToastState(prev => ({ ...prev, show: false }));
        }, 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const accessKey = import.meta.env.VITE_web3forms_key;

        if (!accessKey) {
            triggerToast('Configuration Needed', 'Please add VITE_web3forms_key to your frontend .env file.', false);
            return;
        }

        // Web3Forms submission
        const formPayload = {
            access_key: accessKey,
            name: formData.name,
            email: formData.email,
            subject: formData.subject || 'Portfolio Contact Message',
            message: formData.message
        };

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formPayload)
            });

            const result = await response.json();
            if (result.success) {
                triggerToast('Message Sent', 'Your message has been forwarded successfully to Ayush!', true);
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                triggerToast('Error', result.message || 'Failed to send email. Check your Web3Forms key.', false);
            }
        } catch {
            triggerToast('Connection Error', 'Failed to connect to the mail server. Please try again.', false);
        }
    };

    return (
        <section id="contact" className="contact">
            <div className="container">
                <h2 className="section-title">Contact <span>Me</span></h2>
                <div className="contact-content">
                    <div className="contact-info">
                        <div className="info-item">
                            <a href="mailto:ayushtrikmani@gmail.com">
                                <i className="fas fa-envelope"></i>
                            </a>
                            <div className="info-text">
                                <h3>Email</h3>
                                <p><a href="mailto:ayushtrikmani@gmail.com">ayushtrikmani@gmail.com</a></p>
                            </div>
                        </div>
                        <div className="info-item">
                            <a href="tel:+916352243970">
                                <i className="fas fa-phone"></i>
                            </a>
                            <div className="info-text">
                                <h3>Phone</h3>
                                <p><a href="tel:+916352243970">+91 6352243970</a></p>
                            </div>
                        </div>
                        <div className="info-item">
                            <a href="https://www.google.com/maps?q=Ahmedabad,+Gujarat,+India" target="_blank" rel="noreferrer">
                                <i className="fas fa-map-marker-alt"></i>
                            </a>
                            <div className="info-text">
                                <h3>Location</h3>
                                <p><a href="https://www.google.com/maps?q=Ahmedabad,+Gujarat,+India" target="_blank" rel="noreferrer">Ahmedabad, Gujarat, India</a></p>
                            </div>
                        </div>
                    </div>

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your Name" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Your Email" 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <input 
                                type="text" 
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Subject" 
                            />
                        </div>
                        <div className="form-group">
                            <textarea 
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Your Message" 
                                required
                            ></textarea>
                        </div>
                        <StarfieldButton 
                            type="submit" 
                            style={{ marginTop: '1.4rem' }}
                            addIcon={true}
                            icon={{
                                type: "symbol",
                                symbol: "✦",
                                size: 16,
                                side: "right"
                            }}
                        >
                            Send Message
                        </StarfieldButton>
                    </form>
                </div>
            </div>

            {/* Custom Toast Notification */}
            <div 
                id="toast" 
                className={`toast ${toastState.show ? 'show' : ''}`}
                style={{ borderLeftColor: toastState.success ? 'var(--accent-color)' : '#f44336' }}
            >
                <div className="toast-content">
                    <i 
                        className={toastState.success ? 'fas fa-check-circle toast-icon' : 'fas fa-times-circle toast-icon'}
                        style={{ color: toastState.success ? 'var(--accent-color)' : '#f44336' }}
                    ></i>
                    <div className="toast-details">
                        <span className="toast-title">{toastState.title}</span>
                        <span className="toast-desc">{toastState.desc}</span>
                    </div>
                </div>
                <button 
                    className="toast-close" 
                    onClick={() => setToastState(prev => ({ ...prev, show: false }))}
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </section>
    );
};

export default Contact;
