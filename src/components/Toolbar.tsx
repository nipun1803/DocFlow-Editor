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
  Minus,
  Plus,
  Type,
  Baseline,
  Highlighter,
  Link as LinkIcon,
  Image as ImageIcon,
  MessageSquarePlus,
  CheckSquare,
  Indent,
  Outdent,
  RemoveFormatting,
  ChevronDown,
} from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { FONT_FAMILIES } from "../extensions/FontFamily";

interface ToolbarProps {
  editor: Editor | null;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

const ZOOM_LEVELS = [50, 75, 90, 100, 125, 150, 200];

const HEADING_STYLES = [
  { label: "Normal text", value: "paragraph", className: "text-sm" },
  { label: "Title", value: 1, className: "text-2xl font-bold" },
  { label: "Subtitle", value: "subtitle", className: "text-xl text-zinc-500" }, // Custom mapping needed if used
  { label: "Heading 1", value: 1, className: "text-xl font-bold" },
  { label: "Heading 2", value: 2, className: "text-lg font-bold" },
  { label: "Heading 3", value: 3, className: "text-base font-bold" },
];

export function Toolbar({ editor, zoom = 100, onZoomChange }: ToolbarProps) {
  const [currentFontSize, setCurrentFontSize] = useState("12");
  const [inputFontSize, setInputFontSize] = useState("12");
  const [currentFontFamily, setCurrentFontFamily] = useState("Arial");
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);

  // Sync state with editor
  useEffect(() => {
    if (!editor) return;

    const updateState = () => {
      // Font Size
      const size = editor.getAttributes("textStyle").fontSize;
      if (size) {
        const cleanSize = size.replace(/[a-z]/g, "");
        setCurrentFontSize(cleanSize);
        setInputFontSize(cleanSize);
      } else {
        // Default
        setCurrentFontSize("12");
        setInputFontSize("12");
      }

      // Font Family
      const family = editor.getAttributes("textStyle").fontFamily;
      if (family) {
        setCurrentFontFamily(family);
      } else {
        setCurrentFontFamily("Arial"); // Default fallback
      }
    };

    editor.on("selectionUpdate", updateState);
    editor.on("update", updateState);

    return () => {
      editor.off("selectionUpdate", updateState);
      editor.off("update", updateState);
    };
  }, [editor]);

  const handleFontSizeChange = useCallback((newSize: string) => {
    const size = parseInt(newSize);
    if (!isNaN(size) && size > 0) {
      editor?.chain().focus().setFontSize(`${size}pt`).run();
      setCurrentFontSize(size.toString());
      setInputFontSize(size.toString());
    }
  }, [editor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputFontSize(e.target.value);
  };

  const handleInputBlur = () => {
    handleFontSizeChange(inputFontSize);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFontSizeChange(inputFontSize);
      editor?.commands.focus();
    }
  };

  const incrementFontSize = () => {
    const newSize = parseInt(currentFontSize) + 1;
    handleFontSizeChange(newSize.toString());
  };

  const decrementFontSize = () => {
    const newSize = Math.max(1, parseInt(currentFontSize) - 1);
    handleFontSizeChange(newSize.toString());
  };

  if (!editor) {
    return (
      <div className="h-[46px] bg-[#edf2fa] border-b border-[#c7c7c7]" />
    );
  }

  // Helper Components
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
        flex items-center justify-center w-7 h-7 rounded-[4px]
        transition-colors duration-100 ease-in-out
        ${active
          ? "bg-blue-100 text-blue-700"
          : "text-[#444746] hover:bg-[#1d1d1f]/10"
        }
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      title={title}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#edf2fa] border-b border-[#c7c7c7] print:hidden h-[46px] flex items-center">
      {/* Scrollable Container for small screens */}
      <div className="flex items-center w-full px-4 gap-1 overflow-x-auto no-scrollbar h-full">

        {/* History & Print */}
        <div className="flex items-center gap-0.5">
          <ToolButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Custom + Z)">
            <Undo2 size={15} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Custom + Y)">
            <Redo2 size={15} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton onClick={() => window.print()} title="Print">
            <Printer size={15} strokeWidth={2.5} />
          </ToolButton>
          {/* Zoom - Simplified for space */}
          <div className="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-[4px] hover:bg-[#1d1d1f]/10 cursor-pointer text-[#444746]" title="Zoom">
            <select
              value={zoom}
              onChange={(e) => onZoomChange?.(Number(e.target.value))}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer appearance-none pr-3"
            >
              {ZOOM_LEVELS.map(z => <option key={z} value={z}>{z}%</option>)}
            </select>
            <ChevronDown size={10} className="-ml-3 pointer-events-none" />
          </div>
        </div>

        <Separator />

        {/* Styles */}
        <div className="flex items-center relative">
          <button
            className="px-2 h-7 flex items-center gap-2 rounded-[4px] hover:bg-[#1d1d1f]/10 text-[#444746] text-sm font-medium min-w-[100px]"
            onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
          >
            <span className="truncate max-w-[80px]">
              {editor.isActive('heading', { level: 1 }) ? 'Heading 1' :
                editor.isActive('heading', { level: 2 }) ? 'Heading 2' :
                  editor.isActive('heading', { level: 3 }) ? 'Heading 3' :
                    'Normal text'}
            </span>
            <ChevronDown size={10} />
          </button>

          {showHeadingDropdown && (
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setShowHeadingDropdown(false)} />
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded shadow-lg border border-zinc-200 py-1 z-[101] max-h-[300px] overflow-y-auto">
                {HEADING_STYLES.map(style => (
                  <button
                    key={style.label}
                    className={`w-full text-left px-4 py-2 hover:bg-zinc-100 flex items-center justify-between ${style.className}`}
                    onClick={() => {
                      if (style.value === 'paragraph') {
                        editor.chain().focus().setParagraph().run();
                      } else if (typeof style.value === 'number') {
                        editor.chain().focus().toggleHeading({ level: style.value as 1 | 2 | 3 }).run();
                      }
                      setShowHeadingDropdown(false);
                    }}
                  >
                    {style.label}
                    {/* Checkmark if active could go here */}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Font Family */}
        <div className="flex items-center">
          <div className="relative group">
            <select
              value={currentFontFamily} // need mapping? simpler to just use raw value
              onChange={(e) => {
                const fam = e.target.value;
                editor.chain().focus().setFontFamily(fam).run();
                setCurrentFontFamily(fam);
              }}
              className="w-[110px] h-7 pl-2 text-sm bg-transparent hover:bg-[#1d1d1f]/10 rounded-[4px] focus:outline-none cursor-pointer appearance-none truncate"
            >
              {FONT_FAMILIES.map(f => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
          </div>
        </div>

        <Separator />

        {/* Font Size */}
        <div className="flex items-center border border-zinc-300 rounded-[4px] h-7 bg-white px-0.5">
          <button
            onClick={decrementFontSize}
            className="w-6 h-full flex items-center justify-center hover:bg-zinc-100 rounded-sm text-zinc-600"
            title="Decrease font size"
          >
            <Minus size={12} strokeWidth={3} />
          </button>
          <input
            type="text"
            value={inputFontSize}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="w-8 h-full text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-x border-transparent hover:border-zinc-200"
          />
          <button
            onClick={incrementFontSize}
            className="w-6 h-full flex items-center justify-center hover:bg-zinc-100 rounded-sm text-zinc-600"
            title="Increase font size"
          >
            <Plus size={12} strokeWidth={3} />
          </button>
        </div>

        <Separator />

        {/* Formatting */}
        <div className="flex items-center gap-0.5">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          >
            <Bold size={15} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          >
            <Italic size={15} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon size={15} strokeWidth={2.5} />
          </ToolButton>

          <div className="w-[1px] h-5 bg-zinc-200 mx-0.5" />

          <ToolButton
            onClick={() => { }} // Needs Color Extension logic improvement for direct click? 
            // Usually separate dropdown. For now, simple standard black/red switch or color picker
            title="Text color"
          >
            <div className="relative flex flex-col items-center justify-center">
              <Baseline size={14} strokeWidth={2.5} />
              <div className="h-[3px] w-3 bg-black mt-[1px] rounded-full" />
              {/* Invisible color input overlay */}
              <input
                type="color"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              />
            </div>
          </ToolButton>
          <ToolButton
            onClick={() => { }}
            title="Highlight color"
          >
            <div className="relative flex flex-col items-center justify-center">
              <Highlighter size={14} strokeWidth={2.5} />
              <div className="h-[3px] w-3 bg-yellow-300 mt-[1px]" />
              <input // Need highlight extension? Assuming standard setColor creates text color. Highlight usually distinct.
                // Standard Tiptap helper doesn't have highlight by default unless 'Highlight' extension added.
                // I'll leave as 'Text Color' picker for now to avoid errors if extension missing.
                type="color"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  // If highlight extension exists: editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
                  // Otherwise just log or ignore
                }}
              />
            </div>
          </ToolButton>
        </div>

        <Separator />

        {/* Insert - Simplified */}
        <div className="flex items-center gap-0.5">
          <ToolButton onClick={() => { }} title="Insert link" disabled>
            <LinkIcon size={15} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton onClick={() => { }} title="Insert image" disabled>
            <ImageIcon size={15} strokeWidth={2.5} />
          </ToolButton>
        </div>

        <Separator />

        {/* Alignment */}
        <div className="flex items-center gap-0.5">
          <ToolButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Left align"
          >
            <AlignLeft size={15} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Center align"
          >
            <AlignCenter size={15} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Right align"
          >
            <AlignRight size={15} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            active={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify size={15} strokeWidth={2.5} />
          </ToolButton>
        </div>

        <Separator />

        {/* Lists & Indent */}
        <div className="flex items-center gap-0.5">
          {/* Checkbox? Needed extension. Skipping for standard lists first */}
          <ToolButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bulleted list"
          >
            <List size={15} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered list"
          >
            <ListOrdered size={15} strokeWidth={2.5} />
          </ToolButton>

          <ToolButton
            onClick={() => editor.chain().focus().liftListItem('listItem').run()} // sink/lift logic check
            disabled={!editor.can().liftListItem('listItem')}
            title="Decrease indent"
          >
            <Outdent size={15} strokeWidth={2.5} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
            disabled={!editor.can().sinkListItem('listItem')}
            title="Increase indent"
          >
            <Indent size={15} strokeWidth={2.5} />
          </ToolButton>
        </div>

        <Separator />

        {/* Clear */}
        <div className="flex items-center">
          <ToolButton
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title="Clear formatting"
          >
            <RemoveFormatting size={15} strokeWidth={2.5} />
          </ToolButton>
        </div>

      </div>
    </div>
  );
}