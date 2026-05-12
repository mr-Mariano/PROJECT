import OpenAI from "openai"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"

async function extract_pdf_text(buffer) {
    const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
        disableFontFace: true
    })
    const pdf = await loadingTask.promise
    let text = ""
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map(item => item.str).join(" ") + "\n"
    }
    return text.trim()
}

export const parse_document = async (req, res) => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
    }

    const { mimetype, buffer, originalname } = req.file

    try {
        let text = ""

        if (mimetype === "application/pdf") {
            text = await extract_pdf_text(buffer)
        } else {
            return res.status(400).json({ message: "Only PDF files are supported for extraction" })
        }

        if (!text || text.trim().length < 20) {
            return res.status(422).json({ message: "Could not extract readable text from this PDF" })
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Current date: ${new Date().toUTCString()}\nYou are a financial document parser. Extract all transactions from the provided bank statement or financial document text.
Return ONLY a valid JSON object in this exact format, with no extra text:
{
  "transactions": [
    { "title": "description of transaction", "amount": -12.50, "date": "2026-03-15" }
  ]
}
Rules:
- "amount" must be a number. Use negative values for debits/expenses, positive for credits/income.
- "date" must be in YYYY-MM-DD format. If the year is missing, infer it from context.
- "title" should be the merchant/description, cleaned up and concise (max 60 chars).
- If no transactions are found, return { "transactions": [] }.
- Do NOT include metadata, summaries, or opening/closing balances as transactions.`
                },
                {
                    role: "user",
                    content: `Extract all transactions from this document:\n\n${text.slice(0, 12000)}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0
        })

        const content = completion.choices[0].message.content
        const parsed_result = JSON.parse(content)

        if(!parsed_result.transactions.length) parsed_result.transactions=[]

        for(let transaction of parsed_result.transactions) {
            transaction.epoch = new Date(transaction.date).getTime()
        }

        return res.status(200).json({
            filename: originalname,
            transactions: parsed_result.transactions
        })

    } catch (err) {
        console.error("Document parse error:", err)
        return res.status(500).json({ message: "Failed to process document" })
    }
}
