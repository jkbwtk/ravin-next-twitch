import AnchorText from '#components/AnchorText';
import Button from '#components/Button';
import InputBase from '#components/InputBase';
import InputLabeled from '#components/InputLabeled';
import Modal from '#components/Modal';
import TextArea from '#components/TextArea';
import { makeRequest } from '#lib/fetch';
import { useNotification } from '#providers/NotificationProvider';
import { PatchTemplateReqBody, PostTemplateReqBody, Template, TestTemplateResponse } from '#shared/types/api/templates';

import style from '#styles/TemplateEditor.module.scss';


export type TemplateEditorProps = {
  open: boolean;
  template?: Template | null;
  onClose: () => void;
};

const TemplateEditor: Component<TemplateEditorProps> = (props) => {
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

  const testTemplate = async (code: string): Promise<TestTemplateResponse> => {
    return await makeRequest('/api/v1/templates/test', {
      schema: TestTemplateResponse,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ template: code }),
    });
  };

  const handleForm = async (ev: SubmitEvent) => {
    ev.preventDefault();

    if (!(ev.target instanceof HTMLFormElement)) return;

    const name = ev.target.elements.namedItem('name') as HTMLInputElement;
    const templateField = ev.target.elements.namedItem('template') as HTMLInputElement;

    if (props.template) {
      await updateTemplate({
        id: props.template.id,
        name: name.value,
        template: templateField.value,
      });
    } else {
      await createTemplate({
        name: name.value,
        template: templateField.value,
      });
    }

    props.onClose();
  };

  let timeoutHandle: number = 0;

  const handleInput = (ev: InputEvent) => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }

    timeoutHandle = setTimeout(async () => {
      const templateField = (ev.target as HTMLTextAreaElement).value;
      console.log(templateField);


      const issues = await testTemplate(templateField);
      console.log(issues);
    }, 500) as unknown as number;
  };

  return <Modal
    onClose={props.onClose}
    title='Add Template'
    open={props.open}
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
            value={props.template?.name ?? ''}
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
            value={props.template?.template ?? ''}
            class={style.textarea}
            onInput={handleInput}
          />
        </InputLabeled>

        <div class={style.description}>
        The response that will be sent when the template is triggered. It can be up to 1024 characters long.
        Info about variables and utility functions can be found in the <AnchorText href='/dashboard/help'>Help</AnchorText> section.
        </div>
      </div>

      <div class={style.buttons}>
        <Button type='submit' color='primary' symbol='save'>Save</Button>
        <Button type='button' color='gray' onclick={props.onClose}>Cancel</Button>
      </div>
    </form>
  </Modal>;
};

export default TemplateEditor;
