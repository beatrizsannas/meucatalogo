'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type SelectOption = {
    value: string;
    label: string;
};

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    className?: string; // allow overriding button styles
    dropdownClassName?: string; // allow overriding container positioning/width
}

export default function CustomSelect({ value, onChange, options, className = '', dropdownClassName = '' }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Find selected label or fallback to value
    const selectedOption = options.find(o => o.value === value) || { label: value };

    // Default button style if not overriden
    const btnClass = className || "w-full flex items-center justify-between pl-4 pr-10 py-2.5 rounded-full bg-mint border border-mint-dark text-forest text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lime cursor-pointer transition-all text-left";

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={btnClass}
            >
                <span className="truncate pr-2">{selectedOption.label}</span>
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-forest/50 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className={`absolute top-full right-0 mt-2 min-w-full bg-white rounded-2xl border border-mint-dark shadow-[0_4px_20px_0_rgba(0,0,0,0.08)] z-50 overflow-hidden py-2 max-h-60 overflow-y-auto ${dropdownClassName}`}>
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${value === opt.value ? 'bg-mint/30 text-forest font-bold' : 'text-forest/70 hover:bg-mint/20 hover:text-forest font-medium'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
