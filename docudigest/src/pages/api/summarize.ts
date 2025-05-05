import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
// @ts-ignore
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false,
  },
};

const COHERE_API_KEY = process.env.COHERE_API_KEY;

async function parseFile(file: formidable.File): Promise<string> {
  const ext = file.originalFilename?.split('.').pop()?.toLowerCase();
  if (!fs.existsSync(file.filepath)) {
    throw new Error(`Uploaded file not found on server: ${file.filepath}`);
  }
  if (ext === 'pdf') {
    try {
      const data = fs.readFileSync(file.filepath);
      const pdf = await pdfParse(data);
      return pdf.text;
    } catch (err) {
      console.error('Error parsing PDF:', err);
      throw new Error('Failed to parse PDF file.');
    }
  } else if (ext === 'docx') {
    try {
      const data = fs.readFileSync(file.filepath);
      const result = await mammoth.extractRawText({ buffer: data });
      return result.value;
    } catch (err) {
      console.error('Error parsing DOCX:', err);
      throw new Error('Failed to parse DOCX file.');
    }
  } else if (ext === 'txt') {
    try {
      return fs.readFileSync(file.filepath, 'utf8');
    } catch (err) {
      console.error('Error reading TXT:', err);
      throw new Error('Failed to read TXT file.');
    }
  } else {
    throw new Error('Unsupported file type');
  }
}

async function getSummary(text: string): Promise<string> {
  if (!COHERE_API_KEY) {
    throw new Error('Cohere API key is not set in environment variables.');
  }
  const response = await fetch('https://api.cohere.ai/v1/summarize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${COHERE_API_KEY}`,
      'Content-Type': 'application/json',
      'Cohere-Version': '2022-12-06',
    },
    body: JSON.stringify({
      text,
      length: 'medium',
      format: 'paragraph',
      model: 'command',
      extractiveness: 'auto',
    }),
  });
  if (!response.ok) {
    throw new Error('Cohere API error');
  }
  const data = await response.json();
  return data.summary || 'No summary returned.';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const form = formidable({ multiples: false, keepExtensions: true });
    form.parse(req, async (err: Error | null, fields: any, files: any) => {
      if (err) {
        console.error('Formidable error:', err);
        return res.status(500).json({ error: 'File upload error' });
      }
      let file: formidable.File | undefined;
      const uploaded = files.files;
      if (Array.isArray(uploaded)) {
        file = uploaded[0];
      } else if (uploaded && typeof uploaded === 'object' && 'filepath' in uploaded) {
        file = uploaded as formidable.File;
      }
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }
      try {
        const text = await parseFile(file);
        if (!text || text.trim().length === 0) {
          return res.status(400).json({ error: 'No text extracted from file.' });
        }
        const summary = await getSummary(text.slice(0, 4000));
        return res.status(200).json({ summary });
      } catch (err: any) {
        console.error('Processing error:', err);
        return res.status(500).json({ error: err.message || 'Server error' });
      }
    });
  } catch (err: any) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
} 