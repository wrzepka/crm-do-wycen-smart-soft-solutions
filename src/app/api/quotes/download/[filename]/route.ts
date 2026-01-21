import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { auth } from '@/lib/auth'; // Twoja konfiguracja auth
import { constants } from 'fs';
import { access } from 'fs/promises';

const getQuotesDir = () => path.join(process.cwd(), 'storage', 'quotes');

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  const session = await auth();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // TODO: Check roles

  // protect against path traversal
  const safeFilename = path.basename(params.filename);
  const filePath = path.join(getQuotesDir(), safeFilename);

  try {
    // check if file exists
    await access(filePath, constants.F_OK);

    const fileBuffer = await readFile(filePath);

    // send data to the browser
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        // 'inline' = open in the browser
        // 'attachment' = force downloading
        'Content-Disposition': `inline; filename="${safeFilename}"`,
        // delete old data
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('Nie odnaleziono pliku.', { status: 404 });
  }
}
