import { NextRequest, NextResponse } from 'next/server';
import { getFileStream } from '@/lib/google-drive';
import { withAuth } from '@/lib/auth';

/**
 * Secure file download proxy
 * 
 * Instead of exposing Google Drive access_token in URLs
 * (which appears in logs, browser history, and referer headers),
 * this endpoint proxies the download with server-side auth.
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const expires = searchParams.get('expires');

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      );
    }

    // Check if URL expired (optional safety check)
    if (expires) {
      const expiryDate = new Date(expires);
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { error: 'Download link expired' },
          { status: 410 }
        );
      }
    }

    // Fetch file stream from Google Drive (server-side auth, no token exposure)
    const { stream, filename, mimeType } = await getFileStream(fileId);

    // Return streaming response
    return new NextResponse(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
});
