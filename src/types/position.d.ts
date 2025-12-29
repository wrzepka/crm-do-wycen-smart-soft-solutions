import {
  positionBaseSchema,
  positionSelectionSchema,
  updatePositionSchema,
  newPositionSchema,
} from '@/lib/schemas/positionSchema';

// infer types for inputs
export type PositionBase = z.infer<typeof positionBaseSchema>;
export type NewPositionInput = z.infer<typeof newPositionSchema>;
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
export type PositionSelection = z.infer<typeof positionSelectionSchema>;
