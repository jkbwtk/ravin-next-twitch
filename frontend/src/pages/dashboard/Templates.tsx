import DashboardInfoBar from '#components/DashboardInfoBar';
import Button from '#components/Button';
import TemplateTableWidget from '#components/widgets/TemplateTableWidget';
import { batch, createSignal } from 'solid-js';
import Modal from '#components/Modal';
import InputLabeled from '#components/InputLabeled';
import InputBase from '#components/InputBase';
import TextArea from '#components/TextArea';
import AnchorText from '#components/AnchorText';
import { DeleteTemplateReqBody, PatchTemplateReqBody, PostTemplateReqBody, Template } from '#shared/types/api/templates';
import { useNotification } from '#providers/NotificationProvider';

import style from '#styles/dashboard/Templates.module.scss';


const Templates: Component = () => {
  const [editorOpen, setEditorOpen] = createSignal(false);
  const [template, setTemplate] = createSignal<Partial<Template>>({});
  const [, { addNotification }] = useNotification();


  const createTemplate = async (template: PostTemplateReqBody) => {
    const response = await fetch(`/api/v1/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });

    if (!response.ok) {
      addNotification({
        type: 'error',
        title: 'Command not created',
        message: `An error occurred while creating command.`,
        duration: 10000,
      });
    }
  };

  const updateTemplate = async (template: PatchTemplateReqBody) => {
    const response = await fetch(`/api/v1/templates`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });

    if (!response.ok) {
      addNotification({
        type: 'error',
        title: 'Template not updated',
        message: `An error occurred while updating template.`,
        duration: 10000,
      });
    }
  };

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

  const openEditor = (template: Partial<Template> = {}) => {
    batch(() => {
      setTemplate(template);
      setEditorOpen(true);
    });
  };

  const closeEditor = () => {
    batch(() => {
      setTemplate({});
      setEditorOpen(false);
    });
  };

  const handleForm = async (ev: SubmitEvent) => {
    ev.preventDefault();

    if (!(ev.target instanceof HTMLFormElement)) return;

    const templateValue = template();

    const name = ev.target.elements.namedItem('name') as HTMLInputElement;
    const templateField = ev.target.elements.namedItem('template') as HTMLInputElement;

    if (templateValue.id) {
      await updateTemplate({
        id: templateValue.id,
        name: name.value,
        template: templateField.value,
      });
    } else {
      await createTemplate({
        name: name.value,
        template: templateField.value,
      });
    }

    closeEditor();
  };

  return (
    <div class={style.container}>
      <DashboardInfoBar>
        <Button color='primary' size='big' onClick={() => openEditor()} >Add Template</Button>
      </DashboardInfoBar>
      <div class={style.widgets}>
        <TemplateTableWidget openEditor={openEditor} deleteTemplate={deleteTemplate} />
      </div>

      <Modal
        open={editorOpen()}
        onClose={closeEditor}
        title='Add Template'
      >
        <form class={style.editor} onSubmit={handleForm}>
          <div class={style.group}>
            <InputLabeled label='Template name' for='name'>
              <InputBase
                id='name'
                name='name'
                autocomplete='off'
                required
                minLength={1}
                maxLength={32}
                pattern='^[^\s]+$'
                placeholder='name'
                value={template()?.name ?? ''}
                title='Template name cannot contain spaces.'
              />
            </InputLabeled>

            <div class={style.description}>
              Name of the template. It cannot contain spaces and must be between 1 and 32 characters long.
            </div>
          </div>

          <div class={style.group}>
            <InputLabeled label='Response' for='response'>
              <TextArea
                id='template'
                name='template'
                minLength={0}
                maxLength={1024}
                placeholder='This is a command response.'
                required
                value={template()?.template ?? ''}
                class={style.textarea}
              />
            </InputLabeled>

            <div class={style.description}>
              The response that will be sent when the template is triggered. It can be up to 1024 characters long.
              Info about variables and utility functions can be found in the <AnchorText href='/dashboard/help'>Help</AnchorText> section.
            </div>
          </div>

          <div class={style.buttons}>
            <Button type='submit' color='primary' symbol='save'>Save</Button>
            <Button type='button' color='gray' onclick={closeEditor}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Templates;
