// ─── Types ───────────────────────────────────────────────────────────
export type StarRating = 1 | 2 | 3 | 4 | 5;
export type Sentiment = "positive" | "mixed" | "negative";
export type Urgency = "low" | "medium" | "high" | "critical";

export interface ReviewAnalysis {
  stars: StarRating;
  sentiment: Sentiment;
  urgency: Urgency;
  reviewer_name: string;
  key_praise: string[];
  key_complaints: string[];
  specific_issues: string[];
  emotional_tone: string;
  mentions_staff: string[];
  mentions_competitor: boolean;
  threatens_action: boolean;
  response_strategy: string;
}

export interface BrandSettings {
  business_name: string;
  owner_name: string;
  tone: "warm" | "professional" | "casual";
  industry: string;
}

export interface ProcessedResult {
  analysis: ReviewAnalysis;
  response_draft: string;
  internal_notes: string;
  protocol_flags: string[];
}

// ─── Default Brand Settings ──────────────────────────────────────────
export const DEFAULT_BRAND: BrandSettings = {
  business_name: "Your Business",
  owner_name: "The Owner",
  tone: "warm",
  industry: "hospitality",
};

// ─── Demo Reviews ────────────────────────────────────────────────────
export const DEMO_REVIEWS = [
  {
    label: "5-Star Glowing",
    icon: "⭐",
    stars: 5 as StarRating,
    reviewer: "Sarah M.",
    review: `Absolutely amazing experience! We came for my husband's birthday and the team went above and beyond. The food was incredible — the lamb shank was honestly the best I've ever had. Our server Tom was so attentive and even brought out a surprise dessert with a candle. The atmosphere is so cosy and welcoming. We'll definitely be back and we've already told all our friends. Thank you so much for making it such a special evening!`,
  },
  {
    label: "3-Star Mixed",
    icon: "😐",
    stars: 3 as StarRating,
    reviewer: "Dave K.",
    review: `Food was decent but not amazing for the price. The steak was cooked well but the sides were a bit bland. Service was okay — took a while to get our drinks order and the waitress seemed a bit flustered, but she was friendly enough. The place itself is nice and clean. Wouldn't say it's bad by any means but probably wouldn't rush back when there are other options nearby. Average really.`,
  },
  {
    label: "1-Star Angry",
    icon: "🔥",
    stars: 1 as StarRating,
    reviewer: "Karen T.",
    review: `Absolutely disgusting experience. Waited 45 minutes for our food and when it arrived my chicken was cold in the middle. When I complained the manager was incredibly rude and basically accused me of lying. No apology, no offer to remake it, nothing. We ended up leaving without finishing our meal. I've been to hundreds of restaurants and this is by far the worst service I've ever received. I'll be contacting environmental health about the food temperature issue. Do NOT waste your money here. Go to The Oak next door instead.`,
  },
  {
    label: "2-Star Disappointed",
    icon: "😔",
    stars: 2 as StarRating,
    reviewer: "James P.",
    review: `Really disappointed. We booked a table for our anniversary and specifically mentioned it when booking. When we arrived there was no acknowledgement of the occasion at all. The table was right next to the kitchen door so it was noisy and we kept getting bumped by staff walking past. Food was fine but nothing special for £40 a head. Just felt like we were treated as an afterthought. We used to come here regularly but standards have definitely slipped over the last year.`,
  },
  {
    label: "4-Star Nearly Perfect",
    icon: "👍",
    stars: 4 as StarRating,
    reviewer: "Priya S.",
    review: `Really lovely meal overall. The tasting menu was creative and beautifully presented. Particularly loved the scallop starter and the chocolate fondant was divine. Only reason for 4 not 5 is the wine pairing felt a bit generic and at £45 extra I expected more thought. Also the music was a touch loud for a Thursday evening. But the staff were wonderful, especially our server who explained every course with real passion. Would happily recommend and will return.`,
  },
];

// ─── Sentiment Keywords ──────────────────────────────────────────────
const POSITIVE_WORDS = [
  "amazing", "incredible", "fantastic", "wonderful", "brilliant", "excellent",
  "perfect", "lovely", "beautiful", "delicious", "outstanding", "superb",
  "best", "love", "loved", "happy", "special", "recommend", "welcoming",
  "attentive", "friendly", "cosy", "divine", "creative", "passion",
  "definitely be back", "will return", "told all our friends",
];

const NEGATIVE_WORDS = [
  "disgusting", "terrible", "awful", "worst", "horrible", "rude",
  "cold", "raw", "inedible", "overpriced", "disappointing", "disappointed",
  "complained", "refused", "ignored", "waited", "slow", "dirty",
  "never again", "waste of money", "do not", "don't bother", "avoid",
  "slipped", "afterthought", "flustered", "bland",
];

const THREAT_WORDS = [
  "environmental health", "trading standards", "solicitor", "lawyer",
  "food standards", "health and safety", "legal action", "report",
  "ombudsman", "social media", "newspapers", "press",
];

// ─── Analysis Engine ─────────────────────────────────────────────────
export function analyseReview(
  review: string,
  stars: StarRating,
  reviewerName: string,
  brand: BrandSettings
): ReviewAnalysis {
  const lower = review.toLowerCase();

  // Sentiment
  const posScore = POSITIVE_WORDS.filter((w) => lower.includes(w)).length;
  const negScore = NEGATIVE_WORDS.filter((w) => lower.includes(w)).length;
  let sentiment: Sentiment;
  if (stars >= 4 && posScore > negScore) sentiment = "positive";
  else if (stars <= 2 || negScore > posScore + 2) sentiment = "negative";
  else sentiment = "mixed";

  // Urgency
  let urgency: Urgency;
  const threatens = THREAT_WORDS.some((w) => lower.includes(w));
  const mentionsCompetitor = /go to|next door|instead|rather go|competitor|other options/i.test(lower);
  if (stars === 1 && threatens) urgency = "critical";
  else if (stars <= 2) urgency = "high";
  else if (stars === 3 || (stars === 4 && negScore > 0)) urgency = "medium";
  else urgency = "low";

  // Key praise
  const praise: string[] = [];
  if (/food|meal|dish|menu|tasting/i.test(lower) && posScore > 0) praise.push("Food quality praised");
  if (/staff|server|waiter|waitress|team/i.test(lower) && /friendly|attentive|wonderful|passion|lovely/i.test(lower)) praise.push("Staff singled out positively");
  if (/atmosphere|cosy|welcoming|ambiance|decor|clean/i.test(lower) && sentiment !== "negative") praise.push("Atmosphere appreciated");
  if (/birthday|anniversary|special|occasion/i.test(lower) && sentiment !== "negative") praise.push("Special occasion handled well");
  if (/recommend|friends|return|back/i.test(lower) && sentiment !== "negative") praise.push("Likely to return / recommend");

  // Key complaints
  const complaints: string[] = [];
  if (/wait|waited|slow|took a while|45 min/i.test(lower)) complaints.push("Long wait times");
  if (/cold|raw|temperature|undercooked/i.test(lower)) complaints.push("Food temperature / safety concern");
  if (/rude|attitude|accused|dismissive|ignored/i.test(lower)) complaints.push("Staff attitude issue");
  if (/price|expensive|overpriced|£\d+.*not (worth|special)/i.test(lower)) complaints.push("Value for money concern");
  if (/noisy|loud|music|bumped|table.*kitchen|location/i.test(lower)) complaints.push("Seating / environment issue");
  if (/booking|reserved|mentioned|acknowledged/i.test(lower) && sentiment !== "positive") complaints.push("Booking / special request not honoured");
  if (/slipped|used to|standards/i.test(lower)) complaints.push("Perceived decline in standards");
  if (/bland|generic|nothing special|average/i.test(lower)) complaints.push("Food / experience felt uninspired");

  // Specific issues for internal action
  const issues: string[] = [];
  if (/cold.*chicken|chicken.*cold|raw|temperature/i.test(lower)) issues.push("FOOD SAFETY: Temperature complaint needs investigation");
  if (/manager.*rude|rude.*manager/i.test(lower)) issues.push("MANAGEMENT: Staff conduct complaint — identify incident");
  if (/45 min|hour wait/i.test(lower)) issues.push("OPERATIONS: Significant wait time — check staffing / kitchen flow");
  if (/table.*kitchen|noisy|bumped/i.test(lower)) issues.push("FRONT OF HOUSE: Table allocation needs review");
  if (/booking.*not|no acknowledgement/i.test(lower)) issues.push("BOOKINGS: Special occasion notes not reaching floor staff");

  // Emotional tone
  let emotional_tone = "neutral";
  if (/absolutely|incredibly|honestly|so much/i.test(lower) && sentiment === "positive") emotional_tone = "enthusiastic";
  else if (/disgusting|absolutely|furious|appalled|livid/i.test(lower) && sentiment === "negative") emotional_tone = "angry";
  else if (/disappointed|let down|sad|shame|gutted/i.test(lower)) emotional_tone = "disappointed";
  else if (/fine|okay|decent|average|not bad/i.test(lower)) emotional_tone = "indifferent";

  // Staff mentions
  const staffMentions: string[] = [];
  const staffMatch = review.match(/(?:server|waiter|waitress|staff member|manager|bartender|chef)\s+(?:called\s+|named\s+)?(\w+)/gi);
  if (staffMatch) staffMentions.push(...staffMatch.map((s) => s.trim()));
  const nameMatch = review.match(/\b(Tom|Sarah|Mike|Emma|James|Lucy|Dave|Sam|Chris|Alex)\b/g);
  if (nameMatch) staffMentions.push(...nameMatch.map((n) => `Staff: ${n}`));

  // Response strategy
  let strategy: string;
  if (sentiment === "positive" && stars >= 4) {
    strategy = "Thank warmly, reference specific details they mentioned, invite back. Keep it personal — not generic.";
  } else if (sentiment === "mixed") {
    strategy = "Acknowledge the positives first, then address each concern directly. Show you're listening. Invite them to return so you can improve their experience.";
  } else if (urgency === "critical") {
    strategy = "DE-ESCALATION PROTOCOL: Apologise sincerely without admitting liability on safety claims. Take the conversation offline immediately. Provide direct contact details. Do NOT engage with competitor mentions. Do NOT be defensive.";
  } else if (sentiment === "negative") {
    strategy = "Empathise first, apologise for their experience. Address specific issues without making excuses. Offer to make it right. Take offline with direct contact. Show this isn't your standard.";
  } else {
    strategy = "Thank for feedback, acknowledge the specific concern, explain any improvements being made.";
  }

  return {
    stars,
    sentiment,
    urgency,
    reviewer_name: reviewerName,
    key_praise: praise.length > 0 ? praise : ["None detected"],
    key_complaints: complaints.length > 0 ? complaints : ["None detected"],
    specific_issues: issues.length > 0 ? issues : ["No action items"],
    emotional_tone,
    mentions_staff: staffMentions.length > 0 ? staffMentions : [],
    mentions_competitor: mentionsCompetitor,
    threatens_action: threatens,
    response_strategy: strategy,
  };
}

// ─── Response Generator ──────────────────────────────────────────────
export function generateResponse(
  analysis: ReviewAnalysis,
  brand: BrandSettings
): string {
  const { stars, sentiment, reviewer_name, key_praise, key_complaints, emotional_tone } = analysis;
  const firstName = reviewer_name.split(/[\s.]/)[0];
  const biz = brand.business_name;
  const owner = brand.owner_name;

  // ─── 5-Star Response ──────────────────────────────────────────────
  if (stars === 5) {
    const praiseRef = key_praise.includes("Staff singled out positively")
      ? " I'll make sure the team sees this — it'll make their day."
      : "";
    const occasionRef = key_praise.includes("Special occasion handled well")
      ? " It was our pleasure to be part of such a special occasion."
      : "";
    return `Hi ${firstName},

Thank you so much for this wonderful review — it really means the world to us!${occasionRef}

We're absolutely thrilled you had such a great experience.${praiseRef} We put a lot of heart into what we do, so hearing this kind of feedback makes it all worthwhile.

We can't wait to welcome you back. Until then, thank you for spreading the word!

Warmest regards,
${owner}
${biz}`;
  }

  // ─── 4-Star Response ──────────────────────────────────────────────
  if (stars === 4) {
    const concerns = key_complaints.filter(c => c !== "None detected");
    const concernText = concerns.length > 0
      ? `\nI appreciate you flagging ${concerns.length === 1 ? "that point" : "those points"} about ${concerns.map(c => c.toLowerCase().replace(/.*: /, "")).join(" and ")} — that's exactly the kind of feedback that helps us get from great to perfect. I've noted it and we'll be working on it.`
      : "";
    return `Hi ${firstName},

Thank you so much for the lovely review and for taking the time to share your experience!

We're delighted you enjoyed ${key_praise.includes("Food quality praised") ? "the food" : "your visit"} — that really means a lot to us.${concernText}

We'd love to welcome you back and hopefully earn that fifth star next time!

With thanks,
${owner}
${biz}`;
  }

  // ─── 3-Star Response ──────────────────────────────────────────────
  if (stars === 3) {
    const concerns = key_complaints.filter(c => c !== "None detected");
    return `Hi ${firstName},

Thank you for your honest feedback — we genuinely appreciate you taking the time to share it.

${concerns.length > 0 ? `I'm sorry to hear that aspects of your visit didn't meet expectations. You've raised some fair points about ${concerns.map(c => c.toLowerCase().replace(/.*: /, "")).join(" and ")}, and I want you to know we're taking them on board.` : "I'm sorry your experience wasn't everything it could have been."}

${key_praise.some(p => p !== "None detected") ? "I'm glad there were positives too — " : ""}We're always working to improve, and feedback like yours is a big part of that.

I'd love the chance to change your mind. If you'd be open to giving us another visit, please don't hesitate to reach out directly at [email] and I'll make sure we get it right.

Kind regards,
${owner}
${biz}`;
  }

  // ─── 2-Star Response ──────────────────────────────────────────────
  if (stars === 2) {
    const concerns = key_complaints.filter(c => c !== "None detected");
    return `Hi ${firstName},

Thank you for taking the time to share your experience. I'm really sorry to hear we fell short${emotional_tone === "disappointed" ? " — I can hear how disappointing that was, and I completely understand" : ""}.

${concerns.length > 0 ? `You've raised some important points about ${concerns.map(c => c.toLowerCase().replace(/.*: /, "")).join(" and ")}, and I want to assure you these aren't the standards we set for ourselves. I've already flagged this with the team so we can address it properly.` : "This isn't the experience we want anyone to have, and I take full responsibility for that."}

${key_praise.some(p => p !== "None detected") ? "I'm glad it wasn't all negative, but clearly we have work to do. " : ""}I would really value the opportunity to put this right. Would you be willing to reach out to me directly at [email/phone]? I'd like to hear more about what happened and make sure it doesn't happen again.

Sincerely,
${owner}
${biz}`;
  }

  // ─── 1-Star Response (De-escalation Protocol) ─────────────────────
  const threatAcknowledge = analysis.threatens_action
    ? "\n\nWe take all feedback seriously and will be reviewing the points you've raised thoroughly as a matter of priority."
    : "";

  return `Hi ${firstName},

I'm truly sorry to hear about your experience. This is clearly not the standard we hold ourselves to, and I completely understand your frustration.

There is no excuse for what you've described, and I want to sincerely apologise on behalf of the entire team. Every customer deserves to feel valued and well looked after, and we failed to deliver that for you.${threatAcknowledge}

I would very much like the opportunity to look into this personally and to make things right. Could I ask you to contact me directly at [email/phone]? I want to understand exactly what happened so we can ensure it never happens again.

${owner}
${biz}`;
}

// ─── Internal Notes Generator ────────────────────────────────────────
export function generateInternalNotes(analysis: ReviewAnalysis): string {
  const lines: string[] = [];

  lines.push(`INTERNAL — DO NOT POST PUBLICLY`);
  lines.push(`${"─".repeat(40)}`);
  lines.push(`Rating: ${analysis.stars}/5 | Sentiment: ${analysis.sentiment.toUpperCase()} | Urgency: ${analysis.urgency.toUpperCase()}`);
  lines.push(`Reviewer: ${analysis.reviewer_name}`);
  lines.push(`Emotional tone: ${analysis.emotional_tone}`);
  lines.push("");

  if (analysis.specific_issues.some(i => i !== "No action items")) {
    lines.push("ACTION ITEMS:");
    analysis.specific_issues.forEach((i) => lines.push(`  ⚠ ${i}`));
    lines.push("");
  }

  if (analysis.mentions_staff.length > 0) {
    lines.push("STAFF MENTIONED:");
    analysis.mentions_staff.forEach((s) => lines.push(`  → ${s}`));
    lines.push("");
  }

  if (analysis.mentions_competitor) {
    lines.push("⚠ COMPETITOR MENTIONED — do NOT reference in public reply");
    lines.push("");
  }

  if (analysis.threatens_action) {
    lines.push("🚨 REGULATORY/LEGAL THREAT DETECTED");
    lines.push("  → Respond promptly and take offline");
    lines.push("  → Do not admit liability in public response");
    lines.push("  → Brief relevant team members immediately");
    lines.push("  → Document this review and your investigation");
    lines.push("");
  }

  lines.push("RESPONSE STRATEGY:");
  lines.push(`  ${analysis.response_strategy}`);

  return lines.join("\n");
}

// ─── Full Pipeline ───────────────────────────────────────────────────
export function processReview(
  review: string,
  stars: StarRating,
  reviewerName: string,
  brand: BrandSettings
): ProcessedResult {
  const analysis = analyseReview(review, stars, reviewerName, brand);
  const response_draft = generateResponse(analysis, brand);
  const internal_notes = generateInternalNotes(analysis);

  const flags: string[] = [];
  if (analysis.urgency === "critical") flags.push("🚨 Critical — respond within 2 hours");
  if (analysis.urgency === "high") flags.push("⚠️ High priority — respond today");
  if (analysis.threatens_action) flags.push("Legal/regulatory threat detected");
  if (analysis.mentions_competitor) flags.push("Competitor mentioned — don't engage");
  if (analysis.specific_issues.some(i => i.includes("FOOD SAFETY"))) flags.push("Food safety issue — investigate immediately");
  if (analysis.mentions_staff.length > 0) flags.push(`Staff mentioned: ${analysis.mentions_staff.join(", ")}`);

  return { analysis, response_draft, internal_notes, protocol_flags: flags };
}
