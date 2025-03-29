import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

// Replace with your AssemblyAI API key
const apiKey = '36efe71d7b244a37a28605dd67763070';

export async function POST(req) {
  try {
    const { audioUrl } = await req.json(); // Parse the request body

    if (!audioUrl) {
      return NextResponse.json({ error: 'Audio URL is required' }, { status: 400 });
    }

    const client = new AssemblyAI({ apiKey });
    const config = { audio_url: audioUrl };

    const transcript = await client.transcripts.transcribe(config);
    return NextResponse.json({ text: transcript.text }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
