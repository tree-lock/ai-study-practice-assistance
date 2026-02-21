import { and, desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { db } from "@/lib/db";
import { questions, tags, topics, users } from "@/lib/db/schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: topicId } = await params;

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topicResult = await db
    .select()
    .from(topics)
    .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
    .limit(1);

  const topic = topicResult[0];
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const [questionRows, tagRows] = await Promise.all([
    db
      .select({
        id: questions.id,
        content: questions.content,
        type: questions.type,
        source: questions.source,
        createdAt: questions.createdAt,
        creatorId: users.id,
        creatorName: users.name,
      })
      .from(questions)
      .leftJoin(users, eq(questions.creatorId, users.id))
      .where(eq(questions.topicId, topicId))
      .orderBy(desc(questions.createdAt)),
    db
      .select({
        id: tags.id,
        name: tags.name,
      })
      .from(tags)
      .where(eq(tags.topicId, topicId)),
  ]);

  const formattedQuestions = questionRows.map((row) => ({
    id: row.id,
    content: row.content,
    type: row.type,
    source: row.source,
    createdAt: row.createdAt,
    creator: row.creatorId
      ? { id: row.creatorId, name: row.creatorName }
      : null,
  }));

  return NextResponse.json({
    topic: {
      id: topic.id,
      name: topic.name,
      description: topic.description,
    },
    questions: formattedQuestions,
    tags: tagRows,
  });
}
