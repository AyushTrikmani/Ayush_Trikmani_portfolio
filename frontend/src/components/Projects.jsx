import StarfieldButton from './StarfieldButton';

const Projects = ({ onViewDetails }) => {
    const projectsList = [
        {
            title: 'Job Portal Web Application',
            desc: 'A comprehensive full-stack job board with role-based access for job seekers, recruiters, and admins. Supports resume uploads, job postings, applications, real-time candidate-recruiter messaging, payment flow, and a Python (FastAPI) AI microservice for mock interviews and aptitude tests.',
            bannerClass: 'project-banner project-banner-job project-banner-image',
            image: '/upyourjob-preview.png',
            imageAlt: 'UpYourJob job search platform homepage preview',
            iconClass: 'fas fa-briefcase',
            tags: ['React.js', 'Node.js', 'Express.js', 'PostgreSQL', 'Python', 'FastAPI'],
            link: '#',
            btnText: 'Project Details',
            isModal: true
        },
        {
            title: 'Online Pharmacy & Lab Test Booking',
            desc: 'A MERN stack healthcare platform for medicine browsing and lab test booking. Features categorized product catalogs, lab packages, and admin workflows for technician assignment, home sample collection tracking, result entry, and digital reports. Note: Hosted on a free server; email notification services are simulated due to SMTP server limitations on free hosting tiers.',
            bannerClass: 'project-banner project-banner-pharmacy project-banner-image',
            image: '/swasthya-pharma-preview.png',
            imageAlt: 'Swasthya Pharma homepage preview',
            iconClass: 'fas fa-prescription-bottle-alt',
            tags: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Redux'],
            link: 'https://swasthya-pharmacy-and-labs.vercel.app/',
            btnText: 'View Live Site',
            isModal: false
        },
        {
            title: 'Tile Surface Defect Detection',
            desc: 'An AI-powered computer vision system designed to automate quality control in ceramic tile manufacturing units. Utilizes deep learning and OpenCV to identify and classify cracks, discoloration, and scratches on tile surfaces in real-time.',
            bannerClass: 'project-banner project-banner-defect project-banner-image',
            image: '/tile-defect-preview.png',
            imageAlt: 'AI Ceramic Tile Inspector app preview',
            iconClass: 'fas fa-eye',
            tags: ['Python', 'OpenCV', 'TensorFlow', 'Streamlit'],
            link: 'https://ceramic-tile-defectoion-check-f7svufrvzpzxwbru3gyeqh.streamlit.app/',
            btnText: 'View Live Demo',
            isModal: false
        }
    ];

    return (
        <section id="projects" className="projects">
            <div className="container">
                <h2 className="section-title">My <span>Projects</span></h2>
                <div className="projects-grid">
                    {projectsList.map((project, idx) => (
                        <div className="project-card" key={idx}>
                            <div className={project.bannerClass}>
                                {project.image ? (
                                    <img src={project.image} alt={project.imageAlt || project.title} />
                                ) : (
                                    <i className={project.iconClass}></i>
                                )}
                            </div>
                            <div className="project-info">
                                <h3>{project.title}</h3>
                                <p>{project.desc}</p>
                                <div className="tech-stack">
                                    {project.tags.map((tag, tIdx) => (
                                        <span key={tIdx}>{tag}</span>
                                    ))}
                                </div>
                                {project.isModal ? (
                                    <StarfieldButton 
                                        onClick={onViewDetails}
                                        style={{ marginTop: '1.2rem' }}
                                        addIcon={true}
                                        icon={{
                                            type: "symbol",
                                            symbol: "→",
                                            size: 16,
                                            side: "right"
                                        }}
                                    >
                                        {project.btnText}
                                    </StarfieldButton>
                                ) : (
                                    <StarfieldButton 
                                        link={project.link} 
                                        newTab={true}
                                        style={{ marginTop: '1.2rem' }}
                                        addIcon={true}
                                        icon={{
                                            type: "symbol",
                                            symbol: "↗",
                                            size: 16,
                                            side: "right"
                                        }}
                                    >
                                        {project.btnText}
                                    </StarfieldButton>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Projects;
