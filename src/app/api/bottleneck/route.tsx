import { NextResponse } from 'next/server';
import { loadComponentData, getComponent, getAllComponents, Component } from '../../../helpers/dataLoader';

// Initialize CSV data once when the server starts
let isDataLoaded = false;
const initializeData = async () => {
  if (!isDataLoaded) {
    await loadComponentData();
    isDataLoaded = true;
  }
};

type BottleneckResponse = {
  bottleneck?: string;
  details?: Component;
  bottleneckPercentage?: number; // Include percentage score
  error?: string;
};

const identifyBottleneck = (cpu: Component, gpu: Component, ram?: Component|null): BottleneckResponse => {
  const threshold = 0.35; // 35% difference threshold

  let bottleneckPercentage: number | undefined;

  // Check CPU vs GPU
  if (cpu.benchmark < gpu.benchmark * (1 - threshold)) {
    bottleneckPercentage = ((gpu.benchmark - cpu.benchmark) / gpu.benchmark) * 100; // CPU bottleneck percentage
    return { bottleneck: 'CPU', details: cpu, bottleneckPercentage };
  } else if (gpu.benchmark < cpu.benchmark * (1 - threshold)) {
    bottleneckPercentage = ((cpu.benchmark - gpu.benchmark) / cpu.benchmark) * 100; // GPU bottleneck percentage
    return { bottleneck: 'GPU', details: gpu, bottleneckPercentage };
  }
  // Check RAM
  else if (ram && ram.benchmark < (cpu.benchmark + gpu.benchmark) * 0.8) {
    bottleneckPercentage = ((cpu.benchmark + gpu.benchmark - ram.benchmark) / (cpu.benchmark + gpu.benchmark)) * 100; // RAM bottleneck percentage
    return { bottleneck: 'RAM', details: ram, bottleneckPercentage };
  } else {
    return { error: 'No significant bottleneck detected' };
  }
};

export async function POST(request: Request) {
  await initializeData();

  const { cpuModel, gpuModel, ramModel } = await request.json();

  if (!cpuModel || !gpuModel) {
    return NextResponse.json({ error: 'Please provide CPU and GPU models' });
  }

  const cpu = getComponent('CPU', cpuModel);
  const gpu = getComponent('GPU', gpuModel);
  const ram = ramModel ? getComponent('RAM', ramModel) : undefined;

  if (!cpu) {
    return NextResponse.json({ error: `CPU model "${cpuModel}" not found` });
  }
  if (!gpu) {
    return NextResponse.json({ error: `GPU model "${gpuModel}" not found` });
  }

  const bottleneckResult = identifyBottleneck(cpu, gpu, ram);
  return NextResponse.json(bottleneckResult);
}

export async function GET() {
  await initializeData();

  const cpus = await getAllComponents('CPU');
  const gpus = await getAllComponents('GPU');
  const rams = await getAllComponents('RAM');

  return NextResponse.json({ cpus, gpus, rams });
}
