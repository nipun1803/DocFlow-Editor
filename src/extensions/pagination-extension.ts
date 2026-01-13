import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const Pagination = Extension.create({
    name: "pagination",

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey("pagination"),
                state: {
                    init() {
                        return DecorationSet.empty;
                    },
                    apply(tr, value) {
                        const action = tr.getMeta(this as any);
                        if (action && action.type === 'SET_DECORATIONS') {
                            return DecorationSet.create(tr.doc, action.decorations);
                        }
                        return value.map(tr.mapping, tr.doc);
                    },
                },
                view(editorView) {
                    const checkPagination = () => {
                        console.log("Pagination: Checking...");

                        // docView check removed to avoid blocking invocation
                        // if (!(editorView as any).docView) return; 

                        const decorations: Decoration[] = [];

                        const PAGE_HEIGHT_PX = 1123;
                        const PAGE_MARGIN_TOP = 96;
                        const PAGE_MARGIN_BOTTOM = 96;

                        const MAX_CONTENT_HEIGHT = PAGE_HEIGHT_PX - (PAGE_MARGIN_TOP + PAGE_MARGIN_BOTTOM);

                        const editorDom = editorView.dom;
                        const editorRect = editorDom.getBoundingClientRect();

                        let accumulatedHeight = 0;
                        let pageNumber = 1;

                        const firstPageIndicator = document.createElement('div');
                        firstPageIndicator.className = 'page-indicator page-indicator-first';

                        const firstPageBadge = document.createElement('span');
                        firstPageBadge.className = 'page-badge';
                        firstPageBadge.textContent = 'Page 1';
                        firstPageIndicator.appendChild(firstPageBadge);

                        // Always add Page 1 indicator
                        decorations.push(Decoration.widget(0, firstPageIndicator, { side: -1 }));
                        console.log("Pagination: Added Page 1 indicator widget to list. Total decorations:", decorations.length);

                        let nodeCount = 0;
                        editorView.state.doc.forEach((node, pos) => {
                            nodeCount++;
                            const domNode = editorView.nodeDOM(pos) as HTMLElement;

                            if (!domNode) {
                                // This happens for text nodes typically, but doc.forEach iterates blocks?
                                // Actually doc.forEach iterates direct children. If they are paragraphs, they have DOM.
                                // If they are not rendered yet, it might be null.
                                // console.log("Pagination: No DOM node for pos", pos);
                                return;
                            }
                            if (!(domNode instanceof HTMLElement)) return;

                            const rect = domNode.getBoundingClientRect();
                            const nodeVisualHeight = rect.height;

                            const style = window.getComputedStyle(domNode);
                            const marginTop = parseFloat(style.marginTop) || 0;
                            const marginBottom = parseFloat(style.marginBottom) || 0;

                            const totalNodeHeight = nodeVisualHeight + marginTop + marginBottom;

                            if (accumulatedHeight + totalNodeHeight > MAX_CONTENT_HEIGHT) {
                                console.log(`Pagination: Break needed at pos ${pos}. Acc: ${accumulatedHeight}, Node: ${totalNodeHeight}`);
                                const breakElement = document.createElement('div');
                                breakElement.className = 'page-break';

                                const pageBadge = document.createElement('span');
                                pageBadge.className = 'page-badge';
                                pageBadge.textContent = `Page ${pageNumber + 1}`;
                                breakElement.appendChild(pageBadge);

                                decorations.push(Decoration.widget(pos, breakElement, { side: -1 }));

                                accumulatedHeight = totalNodeHeight;
                                pageNumber++;
                            } else {
                                accumulatedHeight += totalNodeHeight;
                            }
                        });
                        console.log(`Pagination: Processed ${nodeCount} nodes. Total decorations: ${decorations.length}`);

                        const pluginKey = this.key;
                        if (!pluginKey) return;

                        // Force dispatch
                        if (editorView.isDestroyed) return;

                        console.log("Pagination: Dispatching transaction with decorations.");
                        const tr = editorView.state.tr.setMeta(pluginKey, { type: 'SET_DECORATIONS', decorations });
                        editorView.dispatch(tr);
                    };

                    // Direct call for debugging, no debounce
                    const debouncedCheck = checkPagination;

                    setTimeout(debouncedCheck, 100);

                    return {
                        update(view, prevState) {
                            if (!view.state.doc.eq(prevState.doc)) {
                                console.log("Pagination: Doc changed, running check.");
                                debouncedCheck();
                            }
                        },
                        destroy() { }
                    };
                },
                props: {
                    decorations(state) {
                        return (this as any).getState(state);
                    },
                },
            }),
        ];
    },
});

function debounce(func: any, wait: number) {
    let timeout: any;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
