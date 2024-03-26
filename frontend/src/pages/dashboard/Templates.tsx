import DashboardInfoBar from '#components/DashboardInfoBar';
import Button from '#components/Button';
import TemplateTableWidget from '#components/widgets/TemplateTableWidget';
import { batch, createSignal } from 'solid-js';
import { DeleteTemplateReqBody, Template } from '#shared/types/api/templates';
import { useNotification } from '#providers/NotificationProvider';
import TemplateEditor from '#components/TemplateEditor';

import style from '#styles/dashboard/Templates.module.scss';


const Templates: Component = () => {
  const [editorOpen, setEditorOpen] = createSignal(false);
  const [template, setTemplate] = createSignal<Template | null>(null);
  const [, { addNotification }] = useNotification();


  const deleteTemplate = async (template: Template) => {
    const body: DeleteTemplateReqBody = {
      id: template.id,
    };

    const response = await fetch(`/api/v1/templates`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      addNotification({
        type: 'success',
        title: 'Template deleted',
        message: `The template ${template.name} was successfully deleted.`,
        duration: 5000,
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Template not deleted',
        message: `An error occurred while deleting the template ${template.name}.`,
        duration: 10000,
      });
    }
  };


  const openEditor = (template: Template | null = null) => {
    batch(() => {
      setTemplate(template);
      setEditorOpen(true);
    });
  };

  const handleEditorClosed = () => {
    batch(() => {
      setTemplate(null);
      setEditorOpen(false);
    });
  };

  return (
    <div class={style.container}>
      <DashboardInfoBar>
        <Button color='primary' size='big' onClick={() => openEditor()} >Add Template</Button>
      </DashboardInfoBar>
      <div class={style.widgets}>
        <TemplateTableWidget openEditor={openEditor} deleteTemplate={deleteTemplate} />
      </div>

      <TemplateEditor open={editorOpen()} template={template()} onClose={handleEditorClosed} />
    </div>
  );
};

export default Templates;
