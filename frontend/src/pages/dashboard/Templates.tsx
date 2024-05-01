import DashboardInfoBar from '#components/DashboardInfoBar';
import Button from '#components/Button';
import TemplateTableWidget from '#components/widgets/TemplateTableWidget';
import { batch, createSignal } from 'solid-js';
import { Template } from '#shared/types/api/templates';
import { useNotification } from '#providers/NotificationProvider';
import TemplateEditor from '#components/TemplateEditor';
import { useConfirmationBox } from '#providers/ConfirmationBoxProvider';
import { useTemplates } from '#providers/TemplatesProvider';
import { useErrorHandlers } from '#providers/ErrorHandlersProvider';

import style from '#styles/dashboard/Templates.module.scss';


const Templates: RouteComponent = (props) => {
  const [editorOpen, setEditorOpen] = createSignal(false);
  const { open: openConfirmationBox } = useConfirmationBox();
  const [template, setTemplate] = createSignal<Template | null>(null);
  const [, { addNotification }] = useNotification();
  const [, { deleteTemplate: deleteProviderTemplate }] = useTemplates();
  const { popupApiError } = useErrorHandlers();

  const deleteTemplate = async (template: Template) => {
    openConfirmationBox({
      title: `Delete ${template.name}`,
      message: 'Are you sure you want to delete this template?',
      confirmText: 'Delete',
    }).then(async (confirmed) => {
      if (!confirmed) return;

      const response = await deleteProviderTemplate({
        id: template.id,
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Template deleted',
          message: `The template ${template.name} was successfully deleted.`,
          duration: 5000,
        });
      } else {
        popupApiError(response, {
          title: 'Template not deleted',
          action: `deleting the template ${template.name}`,
        });
      }
    });
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
      <DashboardInfoBar metadata={props.data?.metadata}>
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
