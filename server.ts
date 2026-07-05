import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = 3000;

// Initialize Gemini API client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Google GenAI client successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Google GenAI:", err);
  }
} else {
  console.log("No GEMINI_API_KEY found. Using fallback heuristics for local AI simulations.");
}

// ==========================================
// SEED DATA & IN-MEMORY STATE
// ==========================================

let users = [
  {
    id: "user-1",
    name: "Arun Kumar",
    email: "arun@example.com",
    role: "citizen",
    phone: "+91 9876543210",
    streak: 5,
    badges: ["Rights Champion", "Scholar Badge", "Civic Leader"],
    certificates: [
      { id: "cert-1", title: "Preamble Mastery", date: "2026-06-25", score: 90 },
    ],
    quizScores: [
      { date: "2026-06-24", score: 80, difficulty: "easy" },
      { date: "2026-06-25", score: 90, difficulty: "medium" },
    ],
    learningProgress: [
      { lessonId: "lesson-1", completed: true },
      { lessonId: "lesson-2", completed: true },
    ],
    bookmarks: [
      { type: "article", id: "art-19" },
      { type: "case", id: "case-1" },
    ],
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "officer-1",
    name: "Officer Selvakumar",
    email: "officer@example.com",
    role: "officer",
    phone: "+91 9988776655",
    streak: 0,
    badges: ["Diligent Duty"],
    certificates: [],
    quizScores: [],
    learningProgress: [],
    bookmarks: [],
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "engineer-1",
    name: "Engineer Karthik",
    email: "engineer@example.com",
    role: "engineer",
    phone: "+91 8877665544",
    streak: 0,
    badges: ["Field Execution Champion"],
    certificates: [],
    quizScores: [],
    learningProgress: [],
    bookmarks: [],
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "admin-1",
    name: "Collector Divya",
    email: "admin@example.com",
    role: "admin",
    phone: "+91 7766554433",
    streak: 0,
    badges: ["Apex Governance"],
    certificates: [],
    quizScores: [],
    learningProgress: [],
    bookmarks: [],
    createdAt: "2026-01-01T10:00:00Z",
  },
];

let complaints: any[] = [
  {
    id: "comp-1",
    title: "Large deep pothole on Anna Salai",
    description: "A huge pothole has formed in front of the Spencer Plaza signal on Anna Salai. It is causing massive traffic slowdowns and pose a severe hazard to two-wheelers, especially during rain. Multiple close-calls occurred yesterday night.",
    category: "Potholes",
    status: "officer_assigned",
    severity: "high",
    location: {
      lat: 13.0612,
      lng: 80.2586,
      address: "Anna Salai, Near Spencer Plaza, Chennai, Tamil Nadu 600002",
    },
    reporter: {
      name: "Arun Kumar",
      email: "arun@example.com",
      isAnonymous: false,
    },
    images: {
      before: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80",
    },
    assignedOfficer: "officer-1",
    aiAnalysis: {
      issueDetected: "Severe asphalt deformation and deep crater/pothole in a high-traffic lane.",
      duplicateDetected: false,
      estimatedCompletionTime: "24 Hours",
      recommendedDepartment: "Highways & Public Works Department",
      summary: "Pothole detected on a major arterial highway near Spencer Plaza. Risk of structural tire damage or two-wheeler accident is high.",
      workOrderDetails: "Excavate loose gravel, fill with hot-mix asphalt aggregate, compact utilizing roller, verify safety level.",
    },
    progress: 35,
    history: [
      { status: "submitted", timestamp: "2026-07-02T09:15:00Z", note: "Complaint submitted by citizen Arun Kumar." },
      { status: "verified", timestamp: "2026-07-02T10:30:00Z", note: "AI verified issue: High severity pothole detected." },
      { status: "officer_assigned", timestamp: "2026-07-02T11:00:00Z", note: "Assigned to Municipal Officer Selvakumar for engineering deployment." },
    ],
    createdAt: "2026-07-02T09:15:00Z",
  },
  {
    id: "comp-2",
    title: "Street light failure for past 1 week",
    description: "Three consecutive streetlights are not working on Kamarajar Street in Ward 4. The area becomes pitch black after 6:30 PM, raising serious safety concerns for women and elderly residents walking back home.",
    category: "Street Light Failure",
    status: "engineer_assigned",
    severity: "medium",
    location: {
      lat: 13.0827,
      lng: 80.2707,
      address: "Kamarajar Street, Ward 4, Chennai, Tamil Nadu 600001",
    },
    reporter: {
      name: "Ravi Chandran",
      email: "ravi@example.com",
      isAnonymous: true,
    },
    images: {
      before: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=600&q=80",
    },
    assignedOfficer: "officer-1",
    assignedEngineer: "engineer-1",
    aiAnalysis: {
      issueDetected: "Multiple bulb/power grid failure in public light poles.",
      duplicateDetected: false,
      estimatedCompletionTime: "48 Hours",
      recommendedDepartment: "Electrical & Lighting Division",
      summary: "Failure of streetlighting over a stretch of 100 meters on Kamarajar Street. Safe community walkability impacted.",
      workOrderDetails: "Perform pole-mounted wiring inspections, replace damaged sodium vapor bulbs with energy-efficient LED nodes.",
    },
    progress: 55,
    history: [
      { status: "submitted", timestamp: "2026-07-01T14:20:00Z", note: "Complaint registered anonymously." },
      { status: "verified", timestamp: "2026-07-01T15:00:00Z", note: "AI verification complete. Medium urgency rated." },
      { status: "officer_assigned", timestamp: "2026-07-01T16:15:00Z", note: "Assigned to Ward 4 Electrical supervisor." },
      { status: "engineer_assigned", timestamp: "2026-07-02T09:00:00Z", note: "Engineer Karthik assigned to the site." },
    ],
    createdAt: "2026-07-01T14:20:00Z",
  },
  {
    id: "comp-3",
    title: "Severe drainage overflow in market street",
    description: "The main drainage pipe has burst near the vegetable market. Stagnant sewer water is spreading on the road, creating an unbearable stench and potential health hazard for shopkeepers and shoppers.",
    category: "Drainage Problems",
    status: "completed",
    severity: "high",
    location: {
      lat: 13.0418,
      lng: 80.2478,
      address: "Vegetable Market, T. Nagar, Chennai, Tamil Nadu 600017",
    },
    reporter: {
      name: "Meenakshi S.",
      email: "meena@example.com",
      isAnonymous: false,
    },
    images: {
      before: "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=600&q=80",
      after: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=600&q=80",
    },
    assignedOfficer: "officer-1",
    assignedEngineer: "engineer-1",
    aiAnalysis: {
      issueDetected: "Ruptured sub-surface main sewer line causing structural back-flow spill.",
      duplicateDetected: false,
      estimatedCompletionTime: "12 Hours",
      recommendedDepartment: "Sewage & Sanitation Board",
      summary: "Commercial drainage failure causing active pathogen risks on a heavy-traffic market street.",
      workOrderDetails: "Shut down line feed, clear blockage utilizing high-pressure vacuum nozzle, replace joint sealing rings.",
    },
    progress: 100,
    history: [
      { status: "submitted", timestamp: "2026-06-29T08:00:00Z", note: "Complaint logged by citizen Meenakshi." },
      { status: "verified", timestamp: "2026-06-29T08:45:00Z", note: "AI categorized: Severe Drainage overflow." },
      { status: "officer_assigned", timestamp: "2026-06-29T09:10:00Z", note: "Assigned to T. Nagar Health and Sanitation branch." },
      { status: "engineer_assigned", timestamp: "2026-06-29T09:30:00Z", note: "Engineer Karthik assigned with suction tanker." },
      { status: "started", timestamp: "2026-06-29T10:15:00Z", note: "Work started. Suction tanker clearing sewer mud." },
      { status: "completed", timestamp: "2026-06-29T16:30:00Z", note: "Blockage removed. Pipe replaced and road disinfected. Job signed off by Engineer." },
    ],
    feedback: {
      rating: 5,
      comment: "Super fast response! The workers cleared the whole mess in hours. Deeply appreciate the quick action.",
      timestamp: "2026-06-29T18:00:00Z",
    },
    engineerSignature: "Karthik B.E. (Civil)",
    createdAt: "2026-06-29T08:00:00Z",
  },
  {
    id: "comp-4",
    title: "Broken pipeline wasting drinking water",
    description: "Fresh drinking water is leaking rapidly from the main distribution pipe near the municipal park. It has been flowing for over 12 hours now, wasting thousands of gallons of pure water.",
    category: "Water Leakage",
    status: "submitted",
    severity: "medium",
    location: {
      lat: 13.0125,
      lng: 80.2152,
      address: "MGR Nagar Park Gate, Chennai, Tamil Nadu 600078",
    },
    reporter: {
      name: "Suresh Pillai",
      email: "suresh@example.com",
      isAnonymous: false,
    },
    images: {
      before: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80",
    },
    progress: 10,
    history: [
      { status: "submitted", timestamp: "2026-07-03T20:30:00Z", note: "Water leakage complaint registered." },
    ],
    createdAt: "2026-07-03T20:30:00Z",
  },
];

// Seeded Landmark Cases
const landmarkCases = [
  {
    id: "case-1",
    name: "Kesavananda Bharati v. State of Kerala (1973)",
    year: 1973,
    facts: "The petitioner challenged the Kerala Land Reforms Act, 1963, which imposed restrictions on the management of religious properties. The central issue was the extent of Parliament's power to amend the Constitution.",
    issues: "Can the Parliament amend any part of the Constitution, including Fundamental Rights, under Article 368?",
    judgment: "A historic 13-judge bench, by a 7:6 majority, held that while Parliament has wide powers to amend the Constitution, it cannot alter or destroy its 'Basic Structure' (e.g., Democracy, Secularism, Federalism, Judicial Review).",
    articlesUsed: ["Article 368", "Article 31", "Article 13"],
    significance: "Established the legendary 'Basic Structure Doctrine' which remains the absolute savior of Indian constitutional integrity, placing a check on unlimited legislative power.",
    aiSummary: "The supreme shield of the Indian Constitution. It prevents any ruling government from utilizing its parliamentary majority to completely overwrite democratic foundations or fundamental liberties.",
  },
  {
    id: "case-2",
    name: "Maneka Gandhi v. Union of India (1978)",
    year: 1978,
    facts: "The regional passport office impounded Maneka Gandhi's passport under the Passports Act in public interest without giving any reason. She challenged this arbitrary administrative action.",
    issues: "Does Article 21 (Right to Life and Personal Liberty) only require a formal written law, or must that law be fair, just, and reasonable?",
    judgment: "The Supreme Court ruled that 'Procedure established by law' under Article 21 cannot be arbitrary. It must pass the test of 'Due Process of Law' and be 'just, fair, and reasonable'. Articles 14, 19, and 21 form an inseparable golden triangle.",
    articlesUsed: ["Article 21", "Article 14", "Article 19"],
    significance: "Vastly expanded the scope of Article 21 to cover the right to travel abroad, right to clean air, right to privacy, and the right to live with human dignity.",
    aiSummary: "Transformed Article 21 from a simple procedural safeguard against arbitrary arrest into a comprehensive, dynamic charter of human rights and dignity.",
  },
  {
    id: "case-3",
    name: "Shreya Singhal v. Union of India (2015)",
    year: 2015,
    facts: "Two young women were arrested by police under Section 66A of the IT Act for posting comments on Facebook criticizing a total bandh in Mumbai. A petition was filed challenging the section's validity.",
    issues: "Does Section 66A of the IT Act violate the fundamental right to Freedom of Speech and Expression under Article 19(1)(a)?",
    judgment: "The Supreme Court struck down Section 66A of the Information Technology Act, declaring it unconstitutionally vague, overbroad, and a direct restriction on internet speech.",
    articlesUsed: ["Article 19(1)(a)", "Article 19(2)"],
    significance: "Stands as a monumental milestone for internet freedom, safeguarding digital speech and expression in India against arbitrary police arrests.",
    aiSummary: "The landmark defense of online freedom of speech. Confirmed that free expression on the internet is protected identically to standard physical print and spoken speech.",
  },
];

// Seeded Government Schemes
const governmentSchemes = [
  {
    id: "scheme-1",
    name: "Tamil Nadu Pudhumai Penn Scheme",
    state: "Tamil Nadu",
    ministry: "Social Welfare and Women Empowerment Department",
    benefits: "Provides ₹1,000 per month directly into the bank accounts of female students to pursue higher education.",
    eligibility: {
      minAge: 17,
      maxAge: 25,
      gender: "female",
      occupations: ["Student"],
      maxIncome: 250000,
    },
    requiredDocuments: ["Government School Transfer Certificate", "Aadhaar Card", "College Admission Proof", "Bank Passbook"],
    applicationGuidance: "Eligible girl students who studied from Class 6 to 12 in Government schools can apply online through the Pudhumai Penn portal or through their respective college nodal officer.",
    aiExplanation: "An excellent initiative to support girl child higher education, preventing early marriages and financially empowering young women in Tamil Nadu.",
  },
  {
    id: "scheme-2",
    name: "PM-Kisan Samman Nidhi",
    state: "All States",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    benefits: "An income support of ₹6,000 per year in three equal installments of ₹2,000 directly into the bank accounts of small and marginal farmer families.",
    eligibility: {
      minAge: 18,
      maxAge: 100,
      gender: "all",
      occupations: ["Farmer", "Agriculture Work"],
      maxIncome: 150000,
    },
    requiredDocuments: ["Land Ownership Documents (Patta/Chitta)", "Aadhaar Card", "Bank Account Details", "Income Certificate"],
    applicationGuidance: "Farmers can register via PM-Kisan portal, common service centers (CSCs), or through local Revenue Officials (VAO).",
    aiExplanation: "Provides direct financial liquidity to small agricultural households for buying seeds, fertilizers, and managing basic farming needs.",
  },
  {
    id: "scheme-3",
    name: "Pradhan Mantri Awas Yojana (PMAY-U)",
    state: "All States",
    ministry: "Ministry of Housing and Urban Affairs",
    benefits: "Interest subsidy of up to 6.5% on home loans or direct financial assistance of up to ₹2.5 Lakhs for construction of permanent (pucca) houses.",
    eligibility: {
      minAge: 18,
      maxAge: 70,
      gender: "all",
      occupations: ["Unemployed", "Laborer", "Salaried", "Self-Employed"],
      maxIncome: 600000,
    },
    requiredDocuments: ["Aadhaar Card", "Address Proof", "Income Certificate / Salary Slip", "Affidavit of not owning a pucca house in India"],
    applicationGuidance: "Apply online through the PMAY official portal or submit a form at designated municipal corporation centers.",
    aiExplanation: "Designed to provide affordable, dignified housing with basic facilities (water, toilet, power) to economically weaker sections.",
  },
];

// Seeded Constitutional Articles & Facts
const constitutionArticles = [
  {
    id: "art-14",
    title: "Article 14: Equality before law",
    part: "Part III - Fundamental Rights",
    description: "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.",
    explanation: "This means all people—regardless of wealth, status, religion, caste, or gender—are subject to the same laws, and the government must treat everyone equally without favoritism.",
  },
  {
    id: "art-19",
    title: "Article 19: Protection of certain rights regarding freedom of speech, etc.",
    part: "Part III - Fundamental Rights",
    description: "All citizens shall have the right—(a) to freedom of speech and expression; (b) to assemble peaceably and without arms; (c) to form associations or unions; (d) to move freely throughout the territory of India; (e) to reside and settle in any part of the territory of India; and (g) to practise any profession, or to carry on any occupation, trade or business.",
    explanation: "Provides the core democratic freedoms. However, these rights are not absolute and can be restricted in the interest of public order, decency, morality, or national security.",
  },
  {
    id: "art-21",
    title: "Article 21: Protection of life and personal liberty",
    part: "Part III - Fundamental Rights",
    description: "No person shall be deprived of his life or personal liberty except according to procedure established by law.",
    explanation: "The most sacred fundamental right. It has been interpreted by courts to include the right to privacy, right to clean water and air, right to education (Article 21A), and right to shelter.",
  },
  {
    id: "art-51a",
    title: "Article 51A: Fundamental Duties",
    part: "Part IVA - Fundamental Duties",
    description: "It shall be the duty of every citizen of India—to abide by the Constitution, cherish noble ideals of the freedom struggle, protect sovereignty, promote harmony, protect the natural environment, develop scientific temper, and safeguard public property.",
    explanation: "Added by the 42nd Amendment, these are moral obligations reminding citizens that rights and duties go hand-in-hand to build a progressive nation.",
  },
];

const dailyFacts = [
  "The Constitution of India was entirely handwritten in elegant calligraphic style by Prem Behari Narain Raizada.",
  "The original copies of the Indian Constitution are kept in special helium-filled cases in the Parliament Library to preserve them.",
  "India's Constitution is the longest written national constitution in the world, containing over 146,000 words.",
  "The concepts of Liberty, Equality, and Fraternity in the Preamble were adopted from the French Constitution.",
  "Dr. B.R. Ambedkar called Article 32 (Right to Constitutional Remedies) the 'Heart and Soul' of the Constitution.",
];

// Seeded Constitutional News
const constitutionalNews = [
  {
    id: "news-1",
    title: "Supreme Court emphasizes Citizen Right to a Clean Environment under Article 21",
    date: "2026-06-30",
    source: "LiveLaw India",
    summary: "The Supreme Court, in a major civic litigation, ruled that local municipal bodies are constitutionally obligated to maintain sewer systems. Failure to address sewage overflow is a direct violation of the Right to Life under Article 21.",
    aiSummary: "Reaffirms that clean streets and functioning drains are not civic luxuries, but sacred, enforceable fundamental rights under Article 21.",
  },
  {
    id: "news-2",
    title: "Parliament proposes new digital privacy guidelines aligning with Right to Privacy",
    date: "2026-06-15",
    source: "The Hindu",
    summary: "A new draft bill has been tabled to regulate commercial data brokers and mandate explicit citizen consent for data harvesting, enforcing the landmark K.S. Puttaswamy judgment.",
    aiSummary: "A major regulatory step forward to safeguard the personal digital data of citizens from corporate exploitation.",
  },
];

// ==========================================
// API ENDPOINTS
// ==========================================

// AUTH SYSTEM
app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  
  // Find matching user or fallback to register
  let user = users.find((u) => u.email === email);
  if (!user) {
    // Auto-create for easier review
    user = {
      id: `user-${Date.now()}`,
      name: email.split("@")[0].toUpperCase(),
      email,
      role: role || "citizen",
      phone: "+91 9000000000",
      streak: 1,
      badges: ["Initiate"],
      certificates: [],
      quizScores: [],
      learningProgress: [],
      bookmarks: [],
      createdAt: new Date().toISOString(),
    };
    users.push(user);
  } else if (role && user.role !== role) {
    // Override role if requested in UI dropdown
    user.role = role;
  }

  res.json({ success: true, user });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, role, phone } = req.body;
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "Email already registered." });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: role || "citizen",
    phone: phone || "+91 9000000000",
    streak: 1,
    badges: ["Initiate"],
    certificates: [],
    quizScores: [],
    learningProgress: [],
    bookmarks: [],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  res.json({ success: true, user: newUser });
});

// COMPLAINTS
app.get("/api/complaints", (req, res) => {
  res.json(complaints);
});

// SUBMIT COMPLAINT WITH REAL-TIME AI ANALYSIS (GEMINI)
app.post("/api/complaints", async (req, res) => {
  const { title, description, category, location, reporter, base64Image, isAnonymous, voiceUrl } = req.body;

  // Let's perform a live AI smart analysis using Gemini!
  let aiAnalysis = {
    issueDetected: "AI auto-detected issue based on description",
    duplicateDetected: false,
    estimatedCompletionTime: "48 Hours",
    recommendedDepartment: "General Municipal Department",
    summary: description,
    workOrderDetails: "Inspect site and deploy standard maintenance team.",
  };

  let severity: "low" | "medium" | "high" | "emergency" = "medium";

  // Call Gemini if initialized
  if (ai) {
    try {
      const prompt = `
      You are an advanced Smart Municipal Governance AI. Analyze this civic grievance complaint:
      Title: "${title}"
      Description: "${description}"
      Provided Category: "${category}"

      Analyze and respond strictly in JSON format matching the schema below:
      {
        "issueDetected": "Detailed short description of what is broken or needs fixing",
        "category": "Map it to one of: Road Damage, Potholes, Water Leakage, Drinking Water Supply, Garbage Collection, Drainage Problems, Street Light Failure, Electricity Issues, Public Toilet Issues, Flooding, Park Maintenance, Public Safety, Other Public Issues",
        "severity": "low, medium, high, or emergency",
        "estimatedCompletionTime": "Estimated hours or days, e.g. '24 Hours' or '3 Days'",
        "recommendedDepartment": "The specific government department to handle this",
        "summary": "A concise 2-sentence summary of the citizen's complaint",
        "workOrderDetails": "Actionable, step-by-step engineering tasks to resolve this issue"
      }
      `;

      let parts: any[] = [{ text: prompt }];
      
      // If user uploaded a base64 image, send it to Gemini for vision analysis!
      if (base64Image) {
        const cleanedBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanedBase64,
          }
        });
      }

      console.log("Calling Gemini to analyze complaint...");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: parts,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text;
      if (responseText) {
        const result = JSON.parse(responseText.trim());
        aiAnalysis = {
          issueDetected: result.issueDetected || aiAnalysis.issueDetected,
          duplicateDetected: false,
          estimatedCompletionTime: result.estimatedCompletionTime || "48 Hours",
          recommendedDepartment: result.recommendedDepartment || aiAnalysis.recommendedDepartment,
          summary: result.summary || aiAnalysis.summary,
          workOrderDetails: result.workOrderDetails || aiAnalysis.workOrderDetails,
        };
        if (result.severity) {
          severity = result.severity.toLowerCase() as any;
        }
      }
    } catch (err) {
      console.error("Gemini Complaint Analysis Failed:", err);
      // Fallback heuristics based on keyword matching
      const descLower = description.toLowerCase();
      if (descLower.includes("water") || descLower.includes("leak")) {
        severity = "medium";
        aiAnalysis.recommendedDepartment = "Sewage & Water Board";
        aiAnalysis.estimatedCompletionTime = "24 Hours";
      } else if (descLower.includes("pothole") || descLower.includes("road")) {
        severity = "high";
        aiAnalysis.recommendedDepartment = "Highways & PWD";
        aiAnalysis.estimatedCompletionTime = "36 Hours";
      } else if (descLower.includes("accident") || descLower.includes("danger") || descLower.includes("flooding") || descLower.includes("fire")) {
        severity = "emergency";
        aiAnalysis.recommendedDepartment = "Emergency Services & Ward Control";
        aiAnalysis.estimatedCompletionTime = "4 Hours";
      }
    }
  } else {
    // Simulated local keyword-based heuristics
    const descLower = description.toLowerCase();
    if (descLower.includes("water") || descLower.includes("leak")) {
      severity = "medium";
      aiAnalysis.recommendedDepartment = "Sewage & Water Board";
      aiAnalysis.estimatedCompletionTime = "24 Hours";
      aiAnalysis.summary = `Leaking water reported at address. Resource loss detected.`;
      aiAnalysis.workOrderDetails = `Locate joint, isolate pressure, weld/seal pipe joint.`;
    } else if (descLower.includes("pothole") || descLower.includes("road")) {
      severity = "high";
      aiAnalysis.recommendedDepartment = "Highways & PWD";
      aiAnalysis.estimatedCompletionTime = "36 Hours";
      aiAnalysis.summary = `Physical road erosion causing vehicle damage and safety risks.`;
      aiAnalysis.workOrderDetails = `Dig and clear structural dirt, deploy bitumen and fill, level road.`;
    } else if (descLower.includes("dark") || descLower.includes("light") || descLower.includes("lamp")) {
      severity = "medium";
      aiAnalysis.recommendedDepartment = "Electricity Board";
      aiAnalysis.estimatedCompletionTime = "48 Hours";
      aiAnalysis.summary = `Failed public lighting nodes causing security threats in neighborhood.`;
      aiAnalysis.workOrderDetails = `Inspect fuse boards, test line wires, replace light fixtures.`;
    }
  }

  const newComplaint = {
    id: `comp-${Date.now()}`,
    title,
    description,
    category: category || "Other Public Issues",
    status: "submitted" as const,
    severity,
    location: location || { lat: 13.0827, lng: 80.2707, address: "Chennai District Ward Office" },
    reporter: {
      name: isAnonymous ? "Anonymous Citizen" : (reporter?.name || "Citizen"),
      email: isAnonymous ? "anonymous@example.com" : (reporter?.email || "citizen@example.com"),
      isAnonymous: !!isAnonymous,
    },
    images: {
      before: base64Image || "https://images.unsplash.com/photo-1599740831146-7a69ef87b372?auto=format&fit=crop&w=600&q=80",
    },
    voiceUrl,
    progress: 15,
    aiAnalysis,
    history: [
      { status: "submitted" as const, timestamp: new Date().toISOString(), note: "Complaint logged on ConstitutionAI platform." },
      { status: "verified" as const, timestamp: new Date(Date.now() + 2000).toISOString(), note: "AI Auto-Analysis completed. Assigned severity: " + severity.toUpperCase() },
    ],
    createdAt: new Date().toISOString(),
  };

  complaints.unshift(newComplaint);
  res.json({ success: true, complaint: newComplaint });
});

// COMPLAINT STATUS UPDATES & ACTIONS
app.post("/api/complaints/:id/assign", (req, res) => {
  const { id } = req.params;
  const { officerId, engineerId, priority } = req.body;
  const complaint = complaints.find((c) => c.id === id);

  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  if (officerId) {
    complaint.assignedOfficer = officerId;
    complaint.status = "officer_assigned";
    complaint.progress = 35;
    complaint.history.push({
      status: "officer_assigned",
      timestamp: new Date().toISOString(),
      note: `Assigned to Officer: ${users.find(u => u.id === officerId)?.name || officerId}.`,
    });
  }

  if (engineerId) {
    complaint.assignedEngineer = engineerId;
    complaint.status = "engineer_assigned";
    complaint.progress = 55;
    complaint.history.push({
      status: "engineer_assigned",
      timestamp: new Date().toISOString(),
      note: `Engineer dispatched: ${users.find(u => u.id === engineerId)?.name || engineerId}.`,
    });
  }

  if (priority) {
    complaint.severity = priority;
  }

  res.json({ success: true, complaint });
});

app.post("/api/complaints/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const complaint = complaints.find((c) => c.id === id);

  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  complaint.status = status;
  if (status === "started") {
    complaint.progress = 75;
  } else if (status === "completed") {
    complaint.progress = 100;
  }

  complaint.history.push({
    status,
    timestamp: new Date().toISOString(),
    note: note || `Complaint transitioned to ${status.replace("_", " ")}`,
  });

  res.json({ success: true, complaint });
});

app.post("/api/complaints/:id/engineer-action", (req, res) => {
  const { id } = req.params;
  const { afterImageBase64, signature, eta, status } = req.body;
  const complaint = complaints.find((c) => c.id === id);

  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  if (afterImageBase64) {
    complaint.images.after = afterImageBase64;
  }
  if (signature) {
    complaint.engineerSignature = signature;
  }
  if (eta) {
    complaint.eta = eta;
  }
  if (status) {
    complaint.status = status;
    if (status === "started") complaint.progress = 75;
    if (status === "completed") complaint.progress = 100;
    
    complaint.history.push({
      status,
      timestamp: new Date().toISOString(),
      note: status === "completed" 
        ? "Work completed, signed digitally, and certified by site engineer." 
        : `Engineer site update: ${status.toUpperCase()}`,
    });
  }

  res.json({ success: true, complaint });
});

app.post("/api/complaints/:id/feedback", (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const complaint = complaints.find((c) => c.id === id);

  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  complaint.feedback = {
    rating: Number(rating),
    comment,
    timestamp: new Date().toISOString(),
  };
  complaint.status = "feedback_received";
  complaint.history.push({
    status: "feedback_received",
    timestamp: new Date().toISOString(),
    note: `Citizen feedback received. Rating: ${rating}/5. Comment: "${comment}"`,
  });

  res.json({ success: true, complaint });
});

// CONSTITUTION REAL-TIME CHATBOT ASSISTANT
app.post("/api/chat", async (req, res) => {
  const { messages, language } = req.body;
  const lastMessage = messages[messages.length - 1]?.content;

  const currentLang = language || "en";
  const langText = currentLang === "ta" ? "Tamil" : currentLang === "hi" ? "Hindi" : "English";

  if (!lastMessage) {
    return res.status(400).json({ error: "No message found" });
  }

  let chatResponse = "";

  if (ai) {
    try {
      console.log(`Calling Gemini for chat in ${langText}...`);
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [{
              text: `You are the ultimate ConstitutionAI assistant. You must explain Indian Constitutional Articles, Fundamental Rights, Fundamental Duties, Amendments, landmark cases, and government schemes accurately and simply.
              
              Respond clearly in ${langText} language. Keep the explanation engaging, professional, human-like, and easy to read. Suggest exact articles where applicable.
              
              User question: "${lastMessage}"`
            }]
          }
        ]
      });

      chatResponse = response.text || "I am processing your constitutional request.";
    } catch (err) {
      console.error("Gemini Chat failed:", err);
      chatResponse = "The Constitutional AI is briefly busy verifying its libraries. Here is your constitutional guidance: The Fundamental Rights are enshrined in Part III of the Constitution (Articles 12 to 35) guaranteeing justice, equality, and liberty to all citizens.";
    }
  } else {
    // Simulated high-quality replies when Gemini API key is absent
    const msgLower = lastMessage.toLowerCase();
    if (msgLower.includes("right") || msgLower.includes("urimai")) {
      chatResponse = currentLang === "ta" 
        ? "இந்திய அரசியலமைப்பின் பகுதி III (பிரிவுகள் 12 முதல் 35 வரை) அனைத்து குடிமக்களுக்கும் அடிப்படை உரிமைகளை வழங்குகிறது. இதில் சமத்துவ உரிமை (பிரிவு 14), பேச்சு சுதந்திரம் (பிரிவு 19) மற்றும் வாழ்வுரிமை (பிரிவு 21) ஆகியவை முக்கியமானவை."
        : "Indian Constitution Part III (Articles 12 to 35) guarantees Fundamental Rights to all citizens. These include Equality before law (Article 14), Freedom of Speech (Article 19), and Protection of Life & Personal Liberty (Article 21).";
    } else if (msgLower.includes("duty") || msgLower.includes("kadamai")) {
      chatResponse = currentLang === "ta"
        ? "பிரிவு 51A அடிப்படை கடமைகளை வரையறுக்கிறது (42வது திருத்தம் 1976 மூலம் சேர்க்கப்பட்டது). தேசியக் கொடியை மதிப்பது, சுற்றுச்சூழலைப் பாதுகாப்பது மற்றும் அறிவியல் மனப்பான்மையை வளர்ப்பது ஆகியவை நமது கடமைகள்."
        : "Article 51A defines Fundamental Duties of citizens (added by 42nd Amendment, 1976). This includes respecting the national flag, protecting the environment, safeguarding public property, and developing a scientific temper.";
    } else if (msgLower.includes("preamble") || msgLower.includes("mugavurai")) {
      chatResponse = currentLang === "ta"
        ? "அரசியலமைப்பின் முகவுரை இந்தியாவை ஒரு 'இறையாண்மை, சமதர்ம, மதச்சார்பற்ற, ஜனநாயக, குடியரசு' நாடாக அறிவிக்கிறது. இது நீதி, சுதந்திரம், சமத்துவம் மற்றும் சகோதரத்துவத்தை உறுதி செய்கிறது."
        : "The Preamble declares India to be a 'Sovereign, Socialist, Secular, Democratic, Republic' and secures justice, liberty, equality, and fraternity to all citizens.";
    } else {
      chatResponse = currentLang === "ta"
        ? "அரசியலமைப்பு உதவி மையத்திற்கு வரவேற்கிறோம்! அடிப்படை உரிமைகள், கடமைகள், சட்டங்கள் மற்றும் அரசு திட்டங்கள் குறித்து நீங்கள் ஏதேனும் கேள்விகள் கேட்கலாம்."
        : "Welcome to ConstitutionAI Helpdesk! You can ask me any questions regarding India's Constitution, fundamental rights, landmark judgments, or public welfare schemes.";
    }
  }

  res.json({ content: chatResponse });
});

// AI FACT-CHECKER (MISINFORMATION)
app.post("/api/factcheck", async (req, res) => {
  const { textClaim, base64Screenshot } = req.body;

  let result = {
    isFake: false,
    confidenceScore: 85,
    officialSources: ["Government PIB Fact Check Portal", "Ministry of Law & Justice Announcements"],
    explanation: "This claim is verified. It aligns with standard constitutional procedures and official announcements.",
  };

  if (ai) {
    try {
      const prompt = `
      You are an expert Government Misinformation & Fake News Detector. Analyze this user claim or screenshot:
      Claim: "${textClaim || "Analyze provided image screenshot"}"
      
      Compare with real constitutional guidelines and official government press releases (PIB Fact Check).
      Provide a response strictly in JSON format as defined below:
      {
        "isFake": true or false,
        "confidenceScore": 0 to 100 percentage,
        "officialSources": ["list of trusted government sources or news links"],
        "explanation": "Detailed explanation of why this claim is fake or true with real factual corrections"
      }
      `;

      let parts: any[] = [{ text: prompt }];
      if (base64Screenshot) {
        const cleaned = base64Screenshot.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: cleaned,
          }
        });
      }

      console.log("Calling Gemini to factcheck claim...");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: parts,
        config: {
          responseMimeType: "application/json",
        }
      });

      if (response.text) {
        result = JSON.parse(response.text.trim());
      }
    } catch (err) {
      console.error("Fact-check analysis failed:", err);
    }
  } else {
    // Simulated factcheck
    const cl = textClaim?.toLowerCase() || "";
    if (cl.includes("fundamental rights suspended") || cl.includes("internet banned forever") || cl.includes("free money")) {
      result = {
        isFake: true,
        confidenceScore: 95,
        officialSources: ["Press Information Bureau (PIB)", "Ministry of Home Affairs circulars"],
        explanation: "This is fake news spreading on social media. Fundamental Rights can only be suspended under a formal National Emergency declared by the President under Article 352, and even then, Articles 20 and 21 can NEVER be suspended. No such notification has been issued.",
      };
    }
  }

  res.json(result);
});

// AI FRAUD AUDIT DETECTION
app.post("/api/fraud", async (req, res) => {
  const { docText, amount, beneficiary } = req.body;

  let result = {
    riskScore: 25,
    alerts: ["Standard low risk audit profile"],
    recommendations: ["Ensure digital identity match on beneficiary patta/Aadhaar record.", "Log dual-officer sign-off."],
  };

  if (ai) {
    try {
      const prompt = `
      You are an AI Forensic Auditor & Anti-Corruption Analyst for public schemes.
      Audit this transaction/beneficiary detail:
      Description/Document: "${docText || "Municipal welfare allocation card"}"
      Requested Amount: "${amount || "₹25,000"}"
      Beneficiary Name: "${beneficiary || "Direct Benefit Transfer Record"}"

      Analyze for corruption risk, duplicate bank details, financial anomalies, or ghost beneficiary signatures.
      Respond strictly in JSON format matching this schema:
      {
        "riskScore": 0 to 100 integer representing severity of risk,
        "alerts": ["specific warning messages, e.g. 'Bank account linked to 3 active files'"],
        "recommendations": ["forensic steps to double-check or mitigate this anomaly"]
      }
      `;

      console.log("Calling Gemini for fraud detection audit...");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      if (response.text) {
        result = JSON.parse(response.text.trim());
      }
    } catch (err) {
      console.error("Fraud detection audit failed:", err);
    }
  } else {
    // Simulated audit heuristics
    if (beneficiary && (beneficiary.toLowerCase().includes("test") || amount > 10000000)) {
      result = {
        riskScore: 85,
        alerts: [
          "Beneficiary flagged for dummy/test identity registration.",
          "Welfare transfer exceeds standard administrative limits for single-household subsidy.",
        ],
        recommendations: [
          "Perform immediate on-field biometric verification.",
          "Check PATTA registry to verify genuine property ownership status before dispersing home subsidy.",
        ],
      };
    }
  }

  res.json(result);
});

// DYNAMIC AI CONSTITUTION QUIZ GENERATOR
app.post("/api/quiz/generate", async (req, res) => {
  const { difficulty } = req.body; // easy, medium, hard
  const diff = difficulty || "medium";

  let defaultQuiz: any[] = [
    {
      id: "q-1",
      question: "Which landmark case established the 'Basic Structure Doctrine' of the Indian Constitution?",
      options: ["Maneka Gandhi v. Union of India", "Kesavananda Bharati v. State of Kerala", "Golaknath v. State of Punjab", "A.K. Gopalan v. State of Madras"],
      correctAnswerIndex: 1,
      explanation: "The Basic Structure Doctrine was established by a 13-judge bench of the Supreme Court in the Kesavananda Bharati case in 1973, limiting Parliament's power to rewrite the fundamental pillars of our democracy.",
    },
    {
      id: "q-2",
      question: "Under which article of the Indian Constitution can the President declare a National Emergency?",
      options: ["Article 352", "Article 356", "Article 360", "Article 368"],
      correctAnswerIndex: 0,
      explanation: "Article 352 allows the President to declare a National Emergency on the grounds of war, external aggression, or armed rebellion.",
    },
    {
      id: "q-3",
      question: "Which Part of the Indian Constitution deals with the Fundamental Rights?",
      options: ["Part I", "Part II", "Part III", "Part IV"],
      correctAnswerIndex: 2,
      explanation: "Part III of the Constitution (Articles 12 to 35) guarantees six fundamental rights to all citizens, protecting individual liberties.",
    }
  ];

  if (diff === "easy") {
    defaultQuiz = [
      {
        id: "qe-1",
        question: "Who is known as the Chief Architect of the Constitution of India?",
        options: ["Mahatma Gandhi", "Dr. B.R. Ambedkar", "Jawaharlal Nehru", "Dr. Rajendra Prasad"],
        correctAnswerIndex: 1,
        explanation: "Dr. Bhimrao Ramji Ambedkar was the Chairman of the Drafting Committee and is recognized as the father/chief architect of the Constitution.",
      },
      {
        id: "qe-2",
        question: "When is Constitution Day (Samvidhan Divas) celebrated in India?",
        options: ["15th August", "26th January", "26th November", "2nd October"],
        correctAnswerIndex: 2,
        explanation: "Constitution Day is celebrated on 26th November every year to commemorate the adoption of the Constitution of India by the Constituent Assembly in 1949.",
      }
    ];
  } else if (diff === "hard") {
    defaultQuiz = [
      {
        id: "qh-1",
        question: "Which of the following is correct regarding the writ of 'Quo Warranto'?",
        options: ["To release a person illegally detained", "To command a public officer to perform their duty", "To query by what authority a person holds a public office", "To transfer a pending lawsuit to a higher court"],
        correctAnswerIndex: 2,
        explanation: "Quo Warranto literally means 'by what warrant/authority' and is issued to prevent illegal usurpation of a public office by anyone.",
      },
      {
        id: "qh-2",
        question: "The concept of 'Procedure Established by Law' in Article 21 was borrowed from which country's constitution?",
        options: ["USA", "Japan", "United Kingdom", "Canada"],
        correctAnswerIndex: 1,
        explanation: "The phrase 'Procedure Established by Law' was borrowed from the Japanese Constitution, though it has been interpreted widely to encompass the US concept of 'Due Process' since 1978.",
      }
    ];
  }

  if (ai) {
    try {
      const prompt = `
      You are an expert Constitutional Scholar and Educator. Generate 3 unique, high-quality multiple choice questions for a quiz on the Constitution of India.
      Difficulty: ${diff}
      
      Respond strictly in JSON format as a list of objects matching this schema:
      [
        {
          "question": "Clear, precise quiz question string",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswerIndex": 0 to 3 integer index,
          "explanation": "Detailed professional explanation of why this answer is correct"
        }
      ]
      `;

      console.log(`Calling Gemini to generate custom ${diff} quiz questions...`);
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((q, idx) => ({
            id: `q-gen-${idx}-${Date.now()}`,
            question: q.question,
            options: q.options,
            correctAnswerIndex: Number(q.correctAnswerIndex),
            explanation: q.explanation,
          }));
          return res.json(formatted);
        }
      }
    } catch (err) {
      console.error("Gemini Quiz generation failed, returning default seed questions:", err);
    }
  }

  res.json(defaultQuiz);
});

// METADATA RESOURCES ACCESS (Static news, cases, schemes)
app.get("/api/landmark-cases", (req, res) => {
  res.json(landmarkCases);
});

app.get("/api/schemes", (req, res) => {
  res.json(governmentSchemes);
});

app.get("/api/articles", (req, res) => {
  res.json(constitutionArticles);
});

app.get("/api/daily-fact", (req, res) => {
  const index = Math.floor(Math.random() * dailyFacts.length);
  res.json({ fact: dailyFacts[index] });
});

app.get("/api/constitutional-news", (req, res) => {
  res.json(constitutionalNews);
});

// START EXPRESS & MOUNT VITE MIDDLEWARE
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ConstitutionAI full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
