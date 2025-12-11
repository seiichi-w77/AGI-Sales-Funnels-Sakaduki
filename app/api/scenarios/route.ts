import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

// Mock storage (in production, use database)
const scenariosStore = new Map<string, unknown>();

// GET /api/scenarios - List all scenarios
export async function GET(request: Request) {
  try {
    const _session = await auth();
    const { searchParams } = new URL(request.url);
    const _groupId = searchParams.get('groupId');
    const _status = searchParams.get('status');

    const scenarios = Array.from(scenariosStore.values());

    return NextResponse.json({
      scenarios,
      total: scenarios.length,
    });
  } catch (error) {
    console.error('Failed to fetch scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}

// POST /api/scenarios - Create a new scenario
export async function POST(request: Request) {
  try {
    const _session = await auth();
    const body = await request.json();
    const { name, description, scenarioGroupId, channels = ['email'] } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Scenario name is required' },
        { status: 400 }
      );
    }

    const scenarioId = crypto.randomUUID();
    const now = new Date().toISOString();

    const scenario = {
      id: scenarioId,
      name,
      description,
      scenarioGroupId,
      status: 'draft',
      channels,
      startTriggers: [{ type: 'manual' }],
      excludeUnsubscribed: true,
      excludeBlocked: true,
      excludeActiveScenarios: false,
      notifications: {
        onReaderRegistration: false,
        onDeliveryError: true,
        onCompletion: false,
        emails: [],
      },
      totalReaders: 0,
      activeReaders: 0,
      completedReaders: 0,
      createdAt: now,
      updatedAt: now,
    };

    scenariosStore.set(scenarioId, scenario);

    return NextResponse.json({ scenario }, { status: 201 });
  } catch (error) {
    console.error('Failed to create scenario:', error);
    return NextResponse.json(
      { error: 'Failed to create scenario' },
      { status: 500 }
    );
  }
}
