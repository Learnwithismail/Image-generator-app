import { AspectRatioOption, StylePresetOption } from './types';

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Widescreen (16:9)" },
  { value: "9:16", label: "Portrait (9:16)" },
  { value: "4:3", label: "Landscape (4:3)" },
  { value: "3:4", label: "Tall (3:4)" },
];

export const STYLE_PRESETS: StylePresetOption[] = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'fantasy', label: 'Fantasy' },
];