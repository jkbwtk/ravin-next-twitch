import { serializer } from '#lib/serializer';
import { TemplateApi } from '#types/api/templates';
import { Template } from '#types/database/tables';


export const TemplateSerializer = serializer<Template, TemplateApi>((template) => {
  return {
    id: template.id,
    name: template.name,
    template: template.template,
    channelUserId: template.channelUserId,
    environments: template.environments,
  };
});

