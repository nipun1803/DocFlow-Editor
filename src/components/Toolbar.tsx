"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Printer,
  Baseline,
  RemoveFormatting,
  ChevronDown,
  FileText,
  Settings,
  Grid3x3,
  Quote,
  Strikethrough,
} from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { FONT_FAMILIES } from "../extensions/FontFamily";
import { exportToPDF, exportToDOCX, printDocument } from "../utils/export";

interface ToolbarProps {
  editor: Editor | null;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

const ZOOM_LEVELS = [50, 75, 90, 100, 125, 150, 200];

export function Toolbar({ editor, zoom = 100, onZoomChange }: ToolbarProps) {
  const [currentFontSize, setCurrentFontSize] = useState("12");
  const [currentFontFamily, setCurrentFontFamily] = useState("Arial");
  const [showPrintDropdown, setShowPrintDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Sync state with editor
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!editor) return;

    const updateState = () => {
      // Font Size
      const size = editor.getAttributes("textStyle").fontSize;
      if (size) {
        const cleanSize = size.replace(/[a-z]/g, "");
        setCurrentFontSize(cleanSize);
      } else {
        setCurrentFontSize("12");
      }

      // Font Family
      const family = editor.getAttributes("textStyle").fontFamily;
      if (family) {
        setCurrentFontFamily(family);
      } else {
        setCurrentFontFamily("Arial");
      }

      forceUpdate({});
    };

    editor.on("selectionUpdate", updateState);
    editor.on("update", updateState);
    editor.on("transaction", updateState);

    return () => {
      editor.off("selectionUpdate", updateState);
      editor.off("update", updateState);
      editor.off("transaction", updateState);
    };
  }, [editor]);

  const handleFontSizeChange = useCallback((newSize: string) => {
    const size = parseInt(newSize);
    if (!isNaN(size) && size > 0) {
      editor?.chain().focus().setFontSize(`${size}pt`).run();
      setCurrentFontSize(size.toString());
    }
  }, [editor]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF("document.pdf");
    } finally {
      setIsExporting(false);
      setShowPrintDropdown(false);
    }
  };

  const handleExportDOCX = async () => {
    setIsExporting(true);
    try {
      const content = editor?.getHTML() || "";
      await exportToDOCX(content, "document.docx");
    } finally {
      setIsExporting(false);
      setShowPrintDropdown(false);
    }
  };

  const handlePrint = () => {
    printDocument();
    setShowPrintDropdown(false);
  };

  if (!editor) {
    return (
      <div className="h-[46px] bg-[#edf2fa] border-b border-[#c7c7c7]" />
    );
  }


  const Separator = () => <div className="h-5 w-[1px] bg-zinc-300 mx-1" />;

  const ToolButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
    className = ""
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center w-8 h-8 rounded-[4px]
        transition-all duration-200 ease-in-out
        ${active
          ? "bg-blue-100/50 text-blue-700"
          : "text-zinc-600 hover:bg-zinc-200/50 group"
        }
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      data-title={title}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <div className="fixed top-[64px] left-0 right-0 z-40 bg-zinc-50 border-b border-zinc-200 print:hidden py-1 flex items-center shadow-sm min-h-[46px]">
      <div className="flex items-center w-full px-4 gap-1. 5 flex-wrap">

        {/* Undo/Redo & Print/Export & Zoom */}
        <div className="flex items-center gap-0.5">
          <ToolButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={16} strokeWidth={2.5} />
          </ToolButton>

          <div className="relative">
            <ToolButton
              onClick={() => setShowPrintDropdown(!showPrintDropdown)}
              title="Print & Export"
              disabled={isExporting}
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-zinc-300 border-t-zinc-600" />
              ) : (
                <Printer size={16} strokeWidth={2.5} />
              )}
            </ToolButton>

            {showPrintDropdown && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setShowPrintDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-zinc-200 py-1 z-[101]">

                  <button
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-100 flex items-center gap-3 text-sm transition-colors"
                    onClick={handlePrint}
                    disabled={isExporting}
                  >
                    <Printer size={16} className="text-zinc-600" />
                    <span>Print Document</span>
                    <span className="ml-auto text-xs text-zinc-400">Ctrl+P</span>
                  </button>

                  <div className="border-t border-zinc-100 my-1" />


                  <button
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-100 flex items-center gap-3 text-sm transition-colors disabled:opacity-50"
                    onClick={handleExportPDF}
                    disabled={isExporting}
                  >
                    <FileText size={16} className="text-red-600" />
                    <span>Export as PDF</span>
                  </button>


                  <button
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-100 flex items-center gap-3 text-sm transition-colors disabled:opacity-50"
                    onClick={handleExportDOCX}
                    disabled={isExporting}
                  >
                    <FileText size={16} className="text-blue-600" />
                    <span>Export as DOCX</span>
                  </button>

                  <div className="border-t border-zinc-100 my-1" />


                  <div className="px-4 py-2.5 text-sm">
                    <div className="flex items-center gap-3 text-zinc-500">
                      <Settings size={16} />
                      <span>A4 • 1" margins</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-[4px] hover:bg-zinc-100 cursor-pointer text-zinc-600">
            <select
              value={zoom}
              onChange={(e) => onZoomChange?.(Number(e.target.value))}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer appearance-none pr-3"
              title="Zoom level"
            >
              {ZOOM_LEVELS.map(z => <option key={z} value={z}>{z}%</option>)}
            </select>
            <ChevronDown size={12} className="-ml-3 pointer-events-none text-zinc-500" />
          </div>
        </div>

        <Separator />

        {/* Family */}
        <div className="flex items-center">
          <div className="relative group">
            <select
              value={currentFontFamily}
              onChange={(e) => {
                const fam = e.target.value;
                editor.chain().focus().setFontFamily(fam).run();
                setCurrentFontFamily(fam);
              }}
              className="w-[110px] h-7 pl-2 text-sm bg-transparent hover:bg-zinc-100 rounded-[4px] focus:outline-none cursor-pointer appearance-none truncate"
              title="Font family"
            >
              {FONT_FAMILIES.map(f => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
          </div>
        </div>

        <Separator />

        {/* font size */}
        <div className="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-[4px] hover:bg-zinc-100 cursor-pointer text-zinc-600">
          <select
            value={currentFontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="w-[50px] bg-transparent text-sm font-medium focus:outline-none cursor-pointer appearance-none text-center"
            title="Font size"
          >
            {[8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <ChevronDown size={12} className="-ml-3 pointer-events-none text-zinc-500" />
        </div>

        <Separator />

        {/* Formatting */}
        <div className="flex items-center gap-0.5">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={16} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={16} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote size={16} strokeWidth={2.5} />
          </ToolButton>

          <div className="w-[1px] h-5 bg-zinc-200 mx-0.5" />

          <ToolButton
            onClick={() => { }}
            title="Text color"
          >
            <div className="relative flex flex-col items-center justify-center">
              <Baseline size={16} strokeWidth={2.5} />
              <div className="h-[3px] w-3 bg-black mt-[1px] rounded-full" />
              <input
                type="color"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              />
            </div>
          </ToolButton>
        </div>

        <Separator />

        {/* Aligning */}
        <div className="flex items-center gap-0.5">
          <ToolButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Align left"
          >
            <AlignLeft size={16} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Align center"
          >
            <AlignCenter size={16} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Align right"
          >
            <AlignRight size={16} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            active={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify size={16} strokeWidth={2.5} />
          </ToolButton>
        </div>

        <Separator />

        {/* list */}
        <div className="flex items-center gap-0.5">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet list"
          >
            <List size={18} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered list"
          >
            <ListOrdered size={18} strokeWidth={2.5} />
          </ToolButton>
        </div>

        <Separator />

        {/*table */}
        <div className="flex items-center">
          <ToolButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Insert table (3×3)"
          >
            <Grid3x3 size={16} strokeWidth={2.5} />
          </ToolButton>
        </div>

        <Separator />

        <div className="flex items-center">
          <ToolButton
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title="Clear formatting"
          >
            <RemoveFormatting size={16} strokeWidth={2.5} />
          </ToolButton>
        </div>

      </div>
    </div>
  );
}