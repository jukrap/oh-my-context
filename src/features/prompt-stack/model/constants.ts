import type { TranslationKey } from '../../../shared/lib/i18n/messages';

export const STACK_DEPTH_COLORS = [
  'var(--stack-depth-0)',
  'var(--stack-depth-1)',
  'var(--stack-depth-2)',
  'var(--stack-depth-3)',
  'var(--stack-depth-4)',
  'var(--stack-depth-5)',
  'var(--stack-depth-6)',
  'var(--stack-depth-7)',
  'var(--stack-depth-8)',
  'var(--stack-depth-9)',
  'var(--stack-depth-10)',
  'var(--stack-depth-11)',
];

export const RECOMMENDED_NODE_TAGS = [
  { value: 'instruction', descriptionKey: 'recommendedInstructionDesc' },
  { value: 'constraints', descriptionKey: 'recommendedConstraintsDesc' },
  { value: 'context', descriptionKey: 'recommendedContextDesc' },
  { value: 'examples', descriptionKey: 'recommendedExamplesDesc' },
  { value: 'output_format', descriptionKey: 'recommendedOutputFormatDesc' },
  { value: 'checklist', descriptionKey: 'recommendedChecklistDesc' },
] as const satisfies ReadonlyArray<{
  value: string;
  descriptionKey: TranslationKey;
}>;

export const DEFAULT_NODE_TAG = 'context';

export const STACK_MOUSE_DRAG_DISTANCE_PX = 4;
export const STACK_TOUCH_DRAG_DELAY_MS = 120;
export const STACK_TOUCH_DRAG_TOLERANCE_PX = 8;
export const STACK_MAX_VISIBLE_GUIDE_DEPTH = 8;
export const STACK_DRAG_AUTOSCROLL_EDGE_PX = 72;
export const STACK_DRAG_AUTOSCROLL_MAX_STEP_PX = 16;

export function getDepthColor(depth: number): string {
  return STACK_DEPTH_COLORS[depth % STACK_DEPTH_COLORS.length] ?? 'var(--stack-depth-0)';
}
