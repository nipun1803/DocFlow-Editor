import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

/**
 * A4 Page Configuration
 * A4: 210mm x 297mm at 96 DPI = 794px x 1123px
 * Standard margins: 1 inch (96px) on all sides
 * Content area: 602px width x 931px height
 */
const PAGE_CONFIG = {
    // Full page dimensions
    pageHeightPx: 1123,
    pageWidthPx: 794,
    // Margins (1 inch = 96px at 96 DPI)
    marginPx: 96,
    // Visual gap between pages in editor
    pageGapPx: 24,
};

// Content height available per page (page height minus top and bottom margins)
const CONTENT_HEIGHT_PER_PAGE = PAGE_CONFIG.pageHeightPx - (PAGE_CONFIG.marginPx * 2);

// Create a debounce function
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return ((...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => fn(...args), delay);
    }) as T;
}

const paginationPluginKey = new PluginKey("pagination");

export const Pagination = Extension.create({
    name: "pagination",

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: paginationPluginKey,

                state: {
                    init() {
                        return DecorationSet.empty;
                    },
                    apply(tr, oldSet) {
                        const meta = tr.getMeta(paginationPluginKey);
                        if (meta && meta.decorations) {
                            return meta.decorations;
                        }
                        return oldSet.map(tr.mapping, tr.doc);
                    },
                },

                props: {
                    decorations(state) {
                        return paginationPluginKey.getState(state);
                    },
                },

                view(editorView) {
                    let isProcessing = false;
                    let pendingUpdate = false;

                    const updatePagination = () => {
                        if (isProcessing) {
                            pendingUpdate = true;
                            return;
                        }

                        if (editorView.isDestroyed) return;

                        isProcessing = true;

                        // Use requestAnimationFrame to ensure DOM is ready
                        requestAnimationFrame(() => {
                            if (editorView.isDestroyed) {
                                isProcessing = false;
                                return;
                            }

                            try {
                                const decorations = calculatePageBreaks(editorView);
                                const decorationSet = DecorationSet.create(editorView.state.doc, decorations);

                                // Ensure the container has enough height to show full pages for the last page
                                const pageContainer = editorView.dom.closest('.page') as HTMLElement;
                                if (pageContainer) {
                                    const breakCount = decorations.filter(d => d.spec.key && d.spec.key.toString().startsWith('page-break')).length;
                                    const pageCount = breakCount + 1;
                                    // 1123px per page + 24px gap. 
                                    // Note: we use 1147 to match the repeating gradient (1123 white + 24 transparent gap)
                                    // If we are on page 2, we want at least 1147 + 1123 height ?
                                    // 1 Page: 1123.
                                    // 2 Pages: 1123 + 24 + 1123.
                                    const minHeight = pageCount * 1123 + (pageCount - 1) * 24;
                                    pageContainer.style.minHeight = `${minHeight}px`;
                                }

                                const tr = editorView.state.tr.setMeta(paginationPluginKey, {
                                    decorations: decorationSet,
                                });
                                tr.setMeta("addToHistory", false);
                                editorView.dispatch(tr);
                            } catch (e) {
                                console.error("Pagination error:", e);
                            } finally {
                                isProcessing = false;

                                if (pendingUpdate) {
                                    pendingUpdate = false;
                                    updatePagination();
                                }
                            }
                        });
                    };

                    const debouncedUpdate = debounce(updatePagination, 100);

                    // Initial update
                    setTimeout(updatePagination, 150);

                    return {
                        update(view, prevState) {
                            if (!view.state.doc.eq(prevState.doc)) {
                                debouncedUpdate();
                            }
                        },
                        destroy() {
                            // Cleanup
                        },
                    };
                },
            }),
        ];
    },
});

/**
 * Calculate page breaks based on content height
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculatePageBreaks(editorView: any): Decoration[] {
    const decorations: Decoration[] = [];
    const editorDom = editorView.dom as HTMLElement;

    if (!editorDom) return decorations;

    const editorRect = editorDom.getBoundingClientRect();
    const editorTop = editorRect.top;

    // Track accumulated content height
    let accumulatedHeight = 0;
    let currentPage = 1;

    // Add Page 1 indicator at the very start
    decorations.push(
        Decoration.widget(0, createPageIndicator(1, true), {
            side: -1,
            key: "page-1-indicator",
        })
    );

    // Iterate through top-level nodes
    editorView.state.doc.forEach((node: unknown, pos: number) => {
        const domNode = editorView.nodeDOM(pos) as HTMLElement | null;
        if (!domNode) return;

        const nodeRect = domNode.getBoundingClientRect();
        const nodeHeight = nodeRect.height;

        // Get computed margins
        const computedStyle = window.getComputedStyle(domNode);
        const marginTop = parseFloat(computedStyle.marginTop) || 0;
        const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
        const totalNodeHeight = nodeHeight + marginTop + marginBottom;

        // Check if adding this node would exceed current page
        if (accumulatedHeight > 0 && accumulatedHeight + totalNodeHeight > CONTENT_HEIGHT_PER_PAGE) {
            // Insert page break before this node
            currentPage++;

            decorations.push(
                Decoration.widget(pos, createPageBreak(currentPage), {
                    side: -1,
                    key: `page-break-${currentPage}`,
                })
            );

            // Reset accumulated height for new page
            accumulatedHeight = totalNodeHeight;
        } else {
            accumulatedHeight += totalNodeHeight;
        }
    });

    return decorations;
}

/**
 * Create a page indicator element (for Page 1)
 */
function createPageIndicator(pageNum: number, isFirst: boolean): HTMLElement {
    const indicator = document.createElement("div");
    indicator.className = `page-indicator ${isFirst ? "page-indicator-first" : ""}`;
    indicator.contentEditable = "false";

    const badge = document.createElement("span");
    badge.className = "page-badge";
    badge.textContent = `Page ${pageNum}`;
    indicator.appendChild(badge);

    return indicator;
}

/**
 * Create a page break element with visual separation
 */
function createPageBreak(pageNum: number): HTMLElement {
    const breakContainer = document.createElement("div");
    breakContainer.className = "page-break";
    breakContainer.contentEditable = "false";

    // Create the page badge
    const badge = document.createElement("span");
    badge.className = "page-badge";
    badge.textContent = `Page ${pageNum}`;
    breakContainer.appendChild(badge);

    return breakContainer;
}
