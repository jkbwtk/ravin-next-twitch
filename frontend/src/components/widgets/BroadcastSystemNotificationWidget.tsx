import { createSignal } from 'solid-js';
import InputLabeled from '#components/InputLabeled';
import Button from '#components/Button';
import { useNotification } from '#providers/NotificationProvider';
import Widget from '#components/Widget';

import style from '#styles/widgets/BroadcastSystemNotificationWidget.module.scss';
import { PostSystemNotificationBroadcastRequest } from '#shared/types/api/systemNotifications';
import InputBase from '#components/InputBase';
import TextArea from '#components/TextArea';


const BroadcastSystemNotificationWidget: Component = () => {
  const [, { addNotification }] = useNotification();
  const [saving, setSaving] = createSignal(false);


  const handleFormSubmit = async (ev: SubmitEvent) => {
    ev.preventDefault();

    if (!(ev.target instanceof HTMLFormElement)) return;
    if (saving()) return;

    const title = ev.target.elements.namedItem('title') as HTMLInputElement;
    const content = ev.target.elements.namedItem('content') as HTMLInputElement;

    const notification: PostSystemNotificationBroadcastRequest = {
      title: title.value,
      content: content.value,
    };

    setSaving(true);

    const request = await fetch('/api/v1/notifications/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    if (request.ok) {
      addNotification({
        type: 'success',
        title: 'Notification broadcasted',
        message: 'Your notification has been broadcasted to all users.',
        duration: 5000,
      });

      title.value = '';
      content.value = '';
    } else {
      addNotification({
        type: 'error',
        title: 'Failed to broadcast notification',
        message: 'Your notification could not be broadcasted to all users.',
        duration: 5000,
      });
    }

    setSaving(false);
  };

  return (
    <Widget class={style.container} title='Broadcast System Notification'>
      <form class={style.settingsForm} onSubmit={handleFormSubmit}>
        <InputLabeled label='Title' for='title'>
          <InputBase
            id='title'
            name='title'
            required
            minLength={3}
            maxLength={26}
            autocomplete='off'
            placeholder='Notification title'
          />
        </InputLabeled>

        <InputLabeled label='Content' for='content'>
          <TextArea
            id='content'
            name='content'
            required
            minLength={3}
            maxLength={200}
            class={style.textarea}
            placeholder='Notification content'
          />
        </InputLabeled>

        <div class={style.buttonsContainer}>
          <Button
            type='submit'
            symbol='podcasts'
            color='primary'
            size='medium'
            loading={saving()}
          >
              Broadcast
          </Button>
        </div>
      </form>
    </Widget>
  );
};

export default BroadcastSystemNotificationWidget;
