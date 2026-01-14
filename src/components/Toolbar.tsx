"use client";

import { Editor } from "@tiptap/react";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Undo2,
    Redo2,
    Strikethrough,
    Code2,
    Quote,
    Minus,
    Printer,
    Table as TableIcon,
    Palette,
    Type,
    CaseSensitive,
} from "lucide-react";
import { useCallback, useState } from "react";
import { FONT_FAMILIES } from "../extensions/FontFamily";

interface ToolbarProps {
    editor: Editor | null;
}

const FONT_SIZES = [
    { label: "8pt", value: "8pt" },
    { label: "9pt", value: "9pt" },
    { label: "10pt", value: "10pt" },
    { label: "11pt", value: "11pt" },
    { label: "12pt", value: "12pt" },
    { label: "14pt", value: "14pt" },
    { label: "16pt", value: "16pt" },
    { label: "18pt", value: "18pt" },
    { label: "20pt", value: "20pt" },
    { label: "24pt", value: "24pt" },
    { label: "28pt", value: "28pt" },
    { label: "32pt", value: "32pt" },
    { label: "36pt", value: "36pt" },
    { label: "48pt", value: "48pt" },
    { label: "72pt", value: "72pt" },
];

const PAGE_SIZES = [
    { label: "A4", value: "a4" },
    { label: "Letter", value: "letter" },
    { label: "Legal", value: "legal" },
];

export function Toolbar({ editor }: ToolbarProps) {
    const [currentColor, setCurrentColor] = useState("#000000");
    const [currentFontSize, setCurrentFontSize] = useState("12pt");
    const [currentFontFamily, setCurrentFontFamily] = useState("");
    const [currentPageSize, setCurrentPageSize] = useState("a4");

    const handleColorChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const color = e.target.value;
            setCurrentColor(color);
            editor?.chain().focus().setColor(color).run();
        },
        [editor]
    );

    const handleFontSizeChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const size = e.target.value;
            setCurrentFontSize(size);
            editor?.chain().focus().setFontSize(size).run();
        },
        [editor]
    );

    const handleFontFamilyChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const family = e.target.value;
            setCurrentFontFamily(family);
            if (family) {
                editor?.chain().focus().setFontFamily(family).run();
            } else {
                editor?.chain().focus().unsetFontFamily().run();
            }
        },
        [editor]
    );

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const insertTable = useCallback(() => {
        editor
            ?.chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run();
    }, [editor]);

    if (!editor) {
        return (
            <div className="toolbar-skeleton h-14 bg-white border-b border-slate-200 animate-pulse" />
        );
    }

    // Button component for toolbar items
    const ToolbarButton = ({
        onClick,
        active,
        disabled,
        children,
        title,
    }: {
        onClick: () => void;
        active?: boolean;
        disabled?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        relative flex items-center justify-center w-9 h-9 rounded-md
        transition-all duration-150 ease-out
        ${active
                    ? "bg-blue-100 text-blue-600 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        group
      `}
            title={title}
            type="button"
        >
            {children}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                {title}
            </span>
        </button>
    );

    // Divider component
    const Divider = () => <div className="w-px h-6 bg-slate-300 mx-1" />;

    return (
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
                {/* Undo/Redo */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo2 size={18} />
                    </ToolbarButton>
                </div>

                <Divider />

                {/* Font Family */}
                <div className="flex items-center gap-1">
                    <CaseSensitive size={16} className="text-slate-500" />
                    <select
                        value={currentFontFamily}
                        onChange={handleFontFamilyChange}
                        className="h-9 px-2 text-sm bg-white border border-slate-300 rounded-md hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-w-[120px]"
                        title="Font Family"
                    >
                        {FONT_FAMILIES.map((font) => (
                            <option key={font.label} value={font.value}>
                                {font.label}
                            </option>
                        ))}
                    </select>
                </div>

                <Divider />

                {/* Font Size */}
                <div className="flex items-center gap-1">
                    <Type size={16} className="text-slate-500" />
                    <select
                        value={currentFontSize}
                        onChange={handleFontSizeChange}
                        className="h-9 px-2 text-sm bg-white border border-slate-300 rounded-md hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                        title="Font Size"
                    >
                        {FONT_SIZES.map((size) => (
                            <option key={size.value} value={size.value}>
                                {size.label}
                            </option>
                        ))}
                    </select>
                </div>

                <Divider />

                {/* Text Formatting */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={editor.isActive("bold")}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive("italic")}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        active={editor.isActive("underline")}
                        title="Underline (Ctrl+U)"
                    >
                        <UnderlineIcon size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        active={editor.isActive("strike")}
                        title="Strikethrough"
                    >
                        <Strikethrough size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        active={editor.isActive("code")}
                        title="Code"
                    >
                        <Code2 size={18} />
                    </ToolbarButton>
                </div>

                <Divider />

                {/* Color Picker */}
                <div className="flex items-center gap-1">
                    <div className="relative flex items-center">
                        <Palette size={16} className="text-slate-500 mr-1" />
                        <div
                            className="w-8 h-8 rounded-md border-2 border-slate-300 cursor-pointer overflow-hidden hover:border-slate-400 transition-colors"
                            style={{ backgroundColor: currentColor }}
                        >
                            <input
                                type="color"
                                value={currentColor}
                                onChange={handleColorChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="Text Color"
                            />
                        </div>
                    </div>
                </div>

                <Divider />

                {/* Headings */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleHeading({ level: 1 }).run()
                        }
                        active={editor.isActive("heading", { level: 1 })}
                        title="Heading 1"
                    >
                        <Heading1 size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleHeading({ level: 2 }).run()
                        }
                        active={editor.isActive("heading", { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleHeading({ level: 3 }).run()
                        }
                        active={editor.isActive("heading", { level: 3 })}
                        title="Heading 3"
                    >
                        <Heading3 size={18} />
                    </ToolbarButton>
                </div>

                <Divider />

                {/* Alignment */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                        active={editor.isActive({ textAlign: "left" })}
                        title="Align Left"
                    >
                        <AlignLeft size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                        active={editor.isActive({ textAlign: "center" })}
                        title="Align Center"
                    >
                        <AlignCenter size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                        active={editor.isActive({ textAlign: "right" })}
                        title="Align Right"
                    >
                        <AlignRight size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                        active={editor.isActive({ textAlign: "justify" })}
                        title="Justify"
                    >
                        <AlignJustify size={18} />
                    </ToolbarButton>
                </div>

                <Divider />

                {/* Lists */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        active={editor.isActive("bulletList")}
                        title="Bullet List"
                    >
                        <List size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        active={editor.isActive("orderedList")}
                        title="Numbered List"
                    >
                        <ListOrdered size={18} />
                    </ToolbarButton>
                </div>

                <Divider />

                {/* Blocks */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        active={editor.isActive("blockquote")}
                        title="Quote"
                    >
                        <Quote size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Horizontal Rule"
                    >
                        <Minus size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={insertTable} title="Insert Table">
                        <TableIcon size={18} />
                    </ToolbarButton>
                </div>

                <Divider />

                {/* Page Size */}
                <div className="flex items-center gap-1">
                    <select
                        value={currentPageSize}
                        onChange={(e) => setCurrentPageSize(e.target.value)}
                        className="h-9 px-2 text-sm bg-white border border-slate-300 rounded-md hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                        title="Page Size"
                    >
                        {PAGE_SIZES.map((size) => (
                            <option key={size.value} value={size.value}>
                                {size.label}
                            </option>
                        ))}
                    </select>
                </div>

                <Divider />

                {/* Print */}
                <ToolbarButton onClick={handlePrint} title="Print (Ctrl+P)">
                    <Printer size={18} />
                </ToolbarButton>
            </div>
        </div>
    );
}
