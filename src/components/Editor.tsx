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
  <p>Welcome to the document editor with real-time pagination.  This editor simulates a professional document environment with A4 page sizing and 1-inch margins. </p>
  
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

  <h2>More Content for Testing</h2>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  
  <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. </p>
  
  <h3>Additional Paragraphs</h3>
  <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>

  <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>

  <h2>Testing Page Breaks</h2>
  <p>Keep typing to see how the pagination system works in real-time. As you add more content, the editor will automatically calculate where page breaks should occur based on the actual content height.</p>

  <ol>
    <li>First item in an ordered list with some additional text to increase height</li>
    <li>Second item with more details about features and functionality</li>
    <li>Third item to add vertical space and test list pagination</li>
    <li>Fourth item for comprehensive testing of the editor</li>
    <li>Fifth item to ensure we have sufficient content for page breaks</li>
  </ol>

  <p>This paragraph comes after the list and should help demonstrate how content flows naturally across page boundaries when the total height exceeds the available space on a single page.</p>

  <h3>Tables Example</h3>
  <table>
    <tr>
      <th>Feature</th>
      <th>Status</th>
      <th>Notes</th>
    </tr>
    <tr>
      <td>Pagination</td>
      <td>✓ Complete</td>
      <td>Real-time page breaks</td>
    </tr>
    <tr>
      <td>Formatting</td>
      <td>✓ Complete</td>
      <td>Bold, italic, underline</td>
    </tr>
    <tr>
      <td>Print Support</td>
      <td>✓ Complete</td>
      <td>Matches screen view</td>
    </tr>
  </table>

  <p>Continue adding content to see pagination in action.  The system calculates the height of each element and inserts visual page breaks when appropriate.</p>
`;

export default function DocumentEditor() {
  const [zoom, setZoom] = useState(100);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
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
      Pagination.configure({
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
      Table. configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    immediatelyRender: false,
    content: DEFAULT_CONTENT,
    editorProps: {
      attributes:  {
        class: "focus:outline-none prose prose-sm max-w-none",
      },
    },
    onUpdate:  ({ editor }) => {
      localStorage.setItem("doc-editor-content", editor.getHTML());
    },
    onCreate: ({ editor }) => {
      console.log("✅ Editor created");
      console.log("📦 Extensions loaded:", editor.extensionManager.extensions.map(e => e.name));
      
      const hasPagination = editor.extensionManager.extensions.some(e => e.name === 'pagination');
      console.log("📄 Pagination loaded:", hasPagination);
      
      const savedContent = localStorage.getItem("doc-editor-content");
      if (savedContent) {
        console.log("💾 Loading saved content");
        editor.commands.setContent(savedContent);
      }
    },
  });

  const zoomScale = zoom / 100;

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-zinc-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      <Toolbar editor={editor} zoom={zoom} onZoomChange={setZoom} />
      
      <div className="flex-1 overflow-auto print:overflow-visible">
        <div
          className="editor-pages"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "top center",
            transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="page">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Debug panel */}
      <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg text-xs font-mono space-y-2 print:hidden">
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-500">Zoom: </span>
          <span className="font-semibold text-zinc-900">{zoom}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-500">Pagination:</span>
          <span className="font-semibold">
            {editor.extensionManager.extensions.some(e => e.name === 'pagination') ? '✅' : '❌'}
          </span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('doc-editor-content');
            window.location.reload();
          }}
          className="w-full mt-2 px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs font-semibold"
        >
          Clear & Reload
        </button>
      </div>
    </div>
  );
}