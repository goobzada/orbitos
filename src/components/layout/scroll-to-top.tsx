"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Mostrar o botão quando o usuário descer 500px globais
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <Button
            variant="outline"
            size="icon"
            className="fixed bottom-8 right-8 z-[100] rounded-full h-12 w-12 bg-[#050812]/80 backdrop-blur-md border-white/10 hover:bg-violet-600/20 hover:border-violet-500/50 text-slate-300 hover:text-white shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
            onClick={scrollToTop}
            aria-label="Voltar para o topo"
        >
            <ArrowUp className="h-5 w-5" />
        </Button>
    );
}
