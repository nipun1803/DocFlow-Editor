import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Node as ProseMirrorNode } from "prosemirror-model";

export interface PageSize {
  name: string;
  width: number;
  height: number;
}

export const PAGE_SIZES: Record<string, PageSize> = {
  a4: {
    name: "A4",
    width: 794,
    height: 1123,
  },
  letter: {
    name: "Letter",
    width: 816,
    height: 1056,
  },
  legal:  {
    name: "Legal",
    width: 816,
    height: 1344,
  },
};

export interface PaginationOptions {
  pageSize: string;
  marginTop: number;
  marginBottom: number;
  marginLeft:  number;
  marginRight: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pagination: {
      setPageSize:  (pageSize: string) => ReturnType;
    };
  }
}

const paginationPluginKey = new PluginKey("pagination");

export const Pagination = Extension.create<PaginationOptions>({
  name:  "pagination",

  addOptions() {
    return {
      pageSize: "a4",
      marginTop:  96,
      marginBottom: 96,
      marginLeft: 96,
      marginRight: 96,
    };
  },

  addCommands() {
    return {
      setPageSize: 
        (pageSize: string) =>
        () => {
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extensionThis = this;

    return [
      new Plugin({
        key: paginationPluginKey,
        state: {
          init(_, state) {
            return calculateDecorations(state. doc, extensionThis.options);
          },
          apply(tr, oldState) {
            if (tr.docChanged) {
              return calculateDecorations(tr. doc, extensionThis.options);
            }
            return oldState. map(tr. mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return paginationPluginKey.getState(state);
          },
        },
      }),
    ];
  },
});

/**
 * Calculate decorations for page breaks
 */
function calculateDecorations(
  doc: ProseMirrorNode,
  options: PaginationOptions
): DecorationSet {
  const decorations:  Decoration[] = [];
  const pageSize = PAGE_SIZES[options.pageSize] || PAGE_SIZES.a4;
  const contentHeight = pageSize.height - options.marginTop - options.marginBottom;

  let currentHeight = 0;
  let currentPage = 1;
  const BASE_LINE_HEIGHT = 24;

  doc.descendants((node, pos) => {
    if (! node.isBlock) {
      return true;
    }

    const nodeHeight = estimateNodeHeight(node, BASE_LINE_HEIGHT);

    // Check if we need a page break
    if (currentHeight + nodeHeight > contentHeight && currentHeight > 50) {
      const pageForBreak = currentPage;

      decorations.push(
        Decoration.widget(
          pos,
          () => {
            return createPageBreakElement(pageForBreak);
          },
          {
            side: -1,
            key: `page-break-${pageForBreak}-${pos}`,
          }
        )
      );

      currentPage++;
      currentHeight = nodeHeight;
    } else {
      currentHeight += nodeHeight;
    }

    return true;
  });

  // Add final page footer
  const finalPage = currentPage;
  decorations.push(
    Decoration. widget(
      doc.content.size,
      () => {
        return createFinalPageFooter(finalPage);
      },
      { side: 1, key: `final-footer-${finalPage}` }
    )
  );

  console.log(`✅ Created ${decorations.length} decorations for ${finalPage} pages`);
  return DecorationSet.create(doc, decorations);
}

/**
 * Estimate node height
 */
function estimateNodeHeight(node: ProseMirrorNode, baseLineHeight: number): number {
  const nodeName = node.type.name;

  if (nodeName === "heading") {
    const level = node.attrs.level || 1;
    return level === 1 ? 92 : level === 2 ? 76 : 64;
  }

  if (nodeName === "paragraph") {
    const textLength = node.textContent. length;
    if (textLength === 0) return baseLineHeight + 12;
    const lines = Math.ceil(textLength / 80);
    return lines * baseLineHeight + 12;
  }

  if (nodeName === "bulletList" || nodeName === "orderedList") {
    let totalHeight = 18;
    node.forEach((listItem) => {
      const textLength = listItem.textContent. length;
      const lines = Math.max(1, Math.ceil(textLength / 80));
      totalHeight += lines * baseLineHeight + 6;
    });
    return totalHeight;
  }

  if (nodeName === "listItem") {
    const textLength = node.textContent.length;
    const lines = Math.max(1, Math.ceil(textLength / 80));
    return lines * baseLineHeight + 6;
  }

  if (nodeName === "table") {
    return node.childCount * 44 + 48;
  }

  if (nodeName === "blockquote") {
    const textLength = node.textContent. length;
    const lines = Math.ceil(textLength / 70);
    return lines * baseLineHeight + 32;
  }

  if (nodeName === "codeBlock") {
    return node.textContent.split("\n").length * 20 + 32;
  }

  if (nodeName === "horizontalRule") {
    return 64;
  }

  return baseLineHeight;
}

/**
 * Create page break element - THIS IS THE KEY PART
 */
function createPageBreakElement(pageNumber: number): HTMLElement {
  const container = document.createElement("div");
  container.className = "page-break-widget";
  container. contentEditable = "false";

  // Footer
  const footer = document.createElement("div");
  footer.className = "page-break-footer";
  const footerNum = document.createElement("span");
  footerNum.className = "page-number";
  footerNum.textContent = `${pageNumber}`;
  footer.appendChild(footerNum);

  // Gap
  const gap = document.createElement("div");
  gap.className = "page-break-gap";
  const gapContent = document.createElement("div");
  gapContent.className = "page-break-gap-content";
  const label = document.createElement("span");
  label.className = "page-break-label";
  label.textContent = `Page ${pageNumber} ends • Page ${pageNumber + 1} begins`;
  gapContent.appendChild(label);
  gap.appendChild(gapContent);

  // Double-click handler
  gap.addEventListener("dblclick", (e) => {
    e.preventDefault();
    gap.classList.toggle("collapsed");
  });

  // Header
  const header = document.createElement("div");
  header.className = "page-break-header";
  const headerNum = document.createElement("span");
  headerNum.className = "page-number";
  headerNum. textContent = `${pageNumber + 1}`;
  header.appendChild(headerNum);

  container.appendChild(footer);
  container.appendChild(gap);
  container.appendChild(header);

  return container;
}

/**
 * Create final page footer
 */
function createFinalPageFooter(pageNumber: number): HTMLElement {
  const footer = document.createElement("div");
  footer.className = "final-page-footer";
  footer.contentEditable = "false";

  const pageNum = document.createElement("span");
  pageNum.className = "page-number";
  pageNum. textContent = `${pageNumber}`;

  footer.appendChild(pageNum);
  return footer;
}