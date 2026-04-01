export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const BASE_URL = API_BASE_URL; // FastAPI

export const parseJD = async (jd: string) => {
  const res = await fetch(`${BASE_URL}/jd/parse-jd`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jd }),
  });
  return res.json();
};

export const getScore = async (resume: any, jd: any) => {
  const res = await fetch(`${BASE_URL}/match/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, jd }),
  });
  return res.json();
};

export const chatEdit = async (resume: any, jd: any, message: string) => {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, jd, message }),
  });
  return res.json();
};

export const applyChanges = async ({
    html,
    skills,
    experience_updates,
  }: {
    html: string;
    skills: { name: string; level: "NEW" | "RELATED" | "STRONG" }[];
    experience_updates: { skill: string; bullet: string }[];
  }) => {
    const res = await fetch(`${BASE_URL}/resume/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        html,
        skills,
        experience_updates,
      }),
    });
  
    return res.json();
  };
export const getTemplates = async () => {
    const res = await fetch(`${BASE_URL}/resume/templates`);
    return res.json();
  };
  
  export const loadTemplate = async (name: string) => {
    const res = await fetch(`${BASE_URL}/resume/load/${name}`);
    return res.json();
  };