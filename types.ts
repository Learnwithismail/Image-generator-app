export interface ImageData {
  base64: string;
  mimeType: string;
}

// Fix: Add missing type definitions to fix compilation errors.
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export type StylePreset = 'photorealistic' | 'illustration' | 'minimalist' | 'cinematic' | 'fantasy';

export interface AspectRatioOption {
  value: AspectRatio;
  label: string;
}

export interface StylePresetOption {
  value: StylePreset;
  label: string;
}

export enum Mode {
  GENERATE = 'GENERATE',
  EDIT = 'EDIT',
}
