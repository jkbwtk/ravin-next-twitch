import { getScheduledJobsView, patchConfigView } from '#server/routers/v1/admin/admin.views';
import { Router } from 'express';


export const createAdminRouter = (): Router => {
  const adminRouter = Router();

  adminRouter.patch('/settings/config', ...patchConfigView.unwrap());

  adminRouter.get('/scheduled-jobs', ...getScheduledJobsView.unwrap());

  return adminRouter;
};
