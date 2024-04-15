import { TemplateIssues } from '#bot/templates/TemplateIssues';
import { TemplateTester } from '#bot/templates/TemplateTester';
import { logger } from '#lib/logger';
import { Middleware } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { HttpCodes } from '#shared/httpCodes';


export const templateTesterMiddleware: Middleware<
never,
{ validated: { body: { template?: string } } },
  object,
{ templateIssues: TemplateIssues | null }
> = async (req, res) => {
  const template = req.validated.body.template;
  if (template === undefined) return [Object.assign(req, { templateIssues: null }), res];

  const issues = await TemplateTester.test(template);

  if (issues.hasSyntaxError()) {
    logger.warn('Invalid template syntax', {
      label: ['APIv1', 'template', 'templateValidatorMiddleware'],
    });

    throw new ServerError(HttpCodes.BadRequest, 'Invalid template syntax');
  }

  if (!issues.hasSupportedEnvironments()) {
    logger.warn('No supported environments found', {
      label: ['APIv1', 'template', 'templateValidatorMiddleware'],
    });

    throw new ServerError(HttpCodes.BadRequest, 'No supported environments found');
  }

  return [Object.assign(req, { templateIssues: issues }), res];
};
