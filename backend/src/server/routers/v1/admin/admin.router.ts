import { getPublicConfigView, getScheduledJobsView, patchConfigView, postPublicConfigView } from '#server/routers/v1/admin/admin.views';
import { Router } from 'express';


export const createAdminRouter = (): Router => {
  const adminRouter = Router();

  adminRouter.patch('/settings/config', ...patchConfigView.unwrap());

  adminRouter.get('/scheduled-jobs', ...getScheduledJobsView.unwrap());

  adminRouter.get('/settings/public-config', ...getPublicConfigView.unwrap());

  adminRouter.post('/settings/public-config', ...postPublicConfigView.unwrap());

  return adminRouter;
};
