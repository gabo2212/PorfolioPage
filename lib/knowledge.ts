export interface QAItem {
  id: string;
  keywords: string[];
  answer: string;
}

export const KNOWLEDGE: QAItem[] = [
  {
    id: "about",
    keywords: [
      "about",
      "bio",
      "who are you",
      "background",
      "about me",
      "what do you do",
      "philosophy",
    ],
    answer:
      "I build intelligent systems that combine creative engineering with practical AI. Projects include voice-driven assistants, automated pipelines, and adaptive interfaces. I treat every product like an ecosystem: scalable, observable, and ready to iterate so the experience feels alive, reliable, and intuitively engineered.",
  },
  {
    id: "skills",
    keywords: [
      "skills",
      "stack",
      "what can you do",
      "what are you good at",
      "tech",
      "tech stack",
      "technology",
      "languages",
    ],
    answer:
      "Core focus: production AI systems and infra. Backend with C# (.NET 8), Python (FastAPI), Postgres + pgvector, Redis, Docker. Full-stack web with React + TypeScript. Voice AI, real-time agents, secure role-based dashboards, cloud deploy on VMs. Goal: ship tools that run 24/7, not just demos.",
  },
  {
    id: "ceobot",
    keywords: ["ceobot", "ceo bot", "property management", "tickets", "tenants", "twilio", "dashboard"],
    answer:
      "CEObot: property management platform. .NET 8 + EF Core + SQLite. Role-based dashboards for admins and maintenance staff. Twilio voice intake for tenant issues. Deployed on hardened Linux VM. Goal: automate intake to dispatch without manual triage.",
  },
  {
    id: "companion",
    keywords: ["companion", "asuka", "minecraft", "assistant", "voice", "tts", "mod", "forge"],
    answer:
      "Companion AI: Minecraft assistant. Forge 1.20.1 mod plus Python FastAPI backend. Streams in-game events (HP, combat, location) to an LLM and TTS voice clone that talks back in real time. Has cooldown and urgency logic so it only interrupts for important stuff. Stores memory in SQLite.",
  },
  {
    id: "vibecoder",
    keywords: [
      "vibecoder",
      "vibe coder",
      "code assistant",
      "ai coder",
      "generate code",
      "fastapi",
      "pgvector",
      "redis",
      "bedrock",
    ],
    answer:
      "VibeCoder: AI coding assistant. React + TypeScript front end with Redux. FastAPI backend. Postgres + pgvector memory. Redis for job queue. Uses AWS Bedrock models for code generation, debugging help, and infra planning. Goal: type plain English and receive working code plus deployment plan.",
  },
  {
    id: "workstyle",
    keywords: [
      "how you work",
      "workflow",
      "style",
      "approach",
      "philosophy",
      "mindset",
      "what makes you different",
      "reliability",
      "production",
    ],
    answer:
      "Mindset: build systems that survive real users, not classroom demos. Focus on reliability, security, monitoring, and deploy. Strong at wiring AI features into actual products: auth, persistence, rate limit, voice, dashboards. Priority is shipping something other people can actually use.",
  },
  {
    id: "experience",
    keywords: [
      "experience",
      "work history",
      "jobs",
      "cirque",
      "it technician",
      "apprenticeship",
      "what have you done",
    ],
    answer:
      "Recent role: IT Technician (Apprenticeship) at Cirque du Soleil Entertainment Group, Jul 2020 - Sep 2020. Helped maintain live-show IT across venues, handling network and AV setup, troubleshooting, and system upkeep to keep performances running smoothly.",
  },
  {
    id: "education",
    keywords: [
      "education",
      "school",
      "study",
      "degree",
      "college",
      "cdi",
      "cegep",
      "ai program",
    ],
    answer:
      "Education: Technic program in Artificial Intelligence at CDI College (2025-2026) focused on applied ML, deployment, and data-driven design. Previously at Cégep Édouard-Montpetit (Sep 2024 - Jul 2025) studying computer science with emphasis on full-stack development, data systems, and cloud infrastructure.",
  },
  {
    id: "contact",
    keywords: ["contact", "hire", "email", "reach you", "work with you", "collab", "talk"],
    answer: "Contact: [tdgf@icloud.com or kanyelover1 on Discord]. Open to software / AI infra / tooling roles.",
  },
];

const FALLBACK =
  "I can answer about: bio, skills, projects (CEObot, Companion AI, VibeCoder), workstyle, experience, education, or contact.";

const sanitize = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const getBestAnswer = (question: string): string => {
  const sanitizedQuestion = sanitize(question);
  if (!sanitizedQuestion) {
    return FALLBACK;
  }

  const questionWords = sanitizedQuestion.split(" ");

  let bestAnswer = FALLBACK;
  let highestScore = 0;
  let tie = false;

  for (const item of KNOWLEDGE) {
    let score = 0;
    for (const keyword of item.keywords) {
      const normalizedKeyword = sanitize(keyword);
      if (!normalizedKeyword) {
        continue;
      }

      const keywordWords = normalizedKeyword.split(" ");
      if (normalizedKeyword === sanitizedQuestion) {
        score += 3;
        continue;
      }
      const questionContainsKeyword = sanitizedQuestion.includes(normalizedKeyword);
      const keywordContainsQuestionWord = questionWords.some((word) => {
        if (word.length < 2) {
          return false;
        }
        return normalizedKeyword.includes(word);
      });
      const questionContainsKeywordWord = keywordWords.some((word) => {
        if (word.length < 2) {
          return false;
        }
        return sanitizedQuestion.includes(word);
      });

      if (questionContainsKeyword) {
        score += 2;
      }
      if (keywordContainsQuestionWord) {
        score += 1;
      }
      if (questionContainsKeywordWord) {
        score += 1;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestAnswer = item.answer;
      tie = false;
    } else if (score === highestScore && score !== 0) {
      tie = true;
    }
  }

  if (highestScore === 0 || tie) {
    return FALLBACK;
  }

  return bestAnswer;
};

export default getBestAnswer;
