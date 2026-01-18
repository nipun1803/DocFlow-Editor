"use client";

import { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";
import { ChevronRight, ChevronLeft, FileText, PanelLeft } from "lucide-react";

interface SidebarProps {
    editor: Editor | null;
    isOpen: boolean;
    onToggle: () => void;
}

export default function Sidebar({ editor, isOpen, onToggle }: SidebarProps) {
    const [pages, setPages] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!editor) return;

        const updatePages = () => {
            // Logic to count pages. 
            // Since we use tiptap-pagination-plus, we might need to listen to its state if available, 
            // or standard DOM checking for page-break-widget
            const widgets = document.querySelectorAll('.page-break-widget');
            // Number of pages is widgets + 1 (the last chunk)
            const pageCount = widgets.length + 1;

            const newPages = Array.from({ length: pageCount }, (_, i) => i + 1);
            if (newPages.length !== pages.length) {
                setPages(newPages);
            }

            // Determine current page based on scroll or selection?
            // For now, let's just track total pages.
        };

        updatePages();

        // Listen to transaction to update page count
        editor.on('transaction', updatePages);
        return () => {
            editor.off('transaction', updatePages);
        };
    }, [editor, pages.length]);

    const scrollToPage = (pageNum: number) => {
        // Basic scrolling implementation
        // We can try to find the page-break-widget for pageNum - 1
        if (pageNum === 1) {
            const editorEl = document.getElementById('editor');
            editorEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Find the break for pageNum-1 (which is at end of pageNum-1 / start of pageNum)
            const widgets = document.querySelectorAll('.page-break-widget');
            const targetWidget = widgets[pageNum - 2];
            if (targetWidget) {
                // Scroll to the header part of the widget
                targetWidget.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        setCurrentPage(pageNum);
    };

    if (!isOpen) {
        return (
            <button
                onClick={onToggle}
                className="fixed left-4 bottom-4 z-50 bg-white p-2 rounded-full shadow-md border border-zinc-200 hover:bg-zinc-50 transition-all print:hidden"
                title="Show Page Thumbnails"
            >
                <PanelLeft size={20} className="text-zinc-600" />
            </button>
        );
    }

    return (
        <div className="fixed left-0 top-[110px] bottom-0 w-64 bg-zinc-50 border-r border-zinc-200 z-30 flex flex-col print:hidden shadow-sm transition-all animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-white">
                <h2 className="text-sm font-semibold text-zinc-700">Pages</h2>
                <button onClick={onToggle} className="text-zinc-500 hover:bg-zinc-100 p-1 rounded">
                    <ChevronLeft size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => scrollToPage(page)}
                        className={`w-full group flex flex-col gap-2 transition-all ${currentPage === page ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                    >
                        <div className={`
              w-full aspect-[210/297] bg-white shadow-sm border rounded-sm relative overflow-hidden transition-all
              ${currentPage === page ? 'ring-2 ring-blue-500 border-blue-500 shadow-md' : 'border-zinc-200 group-hover:border-zinc-300'}
            `}>
                            {/* Thumbnail Placeholder - Real thumbnail generation is complex */}
                            <div className="absolute inset-0 flex items-center justify-center bg-white">
                                <div className="text-[8px] text-zinc-300 p-2 text-left w-full h-full leading-tight">
                                    <div className="w-3/4 h-1 bg-zinc-100 mb-1" />
                                    <div className="w-full h-1 bg-zinc-100 mb-1" />
                                    <div className="w-5/6 h-1 bg-zinc-100 mb-1" />
                                    <div className="w-full h-1 bg-zinc-100 mb-1" />
                                    <div className="w-2/3 h-1 bg-zinc-100 mb-1" />
                                </div>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                                <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    Go to Page {page}
                                </span>
                            </div>
                        </div>
                        <span className={`text-xs text-center font-medium ${currentPage === page ? 'text-blue-600' : 'text-zinc-500'}`}>
                            Page {page}
                        </span>
                    </button>
                ))}
            </div>

            <div className="p-3 border-t border-zinc-200 bg-white text-xs text-center text-zinc-500">
                {pages.length} pages
            </div>
        </div>
    );
}
