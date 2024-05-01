import { DeleteCommandTimerReqBody, PatchCommandTimerReqBody, PostCommandTimerReqBody } from '#shared/types/api/commands';
import Cron from 'croner';
import { z } from 'zod';


const CommandTimerCronValidatorMixin = z.object({
  cron: z.string().superRefine((val, ctx) => {
    try {
      new Cron(val, () => {});
    } catch (err) {
      if (err instanceof Error) {
        let message = err.message.replace('CronPattern:', '').trim();

        if (message.length === 0) {
          message = 'Invalid cron pattern';
        }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: (message.at(0) ?? '').toUpperCase() + message.slice(1),
        });
      } else {
        throw err;
      }
    }
  }),
});

export const PostCommandTimerSchema = z.object({
  body: PostCommandTimerReqBody.merge(CommandTimerCronValidatorMixin),
});

export type PostCommandTimerSchema = z.infer<typeof PostCommandTimerSchema>;


export const PatchCommandTimerSchema = z.object({
  body: PatchCommandTimerReqBody.merge(CommandTimerCronValidatorMixin),
});

export type PatchCommandTimerSchema = z.infer<typeof PatchCommandTimerSchema>;


export const DeleteCommandTimerSchema = z.object({
  body: DeleteCommandTimerReqBody,
});

export type DeleteCommandTimerSchema = z.infer<typeof DeleteCommandTimerSchema>;
