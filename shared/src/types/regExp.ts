import { z } from 'zod';


export const RegExpLiteralType = z.string().regex(/^\/.*\/.*$/).superRefine((val, ctx) => {
  const regexDeserializer = /^\/(.*)\/(.*)$/;
  const matched = val.match(regexDeserializer);

  if (matched === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid regex format. Must be in the form of /regex/flags',
      fatal: true,
    });

    return z.NEVER;
  }

  try {
    const pattern = matched[1]!;
    const flags = matched[2]!;

    new RegExp(pattern, flags);
  } catch (err) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: err instanceof Error ? err.message : 'Unknown error',
      fatal: true,
    });
  }
});

export type RegExpLiteralType = z.infer<typeof RegExpLiteralType>;


export const RegExpType = RegExpLiteralType.transform<RegExp>((val) => {
  const regexDeserializer = /^\/(.*)\/(.*)$/;
  const matched = val.match(regexDeserializer);

  if (!matched) {
    throw new Error('Invalid regex format. Must be in the form of /regex/flags');
  }

  const pattern = matched[1]!;
  const flags = matched[2]!;

  return new RegExp(pattern, flags);
});

export type RegExpType = z.infer<typeof RegExpType>;

