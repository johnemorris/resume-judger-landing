export const mockReport = {
  meta: {
    roleTitle: "Senior Software Engineer",
    seniorityLevel: "senior",
    overallFit: "strong",
    generatedAtISO: "2025-12-23T13:00:00.000Z",
  },
  scores: {
    overall: 86,
    breakdown: {
      frontendReactTypescript: 95,
      backendNodeApis: 82,
      awsCloud: 74,
      devopsCicdIac: 70,
      productUxB2c: 88,
      leadershipMentorship: 92,
      atsHygiene: 90,
    },
  },
  surgicalEdits: [
    {
      priority: "p0",
      where: "skills",
      editType: "add",
      instruction: "List specific AWS services you’ve used (if true).",
      before: "AWS",
      after: "AWS (Lambda, S3, DynamoDB)",
      truthfulness: "add-if-true",
    },
    {
      priority: "p0",
      where: "summary",
      editType: "replace",
      instruction:
        "Align summary to the job’s core signals: React/TS + Node + AWS + DevOps.",
      before:
        "Full-stack engineer with 10+ years building high-performance web apps.",
      after:
        "Senior engineer (10+ yrs) building React/TypeScript frontends and Node APIs, with cloud-native delivery and CI/CD focus.",
      truthfulness: "safe-rewrite",
    },
    {
      priority: "p1",
      where: "experience",
      editType: "add",
      instruction: "Add one impact/scale metric to your strongest recent role.",
      before:
        "Enhancing Next.js/React based DevSecOps Insights web application",
      after:
        "Enhancing Next.js/React based DevSecOps Insights web application used by internal teams; improved onboarding efficiency by 60%.",
      truthfulness: "safe-rewrite",
    },
  ],
  gapLearningPaths: [
    {
      gap: "Infrastructure as Code (Terraform / CloudFormation)",
      priority: "high",
      whyItMatters:
        "This role expects repeatable AWS infrastructure and deployment workflows.",
      fastTrack: {
        tutorial: {
          title: "Terraform vs CloudFormation (quick overview)",
          provider: "YouTube",
          time: "15–20 min",
          url: "https://www.youtube.com/results?search_query=terraform+vs+cloudformation",
          affiliate: false,
        },
        project: {
          title: "Deploy a Node API on AWS using Terraform",
          provider: "Guided tutorial",
          time: "2–3 hrs",
          url: "https://www.google.com/search?q=deploy+node+api+aws+terraform+tutorial",
          affiliate: false,
        },
        optionalDeepDive: {
          title: "Terraform on AWS for Developers",
          provider: "Udemy",
          time: "3–6 hrs",
          url: "https://www.udemy.com/courses/search/?q=terraform%20aws",
          affiliate: true,
        },
      },
    },
    {
      gap: "AWS ECS/EKS deployment experience",
      priority: "medium",
      whyItMatters:
        "Container deployment experience signals readiness for production scale.",
      fastTrack: {
        tutorial: {
          title: "ECS vs EKS explained",
          provider: "YouTube",
          time: "10–20 min",
          url: "https://www.youtube.com/results?search_query=ecs+vs+eks",
          affiliate: false,
        },
        project: {
          title: "Deploy a containerized Node service to ECS",
          provider: "Workshop",
          time: "2–4 hrs",
          url: "https://www.google.com/search?q=aws+ecs+workshop+node",
          affiliate: false,
        },
        optionalDeepDive: {
          title: "AWS ECS/EKS in Practice",
          provider: "Pluralsight",
          time: "3–6 hrs",
          url: "https://www.pluralsight.com/search?q=ECS%20EKS",
          affiliate: false,
        },
      },
    },
    {
      gap: "TaaS",
      priority: "high",
      whyItMatters:
        "This role expects repeatable AWS infrastructure and deployment workflows.",
      fastTrack: {
        tutorial: {
          title: "Terraform vs CloudFormation (quick overview)",
          provider: "YouTube",
          time: "15–20 min",
          url: "https://www.youtube.com/results?search_query=terraform+vs+cloudformation",
          affiliate: false,
        },
        project: {
          title: "Deploy a Node API on AWS using Terraform",
          provider: "Guided tutorial",
          time: "2–3 hrs",
          url: "https://www.google.com/search?q=deploy+node+api+aws+terraform+tutorial",
          affiliate: false,
        },
        optionalDeepDive: {
          title: "Terraform on AWS for Developers",
          provider: "Udemy",
          time: "3–6 hrs",
          url: "https://www.udemy.com/courses/search/?q=terraform%20aws",
          affiliate: true,
        },
      },
    },
  ],
  requirementsCoverage: {
    required: [
      {
        requirement: "React + TypeScript production experience",
        status: "met",
        evidenceQuote: "Enhancing React, Node.js, JavaScript, TypeScript code",
        whatWouldMakeItMet: "",
      },
      {
        requirement: "AWS (Lambda, ECS/EKS, DynamoDB, S3)",
        status: "partial",
        evidenceQuote: "Cloud & DevOps: AWS, IBM Cloud, Azure",
        whatWouldMakeItMet:
          "List specific AWS services used (Lambda/ECS/EKS/DynamoDB/S3) with one bullet of evidence.",
      },
    ],
  },
} as const;
