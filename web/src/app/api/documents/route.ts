import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Document from '@/models/Document';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const documents = await Document.find({ ownerId: session.user.id })
      .sort({ uploaded: -1 })
      .limit(50);

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, size, key, fileType, access = 'Secure', businessId } = body;

    if (!name || !size || !key || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const document = new Document({
      name,
      size,
      key,
      fileType,
      access,
      businessId,
      ownerId: session.user.id,
      uploaded: new Date().toISOString(),
    });

    await document.save();

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error saving document:', error);
    return NextResponse.json(
      { error: 'Failed to save document' },
      { status: 500 }
    );
  }
}