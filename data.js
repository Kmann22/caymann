/* =====================================================================
   YOUR CONTENT: edit this file to add or change experiences & projects.
   Everything on the Experience and Projects pages is built from here.
   ===================================================================== */

/* ---------------- EXPERIENCE ---------------- */
// To add a role: copy one { ... } block and fill it in. Newest first.
// Any field can be left as "" and points can be [] — empty parts are simply hidden.
// certificate: path to a PDF in assets/pdf/ — shows a "View certificate" button in the pop-up.
const experiences = [
    {
        role: "NMES 50 Student Representative",
        org: "King's College London",
        type: "Part-time",
        dates: "Dec 2025 – Apr 2026",
        location: "London, United Kingdom · On-site",
        certificate: "",
        points: [
            "Represented student perspectives and acted as a communication link between MSc Advanced Computing students and departmental staff.",
            "Gathered student feedback to identify gaps in course delivery, academic support and the overall learning experience.",
            "Contributed suggestions for making assessments more engaging and improving the effectiveness of student feedback mechanisms.",
            "Advocated for meaningful student involvement in departmental discussions and improvements to the academic experience."
        ]
    },
    {
        role: "Quality Assurance Intern",
        org: "OneShield Softwares",
        type: "Internship",
        dates: "Jul 2023 – Sep 2023",
        location: "Panaji, Goa, India",
        certificate: "assets/pdf/certificate-oneshield.pdf",
        points: [
            "Developed structured test workflows using the Behavior-Driven Development (BDD) framework and conducted detailed validation of 50+ insurance process fields, ensuring accuracy and minimising errors across diverse data types.",
            "Automated 25+ test scenarios with Selenium, improving accuracy and consistency in software functionality checks.",
            "Refactored test processes and collaborated with a team of 15 members to enhance efficiency while maintaining high-quality standards across diverse data forms."
        ]
    },
    {
        role: "Magazine Secretary",
        org: "Cursor Council",
        type: "Goa College of Engineering",
        dates: "Sep 2022 – Jun 2023",
        location: "Goa, India",
        certificate: "assets/pdf/certificate-cursor-council.pdf",
        points: [
            "Tailored an interactive college department magazine with a companion app that scanned pages for clues, engaging readers with treasure hunts and puzzles thus boosting user engagement and publication visibility.",
            "Designed and managed online forms for talent management and content coordination, streamlining data collection and allocation of more than 250 participants based on interests.",
            "Spearheaded poster and creative campaigns, boosting engagement and initiative visibility.",
            "Coordinated 10+ council activities through structured workflows and meeting minutes, liaising with internal and external bodies to ensure timely execution."
        ]
    }
];


/* ---------------- PROJECTS ----------------
   To add a project: copy one { ... } block into the list and fill it in.
   category  → one of the ids in projectCategories below
   status    → short label shown on the card ("Completed", "In Progress", "1st Place"…)
   award     → true adds a gold ★ badge
   image     → optional picture in assets/images/ ("" = a themed icon is used)
   imagePos  → optional, which part of the picture shows on the card, e.g. "left center"
   intro / sections → optional longer write-up for the pop-up (see the Segmentation project)
   links     → optional buttons, e.g. { label: "Source code", url: "https://…" }
   Anything left "" or [] is simply hidden.                                  */
const projectCategories = [
    { id: "ai",       name: "AI & Research",   icon: "" },
    { id: "software", name: "Software & Apps", icon: "" },
    { id: "data",     name: "Data & Finance",  icon: "" },
    { id: "other",    name: "Other Research",  icon: "" },
];

const projects = [
    /* ---- AI, Machine Learning & Research ---- */
    {
        title: "Semantic Segmentation of Surgical Instruments in Laparoscopic Videos",
        category: "ai",
        status: "",
        intro: "During my MSc at King's College London, I investigated how deep learning could automatically identify surgical instruments in laparoscopic videos. The project focused on making segmentation reliable in difficult surgical scenes with occlusion, overlapping instruments, reflections and motion blur.",
        sections: [
            { heading: "Approach & Methodology", points: [
                "Reviewed existing research and established evaluation measures for segmentation accuracy, boundary quality and instrument outline completeness.",
                "Manually annotated approximately 1,000 frames and combined them with collaborators' annotations to build a dataset of around 5,000 frames spanning 77 surgical procedure types.",
                "Developed and evaluated deep learning segmentation models, progressing to HRNet-W18 to better preserve fine instrument details.",
                "Conducted systematic error analysis to identify annotation inconsistencies, missing labels and challenging instrument configurations.",
                "Investigated targeted data augmentation and training strategies to improve performance on frames containing small and multiple instruments.",
                "Explored alternative approaches, including attention-based fusion and different loss functions, documenting unsuccessful experiments and methodological limitations."
            ] },
            { heading: "Key Achievements", points: [
                "Improved the Dice score from 0.78 to 0.88 through annotation validation and correction of 710 unreliable frames, without changing the model architecture.",
                "Achieved a Dice score of approximately 0.92 using HRNet-W18.",
                "Improved performance further to approximately 0.93 through targeted training strategies.",
                "Developed a novel post-processing method to address fragmented instrument predictions, matching the accuracy of DenseCRF while running approximately 41 times faster.",
                "Evaluated the proposed method on two independent datasets to investigate its generalisability."
            ] },
            { heading: "Key Learning", text: "This project strengthened my ability to investigate data quality, identify model weaknesses, design controlled experiments and make evidence-based technical decisions. It also reinforced the importance of looking beyond headline performance metrics to understand the reliability of an AI system." }
        ],
        points: [],
        tech: ["Python", "PyTorch", "HRNet-W18", "OpenCV", "CVAT", "NumPy", "Semantic Segmentation", "Data Annotation", "Model Evaluation", "Error Analysis", "Computer Vision", "Deep Learning", "Medical AI"],
        image: "assets/images/project-segmentation.webp",
        links: [{ label: "Read the thesis", url: "https://drive.google.com/file/d/1C6SdtKhFxUi0WNGtnlVKPWlQ8DH8nUIc/view?usp=sharing" }]
    },
    {
        title: "Breast Cancer Detection",
        category: "ai",
        status: "",
        points: [
            "Built a machine learning model to classify breast tumours as benign or malignant from diagnostic measurements.",
            "Cleaned and explored the data, selected the most informative features and compared several classification models.",
            "Evaluated the models with accuracy, precision, recall and confusion matrices to understand where they make mistakes."
        ],
        tech: ["Machine Learning", "Medical Imaging"],
        image: "assets/images/project-cancer.webp",
        links: [{ label: "Notebook", url: "https://colab.research.google.com/drive/1C65aBBt99AxJXqhzZGSaHfK3wycsUcut?usp=sharing" }]
    },

    /* ---- Software Engineering & Application Development ---- */
    {
        title: "AI-Powered Semantic Search Photo Gallery",
        category: "software",
        status: "",
        points: [
            "Developed a multimodal (text, image, audio) semantic search engine using CLIP embeddings and FAISS search.",
            "Achieved top-30 retrieval across 10,000+ images with an average query latency of ~2.17 ms, significantly reducing the time spent searching for specific photos.",
            "Implemented automatic preprocessing, incremental embedding updates and metadata extraction (EXIF & geolocation) stored in SQLite, with a real-time Watchdog pipeline for continuous ingestion.",
            "Created hierarchical (agglomerative) album clustering and an interactive Flask dashboard for organising, filtering, visualising and editing images."
        ],
        tech: ["Python", "CLIP", "FAISS", "SQLite", "Flask", "Watchdog", "Clustering", "Vector Search"],
        image: "assets/images/project-photo-gallery.webp",
        links: [{ label: "Source code", url: "https://github.com/Kmann22/ai_photo_gallery" }]
    },
    {
        title: "Gamified Vocabulary Learning Application",
        category: "software",
        status: "",
        points: [
            "Created a vocabulary-learning application for an MBA exam candidate.",
            "Incorporated Hangman, Wordle-style games and revision activities.",
            "Integrated WhatsApp into the learning experience.",
            "Developed an application used by approximately four regular users."
        ],
        tech: ["Application Development", "Gamification", "Educational Technology"],
        image: "assets/images/project-english.webp",
        links: [{ label: "Source code", url: "https://github.com/Kmann22/vocab.git" }]
    },
    {
        title: "Immersive Spatial Audio Powered by Computer Vision",
        category: "software",
        status: "",
        points: [
            "Architected a Flutter mobile app with a distributed backend using FastAPI and Redis Streams for asynchronous communication between audio and video processing units, ensuring real-time performance and resilience.",
            "Integrated a two-camera stereo vision system with MediaPipe & OpenCV, performing real-time head-pose estimation via 3D triangulation.",
            "Crafted an adaptive binaural audio pipeline using individualised HRIRs from the LISTEN dataset, convolved via FFT for efficient real-time spatialisation.",
            "Simulated realistic acoustic environments using Room Impulse Response (RIR) and RT60 modelling with Pyroomacoustics, enhancing immersive audio perception."
        ],
        tech: ["Python", "Flutter", "FastAPI", "Redis", "OpenCV", "MediaPipe", "Computer Vision", "Spatial Audio", "Pyroomacoustics"],
        image: "assets/images/project-3d.webp",
        links: [
            { label: "Demo", url: "https://drive.google.com/file/d/1tMh6xuMzK1qQZrzGfs2lHmGGl5lEvy3i/view" },
            { label: "Source code", url: "https://github.com/Kmann22/soundscape.git" }
        ]
    },
    {
        title: "Chess",
        category: "software",
        status: "",
        points: [
            "Built the backend for a chess game that manages the board, players' turns and the full game state.",
            "Implemented move validation for every piece, including checks so that illegal moves are rejected.",
            "Designed the code so a front end can connect to it to play complete games."
        ],
        tech: ["Backend Development"],
        image: "assets/images/project-chess.webp",
        links: [{ label: "Source code", url: "https://github.com/Kmann22/chessBackend.git" }]
    },
    {
        title: "Python Decisions Quest",
        category: "software",
        status: "",
        points: [
            "Built a fun, story-driven Python treasure hunt that teaches young children how computers make decisions.",
            "Children predict what a piece of code will do, run it and discover the answer, learning if / else step by step through play.",
            "Designed a friendly illustrated world, simple language and keyboard support so it is easy for beginners to use."
        ],
        tech: ["Python", "Web Development", "Educational Technology", "Gamification"],
        image: "assets/images/project-python-quest.webp",
        imagePos: "center top",
        links: [{ label: "Play the game", url: "https://python-decisions-quest.netlify.app/" }]
    },

    /* ---- Data Analytics & Finance ---- */
    {
        title: "Retail Market Data & Marketing Analytics",
        category: "data",
        status: "",
        points: [
            "Built an end-to-end retail marketing analytics solution with Python, Pandas and SQL, turning multi-source marketing and sales data into actionable business insights.",
            "Developed an ETL pipeline to clean, validate, integrate and analyse Google Ads, Meta Ads, website analytics, email campaign and retail transaction data, stored in SQLite.",
            "Created an interactive six-section dashboard: executive performance, channels & campaigns, customer insights, Marketing Mix Modelling (MMM) and data quality.",
            "Analysed £14.7M in revenue against £2.39M in marketing spend, with an overall reported ROAS of 3.09x.",
            "Investigated channel performance, campaign profitability and break-even ROAS, and identified discrepancies in ad-platform conversion reporting.",
            "Explored diminishing returns and marketing budget optimisation using MMM."
        ],
        tech: ["Python", "SQL", "ETL", "Streamlit", "Pandas", "SQLite", "Marketing Mix Modelling", "Data Visualisation", "Data Analytics"],
        image: "assets/images/project-marketing.webp",
        imagePos: "left center",
        links: [{ label: "Source code", url: "https://github.com/Kmann22/marketing-analytics" }]
    },
    {
        title: "Agentic AI Finance Project",
        category: "data",
        status: "In Progress",
        points: [
            "Currently building an LLM project: an AI-powered finance application driven by LLM agents.",
            "Focused on agentic workflows that gather, process and reason over financial information."
        ],
        tech: ["Python", "LLMs", "AI Agents", "Financial Data"],
        image: "",
        links: []
    },

    /* ---- Other Research & Technical Initiatives ---- */
    {
        title: "Mirokai Pilot Study",
        category: "other",
        status: "",
        points: [
            "Took part in a pilot study at Evelina London Children's Hospital involving Mirokai, a social humanoid robot.",
            "Connected with research around human-robot interaction in a real clinical setting."
        ],
        tech: ["Robotics", "Human-Robot Interaction"],
        image: "assets/images/project-mirokai.webp",
        links: []
    },
    {
        title: "Gamified Auditory Training for Hearing Rehabilitation",
        category: "other",
        status: "",
        points: [],
        tech: ["Audio Technology", "Gamification"],
        image: "assets/images/project-hearingaid.webp",
        links: [{ label: "Source code", url: "https://github.com/Kmann22/audivive.git" }]
    },
];


/* ---------------- ACHIEVEMENTS ----------------
   Shown on the Milestones strip (with education and certificates below). To add one, copy a block.
   medal → "gold", "silver", "bronze" or "star"   badge → short text on the medal */
const achievements = [
    {
        title: "NHS Clinical AI & Quantum Hackathon",
        place: "1st Place · Grand Final & Qualifier",
        where: "London",
        medal: "gold", badge: "1st",
        photo: "assets/images/photo-nhs-hackathon.webp",
        details: ["Won 1st place in the qualifier round.", "Went on to win 1st place in the grand final."]
    },
    {
        title: "Cepheus Hackathon",
        place: "1st Place",
        where: "Indian Institute of Technology Goa",
        medal: "gold", badge: "1st",
        logo: "assets/images/logo-cepheus.webp", logoBg: "#000",
        details: ["My first hackathon win."]
    },
    {
        title: "Music Technology Hackathon",
        place: "3rd Place",
        where: "Queen Mary University of London",
        medal: "bronze", badge: "3rd",
        logo: "assets/images/logo-devpost.webp", logoBg: "#000",
        details: []
    },
    {
        title: "The Joy of Computing using Python",
        place: "Top 1% Nationally · 93%",
        where: "NPTEL Swayam",
        medal: "star", badge: "1%",
        logo: "assets/images/logo-nptel.webp",
        link: "https://archive.nptel.ac.in/noc/Ecertificate/?q=NPTEL22CS122S2441014710042974",
        details: []
    },
];


/* ---------------- SKILLS ----------------
   Shown as constellations around the moon astronaut on the Skills page.
   Keep it to 6 groups; add or remove skills freely.                       */
const skillGroups = [
    { name: "AI & Data Science",      skills: ["Machine Learning", "Deep Learning", "Computer Vision", "NLP", "LLMs", "Transformers", "Generative AI", "Image Processing"] },
    { name: "Programming",            skills: ["Python", "C++", "JavaScript", "Flutter", "PHP", "OOP"] },
    { name: "Frameworks & Libraries", skills: ["PyTorch", "OpenCV", "Pandas", "FastAPI", "Streamlit", "FAISS", "Redis"] },
    { name: "Data Analytics",         skills: ["SQL / MySQL", "Excel", "Power BI", "Feature Engineering", "EDA", "Statistics"] },
    { name: "Computer Fundamentals",  skills: ["Data Structures & Algorithms", "Computer Networks", "Software Architecture", "Agile & Scrum", "Documentation"] },
    { name: "Tools",                  skills: ["Git & GitHub", "Linux", "Jira", "Figma", "Canva", "LaTeX"] },
];


/* ---------------- EDUCATION (Milestones strip) ---------------- */
const education = [
    { title: "MSc Advanced Computing", where: "King's College London", when: "Sep 2025 – Sep 2026", note: "", logo: "assets/images/logo-kcl.webp" },
    { title: "BEng Computer Engineering", where: "Goa Engineering College, India", when: "Nov 2020 – Aug 2024", note: "CGPA 8.92 / 10", logo: "assets/images/logo-gec.webp" },
];

/* ---------------- CERTIFICATES (Milestones strip) ----------------
   link     → the credential (a PDF in assets/pdf/ or a web address)
   image    → a picture of the certificate for the card (otherwise the issuer name is shown)
   issuer   → short name shown big on the card top      kind → "Award" or leave out for "Certificate"
   verified → true adds a "Verified credential" tag
   logo     → issuer/organisation logo for the card (logoBg: tile colour, default white)
   photo    → a photo that fills the card top
   badge    → a badge image (e.g. from Accredible); if it can't load, the issuer name is shown instead          */
const certificates = [
    { title: "King's Enterprise Award", where: "King's Entrepreneurship Institute", when: "Jun 2026", kind: "Award", issuer: "King's", link: "https://entrepreneurshipcredentials.kcl.ac.uk/c329fd19-87f6-405a-bddd-20706ff36de6", verified: true, badge: "assets/images/badge-kings-enterprise.webp" },
    { title: "Champion for Change Award", where: "King's College London", when: "Apr 2026", kind: "Award", issuer: "King's", link: "https://eu.credential.net/afa54a77-94b1-432b-b16e-722961cdbc4d", verified: true, badge: "assets/images/badge-champion-for-change.webp" },
    { title: "Machine Learning in Python", where: "University of Oxford", when: "", issuer: "Oxford", link: "https://drive.google.com/file/d/1Z6LPpPz8SnhsI3tNKfa8kXv9Fb6nTmjA/view", logo: "assets/images/logo-oxford.svg" },
    { title: "Internship Certificate", where: "OneShield India · Automation Scripting", when: "Jul – Sep 2023", link: "assets/pdf/certificate-oneshield.pdf", image: "assets/images/cert-oneshield.webp", logo: "assets/images/logo-oneshield.webp" },
    { title: "Careers 360 Award", where: "King's College London", when: "May 2026", kind: "Award", issuer: "King's", link: "https://eu.credential.net/2b0cf7dc-435a-4fe2-8335-9c4cda1ab57e", verified: true, badge: "assets/images/badge-careers-360.webp" },
    { title: "Complete Data Science, ML, DL & NLP Bootcamp", where: "Udemy", when: "", issuer: "Udemy", link: "https://www.udemy.com/certificate/UC-33988b0e-7647-49d7-a001-65a75e6882db/", logo: "assets/images/logo-udemy.webp" },
    { title: "King's Mentoring Award", where: "King's College London", when: "Apr 2026", kind: "Award", issuer: "King's", link: "https://eu.credential.net/332df45c-ae3c-4230-a611-c32ae4fe4b01", verified: true, badge: "assets/images/badge-kings-mentoring.webp" },
    { title: "The Data Analyst Course: Complete Data Analyst Bootcamp", where: "Udemy", when: "", issuer: "Udemy", link: "https://www.udemy.com/certificate/UC-75308a18-6ba5-4d21-b017-d9605f5e830e/", logo: "assets/images/logo-udemy.webp" },
    { title: "Certificate of Recognition", where: "Cursor Council · Goa College of Engineering", when: "2022 – 2023", link: "assets/pdf/certificate-cursor-council.pdf", image: "assets/images/cert-cursor-council.webp", logo: "assets/images/logo-cursor.webp" },
    { title: "The Project Management Course: Beginner to PROject Manager", where: "Udemy", when: "", issuer: "Udemy", link: "https://www.udemy.com/certificate/UC-971ec47d-98b5-48b2-90c7-21c1846ccfda/", logo: "assets/images/logo-udemy.webp" },
    { title: "Excel Essential Training (Microsoft 365)", where: "LinkedIn Learning", when: "Sep 2021", issuer: "LinkedIn", link: "https://www.linkedin.com/learning/certificates/bd2433d9b3e12ac514c3942032bfb91bd861f800ec8f8177396563b2fdbb89fa/", logo: "assets/images/logo-linkedin.webp", logoBg: "#0a66c2" },
];
