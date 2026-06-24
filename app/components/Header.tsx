'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';

export default function Header() {
    const { currentUser, setShowAuthModal, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="border-b-4 border-foreground py-6 px-8 bg-background relative z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link href="/">
                    <div className="cursor-pointer">
                        <Image
                            src="/E-cell Logo.svg"
                            alt="E-cell Logo"
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="w-auto h-12 invert"
                        />
                    </div>
                </Link>
                <div className="flex items-center gap-4">
                    {currentUser ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`flex items-center justify-center w-12 h-12 border-2 border-foreground transition-all ${isMenuOpen ? 'bg-foreground text-background' : 'bg-background text-foreground hover:bg-highlight'}`}
                            >
                                <User className="w-6 h-6" />
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-background border-2 border-foreground shadow-[4px_4px_0px_0px_#3D5A5B] p-4 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="text-right border-b-2 border-dashed border-gray-300 pb-3">
                                        <div className="font-black text-lg uppercase tracking-tight break-words text-foreground" style={{ fontFamily: "'Space Mono', monospace" }}>{currentUser.name}</div>
                                        <div className="text-xs text-gray-600 font-bold truncate" style={{ fontFamily: "'Space Mono', monospace" }}>{currentUser.email}</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full border-2 border-foreground py-3 text-sm font-black hover:bg-foreground hover:text-background transition-all uppercase text-center"
                                        style={{ fontFamily: "'Space Mono', monospace" }}
                                    >
                                        SIGN OUT
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAuthModal(true)}
                            className="border-2 border-foreground px-6 py-2 font-bold hover:bg-foreground hover:text-background transition-colors text-foreground"
                        >
                            SIGN IN
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
