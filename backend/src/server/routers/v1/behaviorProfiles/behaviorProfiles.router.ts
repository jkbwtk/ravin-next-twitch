import {
  deleteBehaviorProfileView,
  getAvailableRelatedItemsView,
  getBehaviorProfilesStatus,
  getBehaviorProfilesView,
  patchBehaviorProfileView,
  postBehaviorProfileView,
} from '#server/routers/v1/behaviorProfiles/behaviorProfiles.views';
import { Router } from 'express';


export const createBehaviorProfilesRouter = (): Router => {
  const behaviorProfilesRouter = Router();

  behaviorProfilesRouter.get('/status', ...getBehaviorProfilesStatus.unwrap());

  behaviorProfilesRouter.get('/', ...getBehaviorProfilesView.unwrap());

  behaviorProfilesRouter.post('/', ...postBehaviorProfileView.unwrap());

  behaviorProfilesRouter.patch(patchBehaviorProfileView.url, ...patchBehaviorProfileView.unwrap());

  behaviorProfilesRouter.delete(deleteBehaviorProfileView.url, ...deleteBehaviorProfileView.unwrap());

  behaviorProfilesRouter.get('/available-items', ...getAvailableRelatedItemsView.unwrap());

  return behaviorProfilesRouter;
};
