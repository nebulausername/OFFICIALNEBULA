import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SectionHeader({
    title,
    subtitle,
    linkTo,
    linkText = "View All",
    onPrev = undefined,
    onNext = undefined
}) {
    return (
        <div className="flex items-end justify-between mb-8 md:mb-12 px-2">
            <div className="max-w-xl">
                {subtitle && (
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-8 h-[2px] bg-gold/50 shadow-[0_0_10px_#D6B25E]" />
                        <span className="text-gold text-xs md:text-sm font-bold uppercase tracking-[0.2em]">{subtitle}</span>
                    </div>
                )}
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">
                    {title}
                </h2>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
                {linkTo && (
                    <Link to={linkTo}>
                        <Button variant="ghost" className="hidden md:flex items-center gap-2 text-zinc-400 hover:text-gold hover:bg-white/5 transition-all group uppercase tracking-wider font-bold">
                            <span>{linkText}</span>
                            <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center group-hover:border-gold/50 transition-all">
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </Button>
                    </Link>
                )}

                {(onPrev || onNext) && (
                    <div className="flex items-center gap-2">
                        <button onClick={onPrev} className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-gold hover:text-black hover:border-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={onNext} className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-gold hover:text-black hover:border-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
