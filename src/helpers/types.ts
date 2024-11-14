// types.ts

export type ComponentType = 'CPU' | 'GPU' | 'RAM';

export type ResolutionCategory = 'Standard' | 'Ultrawide' | 'Super Ultrawide' | 'HD' | '4K+';

export type DisplayType = 'Gaming' | 'Professional' | 'General' | 'Cinema';

export interface Resolution {
  name: string;
  width: number;
  height: number;
  pixelCount: number;
  description: string;
  category: ResolutionCategory;
  aspectRatio: string;
  refreshRates: number[];
  type: DisplayType;
  popularityScore: number;
}

export interface Component {
  type: string;
  model: string;
  benchmark: number;
  url: string;
  resolutionPerformance?: Record<string, number>;
  vram?: number;
  recommendedResolutions?: string[];
  maxSupportedResolution?: string;
  maxRefreshRate?: number;
}

export interface VramRequirement {
  minimum: number;
  recommended: number;
  ultra: number;
}

export interface GpuSuitabilityResult {
  suitable: boolean;
  reason?: string;
}

export interface PerformanceResult {
  performance: number;
  isRecommended: boolean;
}