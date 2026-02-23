import { NextResponse } from 'next/server';

export async function PUT() {
  return NextResponse.json({ error: 'Inngest not configured' }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: 'Inngest not configured' }, { status: 404 });
}

export async function GET() {
  return NextResponse.json({ error: 'Inngest not configured' }, { status: 404 });
}
