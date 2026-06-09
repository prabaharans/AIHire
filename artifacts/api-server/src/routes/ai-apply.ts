import { Router, type IRouter } from "express";
import OpenAI from "openai";

const router: IRouter = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/board/ai-apply", async (req, res): Promise<void> => {
  const { resumeText, jobTitle, jobDescription, jobRequirements } = req.body as {
    resumeText?: string;
    jobTitle?: string;
    jobDescription?: string;
    jobRequirements?: string;
  };

  if (!resumeText || resumeText.trim().length < 20) {
    res.status(400).json({ error: "Please paste your resume text (at least 20 characters)." });
    return;
  }

  const jobContext = [
    jobTitle ? `Job Title: ${jobTitle}` : "",
    jobDescription ? `Job Description:\n${jobDescription}` : "",
    jobRequirements ? `Requirements:\n${jobRequirements}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const prompt = `You are a hiring assistant. A candidate has pasted their resume below. Extract their information and write a tailored cover letter for the job.

RESUME:
${resumeText}

${jobContext ? `JOB DETAILS:\n${jobContext}` : ""}

Respond ONLY with valid JSON in exactly this shape (no markdown, no explanation):
{
  "name": "Full name from resume",
  "email": "Email address from resume or empty string",
  "phone": "Phone number from resume or empty string",
  "linkedinUrl": "LinkedIn URL from resume or empty string",
  "coverLetter": "2-3 paragraph cover letter tailored to the job, written in first person, professional tone. Reference specific skills from the resume that match the job requirements."
}`;

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("429") || msg.includes("quota") || msg.includes("billing")) {
      res.status(503).json({ error: "OpenAI quota exceeded. Please check your API key billing details and try again." });
    } else if (msg.includes("401") || msg.includes("invalid_api_key") || msg.includes("Incorrect API key")) {
      res.status(503).json({ error: "Invalid OpenAI API key. Please check your OPENAI_API_KEY secret." });
    } else {
      res.status(503).json({ error: "AI service unavailable. Please try again later." });
    }
    return;
  }

  const raw = completion.choices[0]?.message?.content ?? "{}";

  let parsed: Record<string, string>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    res.status(500).json({ error: "AI returned unexpected output. Please try again." });
    return;
  }

  res.json({
    name: parsed.name ?? "",
    email: parsed.email ?? "",
    phone: parsed.phone ?? "",
    linkedinUrl: parsed.linkedinUrl ?? "",
    coverLetter: parsed.coverLetter ?? "",
  });
});

export default router;
