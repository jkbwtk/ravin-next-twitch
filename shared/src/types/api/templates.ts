import { z } from 'zod';


export const Template = z.object({
  id: z.number().int().positive(),
  name: z.string().min(3),
  template: z.string().min(1),
  userId: z.string().min(1),
});

export type Template = z.infer<typeof Template>;


export const GetTemplatesResponse = z.object({
  data: z.array(Template),
});

export type GetTemplatesResponse = z.infer<typeof GetTemplatesResponse>;


export const PostTemplateReqBody = Template.omit({ id: true, userId: true });

export type PostTemplateReqBody = z.infer<typeof PostTemplateReqBody>;


export const PatchTemplateReqBody = Template.pick({ id: true }).merge(PostTemplateReqBody.partial());

export type PatchTemplateReqBody = z.infer<typeof PatchTemplateReqBody>;


export const DeleteTemplateReqBody = Template.pick({ id: true });

export type DeleteTemplateReqBody = z.infer<typeof DeleteTemplateReqBody>;

