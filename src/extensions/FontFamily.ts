import { Extension } from "@tiptap/core";

export const FONT_FAMILIES = [
    { label: "Inter", value: "Inter" },
    { label: "Roboto", value: "Roboto" },
    { label: "Open Sans", value: "Open Sans" },
    { label: "Lato", value: "Lato" },
    { label: "Montserrat", value: "Montserrat" },
    { label: "Poppins", value: "Poppins" },
    { label: "Arial", value: "Arial" },
    { label: "Helvetica", value: "Helvetica" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Courier New", value: "Courier New" },
    { label: "Georgia", value: "Georgia" },
    { label: "Verdana", value: "Verdana" },
    { label: "Comic Sans MS", value: "Comic Sans MS" },
];

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        fontFamily: {
            /**
             * Set the font family
             */
            setFontFamily: (fontFamily: string) => ReturnType;
            /**
             * Unset the font family
             */
            unsetFontFamily: () => ReturnType;
        };
    }
}

export const FontFamily = Extension.create({
    name: "fontFamily",

    addOptions() {
        return {
            types: ["textStyle"],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontFamily: {
                        default: null,
                        parseHTML: (element) =>
                            element.style.fontFamily?.replace(/['"]+/g, ""),
                        renderHTML: (attributes) => {
                            if (!attributes.fontFamily) {
                                return {};
                            }
                            return {
                                style: `font-family: ${attributes.fontFamily}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontFamily:
                (fontFamily: string) =>
                    ({ chain }) => {
                        return chain().setMark("textStyle", { fontFamily }).run();
                    },
            unsetFontFamily:
                () =>
                    ({ chain }) => {
                        return chain()
                            .setMark("textStyle", { fontFamily: null })
                            .removeEmptyTextStyle()
                            .run();
                    },
        };
    },
});