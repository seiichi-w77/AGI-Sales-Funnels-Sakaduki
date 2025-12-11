import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

// Mock storage (in production, use database)
const scenariosStore = new Map<string, unknown>();

// GET /api/scenarios/[scenarioId] - Get a specific scenario
export async function GET(
  request: Request,
  { params }: { params: { scenarioId: string } }
) {
  try {
    const _session = await auth();
    const { scenarioId } = params;

    const scenario = scenariosStore.get(scenarioId);

    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ scenario });
  } catch (error) {
    console.error('Failed to fetch scenario:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenario' },
      { status: 500 }
    );
  }
}

// PUT /api/scenarios/[scenarioId] - Update a scenario
export async function PUT(
  request: Request,
  { params }: { params: { scenarioId: string } }
) {
  try {
    const _session = await auth();
    const { scenarioId } = params;
    const body = await request.json();

    let scenario = scenariosStore.get(scenarioId) as Record<string, unknown> | undefined;

    if (!scenario) {
      // Create new scenario if it doesn't exist
      scenario = {
        id: scenarioId,
        createdAt: new Date().toISOString(),
      };
    }

    const updatedScenario = {
      ...scenario,
      ...body,
      id: scenarioId,
      updatedAt: new Date().toISOString(),
    };

    scenariosStore.set(scenarioId, updatedScenario);

    return NextResponse.json({ scenario: updatedScenario });
  } catch (error) {
    console.error('Failed to update scenario:', error);
    return NextResponse.json(
      { error: 'Failed to update scenario' },
      { status: 500 }
    );
  }
}

// DELETE /api/scenarios/[scenarioId] - Delete a scenario
export async function DELETE(
  request: Request,
  { params }: { params: { scenarioId: string } }
) {
  try {
    const _session = await auth();
    const { scenarioId } = params;

    if (!scenariosStore.has(scenarioId)) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    scenariosStore.delete(scenarioId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete scenario:', error);
    return NextResponse.json(
      { error: 'Failed to delete scenario' },
      { status: 500 }
    );
  }
}
