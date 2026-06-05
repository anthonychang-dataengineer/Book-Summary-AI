import { getResolvedPDFJS } from "unpdf";
import { readFile } from "fs/promises";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv"

dotenv.config({ path: ".env" })

const pdfInput = await readFile(String.raw`C:\Users\17322\Desktop\Book Summary AI\The Like Switch.pdf`);

const { getDocument } = await getResolvedPDFJS() //use the full set of pdf.js tools
const myPdf = await getDocument(new Uint8Array(pdfInput)).promise; //reach into the pdf promise, instead of just the pdf

console.log("Total pages:", myPdf.numPages);

const outline = await myPdf.getOutline();
'console.log("Outline:", JSON.stringify(outline, null, 2));'
//--build the JSON of chapters, by title and startpage--
const chapters = [];
for (const entry of outline) { //start the loop
    const ref = entry.dest[0];  //each entry is the first "item".And under that item, the hierarchy underneath is "dest", and then you take the first item under that
    const pageIndex = await myPdf.getPageIndex(ref); //translate to a real page number, aka index
    chapters.push({ title: entry.title, startPage: pageIndex + 1 });
}

//--pull the text of every page into an array--
const pageTexts = [];
for (let p = 1; p <= myPdf.numPages; p++) {
    const page = await myPdf.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    pageTexts.push(pageText);
}
//--create a grouping of chapters by page #--
const chapterChunks = [];
for (let i = 0; i < chapters.length; i++) {
    const start =  chapters[i].startPage;
    const end = (i + 1 < chapters.length) ? chapters[i + 1].startPage: myPdf.numPages + 1;
    const text = pageTexts.slice(start - 1, end -1).join(" ");
    chapterChunks.push({ title: chapters[i].title, wordCount: text.split(/\s+/).length, text });

}

//check the result
//for (const ch of chapterChunks) {
//const ch = chapterChunks[0]
//    console.log(`${ch.title} - ${ch.wordCount} words: text is ${ch.text}`);
//}

//summarize ONE chapter
const anthropic = new Anthropic(); //reads ANTHROPIC_API_KEY

const chapter =  chapterChunks[1];

const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [
        {
            role: "user",
            content: `Summarize this book chapter in 4-6 sentences. Capture the main theme, key concepts, and the main points of advice. Give bullet points when appropriate. Plain prose, no preamble. \n\n=== ${chapter.title} ===\n${chapter.text}`,
        },
    ],
});

console.log("CHAPTER:, chapter.title");
console.log("\nSUMMARY:\n", message.content[0].text);

