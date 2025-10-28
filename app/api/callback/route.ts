import { NextRequest, NextResponse } from 'next/server';

// Store for task callbacks (in production, use a database)
const taskCallbacks = new Map<string, any>();

/**
 * Callback endpoint for Kie.ai task completion
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Received callback from Kie.ai:', JSON.stringify(body, null, 2));

    // Store the callback result
    if (body.data?.taskId) {
      taskCallbacks.set(body.data.taskId, {
        ...body,
        receivedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Callback received',
    });
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}

/**
 * Retrieve callback result for a specific task
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }

    const result = taskCallbacks.get(taskId);

    if (!result) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Callback retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve callback' },
      { status: 500 }
    );
  }
}

