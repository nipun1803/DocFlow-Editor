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
  ZoomIn,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { useCallback, useState } from "react";
import { FONT_FAMILIES } from "../extensions/FontFamily";
import { PAGE_SIZES } from "../extensions/PaginationExtension";

interface ToolbarProps {
  editor: Editor | null;
  zoom?:  number;
  onZoomChange?: (zoom: number) => void;
}

const FONT_SIZES = [
  { label: "Small", value: "10pt" },
  { label:  "Normal", value: "12pt" },
  { label: "Large", value: "14pt" },
  { label:  "Heading 3", value: "16pt" },
  { label: "Heading 2", value: "20pt" },
  { label:  "Heading 1", value:  "28pt" },
];

const ZOOM_LEVELS = [50, 75, 90, 100, 125, 150, 200];

export function Toolbar({ editor, zoom = 100, onZoomChange }: ToolbarProps) {
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentFontSize, setCurrentFontSize] = useState("12pt");
  const [currentFontFamily, setCurrentFontFamily] = useState("Times New Roman");
  const [currentPageSize, setCurrentPageSize] = useState("a4");
  const [showMore, setShowMore] = useState(false);

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
      const family = e.target. value;
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
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="h-16 bg-white/95 backdrop-blur-xl border-b border-zinc-200 animate-pulse" />
    );
  }

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    active?:  boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative flex items-center justify-center w-9 h-9 rounded-lg
        transition-all duration-200 ease-out
        ${
          active
            ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-200"
            : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 hover:scale-105"
        }
        ${disabled ? "opacity-30 cursor-not-allowed hover:scale-100" : "cursor-pointer active:scale-95"}
      `}
      title={title}
      type="button"
    >
      {children}
      <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-zinc-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
        {title}
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45"></span>
      </span>
    </button>
  );

  const Divider = () => <div className="w-px h-7 bg-zinc-200" />;

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-200 shadow-sm print:hidden">
      <div className="flex items-center justify-between gap-3 px-6 py-3">
        {/* Left side - Main editing tools */}
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor. chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo2 size={18} strokeWidth={2} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo2 size={18} strokeWidth={2} />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Font controls */}
          <div className="flex items-center gap-2">
            <select
              value={currentFontSize}
              onChange={handleFontSizeChange}
              className="h-9 px-3 pr-8 text-sm font-medium bg-white border border-zinc-300 rounded-lg hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all appearance-none"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.25em 1.25em'
              }}
            >
              {FONT_SIZES.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>

            <select
              value={currentFontFamily}
              onChange={handleFontFamilyChange}
              className="h-9 px-3 pr-8 text-sm font-medium bg-white border border-zinc-300 rounded-lg hover:border-zinc-400 focus:outline-none focus:ring-2 focus: ring-blue-500 focus: border-transparent cursor-pointer transition-all min-w-[140px] appearance-none"
              style={{ 
                backgroundImage:  `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize:  '1.25em 1.25em'
              }}
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font. label} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <Divider />

          {/* Text formatting */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              title="Bold"
            >
              <Bold size={18} strokeWidth={2.5} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              title="Italic"
            >
              <Italic size={18} strokeWidth={2} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor. isActive("underline")}
              title="Underline"
            >
              <UnderlineIcon size={18} strokeWidth={2} />
            </ToolbarButton>

            {/* Color picker */}
            <div className="relative">
              <ToolbarButton
                onClick={() => {}}
                title="Text Color"
              >
                <div className="relative">
                  <Palette size={18} />
                  <div 
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full" 
                    style={{ backgroundColor: currentColor }}
                  />
                  <input
                    type="color"
                    value={currentColor}
                    onChange={handleColorChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </ToolbarButton>
            </div>
          </div>

          <Divider />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              active={editor.isActive({ textAlign: "left" })}
              title="Align Left"
            >
              <AlignLeft size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              active={editor. isActive({ textAlign: "center" })}
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
          </div>

          <Divider />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor. isActive("bulletList")}
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

          {/* More options dropdown */}
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowMore(!showMore)}
              active={showMore}
              title="More Options"
            >
              <MoreHorizontal size={18} />
            </ToolbarButton>

            {showMore && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-zinc-200 p-2 min-w-[200px] z-50">
                <button
                  onClick={() => {
                    editor. chain().focus().toggleBlockquote().run();
                    setShowMore(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 hover: bg-zinc-100 rounded-md transition-colors"
                >
                  <Quote size={16} />
                  <span>Quote</span>
                </button>
                <button
                  onClick={() => {
                    editor. chain().focus().toggleCode().run();
                    setShowMore(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  <Code2 size={16} />
                  <span>Inline Code</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setHorizontalRule().run();
                    setShowMore(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  <Minus size={16} />
                  <span>Divider</span>
                </button>
                <button
                  onClick={() => {
                    insertTable();
                    setShowMore(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  <TableIcon size={16} />
                  <span>Table</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side - View controls */}
        <div className="flex items-center gap-2">
          <select
            value={zoom}
            onChange={(e) => onZoomChange?.(Number(e.target.value))}
            className="h-9 px-3 pr-8 text-sm font-medium bg-white border border-zinc-300 rounded-lg hover:border-zinc-400 focus:outline-none focus: ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all appearance-none"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25em 1.25em'
            }}
          >
            {ZOOM_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}%
              </option>
            ))}
          </select>

          <ToolbarButton onClick={handlePrint} title="Print">
            <Printer size={18} />
          </ToolbarButton>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showMore && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMore(false)}
        />
      )}
    </div>
  );
}