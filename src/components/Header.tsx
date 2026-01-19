"use client";

import { FileText } from "lucide-react";

export function Header() {
    return (
        <div className="h-[64px] bg-white flex items-center px-4 border-b border-zinc-200 fixed top-0 left-0 right-0 z-50 print:hidden shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm">
                    <FileText size={20} className="stroke-[2.5]" />
                </div>
                <span className="text-xl font-semibold text-zinc-800 tracking-tight">
                    DocFlow-Editor
                </span>
            </div>
        </div>
    );
}
