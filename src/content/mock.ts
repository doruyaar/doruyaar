/**
 * Site content. Profile, experience and skills are taken from the CV.
 * See the comment on `sideProjects` for how to add projects and screenshots.
 *
 * Every concept renders from this one file so the copy stays identical
 * while you compare designs.
 */

export const profile = {
  name: "Dor Yardeni",
  firstName: "Dor",
  role: "Data & AI Engineer",
  roleLong: "Data Engineer · AI Engineer",
  tagline: "From raw events to AI agents - built end to end.",
  intro:
    "Data and AI Engineer with a strong backend, data engineering and cloud infrastructure background. I've worked the whole product lifecycle - frontend, REST APIs, large-scale Spark pipelines, cloud infrastructure, AI agents, RAG and context engineering - and I like taking a proof-of-concept all the way to a product people actually use.",
  email: "doru.yaar@gmail.com",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/dor-yardeni-b43066331/" },
    { label: "Medium", href: "https://medium.com/@dor.yar" },
    { label: "GitHub", href: "https://github.com/doruyaar" },
  ],
  languages: [
    { label: "English", level: "Excellent" },
    { label: "Hebrew", level: "Native" },
  ],
};

export type Stage = {
  id: string;
  index: string;
  title: string;
  body: string;
  tags: string[];
};

/** The four beats of the scroll story, shared by all concepts. */
export const stages: Stage[] = [
  {
    id: "ingest",
    index: "01",
    title: "Raw. Messy. Everywhere.",
    body:
      "Large-scale event data landing from Kafka, Event Hubs, S3 and half a dozen databases. Nobody trusts it yet. This is where I start.",
    tags: ["Kafka", "Event Hubs", "S3", "PostgreSQL", "Elasticsearch"],
  },
  {
    id: "transform",
    index: "02",
    title: "Structure out of noise.",
    body:
      "A live streaming ETL pipeline on Spark and Databricks: 10,000 events a second at peak, hundreds of terabytes a month, Delta Lake underneath, Terraform and CI/CD keeping it honest.",
    tags: ["Databricks", "Apache Spark", "Delta Lake", "Structured Streaming", "Terraform"],
  },
  {
    id: "model",
    index: "03",
    title: "Then it learns.",
    body:
      "An AI agent that works like an analyst: it understands company-specific domain data and runs real analysis workflows - about 1000× faster than a human analyst, at 1/100 of the cost.",
    tags: ["LLMs", "AI Agents", "RAG", "LangGraph", "MLflow"],
  },
  {
    id: "serve",
    index: "04",
    title: "Shipped. Owned. End to end.",
    body:
      "Frontend, backend, security and evaluation - from concept to a product used internally and pitched to customers, making our offers far more competitive. I own the direction, the code and the conversation.",
    tags: ["TypeScript", "Node.js", "React", "Vue", "AWS Lambda", "Azure Functions"],
  },
];

export type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  summary: string;
  highlight: string;
  bullets: string[];
  stack: string[];
};

/** Professional experience, most recent first (from the CV). */
export const experience: Experience[] = [
  {
    id: "cymotive-ai",
    role: "AI Engineer",
    company: "CYMOTIVE Technologies",
    period: "2025 - 2026",
    summary:
      "Initiated and independently built a new AI product from concept to proof-of-concept: an AI agent that works as an analyst over company-specific domain data - about 1000× faster than a human analyst at roughly 1/100 of the cost.",
    highlight: "1000× faster · 1/100 the cost",
    bullets: [
      "Designed and implemented an AI agent that understands domain data and runs real analysis workflows end to end.",
      "Built the full product flow: frontend, backend, security, model evaluation, agent logic and integration with internal data sources.",
      "Made the company materially more efficient in time and money, and made our commercial offers far more competitive than competitors'.",
      "Presented and drove the initiative internally until it became both an internal productivity tool and a customer-facing product candidate.",
    ],
    stack: ["LLMs", "LangChain", "LangGraph", "RAG", "MLflow", "Python"],
  },
  {
    id: "cymotive-data",
    role: "Data Engineer",
    company: "CYMOTIVE Technologies",
    period: "2023 - 2025",
    summary:
      "Built a live streaming, end-to-end ETL pipeline that consumes 10,000 events per second at peak - hundreds of terabytes every month - on Spark and Databricks, and led a full system migration from Elasticsearch into Databricks.",
    highlight: "10k events/s · 100s of TB/month",
    bullets: [
      "Built live ETL and streaming pipelines with Databricks, Spark Structured Streaming, Delta Lake and Kafka.",
      "Created, optimized and maintained database architectures, schemas and complex SQL queries over large-scale event data.",
      "Automated cloud data infrastructure with Terraform and CI/CD.",
      "Go-to expert in the team for data engineering, Databricks, Spark and secure coding practices.",
    ],
    stack: ["Databricks", "Apache Spark", "Delta Lake", "Kafka", "Terraform", "SQL"],
  },
  {
    id: "cymotive-fullstack",
    role: "Full Stack Engineer",
    company: "CYMOTIVE Technologies",
    period: "2022 - 2023",
    summary:
      "Developed backend services, REST APIs and data-driven applications in TypeScript and Node.js, with Vue and React frontends and serverless functions on AWS and Azure.",
    highlight: "End-to-end features",
    bullets: [
      "Designed and implemented product features from frontend interfaces to backend APIs and serverless functions.",
      "Worked with AWS Lambda, Azure Functions and cloud services across AWS and Azure.",
      "Implemented database schemas, SQL queries and backend integrations with PostgreSQL.",
      "Contributed to CI/CD pipelines, infrastructure automation and deployment workflows.",
    ],
    stack: ["TypeScript", "Node.js", "Vue", "React", "PostgreSQL", "AWS", "Azure"],
  },
];

export type SideProject = {
  id: string;
  title: string;
  description: string;
  /**
   * Screenshot path, served from /public. Drop the image into
   * `public/projects/` and reference it as `/projects/<file>.png`.
   * Leave undefined to render the generated placeholder.
   */
  image?: string;
  links: { label: string; href: string }[];
  tags: string[];
  year?: string;
};

/**
 * Personal / open-source projects (GitHub, articles, experiments).
 * To add a screenshot:
 *   1. copy it to `public/projects/my-project.png`
 *   2. set `image: "/projects/my-project.png"` on the entry
 */
export const sideProjects: SideProject[] = [
  {
    id: "jagura",
    title: "Jagura",
    description:
      "An SQL interface for managing containers. Jagura behaves like any SQL database, plus a CONTAINER data type: start, stop, restart, pause or kill containers, read their metadata and run commands inside them - all from ordinary SELECT statements.",
    image: "/projects/jagura.png",
    links: [{ label: "GitHub", href: "https://github.com/doruyaar/Jagura" }],
    tags: ["Docker", "SQL", "Node.js", "TypeScript"],
    year: "2025",
  },
  {
    id: "openinsight",
    title: "OpenInsight",
    description:
      "An AI-based competitive intelligence platform. It tracks competitors, turns their product, pricing and security changes into insights, compares them side by side and ranks everything by impact automatically - with every claim traced back to its source.",
    image: "/projects/openinsight.png",
    links: [{ label: "GitHub", href: "https://github.com/doruyaar/OpenInsight" }],
    tags: ["AI Agents", "LLMs", "RAG", "Context Engineering", "Prompt Engineering"],
    year: "2026",
  },
  {
    id: "book-agent-skills",
    title: "Agent Skills from Books",
    description:
      "One agent skill per engineering book I've read - each distilling the book's rules and methodology into a single SKILL.md, so I can call a book into my agent while developing. Covers AI engineering and RAG, data-intensive systems, refactoring, pragmatic engineering and UX. Works in Cursor, Claude Code and anything else that speaks the open Agent Skills format.",
    image: "/projects/agent-skills-books.jpg",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/doruyaar/agent-skills-based-on-books-I-have-read",
      },
    ],
    tags: ["Agent Skills", "LLMs", "Context Engineering", "Cursor", "Claude Code"],
    year: "2026",
  },
  {
    id: "spark-python-article",
    title: "Should We Stop Using Python for Spark Jobs?",
    description:
      "An article I wrote after benchmarking PySpark against Scala: identical performance on the native DataFrame and SQL APIs, but up to 10× faster in Scala once heavy UDFs enter the picture - and the rewrite that finally stopped a streaming job from running its driver out of memory.",
    image: "/projects/spark-python-article.jpg",
    links: [
      {
        label: "Medium",
        href: "https://medium.com/@dor.yar/should-we-stop-using-python-for-spark-jobs-e4886dff8923",
      },
      { label: "All writing", href: "https://medium.com/@dor.yar" },
    ],
    tags: ["Writing", "Apache Spark", "PySpark", "Scala", "Benchmarking"],
    year: "2024",
  },
];

export type SkillGroup = { label: string; items: string[] };

/** Technical skills grouped as on the CV. */
export const skillGroups: SkillGroup[] = [
  { label: "Languages", items: ["TypeScript", "Python", "SQL", "JavaScript", "Scala"] },
  {
    label: "AI Engineering",
    items: ["LLMs", "AI Agents", "RAG", "Context Engineering", "Prompt Engineering", "LangChain", "LangGraph", "MLflow"],
  },
  {
    label: "Data & Big Data",
    items: ["Apache Spark", "Databricks", "Delta Lake", "Structured Streaming", "Kafka", "ETL", "Data Modeling"],
  },
  { label: "Backend & Frontend", items: ["Node.js", "REST APIs", "Vue", "React"] },
  {
    label: "Cloud",
    items: ["AWS S3", "Lambda", "EC2", "SQS", "Azure Event Hubs", "Blob Storage", "Azure Functions"],
  },
  { label: "Infra & DevOps", items: ["Terraform", "GitHub Actions", "Docker", "CI/CD"] },
  { label: "Databases", items: ["Databricks", "PostgreSQL", "Elasticsearch", "SQL optimization", "Schema design"] },
];

/** Flat list, for concepts that want a simple marquee/cloud. */
export const skills = Array.from(new Set(skillGroups.flatMap((g) => g.items)));

export const stats = [
  { value: "1000×", label: "faster than a human analyst - my AI agent" },
  { value: "1/100", label: "of the cost of a human analyst" },
  { value: "10k/s", label: "events ingested at peak, live streaming ETL" },
  { value: "100s TB", label: "processed every month" },
];
