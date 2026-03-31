import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { message } = (await request.json()) as { message: string };

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  // TODO: Implement Anthropic API call
  return NextResponse.json({ reply: "" });
}
