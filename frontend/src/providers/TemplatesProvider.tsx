import { makeRequest } from '#lib/fetch';
import { useSocket } from '#providers/SocketProvider';
import { DeleteTemplateReqBody, GetTemplatesResponse, PatchTemplateReqBody, PostTemplateReqBody, Template } from '#shared/types/api/templates';
import { createContext, createResource, InitializedResource, onCleanup, onMount, useContext } from 'solid-js';


export type TemplatesContextValue = [
  templates: InitializedResource<Template[]>,
  actions: {
    refetchTemplates: () => void;

    addTemplate: (template: PostTemplateReqBody) => Promise<Response>;
    updateTemplate: (template: PatchTemplateReqBody) => Promise<Response>;
    deleteTemplate: (template: DeleteTemplateReqBody) => Promise<Response>;
  }
];

const TemplatesContext = createContext<TemplatesContextValue>([
  null as unknown as InitializedResource<Template[]>,
  {
    refetchTemplates: () => {
      throw Error('TemplatesContext: fetchTemplates() called before provider');
    },

    addTemplate: () => {
      throw Error('TemplatesContext: addTemplate() called before provider');
    },
    updateTemplate: () => {
      throw Error('TemplatesContext: updateTemplate() called before provider');
    },
    deleteTemplate: () => {
      throw Error('TemplatesContext: deleteTemplate() called before provider');
    },
  },
]);


const fetchTemplates = async () => {
  const { data } = await makeRequest('/api/v1/templates', {
    schema: GetTemplatesResponse,
  });


  data.sort((a, b) => {
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });

  return data;
};


export const TemplatesProvider: ParentComponent = (props) => {
  const [socket] = useSocket();
  const [templates, { refetch: refetchTemplates, mutate: setTemplates }] = createResource(fetchTemplates, {
    initialValue: [],
    name: 'templates',
  });


  const addTemplate = async (template: PostTemplateReqBody): Promise<Response> => {
    const response = await fetch(`/api/v1/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });


    return response;
  };

  const updateTemplate = async (template: PatchTemplateReqBody): Promise<Response> => {
    const response = await fetch(`/api/v1/templates`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });


    return response;
  };

  const deleteTemplate = async (template: DeleteTemplateReqBody): Promise<Response> => {
    const response = await fetch(`/api/v1/templates`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });


    return response;
  };


  const handleCreateTemplate = (template: Template) => {
    setTemplates((templates) => ([...templates, template]));
  };

  const handleUpdateTemplate = (template: Template) => {
    setTemplates((templates) => templates.map((c) => c.id === template.id ? template : c));
  };

  const handleRemoveTemplate = (templateId: number) => {
    setTemplates((templates) => templates.filter((template) => template.id !== templateId));
  };

  onMount(() => {
    socket.client.on('NEW_TEMPLATE', handleCreateTemplate);
    socket.client.on('UPD_TEMPLATE', handleUpdateTemplate);
    socket.client.on('DEL_TEMPLATE', handleRemoveTemplate);
  });

  onCleanup(() => {
    socket.client.off('NEW_TEMPLATE', handleCreateTemplate);
    socket.client.off('UPD_TEMPLATE', handleUpdateTemplate);
    socket.client.off('DEL_TEMPLATE', handleRemoveTemplate);
  });


  return (
    <TemplatesContext.Provider value={[
      templates,
      {
        refetchTemplates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
      }]}>
      {props.children}
    </TemplatesContext.Provider>
  );
};

export const useTemplates = (): TemplatesContextValue => useContext(TemplatesContext);
