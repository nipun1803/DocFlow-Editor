import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export interface PageSize {
  name: string;
  width: number;
  height: number;
}

export const PAGE_SIZES: Record<string, PageSize> = {
  a4: {
    name: "A4",
    width: 794, // 210mm in pixels at 96 DPI
    height: 1123, // 297mm in pixels at 96 DPI
  },
  letter: {
    name:  "Letter",
    width: 816, // 8.5 inches
    height: 1056, // 11 inches
  },
  legal:  {
    name: "Legal",
    width: 816, // 8.5 inches
    height: 1344, // 14 inches
  },
};

export interface PaginationOptions {
  pageSize:  string;
  marginTop:  number;
  marginBottom: number;
  marginLeft:  number;
  marginRight: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pagination: {
      setPageSize: (pageSize: string) => ReturnType;
    };
  }
}

export const Pagination = Extension.create<PaginationOptions>({
  name: "pagination",

  addOptions() {
    return {
      pageSize: "a4",
      marginTop:  96, // 1 inch
      marginBottom: 96,
      marginLeft: 96,
      marginRight: 96,
    };
  },

  addCommands() {
    return {
      setPageSize:
        (pageSize: string) =>
        ({ commands }) => {
          // Update page size logic here if needed
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;

    return [
      new Plugin({
        key: new PluginKey("pagination"),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldState) {
            return oldState.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            const decorations:  Decoration[] = [];
            const { doc } = state;
            const pageSize = PAGE_SIZES[options.pageSize] || PAGE_SIZES.a4;
            
            // Calculate available content height (page height minus margins)
            const contentHeight =
              pageSize.height - options.marginTop - options.marginBottom;

            let currentHeight = 0;
            let pageNumber = 1;

            doc.descendants((node, pos) => {
              if (node.isBlock) {
                // Estimate node height (this is approximate)
                const nodeHeight = estimateNodeHeight(node);
                
                // Check if adding this node would exceed page height
                if (currentHeight + nodeHeight > contentHeight && currentHeight > 0) {
                  // Insert page break before this node
                  decorations. push(
                    Decoration. widget(pos, () => {
                      const pageBreak = document.createElement("div");
                      pageBreak.className = "page-break-container";
                      pageBreak.contentEditable = "false";
                      
                      // Footer with page number
                      const footer = document.createElement("div");
                      footer.className = "page-footer";
                      const pageNum = document.createElement("span");
                      pageNum.className = "page-number";
                      pageNum.textContent = `${pageNumber}`;
                      footer.appendChild(pageNum);
                      
                      // Gap between pages
                      const gap = document.createElement("div");
                      gap.className = "page-gap";
                      
                      // Header space for next page
                      const headerSpace = document.createElement("div");
                      headerSpace.className = "page-header-space";
                      
                      pageBreak.appendChild(footer);
                      pageBreak.appendChild(gap);
                      pageBreak.appendChild(headerSpace);
                      
                      return pageBreak;
                    }, { side: -1 })
                  );
                  
                  currentHeight = nodeHeight;
                  pageNumber++;
                } else {
                  currentHeight += nodeHeight;
                }
              }
              return true;
            });

            // Add final page number at the end
            decorations.push(
              Decoration.widget(doc.content.size, () => {
                const footer = document.createElement("div");
                footer.className = "page-footer-final";
                const pageNum = document.createElement("span");
                pageNum.className = "page-number";
                pageNum.textContent = `${pageNumber}`;
                footer.appendChild(pageNum);
                return footer;
              })
            );

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

// Helper function to estimate node height
function estimateNodeHeight(node: any): number {
  const baseLineHeight = 24; // Base line height in pixels
  
  if (node.type.name === "heading") {
    const level = node.attrs.level || 1;
    if (level === 1) return 48;
    if (level === 2) return 36;
    if (level === 3) return 30;
  }
  
  if (node.type.name === "paragraph") {
    // Estimate based on text length
    const textContent = node.textContent || "";
    const charsPerLine = 80; // Approximate characters per line
    const lines = Math.max(1, Math.ceil(textContent.length / charsPerLine));
    return lines * baseLineHeight;
  }
  
  if (node.type. name === "bulletList" || node.type.name === "orderedList") {
    return node.childCount * baseLineHeight * 1.2;
  }
  
  if (node.type.name === "table") {
    return node.childCount * 40; // Rough estimate for table rows
  }
  
  if (node.type.name === "blockquote") {
    return baseLineHeight * 2;
  }
  
  if (node.type.name === "codeBlock") {
    const lines = (node.textContent || "").split("\n").length;
    return lines * 20;
  }
  
  return baseLineHeight;
}