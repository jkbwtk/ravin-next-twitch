import AnchorText from '#components/AnchorText';
import Button from '#components/Button';
import InputBase from '#components/InputBase';
import InputLabeled from '#components/InputLabeled';
import Modal from '#components/Modal';
import TextArea from '#components/TextArea';
import { makeRequest } from '#lib/fetch';
import { useNotification } from '#providers/NotificationProvider';
import { PatchTemplateReqBody, PostTemplateReqBody, Template, TestTemplateResponse } from '#types/api/templates';
import { createResource, createSignal, ErrorBoundary, Index, Show } from 'solid-js';
import { Debounce } from '#shared/Debounce';
import Stack from '@suid/material/Stack/Stack';
import Skeleton from '@suid/material/Skeleton/Skeleton';
import ErrorFallback from '#components/ErrorFallback';
import MaterialSymbol from '#components/MaterialSymbol';
import Pill from '#components/Pill';
import { useTemplates } from '#providers/TemplatesProvider';
import { useErrorHandlers } from '#providers/ErrorHandlersProvider';
import { templateEnvironments } from '#locales/en-us/templates';

import style from '#styles/TemplateEditor.module.scss';


export type TemplateEditorProps = {
  open: boolean;
  template?: Template | null;
  onClose: () => void;
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

const TemplateStatusSkeleton: Component = () => (
  <>
    <Stack width='100%'>
      <Skeleton width='12rem' height='3.2rem' variant='text' animation='wave' style={{
        transform: 'initial',
        'border-radius': '50rem',
      }} />
    </Stack>

    <Stack width='100%'>
      <Skeleton width='15rem' height='3.2rem' variant='text' animation='wave' style={{
        transform: 'initial',
        'border-radius': '50rem',
      }} />

      <Skeleton width='100%' height='6rem' variant='rectangular' animation='wave' style={{
        'margin-top': '0.8rem',
      }} />
    </Stack>
  </>
);

const TemplateEditorBase: Component<TemplateEditorProps> = (props) => {
  const [, { addNotification }] = useNotification();
  const { popupApiError } = useErrorHandlers();
  const [, { addTemplate, updateTemplate: updateProviderTemplate }] = useTemplates();

  const [code, setCode] = createSignal(props.template?.template ?? '');
  const [templateStatus, { refetch: refetchTemplateStatus }] = createResource(code, testTemplate);

  const statusDebouncer = new Debounce<string>({
    timeout: 500,
    callback: (v) => {
      setCode(v);
    },
  });


  const createTemplate = async (template: PostTemplateReqBody): Promise<boolean> => {
    const response = await addTemplate(template);

    if (!response.ok) {
      popupApiError(response, {
        title: 'Template not created',
        action: 'creating template',
      });
    }

    return response.ok;
  };

  const updateTemplate = async (template: PatchTemplateReqBody): Promise<boolean> => {
    const response = await updateProviderTemplate(template);

    if (!response.ok) {
      popupApiError(response, {
        title: 'Template not updated',
        action: 'updating template',
      });
    }

    return response.ok;
  };

  const handleForm = async (ev: SubmitEvent) => {
    ev.preventDefault();

    if (!(ev.target instanceof HTMLFormElement)) return;

    const name = ev.target.elements.namedItem('name') as HTMLInputElement;
    const templateField = ev.target.elements.namedItem('template') as HTMLInputElement;

    let ok = true;

    if (props.template) {
      ok = await updateTemplate({
        id: props.template.id,
        name: name.value,
        template: templateField.value,
      });
    } else {
      ok = await createTemplate({
        name: name.value,
        template: templateField.value,
      });
    }

    if (ok) {
      const metadata = props.template ? {
        title: 'Template updated',
        message: 'Template was successfully updated.',
      } : {
        title: 'Template created',
        message: 'Template was successfully created.',
      };

      addNotification({
        type: 'success',
        ...metadata,
        duration: 5000,
      });

      props.onClose();
    }
  };

  const handleInput = (ev: InputEvent) => {
    if (ev.target instanceof HTMLTextAreaElement) statusDebouncer.debounce(ev.target.value);
  };

  const mappedStatus = () => Object.entries(templateStatus()?.data ?? {}).map(([env, status]) => ({
    name: templateEnvironments.getCoerced(env),
    status,
  }));

  return (
    <div class={style.container}>
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
          <Button type='button' color='gray' onclick={props.onClose}>Cancel</Button>

          <Button
            type='submit'
            color='primary'
            symbol='save'
            disabled={
              templateStatus.state === 'refreshing' ||
              templateStatus()?.data === undefined ||
              Object.values(templateStatus()?.data ?? {}).filter((status) => status === null).length === 0
            }
          >
            Save
          </Button>
        </div>
      </form>

      <div class={style.status}>
        <ErrorBoundary fallback={
          <ErrorFallback
            refresh={refetchTemplateStatus}
            loading={templateStatus.state === 'refreshing'}
          >Failed to test template</ErrorFallback>
        }>
          <Show when={templateStatus.latest !== undefined} fallback={<TemplateStatusSkeleton/>}>
            <Index each={mappedStatus()}>
              {(env) => (
                <div
                  class={style.environment}
                  classList={{
                    [style.invalid]: env().status !== null,
                  }}
                >
                  <Pill
                    content={env().name}
                    class={style.pill}
                    icon={
                      env().status === null ?
                        <MaterialSymbol symbol='check' size='small' color='green' /> :
                        <MaterialSymbol symbol='close' size='small' color='red' />
                    }
                  />

                  <Show when={env().status !== null}>
                    <div class={style.issue}>{env().status?.message}</div>
                  </Show>
                </div>
              )}
            </Index>
          </Show>
        </ErrorBoundary>
      </div>
    </div>
  );
};

const TemplateEditor: Component<TemplateEditorProps> = (props) => {
  return (
    <Modal
      onClose={props.onClose}
      title='Add Template'
      open={props.open}
      modalClass={style.modal}
    >
      <TemplateEditorBase {...props} />
    </Modal>
  );
};

export default TemplateEditor;
