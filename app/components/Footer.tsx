import React from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-12 px-8 bg-foreground text-background border-t-4 border-foreground font-sans">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl font-black mb-6 tracking-tighter" style={{ fontFamily: "'Space Mono', monospace" }}>LET'S CONNECT</h2>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <a
                        href="mailto:ecellbvudet@gmail.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-2 border-background px-6 py-3 font-bold hover:bg-background hover:text-foreground transition-colors inline-block"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                        MAIL
                    </a>
                    <a
                        href="https://www.instagram.com/ecell_bvdu_det"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-2 border-background px-6 py-3 font-bold hover:bg-background hover:text-foreground transition-colors inline-block"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                        INSTAGRAM
                    </a>
                    <a
                        href="https://twitter.com/ecelldetnm?s=11"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-2 border-background px-6 py-3 font-bold hover:bg-background hover:text-foreground transition-colors inline-block"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                        TWITTER
                    </a>
                    <a
                        href="https://www.linkedin.com/company/e-cell-bvdu-det-nm"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-2 border-background px-6 py-3 font-bold hover:bg-background hover:text-foreground transition-colors inline-block"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                        LINKEDIN
                    </a>
                </div>
                <p className="text-sm mb-4" style={{ fontFamily: "'Space Mono', monospace" }}>© {currentYear} E-CELL QUIZZES • ALL RIGHTS RESERVED</p>
                <p className="text-background text-[clamp(14px,3vw,18px)] tracking-wide flex items-center justify-center w-full text-center gap-1">
                    Made with <span className="text-red-500">❤️</span> by{" "}
                    <a
                        href="https://github.com/anshvermadev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer relative inline-block text-background border-b border-background hover:font-bold hover:border-b-2 transition-all duration-300"
                    >
                        Ansh Verma
                    </a>
                </p>
            </div>
        </footer>
    );
}
