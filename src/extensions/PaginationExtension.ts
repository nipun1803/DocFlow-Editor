import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, PluginView } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
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
  legal: {
    name: "Legal",
    width: 816,
    height: 1344,
  },
};

export interface PaginationOptions {
  pageSize: string;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pagination: {
      setPageSize: (pageSize: string) => ReturnType;
    };
  }
}

const paginationPluginKey = new PluginKey("pagination");

/**
 * Pagination Plugin View
 * Using a PluginView allows us to access the EditorView (DOM) to measure elements.
 */
class PaginationPluginView implements PluginView {
  private view: EditorView;
  private options: PaginationOptions;
  private checking: boolean = false;

  constructor(view: EditorView, options: PaginationOptions) {
    this.view = view;
    this.options = options;
    this.update(view, null);
  }

  update(view: EditorView, prevState: any) {
    this.view = view;

    // Avoid loops and excessive checks
    if (this.checking) return;

    // Defer measurement to let the DOM settle (especially for images)
    requestAnimationFrame(() => {
      this.checkPagination();
    });
  }

  destroy() {
    // Cleanup if needed
  }

  private checkPagination() {
    if (this.checking) return;
    this.checking = true;

    const { state } = this.view;
    const { doc } = state;

    const pageSize = PAGE_SIZES[this.options.pageSize] || PAGE_SIZES.a4;
    // Effective content height per page
    const contentHeight = pageSize.height - this.options.marginTop - this.options.marginBottom;

    let currentHeight = 0;
    let pageNumber = 1;
    const breaks: { pos: number; pageNumber: number }[] = [];

    // Iterate through top-level nodes
    doc.forEach((node, pos) => {
      const dom = this.view.nodeDOM(pos) as HTMLElement;

      if (!dom || !(dom instanceof HTMLElement)) {
        return;
      }

      // Skip page break decoration widgets from measurement
      if (dom.classList?.contains('page-break-widget') ||
        dom.classList?.contains('final-page-container')) {
        return;
      }

      // We measure the offsetHeight + margins
      const style = window.getComputedStyle(dom);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      const nodeHeight = dom.offsetHeight + marginTop + marginBottom;

      if (currentHeight + nodeHeight > contentHeight) {
        if (currentHeight > 0) {
          // Add a break before this node
          breaks.push({ pos, pageNumber });
          pageNumber++;
          currentHeight = nodeHeight;
        } else {
          // Node is taller than a single page
          currentHeight += nodeHeight;
        }
      } else {
        currentHeight += nodeHeight;
      }
    });

    // Calculate remaining height for the last page to ensure it looks like a full A4 sheet
    const remainingHeight = Math.max(0, contentHeight - currentHeight);

    // Determine total pages
    const totalPages = pageNumber;

    // Dispatch transaction if breaks changed
    const pluginState = paginationPluginKey.getState(state);

    // Check if breaks OR remainingHeight changed (to update spacer)
    const breaksMatch =
      pluginState &&
      pluginState.breaks.length === breaks.length &&
      pluginState.breaks.every((b: any, i: number) => b.pos === breaks[i].pos && b.pageNumber === breaks[i].pageNumber) &&
      pluginState.totalPages === totalPages &&
      Math.abs(pluginState.remainingHeight - remainingHeight) < 1; // Tolerance for float diffs

    if (!breaksMatch) {
      this.view.dispatch(
        this.view.state.tr.setMeta(paginationPluginKey, { breaks, totalPages, remainingHeight })
      );
    }

    this.checking = false;
  }
}

export const Pagination = Extension.create<PaginationOptions>({
  name: "pagination",

  addOptions() {
    return {
      pageSize: "a4",
      marginTop: 96,
      marginBottom: 96,
      marginLeft: 96,
      marginRight: 96,
    };
  },

  addProseMirrorPlugins() {
    const extensionThis = this;

    return [
      new Plugin({
        key: paginationPluginKey,
        state: {
          init() {
            return { breaks: [], totalPages: 1, remainingHeight: 0, decorations: DecorationSet.empty };
          },
          apply(tr, prevState) {
            const meta = tr.getMeta(paginationPluginKey);

            if (meta) {
              const { breaks, totalPages, remainingHeight } = meta;
              const decorations = createDecorations(breaks, totalPages, remainingHeight, tr.doc);
              return { breaks, totalPages, remainingHeight, decorations };
            }

            // Map existing decorations
            return {
              ...prevState,
              decorations: prevState.decorations.map(tr.mapping, tr.doc)
            };
          },
        },
        props: {
          decorations(state) {
            return this.getState(state).decorations;
          },
        },
        view(view) {
          return new PaginationPluginView(view, extensionThis.options);
        }
      }),
    ];
  },
});

// Helper function to create decorations
function createDecorations(breaks: { pos: number; pageNumber: number }[], totalPages: number, remainingHeight: number, doc: ProseMirrorNode): DecorationSet {
  const decorations: Decoration[] = [];

  breaks.forEach((b) => {
    decorations.push(
      Decoration.widget(b.pos, () => createPageBreakElement(b.pageNumber), {
        key: `page-break-${b.pageNumber}`,
        side: -1
      })
    );
  });

  // Final Footer
  decorations.push(
    Decoration.widget(doc.content.size, () => createFinalPageFooter(totalPages, remainingHeight), {
      key: `final-footer`,
      side: 1
    })
  );

  return DecorationSet.create(doc, decorations);
}

function createPageBreakElement(pageNumber: number): HTMLElement {
  const container = document.createElement("div");
  container.className = "page-break-widget";
  container.contentEditable = "false";

  // Footer (of the page ending)
  const footer = document.createElement("div");
  footer.className = "page-break-footer";
  const footerNum = document.createElement("span");
  footerNum.className = "page-number";
  footerNum.textContent = `${pageNumber}`;
  footer.appendChild(footerNum);

  // Gap
  const gap = document.createElement("div");
  gap.className = "page-break-gap";

  container.appendChild(footer);
  container.appendChild(gap);

  // Header (of the new page) - restores top margin
  const header = document.createElement("div");
  header.className = "page-break-header";
  container.appendChild(header);

  return container;
}

function createFinalPageFooter(pageNumber: number, remainingHeight: number): HTMLElement {
  const container = document.createElement("div");
  container.className = "final-page-container";
  container.contentEditable = "false";

  // Spacer to force A4 height
  if (remainingHeight > 0) {
    const spacer = document.createElement("div");
    spacer.className = "page-spacer";
    spacer.style.height = `${remainingHeight}px`;
    container.appendChild(spacer);
  }

  const footer = document.createElement("div");
  footer.className = "final-page-footer";

  const pageNum = document.createElement("span");
  pageNum.className = "page-number";
  pageNum.textContent = `${pageNumber}`;

  footer.appendChild(pageNum);
  container.appendChild(footer);

  return container;
}