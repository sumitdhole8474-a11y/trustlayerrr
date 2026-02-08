import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import crypto from 'crypto';

const API_KEY_PREFIX = 'sk_';
const API_KEY_LENGTH = 32;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, you'd fetch from database
    // Mock data for now
    const mockKeys = [
      {
        _id: '1',
        name: 'Production Key',
        key: `${API_KEY_PREFIX}prod_${crypto.randomBytes(API_KEY_LENGTH).toString('hex')}`,
        created: new Date().toISOString(),
        status: 'Active',
        userId: session.user.id,
      }
    ];

    return NextResponse.json(mockKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    // Generate API key
    const apiKey = {
      _id: crypto.randomBytes(16).toString('hex'),
      name,
      key: `${API_KEY_PREFIX}live_${crypto.randomBytes(API_KEY_LENGTH).toString('hex')}`,
      created: new Date().toISOString(),
      status: 'Active',
      userId: session.user.id,
    };

    // In production, save to database here

    return NextResponse.json(apiKey, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      );
    }

    // In production, delete from database here
    // For now, return success

    return NextResponse.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}