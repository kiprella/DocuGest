# DocuGest
# DocuDigest

DocuDigest - one page website for document summarization and 100% free. Upload your PDF, DOCX, or TXT files and receive  high-quality AI-generated summaries in couple seconds!

## Features
- **File Upload & Preview:** Drag-and-drop or browse to upload PDF, DOCX, or TXT files. Clean, modern UI with clear 
- **AI Summarization:** Uses Cohere's advanced AI to generate concise, readable summaries of your documents.

## Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes (Pages Router), Node.js
- **AI:** Cohere API for summarization
- **File Parsing:** pdf-parse, mammoth, and Node.js fs for PDF, DOCX, and TXT support

## Getting Started
1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Add your Cohere API key to `.env.local`:
   ```env
   COHERE_API_KEY=your-cohere-api-key
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to use the app.

