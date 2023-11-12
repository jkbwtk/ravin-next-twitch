import { batch, createEffect, createMemo, createResource, createSignal, ErrorBoundary, InitializedResourceReturn, Show, Suspense } from 'solid-js';
import { ChantingSettings, GetChantingSettingsResponse } from '#types/api/channel';
import FetchFallback from '#components/FetchFallback';
import InputLabeled from '#components/InputLabeled';
import InputRange from '#components/InputRange';
import Button from '#components/Button';
import InputCheckbox from '#components/InputCheckbox';
import { useNotification } from '#providers/NotificationProvider';
import MaterialSymbol from '#components/MaterialSymbol';
import { Transition } from 'solid-transition-group';
import Widget from '#components/Widget';
import { makeRequest } from '#lib/fetch';

import style from '#styles/widgets/ChantingSettingsWidget.module.scss';
import ErrorFallback from '#components/ErrorFallback';


const fetchChantingSettings = async (): Promise<ChantingSettings> => {
  const { data } = await makeRequest('/api/v1/channel/settings/chanting', { schema: GetChantingSettingsResponse });

  return data;
};

const defaultValues: ChantingSettings = {
  enabled: false,
  interval: 60,
  length: 3,
};

const ChantingSettingsBase: Component<{ settings: InitializedResourceReturn<ChantingSettings> }> = (props) => {
  const [settings, { mutate: mutateSettings }] = props.settings;
  const [, { addNotification }] = useNotification();

  const [isDirty, setDirty] = createSignal(false);

  const [enabled, setEnabled] = createSignal(defaultValues.enabled);
  const [interval, setInterval] = createSignal(defaultValues.interval);
  const [length, setLength] = createSignal(defaultValues.length);

  const [saving, setSaving] = createSignal(false);

  let lengthRef = document.createElement('input');
  let intervalRef = document.createElement('input');
  let enabledRef = document.createElement('input');

  const hasChanged = createMemo<boolean | number>(() => !(
    settings.latest.enabled === enabled() &&
    settings.latest.interval === interval() &&
    settings.latest.length === length()
  ) && isDirty());

  const handleFormSubmit = async (ev: SubmitEvent) => {
    ev.preventDefault();

    if (!hasChanged() || saving()) return;

    const newSettings: ChantingSettings = {
      enabled: enabled(),
      interval: interval(),
      length: length(),
    };

    setSaving(true);

    const request = await fetch('/api/v1/channel/settings/chanting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSettings),
    });

    if (request.ok) {
      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Chanting settings have been saved successfully!',
        duration: 5000,
      });

      mutateSettings(newSettings);
    } else {
      addNotification({
        type: 'error',
        title: 'Error Saving Settings',
        message: 'There was an error saving your chanting settings.',
        duration: 5000,
      });
    }

    setSaving(false);
  };

  createEffect(() => {
    batch(() => {
      setEnabled(settings().enabled);
      setInterval(settings().interval);
      setLength(settings().length);
    });
  });

  return (
    <form class={style.settingsForm} onSubmit={handleFormSubmit}>
      <InputCheckbox
        id='enabled'
        name='enabled'
        label='Enabled'
        ref={enabledRef}
        onChange={(ev) => {
          batch(() => {
            setEnabled(ev.target.checked);
            setDirty(true);
          });
        }}
        checked={settings().enabled}
      />

      <InputLabeled label='Time between chants' for='interval'>
        <InputRange
          id='interval'
          name='interval'
          min={0}
          max={300}
          step={10}
          label='Interval:'
          unit='seconds'
          ref={intervalRef}
          onChange={(ev) => {
            batch(() => {
              setInterval(ev.target.valueAsNumber);
              setDirty(true);
            });
          }}
          value={settings().interval}
        />
      </InputLabeled>

      <InputLabeled label='Minimum chant length' for='minLength'>
        <InputRange
          id='minLength'
          name='minLength'
          min={2}
          max={64}
          label='Minimum length:'
          unit='messages'
          ref={lengthRef}
          onChange={(ev) => {
            batch(() => {
              setLength(ev.target.valueAsNumber);
              setDirty(true);
            });
          }}
          value={settings().length}
        />
      </InputLabeled>

      <div class={style.buttonsContainer}>
        <Transition
          enterActiveClass={style.warningShow}
          exitActiveClass={style.warningHide}
        >
          <Show when={hasChanged()}>
            <div class={style.warning}>
              <MaterialSymbol symbol='warning' color='yellow' />
              <span>Unsaved changes!</span>
            </div>
          </Show>
        </Transition>
        <Button
          type='button'
          disabled={!hasChanged()}
          onClick={() => {
            enabledRef.checked = settings().enabled;
            lengthRef.value = settings().length.toString();
            intervalRef.value = settings().interval.toString();

            batch(() => {
              setEnabled(settings().enabled);
              setInterval(settings().interval);
              setLength(settings().length);
            });

            lengthRef.dispatchEvent(new Event('change'));
            intervalRef.dispatchEvent(new Event('change'));
          }}
        >
              Reset
        </Button>

        <Button
          type='submit'
          symbol='save'
          color='primary'
          size='medium'
          disabled={!hasChanged()}
          loading={saving()}
        >
              Save
        </Button>
      </div>
    </form>
  );
};

const ChantingSettingsWidget: Component = () => {
  const resource = createResource(fetchChantingSettings, { initialValue: defaultValues });
  const [settings, { refetch: refetchSettings }] = resource;


  return (
    <Widget class={style.container} title='Chanting'>
      <ErrorBoundary fallback={
        <ErrorFallback
          class={style.fallback}
          refresh={refetchSettings}
          loading={settings.state === 'refreshing'}
        >
          Failed to load chanting settings
        </ErrorFallback>
      }>
        <Suspense
          fallback={<FetchFallback>Fetching Chanting Settings</FetchFallback>}
        >
          <ChantingSettingsBase settings={resource}/>
        </Suspense>
      </ErrorBoundary>
    </Widget>
  );
};

export default ChantingSettingsWidget;
