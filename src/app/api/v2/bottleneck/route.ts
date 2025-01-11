import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  await delay(2000); // 10-second delay

  const body = await request.json();
  console.log(body);

  const prompt = `Please analyze the provided PC specifications in JSON format, assessing potential bottlenecks in each component category—CPU, GPU, RAM, storage, and resolution—as well as in overall system balance. Keep in mind that this PC is primarily intended for ${body?.purpose}, and that each component’s compatibility with this purpose is critical.

If any input field has no value, do not identify a bottleneck for that field and do not provide recommendations for it; simply skip that field.

For any component where the specifications are insufficient to make an informed evaluation, perform additional research online to gather relevant details. Provide your assessment using the following JSON format, including the percentage of bottleneck for each applicable category where a bottleneck is identified, explicitly naming each field as shown:
{
  "cpu_bottleneck": {
    "exists": "yes/no",
    "percentage": "x"
  },
  "gpu_bottleneck": {
    "exists": "yes/no",
    "percentage": "x"
  },
  "ram_bottleneck": {
    "exists": "yes/no",
    "percentage": "x"
  },
  "storage_bottleneck": {
    "exists": "yes/no",
    "percentage": "x"
  },
  "resolution_bottleneck": {
    "exists": "yes/no",
    "percentage": "x"
  },
  "overall_bottleneck": {
    "exists": "yes/no",
    "percentage": "x"
  },
  "recommendations": [
    "suggestion 1",
    "suggestion 2"
  ]
}
Input PC Specs:
{
  "cpu": "${body?.cpuModel}",
  "gpu": "${body?.gpuModel}",
  "ram": "${body?.ramModel}",
  "storage": "${body?.hdd}",
  "resolution": "${body?.resolution}"
}`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);

  return NextResponse.json({ results: result.response.text() });
}
