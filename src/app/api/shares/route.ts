import { NextRequest, NextResponse } from 'next/server';
import { getShares, getShareById, getSpeakersList, getTopicsList } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if requesting filters metadata
    if (searchParams.get('type') === 'filters') {
      const [speakers, topics] = await Promise.all([
        getSpeakersList(),
        getTopicsList(),
      ]);
      return NextResponse.json({ speakers, topics });
    }

    // Check if requesting a single share by ID
    const id = searchParams.get('id');
    if (id) {
      const share = await getShareById(parseInt(id, 10));
      if (!share) {
        return NextResponse.json(
          { error: 'Share not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(share);
    }

    // Otherwise, fetch paginated list
    const result = await getShares({
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '20', 10),
      speaker: searchParams.get('speaker') || undefined,
      topic: searchParams.get('topic') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as 'share_date' | 'speaker' | 'topic' | 'created_at') || 'share_date',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch shares:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
      { status: 500 }
    );
  }
}
