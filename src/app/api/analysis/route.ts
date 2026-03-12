import { NextRequest, NextResponse } from 'next/server';
import {
  getRightViewFrequency,
  getConceptsHeat,
  getInsightsClusters,
  getProblemCategories,
  getSpeakerProfile,
  getTopicDeepAnalysis,
  getSpeakersList,
  getTopicsList,
} from '@/lib/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'overview';

  try {
    switch (type) {
      case 'overview': {
        // Fetch all overview data in parallel
        const [rightViewFreq, conceptsHeat, insightsClusters, problemCategories] =
          await Promise.all([
            getRightViewFrequency(30),
            getConceptsHeat(30),
            getInsightsClusters(15),
            getProblemCategories(15),
          ]);

        return NextResponse.json({
          rightViewFreq,
          conceptsHeat,
          insightsClusters,
          problemCategories,
        });
      }

      case 'speaker': {
        const speaker = searchParams.get('speaker');
        if (!speaker) {
          return NextResponse.json(
            { error: 'speaker param required' },
            { status: 400 }
          );
        }
        const profile = await getSpeakerProfile(speaker);
        if (!profile) {
          return NextResponse.json(
            { error: 'Speaker not found' },
            { status: 404 }
          );
        }
        return NextResponse.json(profile);
      }

      case 'topic': {
        const topic = searchParams.get('topic');
        if (!topic) {
          return NextResponse.json(
            { error: 'topic param required' },
            { status: 400 }
          );
        }
        const analysis = await getTopicDeepAnalysis(topic);
        if (!analysis) {
          return NextResponse.json(
            { error: 'Topic not found' },
            { status: 404 }
          );
        }
        return NextResponse.json(analysis);
      }

      case 'filters': {
        const [speakers, topics] = await Promise.all([
          getSpeakersList(),
          getTopicsList(),
        ]);
        return NextResponse.json({ speakers, topics });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
