"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Pagination } from "../extensions/pagination-extension";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "../extensions/FontSize";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Toolbar } from "./Toolbar";
import "../styles/editor.css";

export default function DocumentEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Pagination,
      TextStyle,
      Color,
      FontSize,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    immediatelyRender: false,
    content: `
      <h1>Document Title</h1>
      <p>Welcome to the document editor with real-time pagination. This editor simulates a professional document environment with A4 page sizing and 1-inch margins.</p>
      <h2>Getting Started</h2>
      <p>Start typing or paste content to see how it flows across pages. The editor will automatically insert page breaks to match what you'll see when you print or export the document.</p>
      <h3>Features</h3>
      <ul>
        <li><strong>Real-time pagination</strong> - See exactly where pages break as you type</li>
        <li><strong>Text formatting</strong> - Bold, italic, underline, and more</li>
        <li><strong>Font sizes</strong> - Multiple size options for headings and body text</li>
        <li><strong>Color support</strong> - Change text color with the color picker</li>
        <li><strong>Lists</strong> - Bullet and numbered lists</li>
        <li><strong>Tables</strong> - Insert and edit tables</li>
      </ul>
      <p>Try editing this document to see pagination in action!</p>
    `,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[1123px] prose prose-sm max-w-none",
      },
    },
  });

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Toolbar editor={editor} />
      <div className="flex-1 overflow-auto py-12 print:p-0">
        <div className="editor-pages mx-auto">
          <div className="page print:shadow-none print:border-none">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}