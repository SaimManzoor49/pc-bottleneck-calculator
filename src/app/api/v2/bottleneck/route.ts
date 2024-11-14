import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  await delay(10000); // 10-second delay

  const body = await request.json();
  console.log(body);

  const prompt = `Please analyze the provided PC specifications in JSON format, assessing potential bottlenecks in each component category—CPU, GPU, RAM, storage, and resolution—as well as in overall system balance. Keep in mind that this PC is primarily intended for ${body?.purpose}, and that each component’s compatibility with this purpose is critical.

if any input field has no value then do not identify a bottleneck for that field and also do not give recommendations for that field; simply skip that field.

For any component where the specifications are insufficient to make an informed evaluation, perform additional research online to gather relevant details. Provide your assessment using the following JSON format, with each field explicitly named as shown:
{
  "cpu_bottleneck": "yes/no",
  "gpu_bottleneck": "yes/no",
  "ram_bottleneck": "yes/no",
  "storage_bottleneck": "yes/no",
  "resolution_bottleneck": "yes/no",
  "overall_bottleneck": "yes/no",
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
