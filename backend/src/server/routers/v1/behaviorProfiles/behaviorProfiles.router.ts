import { getBehaviorProfilesStatus, getBehaviorProfilesView } from '#server/routers/v1/behaviorProfiles/behaviorProfiles.views';
import { Router } from 'express';


export const createBehaviorProfilesRouter = (): Router => {
  const behaviorProfilesRouter = Router();

  behaviorProfilesRouter.get('/', ...getBehaviorProfilesView.unwrap());

  behaviorProfilesRouter.get('/status', ...getBehaviorProfilesStatus.unwrap());

  return behaviorProfilesRouter;
};
