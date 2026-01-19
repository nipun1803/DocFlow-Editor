import jsPDF from "jspdf";
import { saveAs } from "file-saver";

let html2canvas: any;
let docxLib: any;

// lazy loading html2canvas
async function getHtml2Canvas() {
  if (!html2canvas) {
    html2canvas = (await import("html2canvas")).default;
  }
  return html2canvas;
}

// lazy loading docx library
async function getDocx() {
  if (!docxLib) {
    docxLib = await import("docx");
  }
  return docxLib;
}

// exporting content to pdf
export async function exportToPDF(filename:  string = "document.pdf"): Promise<void> {
  const element = document.querySelector('.tiptap.ProseMirror') as HTMLElement;
  
  if (!element) {
    alert("Editor not found. Please try again.");
    return;
  }

  const originalCursor = document.body.style. cursor;
  document.body. style.cursor = "wait";

  try {
    const html2canvas = (await import("html2canvas")).default;

    // Store original styles
    const editorContainer = document.querySelector('.editor-container') as HTMLElement;
    const originalStyles = {
      transform:  editorContainer?. style.transform || '',
      maxHeight: element.style.maxHeight || '',
      minHeight: element.style.minHeight || '',
      height: element.style.height || '',
      width: element. style.width || '',
    };
    
    // Remove all constraints
    if (editorContainer) {
      editorContainer.style. transform = 'none';
    }
    element.style.maxHeight = 'none';
    element.style.minHeight = '0';
    element.style. height = 'auto';
    element.style.width = '794px'; // A4 width in pixels

    // Force reflow
    element.offsetHeight;
    
    // Wait for layout stabilization
    await new Promise(resolve => setTimeout(resolve, 100));

    // Capture full content
    const canvas = await html2canvas(element, {
      useCORS: true,
      logging:  false,
      background: "#ffffff",
      allowTaint:  true,
    });

    // Restore original styles
    if (editorContainer) {
      editorContainer.style.transform = originalStyles.transform;
    }
    element.style.maxHeight = originalStyles.maxHeight;
    element.style.minHeight = originalStyles.minHeight;
    element.style.height = originalStyles. height;
    element.style. width = originalStyles.width;

    // PDF configuration
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format:  "a4",
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 25.4; // 1 inch margins
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // Calculate image dimensions
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page with margins
    pdf.addImage(
      canvas.toDataURL("image/png", 1.0),
      "PNG",
      margin,
      margin + position,
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    );

    heightLeft -= contentHeight;

    // Add remaining pages
    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft);
      pdf.addPage();
      
      pdf.addImage(
        canvas.toDataURL("image/png", 1.0),
        "PNG",
        margin,
        margin + position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      
      heightLeft -= contentHeight;
    }

    pdf.save(filename);
    
  } catch (error) {
    console.error("PDF export failed:", error);
    alert("Failed to export PDF. Please try again.");
  } finally {
    document.body.style.cursor = originalCursor;
  }
}

// export content to docx file
export async function exportToDOCX(
  htmlContent: string,
  filename:  string = "document.docx"
): Promise<void> {
  try {
    console.log("=== DOCX Export Debug ===");
    console.log("Original HTML length:", htmlContent.length);
    console.log("Contains pagination:", htmlContent. includes('data-rm-pagination'));
    
    // ✅ Additional cleanup in case Toolbar missed something
    let cleanHTML = htmlContent
      .replace(/<div[^>]*data-rm-pagination[^>]*>[\s\S]*?(?=<h[123]|<p|<ul|<ol|<blockquote)/g, '')
      .replace(/<\/div>\s*<\/div>\s*<\/div>\s*$/g, '');
    
    console.log("Clean HTML length:", cleanHTML.length);
    console.log("First 300 chars:", cleanHTML.substring(0, 300));

    // loading the docx library actively
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await getDocx();

    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanHTML, "text/html");

    const paragraphs: any[] = [];

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          paragraphs. push(
            new Paragraph({
              children: [new TextRun(text)],
            })
          );
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;

        // ✅ Skip pagination wrapper elements
        if (element.classList.contains('rm-pages-wrapper') ||
            element.classList.contains('rm-page-break') ||
            element.classList.contains('page-break-widget') ||
            element.getAttribute('data-rm-pagination')) {
          return; // Skip this element completely
        }

        switch (element.tagName.toLowerCase()) {
          case "h1": 
            paragraphs.push(
              new Paragraph({
                text: element.textContent || "",
                heading: HeadingLevel. HEADING_1,
              })
            );
            break;

          case "h2":
            paragraphs.push(
              new Paragraph({
                text:  element.textContent || "",
                heading: HeadingLevel. HEADING_2,
              })
            );
            break;

          case "h3":
            paragraphs.push(
              new Paragraph({
                text: element.textContent || "",
                heading: HeadingLevel.HEADING_3,
              })
            );
            break;

          case "p":
            const runs:  any[] = [];
            element. childNodes.forEach((child) => {
              if (child.nodeType === Node.TEXT_NODE) {
                runs.push(new TextRun(child.textContent || ""));
              } else if (child.nodeName === "STRONG" || child.nodeName === "B") {
                runs. push(new TextRun({
                  text: child.textContent || "",
                  bold: true,
                }));
              } else if (child.nodeName === "EM" || child.nodeName === "I") {
                runs.push(new TextRun({
                  text: child. textContent || "",
                  italics: true,
                }));
              } else if (child. nodeName === "U") {
                runs.push(new TextRun({
                  text: child.textContent || "",
                  underline: {},
                }));
              } else {
                runs.push(new TextRun(child.textContent || ""));
              }
            });

            paragraphs.push(
              new Paragraph({
                children: runs.length > 0 ? runs : [new TextRun("")],
              })
            );
            break;

          case "ul": 
          case "ol":
            element.querySelectorAll("li").forEach((li) => {
              paragraphs.push(
                new Paragraph({
                  text: li.textContent || "",
                  bullet: { level:  0 },
                })
              );
            });
            break;

          default:
            element.childNodes.forEach(processNode);
        }
      }
    };

    doc.body. childNodes.forEach(processNode);

    // ✅ Add validation
    console.log("Total paragraphs created:", paragraphs.length);

    if (paragraphs.length === 0) {
      alert("No content could be extracted.  The document may be empty.");
      return;
    }

    const docxDoc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(docxDoc);

    // ✅ Add blob size check and success logging
    console.log("Blob size:", blob.size, "bytes");

    if (blob.size < 100) {
      alert("Generated file is too small. Export may have failed.");
      return;
    }

    saveAs(blob, filename);
    console.log("✅ DOCX export successful!");

  } catch (error) {
    console.error("DOCX export failed:", error);
    alert("Failed to export DOCX. Please try again.");
  }
}

export function printDocument(): void {
  window.print();
}