"use client";

import { FileText, Lock, Star } from "lucide-react";

export function Header() {
    return (
        <div className="h-[64px] bg-[#f9fbfd] flex items-center px-4 justify-between border-b border-[#c7c7c7] fixed top-0 left-0 right-0 z-50 print:hidden">
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-600 rounded text-white cursor-pointer hover:bg-blue-700 transition-colors">
                    <FileText size={18} />
                </div>

                <div className="flex flex-col justify-center">
                    <input
                        type="text"
                        defaultValue="Doc Editor"
                        className="text-[18px] text-[#1f1f1f] bg-transparent border border-transparent rounded px-1 -ml-1 hover:border-black focus:border-blue-500 focus:outline-none leading-tight py-0 w-[300px]"
                    />
                </div>
            </div>
            {/* Options removed as per request */}
        </div>
    );
}
