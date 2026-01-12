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
                        if (!(editorView as any).docView) return;

                        const decorations: Decoration[] = [];
                        const PAGE_HEIGHT_PX = 1056; // 11in x 96dpi
                        const PAGE_MARGIN_BOTTOM = 40;
                        const PAGE_MARGIN_TOP = 40;
                        const TOTAL_PAGE_CONTENT_HEIGHT = PAGE_HEIGHT_PX - PAGE_MARGIN_TOP - PAGE_MARGIN_BOTTOM;

                        const editorDom = editorView.dom;
                        const editorRect = editorDom.getBoundingClientRect();
                        const docTop = editorRect.top;

                        let pageNumber = 1;

                        editorView.state.doc.forEach((node, pos) => {
                            const domNode = editorView.nodeDOM(pos) as HTMLElement;
                            if (!domNode || !(domNode instanceof HTMLElement)) return;

                            const rect = domNode.getBoundingClientRect();
                            const nodeHeight = rect.height;
                            const relativeTop = rect.top - docTop;
                            const relativeBottom = relativeTop + nodeHeight;

                            const boundary = pageNumber * PAGE_HEIGHT_PX - PAGE_MARGIN_BOTTOM;

                            if (relativeBottom > boundary) {
                                if (nodeHeight < TOTAL_PAGE_CONTENT_HEIGHT) {
                                    const breakElement = document.createElement('div');
                                    breakElement.className = 'page-break';
                                    breakElement.setAttribute('data-page-number', (pageNumber + 1).toString());

                                    decorations.push(Decoration.widget(pos, breakElement, { side: -1 }));

                                    pageNumber++;
                                } else {
                                    const pagesSpanned = Math.ceil(nodeHeight / PAGE_HEIGHT_PX);
                                    pageNumber += pagesSpanned;
                                }
                            }
                        });

                        const pluginKey = this.key;
                        if (!pluginKey) return;

                        const pluginState = pluginKey.getState(editorView.state);
                        // Rudimentary optimization
                        if (pluginState && pluginState.find().length === decorations.length) {
                            // pass
                        }

                        requestAnimationFrame(() => {
                            if (editorView.isDestroyed) return;
                            const action = { type: 'SET_DECORATIONS', decorations };
                            editorView.dispatch(editorView.state.tr.setMeta(pluginKey, action));
                        });
                    };

                    const debouncedCheck = debounce(checkPagination, 50);

                    requestAnimationFrame(debouncedCheck);

                    return {
                        update(view, prevState) {
                            if (!view.state.doc.eq(prevState.doc)) {
                                debouncedCheck();
                            }
                        },
                        destroy() { }
                    };
                }
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
