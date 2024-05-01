import { createResource, createSignal } from 'solid-js';
import Button from '#components/Button';
import { useNotification } from '#providers/NotificationProvider';
import Widget from '#components/Widget';
import { Config, GetConfig, PostConfigReqBody } from '#shared/types/api/auth';
import { makeRequest } from '#lib/fetch';
import InputBase from '#components/InputBase';
import InputLabeled from '#components/InputLabeled';
import { useSession } from '#providers/SessionProvider';
import { useErrorHandlers } from '#providers/ErrorHandlersProvider';

import style from '#styles/widgets/AdminConfigWidget.module.scss';


const fetchPublicConfig = async (): Promise<Config> => {
  const { data } = await makeRequest('/api/v1/admin/settings/public-config', { schema: GetConfig });

  return data;
};

const AdminPublicConfigWidget: Component = () => {
  const [, { addNotification }] = useNotification();
  const [saving, setSaving] = createSignal(false);
  const [session] = useSession();
  const { popupApiError } = useErrorHandlers();

  const [config] = createResource(fetchPublicConfig);


  const handleSubmit = async (ev: SubmitEvent) => {
    ev.preventDefault();

    if (!(ev.target instanceof HTMLFormElement)) return;

    const defaultPaginationLimit = ev.target.elements.namedItem('defaultPaginationLimit') as HTMLInputElement;
    const paginationLimitOptions = ev.target.elements.namedItem('paginationLimitOptions') as HTMLInputElement;

    const form: PostConfigReqBody = {
      defaultPaginationLimit: defaultPaginationLimit.value as unknown as number,
      paginationLimitOptions: `[${paginationLimitOptions.value}]` as unknown as number[],
    };

    setSaving(true);

    const resp = await fetch('/api/v1/admin/settings/public-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (resp.ok) {
      addNotification({
        type: 'success',
        title: 'Public Config Saved',
        message: 'Public config has been saved successfully!',
        duration: 5000,
      });
    } else {
      await popupApiError(resp, {
        title: 'Public Config Not Saved',
        action: 'saving public config',
      });
    }

    setSaving(false);
  };


  return (
    <Widget class={style.container} title='Public Config'>
      <form class={style.settingsForm} onSubmit={handleSubmit}>
        <InputLabeled label='Default Pagination Limit' for='defaultPaginationLimit'>
          <InputBase
            type='text'
            class={style.input}
            name='defaultPaginationLimit'
            id='defaultPaginationLimit'
            autocomplete='off'
            placeholder={session.config.defaultPaginationLimit.toString()}
            value={config()?.defaultPaginationLimit.toString()}
          />
        </InputLabeled>

        <InputLabeled label='Pagination Limit Options' for='paginationLimitOptions'>
          <InputBase
            type='text'
            class={style.input}
            name='paginationLimitOptions'
            id='paginationLimitOptions'
            autocomplete='off'
            placeholder={session.config.paginationLimitOptions.join(', ')}
            value={config()?.paginationLimitOptions.join(', ')}
          />
        </InputLabeled>

        <div class={style.buttonsContainer}>
          <Button
            type='submit'
            color='primary'
            size='medium'
            symbol='save'
            loading={saving()}
            customClass={style.submitButton}
          >
            Save
          </Button>
        </div>
      </form>
    </Widget>
  );
};

export default AdminPublicConfigWidget;
