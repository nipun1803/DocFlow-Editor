import jsPDF from "jspdf";
import { saveAs } from "file-saver";


let html2canvas:  any;
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

//  exporting content to pdf
export async function exportToPDF(filename: string = "document. pdf"): Promise<void> {
  const element = document.querySelector('. tiptap. ProseMirror') as HTMLElement;
  
  if (!element) {
    alert("Editor not found. Please try again.");
    return;
  }

  const originalCursor = document.body.style.cursor;
  document.body.style.cursor = "wait";

  try {
    // loading html2canvas actively
    const html2canvasFunc = await getHtml2Canvas();

    const editorContainer = document.querySelector('.editor-container') as HTMLElement;
    const originalTransform = editorContainer?. style.transform || '';
    if (editorContainer) {
      editorContainer.style.transform = 'none';
    }

    // Use 'as any' to bypass type checking for html2canvas options
    const canvas = await html2canvasFunc(element, {
      scale: 2,
      useCORS:  true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      width: 794,
    } as any);

    if (editorContainer) {
      editorContainer.style.transform = originalTransform;
    }

    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = A4_WIDTH_MM;
    const imgHeight = (canvas.height * A4_WIDTH_MM) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf. addImage(
      canvas.toDataURL("image/png", 1.0),
      "PNG",
      0,
      position,
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    );

    heightLeft -= A4_HEIGHT_MM;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      
      pdf.addImage(
        canvas.toDataURL("image/png", 1.0),
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      
      heightLeft -= A4_HEIGHT_MM;
    }

    pdf.save(filename);
    
  } catch (error) {
    console.error("PDF export failed:", error);
    alert("Failed to export PDF. Please try again.");
  } finally {
    document.body. style.cursor = originalCursor;
  }
}

// export content to docx file
export async function exportToDOCX(
  htmlContent: string,
  filename:  string = "document.docx"
): Promise<void> {
  try {
    // loading the docx library actively
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await getDocx();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    
    const paragraphs:  any[] = [];
    
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?. trim();
        if (text) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun(text)],
            })
          );
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
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
                text: element.textContent || "",
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
            const runs: any[] = [];
            element.childNodes.forEach((child) => {
              if (child.nodeType === Node.TEXT_NODE) {
                runs.push(new TextRun(child.textContent || ""));
              } else if (child.nodeName === "STRONG" || child.nodeName === "B") {
                runs.push(new TextRun({
                  text: child.textContent || "",
                  bold:  true,
                }));
              } else if (child.nodeName === "EM" || child. nodeName === "I") {
                runs.push(new TextRun({
                  text: child.textContent || "",
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
                children: runs. length > 0 ? runs : [new TextRun("")],
              })
            );
            break;
            
          case "ul":
          case "ol":
            element. querySelectorAll("li").forEach((li) => {
              paragraphs.push(
                new Paragraph({
                  text:  li.textContent || "",
                  bullet: { level: 0 },
                })
              );
            });
            break;
            
          default:
            element.childNodes.forEach(processNode);
        }
      }
    };
    
    doc.body.childNodes.forEach(processNode);
    
    const docxDoc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin:  {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children:  paragraphs,
        },
      ],
    });
    
    const blob = await Packer.toBlob(docxDoc);
    saveAs(blob, filename);
    
  } catch (error) {
    console.error("DOCX export failed:", error);
    alert("Failed to export DOCX. Please try again.");
  }
}


export function printDocument(): void {
  window.print();
}