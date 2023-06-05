import { createSignal } from 'solid-js';
import Button from '#components/Button';
import { useNotification } from '#providers/NotificationProvider';
import Widget from '#components/Widget';
import Input from '#components/Input';
import { PostConfigRequest } from '#types/api/admin';

import style from '#styles/widgets/AdminConfigWidget.module.scss';


const AdminConfigWidget: Component = () => {
  const [, { addNotification }] = useNotification();
  const [saving, setSaving] = createSignal(false);


  const handleSubmit = async (ev: SubmitEvent) => {
    ev.preventDefault();

    if (!(ev.target instanceof HTMLFormElement)) return;

    const adminUsername = ev.target.elements.namedItem('adminUsername') as HTMLInputElement;
    const botLogin = ev.target.elements.namedItem('botLogin') as HTMLInputElement;
    const botToken = ev.target.elements.namedItem('botToken') as HTMLInputElement;
    const twitchClientId = ev.target.elements.namedItem('twitchClientId') as HTMLInputElement;
    const twitchClientSecret = ev.target.elements.namedItem('twitchClientSecret') as HTMLInputElement;

    const form: PostConfigRequest = {
      adminUsername: adminUsername.value.length > 0 ? adminUsername.value : undefined,
      botLogin: botLogin.value.length > 0 ? botLogin.value : undefined,
      botToken: botToken.value.length > 0 ? botToken.value : undefined,
      twitchClientId: twitchClientId.value.length > 0 ? twitchClientId.value : undefined,
      twitchClientSecret: twitchClientSecret.value.length > 0 ? twitchClientSecret.value : undefined,
    };

    setSaving(true);

    const resp = await fetch('/api/v1/admin/settings/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (resp.ok) {
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Settings have been saved successfully!',
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Settings Not Saved',
        message: 'There was an error saving the settings.',
      });
    }

    setSaving(false);
  };


  return (
    <Widget class={style.container} containerClass={style.outerContainer} title='Config'>
      <form class={style.settingsForm} onSubmit={handleSubmit}>
        <Input
          type='text'
          class={style.input}
          name='adminUsername'
          id='adminUsername'
          label='Admin Username'
          autocomplete='off'
        />

        <Input
          type='text'
          class={style.input}
          name='botLogin'
          id='botLogin'
          label='Bot Login'
          autocomplete='off'
        />

        <Input
          type='text'
          class={style.input}
          name='botToken'
          id='botToken'
          label='Bot Token'
          autocomplete='off'
        />

        <Input
          type='text'
          class={style.input}
          name='twitchClientId'
          id='twitchClientId'
          label='Twitch Client ID'
          autocomplete='off'
        />

        <Input
          type='text'
          class={style.input}
          name='twitchClientSecret'
          id='twitchClientSecret'
          label='Twitch Client Secret'
          autocomplete='off'
        />

        <div class={style.buttonsContainer}>
          <Button
            type='submit'
            color='primary'
            size='medium'
            symbol='save'
            loading={saving()}
            customClass={style.submitButton}
          >Save</Button>
        </div>
      </form>
    </Widget>
  );
};

export default AdminConfigWidget;
