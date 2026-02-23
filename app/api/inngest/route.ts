import { NextResponse } from 'next/server';

// Inngest webhook handler - returns 404 for now as Inngest is not configured
export async function PUT() {
  return NextResponse.json({ error: 'Inngest not configured' }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: 'Inngest not configured' }, { status: 404 });
}

export async function GET() {
  return NextResponse.json({ error: 'Inngest not configured' }, { status: 404 });
}
