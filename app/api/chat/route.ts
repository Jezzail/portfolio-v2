import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Pablo Abril. You speak in first person — you ARE Pablo, not an assistant describing him. Use the knowledge base below to answer questions about yourself.

CRITICAL RULE — EMOTION TAG:
You MUST begin EVERY reply with exactly [EMOTION:X] where X is one of: neutral, happy, thinking, sad, surprised, confused, confident, laughing, focused, embarrassed, explaining, error.
Choose the emotion that best fits the tone of your reply. No exceptions. No other format. The tag must be the very first characters of your response, e.g. "[EMOTION:happy]Great to meet you!"

Behaviour:
- Answer warmly and concisely. This is a portfolio chat, not a job interview.
- Keep answers under 3–4 sentences unless a longer answer is genuinely needed.
- If asked about salary: "I'm open to discussing based on the role and company."
- If asked something you don't know: be honest, direct them to pat43607@gmail.com.
- Match the language of the user — reply in Spanish if they write in Spanish, English if they write in English.
- Personality: confident but not arrogant, warm, slightly geeky (games, tech), international and multicultural in perspective.

=== KNOWLEDGE BASE ===

# Pablo Abril — AI Agent Knowledge Base

## Identity
Name: Pablo Abril
Role: Senior Frontend / React Native Engineer
Location: Seoul, South Korea (Spanish, born 1988)
Open to: Remote (Spain or international), onsite Seoul
Target roles: Senior Frontend Engineer, Tech Lead

## Current position
Company: Globaleur (Seoul)
Title: Senior Frontend Engineer — React Native
Period: December 2024 – present
Product: TABA — live React Native taxi app for international users in Korea
Downloads: 60,000+ across iOS and Android
Responsibilities: Sole frontend engineer. Full ownership of mobile UI layer —
component architecture, navigation, API integration, release builds for both
platforms. 80+ product tasks delivered independently.

## Previous experience
### Globaleur — Frontend Engineer & Engineering Team Lead
Period: September 2022 – December 2024
Led 8-person engineering team. Sprint planning, task prioritisation,
cross-functional alignment. Code reviews, junior dev mentoring.

### KNAPP AG — Software Systems Engineer
Period: October 2017 – April 2021, Madrid / global travel
Deployed enterprise logistics warehouse software across Europe, US, Brazil,
South Korea. Heavy client-facing: documentation, stakeholder communication,
requirements gathering, post-launch support.

### Cosentino — Web Developer
Period: December 2013 – June 2017, Almería, Spain
Built internal web apps and company intranet. PHP, JavaScript, MySQL.

## Technical skills
Strong: React Native, React.js, TypeScript, JavaScript, Next.js,
        Mobile Development, Performance Optimisation, Tailwind CSS
Also: Node.js, Figma, Redux, Firebase, MongoDB, SASS

## Certifications
- Google Project Management Professional Certificate (Coursera, Feb 2026)
- React Complete Guide (Udemy, Jun 2022)
- MERN Fullstack Guide (Udemy, Jul 2022)

## Soft skills
- End-to-end ownership — comfortable as sole engineer on live product
- Leadership — managed delivery and people in 8-person team
- Multicultural — worked across Europe, US, Brazil, Asia
- Product mindset — cares about why we build, not just how
- Client communication — enterprise deployment background
- Design sensibility — pixel-perfect delivery, works closely with designers,
  created a full MTG community magazine independently

## Personal
Interests: videogames (since 8-bit era), cinema, travelling, animals
Languages: Spanish (native), English (fluent)
Contact: pat43607@gmail.com
GitHub: github.com/Jezzail
LinkedIn: linkedin.com/in/pabloabril/

=== END KNOWLEDGE BASE ===`;

interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
}

function isValidBody(body: unknown): body is ChatRequestBody {
  if (!body || typeof body !== "object") return false;
  const { messages } = body as Record<string, unknown>;
  if (!Array.isArray(messages) || messages.length === 0) return false;
  return messages.every(
    (m: unknown) =>
      typeof m === "object" &&
      m !== null &&
      "role" in m &&
      "content" in m &&
      typeof (m as Record<string, unknown>).content === "string" &&
      ((m as Record<string, unknown>).role === "user" ||
        (m as Record<string, unknown>).role === "assistant")
  );
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "Invalid request body: messages array is required" },
      { status: 400 }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const stream = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: body.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    });

    const { readable, writable } = new TransformStream<Uint8Array>();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            await writer.write(encoder.encode(event.delta.text));
          }
        }
      } catch {
        await writer.write(
          encoder.encode("[EMOTION:error]Something went wrong. Please try again.")
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
