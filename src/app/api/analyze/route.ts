// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server';

export interface AnalysisResult {
  originalUrl: string;
  finalUrl: string;
  redirectChain: { url: string; status: number | null }[];
  suspiciousPatterns: { type: string; value: string; level: 'medium' | 'high' }[];
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
}

const SUSPICIOUS_KEYWORDS = [
  'dark', 'drug', 'hidden', 'illegal', 'market', 'hack', 'ransom', 'onion', 'tor'
];

export async function POST(req: Request) {
  const { url: initialUrl } = await req.json();

  if (!initialUrl || typeof initialUrl !== 'string') {
    return NextResponse.json({ message: 'URL is required' }, { status: 400 });
  }

  let currentUrl = initialUrl;
  const result: AnalysisResult = {
    originalUrl: initialUrl,
    finalUrl: initialUrl, // Will be updated if fetch succeeds
    redirectChain: [{ url: initialUrl, status: null }],
    suspiciousPatterns: [],
    riskLevel: 'safe',
  };

  // --- CRITICAL FIX: Analyze patterns BEFORE trying to fetch ---
  // 1. Check for high-risk TLDs
  if (currentUrl.includes('.onion') || currentUrl.includes('.i2p')) {
    result.suspiciousPatterns.push({ type: 'Dark Web', value: '.onion/.i2p', level: 'high' });
    result.riskLevel = 'dangerous';
  }

  // 2. Check for suspicious keywords
  SUSPICIOUS_KEYWORDS.forEach(keyword => {
    if (currentUrl.toLowerCase().includes(keyword) && !result.suspiciousPatterns.some(p => p.value === keyword)) {
      result.suspiciousPatterns.push({ type: 'Keyword', value: keyword, level: 'medium' });
      if (result.riskLevel !== 'dangerous') {
        result.riskLevel = 'suspicious';
      }
    }
  });

  // 3. If it's already flagged as dangerous, return immediately. No need to fetch.
  if (result.riskLevel === 'dangerous') {
    result.finalUrl = "N/A (Blocked by pattern detection)";
    return NextResponse.json(result, { status: 200 });
  }
  // --- END OF CRITICAL FIX ---

  try {
    // Now, only proceed with fetching if the URL is not flagged as dangerous
    for (let i = 0; i < 10; i++) {
      const response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(7000),
      });

      // Update status for the current link in the chain
      const currentStep = result.redirectChain.find(step => step.url === currentUrl);
      if (currentStep) currentStep.status = response.status;

      const location = response.headers.get('location');
      if (response.status >= 300 && response.status < 400 && location) {
        currentUrl = new URL(location, currentUrl).toString();
        result.redirectChain.push({ url: currentUrl, status: null });
      } else {
        result.finalUrl = currentUrl;
        break;
      }
    }
    result.finalUrl = currentUrl;

  } catch (error) {
    // If fetch fails (e.g., domain offline), we still have the pattern analysis result
    console.error("Fetch error:", error);
    result.finalUrl = "N/A (Could not resolve host)";
    // The riskLevel from pattern matching will be preserved
  }

  return NextResponse.json(result, { status: 200 });
}