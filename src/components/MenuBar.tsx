'use client';

import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code2,
  Quote2,
  Copy,
  RotateCcw,
  Trash2
} from 'lucide-react';

interface MenuBarProps {
  editor: Editor | null;
}

export default function MenuBar({ editor }: MenuBarProps) {
  if (!editor) {
    return null;
  }

  const Button = ({ 
    onClick, 
    active, 
    children, 
    title,
    disabled = false
  }: { 
    onClick: () => void; 
    active?:  boolean; 
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center
        w-10 h-10 rounded-lg
        transition-all duration-200
        font-medium text-sm
        ${
          active 
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        relative group
      `}
      title={title}
      type="button"
    >
      {children}
      
      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {title}
      </span>
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-gray-300 mx-2" />;

  const ButtonGroup = ({ children, label }: { children: React.ReactNode; label?:  string }) => (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs text-gray-500 font-semibold px-2 mb-1">{label}</span>}
      <div className="flex gap-1 items-center bg-gray-50 p-1 rounded-lg">
        {children}
      </div>
    </div>
  );

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Main toolbar */}
        <div className="flex flex-wrap gap-4 items-center">
          
          {/* Text Formatting Group */}
          <ButtonGroup label="Format">
            <Button
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold size={18} />
            </Button>

            <Button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic size={18} />
            </Button>

            <Button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon size={18} />
            </Button>
          </ButtonGroup>

          {/* Headings Group */}
          <ButtonGroup label="Headings">
            <Button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={18} />
            </Button>

            <Button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={18} />
            </Button>

            <Button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor. isActive('heading', { level:  3 })}
              title="Heading 3"
            >
              <Heading3 size={18} />
            </Button>
          </ButtonGroup>

          {/* Lists Group */}
          <ButtonGroup label="Lists">
            <Button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List size={18} />
            </Button>

            <Button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered size={18} />
            </Button>
          </ButtonGroup>

          {/* Blocks Group */}
          <ButtonGroup label="Blocks">
            <Button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote2 size={18} />
            </Button>

            <Button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive('codeBlock')}
              title="Code Block"
            >
              <Code2 size={18} />
            </Button>
          </ButtonGroup>

          {/* Divider */}
          <Divider />

          {/* Actions Group */}
          <ButtonGroup label="Actions">
            <Button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={! editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw size={18} />
            </Button>

            <Button
              onClick={() => editor.chain().focus().clearNodes().run()}
              title="Clear Formatting"
            >
              <Trash2 size={18} />
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
}