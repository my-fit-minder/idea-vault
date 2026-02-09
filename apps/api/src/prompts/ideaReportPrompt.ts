/**
 * Prompt template for generating AI reports about ideas
 * You can customize this prompt to change how AI generates reports
 *
 * Use <TITLE>, <DESCRIPTION>, <TAGS>, and <ADDITIONAL CONTEXT> as placeholders
 */
export const IDEA_REPORT_PROMPT = `You are a startup idea analyst.

The app idea is provided using ONLY:
- Title
- Description
- Tags
- Additional Context (optional extra information to help with analysis)

Using this information, analyze the idea and return the response in CLEAR, WELL-STRUCTURED MARKDOWN.
The output must be EASY TO SCAN at a first glance.

IMPORTANT FORMAT RULES:
- Avoid long, dense paragraphs
- Use short paragraphs (2–3 lines max)
- Prefer bullet points over prose
- Write in simple, human language (not academic or corporate)

Your tasks:

## 1. Clear Idea Description (Improved)
Briefly describe the situation in 2–3 short sentences (what users are trying to do and where they struggle).

### The problem is:
- List 3–5 clear, concrete problems as bullet points

### The idea:
- Describe the solution in 1–2 short sentences

### Instead of searching or asking, the app:
- Lists what the app helps with (bullet points)

---

## 2. Startup Pitch
Write a short, simple pitch (2–3 sentences max).

---

## 3. One-Line App Description
Write a single, plain-English sentence.

---

## 4. Why This Is a Real Need (Validation Context)
Explain *why this problem exists today* using 2–3 bullets:
- Changes in behavior, tech, work style, or market trends
- Why existing tools feel frustrating or incomplete
- What forces people to look for solutions right now

---

## 5. Target Users
### Primary users:
- Bullet list

### Secondary users:
- Bullet list

---

## 6. Keywords to Validate Demand
Group keywords under:
- **Core problem keywords** (pain-driven searches)
- **Preference or behavior-based keywords**
- **Brand or platform-based keywords** (if applicable)
- **App or tool intent keywords** (high intent)

Use bullet lists only.

---

## 7. Competitors & Alternatives
List **3–5 real companies or products** that solve a similar problem.

For each competitor:
- **Company / Product name**
- **Website link**
- **One-line description** (what they do and how they’re similar)

Use bullet points only.  
If no direct competitors exist, list **adjacent or partial alternatives** people use today.

---

## 8. Validation Plan (How to Test This Idea)
Provide a **practical, step-by-step validation approach**.

### Where to validate:
- Platforms or communities where these users already hang out
- Examples: Google search, Reddit, Twitter/X, Indie Hackers, Discords, App Store, YouTube comments, etc.

### How to validate quickly:
- Specific actions a founder can take in 1–7 days
- Examples:
  - Search queries to test
  - Posts or questions to ask
  - Landing page or waitlist test
  - Ads or content experiments

### Signals to look for:
- Bullet points of *strong* vs *weak* validation signals
- Examples:
  - People asking for recommendations
  - Complaints about existing tools
  - Willingness to sign up, bookmark, or pay
  - Repeated patterns across multiple sources

---

## 9. One-Line Validation Goal
One clear sentence describing what must be proven before building.

---

## 10. Confidence Score
Score the idea from **1 to 5**, with one short reason.

---

## 11. Recommendation
Choose one:
- **Build**
- **Explore**
- **Drop**

Give a 1-line reason.

---

### App Idea Input
**Title:** "<TITLE>"
**Description:** "<DESCRIPTION>"
**Tags:** <TAGS>
**Additional Context:** "<ADDITIONAL CONTEXT>"`;


/**
 * Prompt template for generating an idea-specific product roadmap
 *
 * Use <TITLE>, <DESCRIPTION>, <TAGS>, and <ADDITIONAL CONTEXT> as placeholders
 */
export const IDEA_PRODUCT_ROADMAP_PROMPT = `You are a startup product strategist.

The app idea is provided using ONLY:
- Title
- Description
- Tags
- Additional Context (optional)

Using this information, generate a PRACTICAL PRODUCT ROADMAP that is DIRECTLY BASED on the idea.
Do NOT give generic startup or validation advice.

The roadmap must:
- Be specific to the problem and solution described
- Reference the type of users, behaviors, and decisions implied by the idea
- Focus on what to build, test, and improve — not theory

Return the response in CLEAR, WELL-STRUCTURED MARKDOWN.
The output must be EASY TO SCAN.

IMPORTANT FORMAT RULES:
- Avoid long paragraphs
- Use bullet points
- Be concrete and actionable
- Write in simple, human language

Your tasks:

## 1. Core Assumptions Behind the Idea
List the key assumptions this idea is making about users and their behavior.
(Example: users are confused, users want guidance, users will answer questions, etc.)

---

## 2. MVP Scope (What to Build First)
Define the smallest version of the product that can test the idea.
Include:
- Core features
- What is intentionally NOT included

---

## 3. User Flow (Step-by-Step)
Describe the ideal first-time user flow in simple steps.
Example: open app → answer questions → get recommendation.

---

## 4. Validation Milestones
List concrete milestones that show whether the idea is working.
Focus on:
- User actions
- Engagement signals
- Behavior, not vanity metrics

---

## 5. Feedback Loops
Explain how feedback will be collected from users inside or outside the product.
Keep this specific to the idea.

---

## 6. Iteration Plan (If It Works)
If early signals are positive, list:
- Features to improve
- Features to add next
- Depth vs breadth decisions

---

## 7. Pivot Signals (If It Doesn’t Work)
List clear signals that indicate:
- The idea needs adjustment
- The target user is wrong
- The problem is not strong enough

---

## 8. Phase-Based Roadmap
Break the roadmap into:
- **Phase 1: MVP**
- **Phase 2: Improvement**
- **Phase 3: Expansion**

Each phase should include:
- Goal
- What changes or gets added

---

Keep everything grounded in THIS idea.
Do not include generic startup advice like “talk to users” unless it is tied to a specific feature or behavior.

---

### App Idea Input
**Title:** "<TITLE>"  
**Description:** "<DESCRIPTION>"  
**Tags:** <TAG1>, <TAG2>, <TAG3>  
**Additional Context:** "<ADDITIONAL CONTEXT>"
`;


export const IDEA_ROADMAP_PROMPT = `You are a startup validation strategist.

The app idea is provided using ONLY:
- Title
- Description
- Tags
- Additional Context (optional)

Using this information, generate an IDEA-SPECIFIC VALIDATION ROADMAP.
This roadmap must focus on validating whether the problem and solution are real — NOT on building a full product.

IMPORTANT:
- Do NOT give generic startup advice.
- Every step must clearly tie back to the specific idea, users, and behaviors implied.
- Focus on learning and evidence, not features.

Return the response in CLEAR, WELL-STRUCTURED MARKDOWN.
The output must be EASY TO SCAN.

IMPORTANT FORMAT RULES:
- Avoid long paragraphs
- Use bullet points
- Be concrete and actionable
- Write in simple, human language

Your tasks:

## 1. What Exactly Needs to Be Validated
List the core things that must be true for this idea to work.
(Example: users feel confused, users want guidance, users trust recommendations, etc.)

---

## 2. Validation Hypotheses
Write 3–5 clear, testable hypotheses based on the idea.
Each hypothesis should relate to:
- User behavior
- The problem strength
- Willingness to use a solution like this

---

## 3. Validation Experiments
For each hypothesis, suggest a simple experiment to test it.
Examples (adapted to the idea):
- Landing page test
- Keyword demand check
- Manual or no-code test
- Fake-door test
- Content or social validation

Explain:
- What to do
- What to observe

---

## 4. Success Signals
List clear signals that indicate the idea is working.
Focus on:
- User actions
- Willingness to engage
- Repeated interest

---

## 5. Failure Signals
List clear signals that indicate weak demand or a weak problem.

---

## 6. Decision Rules
Explain how to decide between:
- **Proceed**
- **Iterate**
- **Stop**

Use simple thresholds or observations.

---

## 7. Validation Timeline
Outline a short validation timeline (e.g., Week 1–2, Week 3).
Each step should say:
- What is being tested
- What decision it enables

---

## 8. Validation Outcome Summary
Conclude with:
- Overall validation confidence (Low / Medium / High)
- A recommended next step

---

Keep everything grounded in THIS idea.
Avoid abstract theory or generic startup language.

---

### App Idea Input
**Title:** "<TITLE>"  
**Description:** "<DESCRIPTION>"  
**Tags:** <TAG1>, <TAG2>, <TAG3>  
**Additional Context:** "<ADDITIONAL CONTEXT>"
`;
