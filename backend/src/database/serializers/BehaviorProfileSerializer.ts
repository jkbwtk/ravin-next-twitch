import { zodSerializer } from '#lib/serializer';
import { BehaviorProfileApi } from '#types/api/behaviorProfiles';
import { BehaviorProfileWithRelations } from '#types/database/tables';


const behaviorProfileSchema = BehaviorProfileApi;

export const BehaviorProfileSerializer = zodSerializer<typeof behaviorProfileSchema, BehaviorProfileWithRelations, BehaviorProfileApi>(behaviorProfileSchema);
