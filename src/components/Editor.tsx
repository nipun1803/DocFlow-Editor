"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Pagination } from "../extensions/PaginationExtension";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "../extensions/FontSize";
import { FontFamily } from "../extensions/FontFamily";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Toolbar } from "./Toolbar";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { useState } from "react";

const DEFAULT_CONTENT = `
  <h1>Document Title</h1>
  <p>Welcome to the document editor with real-time pagination.  This editor simulates a professional document environment with A4 page sizing and 1-inch margins.</p>
  <h2>Getting Started</h2>
  <p>Start typing or paste content to see how it flows across pages.  The editor will automatically insert page breaks to match what you'll see when you print or export the document.</p>
  <h3>Features</h3>
  <ul>
    <li><strong>Real-time pagination</strong> - See exactly where pages break as you type</li>
    <li><strong>Text formatting</strong> - Bold, italic, underline, and more</li>
    <li><strong>Font sizes</strong> - Multiple size options for headings and body text</li>
    <li><strong>Color support</strong> - Change text color with the color picker</li>
    <li><strong>Lists</strong> - Bullet and numbered lists</li>
    <li><strong>Tables</strong> - Insert and edit tables</li>
  </ul>
  <p>Try editing this document to see pagination in action! </p>
  <h2>More Content</h2>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
  <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. </p>
  <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
`;

export default function DocumentEditor() {
  const [zoom, setZoom] = useState(100);

  const editor = useEditor({
    extensions: [
      StarterKit. configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TaskList,
      TaskItem. configure({
        nested: true,
      }),
      Underline,
      TextAlign. configure({
        types: ["heading", "paragraph"],
      }),
      Pagination. configure({
        pageSize: "a4",
        marginTop: 96,
        marginBottom: 96,
        marginLeft: 96,
        marginRight: 96,
      }),
      TextStyle,
      Color,
      FontSize,
      FontFamily,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    immediatelyRender: false,
    content: DEFAULT_CONTENT,
    editorProps: {
      attributes: {
        class: "focus:outline-none prose prose-sm max-w-none",
      },
    },
    onUpdate:  ({ editor }) => {
      localStorage.setItem("doc-editor-content", editor.getHTML());
    },
    onCreate: ({ editor }) => {
      const savedContent = localStorage.getItem("doc-editor-content");
      if (savedContent) {
        editor.commands.setContent(savedContent);
      }
    },
  });

  const zoomScale = zoom / 100;

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "var(--workspace-bg)" }}>
      <Toolbar editor={editor} zoom={zoom} onZoomChange={setZoom} />
      <div className="flex-1 overflow-auto print:overflow-visible">
        <div
          className="editor-pages"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
          }}
        >
          <div className="page">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}