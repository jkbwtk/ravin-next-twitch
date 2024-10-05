import { batch, createEffect, createMemo, createResource, createSignal, ErrorBoundary, InitializedResourceReturn, Show, Suspense } from 'solid-js';
import { GetOfflineChatSettingsResponse, OfflineChatSettings } from '#types/api/channel';
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
import ErrorFallback from '#components/ErrorFallback';
import { useErrorHandlers } from '#providers/ErrorHandlersProvider';

import style from '#styles/widgets/OfflineChatSettingsWidget.module.scss';


const fetchOfflineChatSettings = async (): Promise<OfflineChatSettings> => {
  const { data } = await makeRequest('/api/v1/channel/settings/offline-chat-settings', { schema: GetOfflineChatSettingsResponse });

  return data;
};

const defaultValues: OfflineChatSettings = {
  enabled: false,
  liveSettings: {
    emoteMode: false,
    followerMode: false,
    followerModeDuration: 0,
    slowMode: false,
    slowModeWaitTime: 30,
    subscriberMode: false,
    uniqueChatMode: false,
  },
  offlineSettings: {
    emoteMode: false,
    followerMode: false,
    followerModeDuration: 0,
    slowMode: false,
    slowModeWaitTime: 30,
    subscriberMode: false,
    uniqueChatMode: false,
  },
};

const OfflineChatSettingsBase: Component<{ settings: InitializedResourceReturn<OfflineChatSettings> }> = (props) => {
  const [settings, { mutate: mutateSettings }] = props.settings;
  const [, { addNotification }] = useNotification();
  const { popupApiError } = useErrorHandlers();

  const [isDirty, setDirty] = createSignal(false);
  const [saving, setSaving] = createSignal(false);

  const enabledRef = document.createElement('input');
  const liveEmoteModeRef = document.createElement('input');
  const liveFollowerModeRef = document.createElement('input');
  const liveFollowerModeDurationRef = document.createElement('input');
  const liveSlowModeRef = document.createElement('input');
  const liveSlowModeWaitTimeRef = document.createElement('input');
  const liveSubscriberModeRef = document.createElement('input');
  const liveUniqueChatModeRef = document.createElement('input');

  const offlineEmoteModeRef = document.createElement('input');
  const offlineFollowerModeRef = document.createElement('input');
  const offlineFollowerModeDurationRef = document.createElement('input');
  const offlineSlowModeRef = document.createElement('input');
  const offlineSlowModeWaitTimeRef = document.createElement('input');
  const offlineSubscriberModeRef = document.createElement('input');
  const offlineUniqueChatModeRef = document.createElement('input');


  const [enabled, setEnabled] = createSignal(defaultValues.enabled);

  const [liveEmoteMote, setLiveEmoteMode] = createSignal(defaultValues.liveSettings.emoteMode);
  const [liveFollowerMode, setLiveFollowerMode] = createSignal(defaultValues.liveSettings.followerMode);
  const [liveFollowerModeDuration, setLiveFollowerModeDuration] = createSignal(defaultValues.liveSettings.followerModeDuration);
  const [liveSlowMode, setLiveSlowMode] = createSignal(defaultValues.liveSettings.slowMode);
  const [liveSlowModeWaitTime, setLiveSlowModeWaitTime] = createSignal(defaultValues.liveSettings.slowModeWaitTime);
  const [liveSubscriberMode, setLiveSubscriberMode] = createSignal(defaultValues.liveSettings.subscriberMode);
  const [liveUniqueChatMode, setLiveUniqueChatMode] = createSignal(defaultValues.liveSettings.uniqueChatMode);

  const [offlineEmoteMode, setOfflineEmoteMode] = createSignal(defaultValues.offlineSettings.emoteMode);
  const [offlineFollowerMode, setOfflineFollowerMode] = createSignal(defaultValues.offlineSettings.followerMode);
  const [offlineFollowerModeDuration, setOfflineFollowerModeDuration] = createSignal(defaultValues.offlineSettings.followerModeDuration);
  const [offlineSlowMode, setOfflineSlowMode] = createSignal(defaultValues.offlineSettings.slowMode);
  const [offlineSlowModeWaitTime, setOfflineSlowModeWaitTime] = createSignal(defaultValues.offlineSettings.slowModeWaitTime);
  const [offlineSubscriberMode, setOfflineSubscriberMode] = createSignal(defaultValues.offlineSettings.subscriberMode);
  const [offlineUniqueChatMode, setOfflineUniqueChatMode] = createSignal(defaultValues.offlineSettings.uniqueChatMode);

  const hasChanged = createMemo<boolean>(() => isDirty() && !(
    settings().enabled === enabled() &&
    settings().liveSettings.emoteMode === liveEmoteMote() &&
    settings().liveSettings.followerMode === liveFollowerMode() &&
    settings().liveSettings.followerModeDuration === liveFollowerModeDuration() &&
    settings().liveSettings.slowMode === liveSlowMode() &&
    settings().liveSettings.slowModeWaitTime === liveSlowModeWaitTime() &&
    settings().liveSettings.subscriberMode === liveSubscriberMode() &&
    settings().liveSettings.uniqueChatMode === liveUniqueChatMode() &&
    settings().offlineSettings.emoteMode === offlineEmoteMode() &&
    settings().offlineSettings.followerMode === offlineFollowerMode() &&
    settings().offlineSettings.followerModeDuration === offlineFollowerModeDuration() &&
    settings().offlineSettings.slowMode === offlineSlowMode() &&
    settings().offlineSettings.slowModeWaitTime === offlineSlowModeWaitTime() &&
    settings().offlineSettings.subscriberMode === offlineSubscriberMode() &&
    settings().offlineSettings.uniqueChatMode === offlineUniqueChatMode()
  ));

  const handleFormSubmit = async (ev: SubmitEvent) => {
    ev.preventDefault();

    if (!hasChanged() || saving()) return;

    const newSettings = {
      enabled: enabled(),
      liveSettings: {
        emoteMode: liveEmoteMote(),
        followerMode: liveFollowerMode(),
        followerModeDuration: liveFollowerModeDuration(),
        slowMode: liveSlowMode(),
        slowModeWaitTime: liveSlowModeWaitTime(),
        subscriberMode: liveSubscriberMode(),
        uniqueChatMode: liveUniqueChatMode(),
      },
      offlineSettings: {
        emoteMode: offlineEmoteMode(),
        followerMode: offlineFollowerMode(),
        followerModeDuration: offlineFollowerModeDuration(),
        slowMode: offlineSlowMode(),
        slowModeWaitTime: offlineSlowModeWaitTime(),
        subscriberMode: offlineSubscriberMode(),
        uniqueChatMode: offlineUniqueChatMode(),
      },
    };

    setSaving(true);

    const request = await fetch('/api/v1/channel/settings/offline-chat-settings', {
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
        message: 'Offline chat settings have been saved successfully!',
        duration: 5000,
      });

      mutateSettings(newSettings);
    } else {
      popupApiError(request, {
        title: 'Settings not saved',
        action: 'saving offline chat settings',
      });
    }

    setSaving(false);
  };

  createEffect(() => {
    batch(() => {
      setEnabled(settings().enabled);
      setLiveEmoteMode(settings().liveSettings.emoteMode);
      setLiveFollowerMode(settings().liveSettings.followerMode);
      setLiveFollowerModeDuration(settings().liveSettings.followerModeDuration);
      setLiveSlowMode(settings().liveSettings.slowMode);
      setLiveSlowModeWaitTime(settings().liveSettings.slowModeWaitTime);
      setLiveSubscriberMode(settings().liveSettings.subscriberMode);
      setLiveUniqueChatMode(settings().liveSettings.uniqueChatMode);

      setOfflineEmoteMode(settings().offlineSettings.emoteMode);
      setOfflineFollowerMode(settings().offlineSettings.followerMode);
      setOfflineFollowerModeDuration(settings().offlineSettings.followerModeDuration);
      setOfflineSlowMode(settings().offlineSettings.slowMode);
      setOfflineSlowModeWaitTime(settings().offlineSettings.slowModeWaitTime);
      setOfflineSubscriberMode(settings().offlineSettings.subscriberMode);
      setOfflineUniqueChatMode(settings().offlineSettings.uniqueChatMode);
    });
  });

  return (
    <form class={style.settingsForm} onSubmit={handleFormSubmit}>
      <InputCheckbox
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

      <div class={style.modesContainer}>
        <div class={style.settingsForm}>
          <InputCheckbox
            name='offlineEmoteMode'
            label='Offline Emote Mode'
            ref={offlineEmoteModeRef}
            onChange={(ev) => {
              batch(() => {
                setOfflineEmoteMode(ev.target.checked);
                setDirty(true);
              });
            }}
            checked={settings().offlineSettings.emoteMode}
          />

          <InputCheckbox
            name='offlineFollowerMode'
            label='Offline Follower Mode'
            ref={offlineFollowerModeRef}
            onChange={(ev) => {
              batch(() => {
                setOfflineFollowerMode(ev.target.checked);
                setDirty(true);
              });
            }}
            checked={settings().offlineSettings.followerMode}
          />

          <InputLabeled label='Offline Follower Mode Duration' for='offlineFollowerModeDuration'>
            <InputRange
              name='offlineFollowerModeDuration'
              min={0}
              max={129600}
              step={60}
              label='Duration:'
              unit='seconds'
              ref={offlineFollowerModeDurationRef}
              onChange={(ev) => {
                batch(() => {
                  setOfflineFollowerModeDuration(ev.target.valueAsNumber);
                  setDirty(true);
                });
              }}
              value={settings().offlineSettings.followerModeDuration}
            />
          </InputLabeled>

          <InputCheckbox
            name='offlineSlowMode'
            label='Offline Slow Mode'
            ref={offlineSlowModeRef}
            onChange={(ev) => {
              batch(() => {
                setOfflineSlowMode(ev.target.checked);
                setDirty(true);
              });
            }}
            checked={settings().offlineSettings.slowMode}
          />

          <InputLabeled label='Offline Slow Mode Wait Time' for='offlineSlowModeWaitTime'>
            <InputRange
              name='offlineSlowModeWaitTime'
              min={3}
              max={120}
              label='Wait Time:'
              unit='seconds'
              ref={offlineSlowModeWaitTimeRef}
              onChange={(ev) => {
                batch(() => {
                  setOfflineSlowModeWaitTime(ev.target.valueAsNumber);
                  setDirty(true);
                });
              }}
              value={settings().offlineSettings.slowModeWaitTime}
            />
          </InputLabeled>

          <InputCheckbox
            name='offlineSubscriberMode'
            label='Offline Subscriber Mode'
            ref={offlineSubscriberModeRef}
            onChange={(ev) => {
              batch(() => {
                setOfflineSubscriberMode(ev.target.checked);
                setDirty(true);
              });
            }}
            checked={settings().offlineSettings.subscriberMode}
          />

          <InputCheckbox
            name='offlineUniqueChatMode'
            label='Offline Unique Chat Mode'
            ref={offlineUniqueChatModeRef}
            onChange={(ev) => {
              batch(() => {
                setOfflineUniqueChatMode(ev.target.checked);
                setDirty(true);
              });
            }}
            checked={settings().offlineSettings.uniqueChatMode}
          />
        </div>

        <div class={style.settingsForm}>
          <InputCheckbox
            name='liveEmoteMode'
            label='Live Emote Mode'
            ref={liveEmoteModeRef}
            onChange={(ev) => {
              batch(() => {
                setLiveEmoteMode(ev.target.checked);
                setDirty(true);
              });
            }}
            checked={settings().liveSettings.emoteMode}
          />

          <InputCheckbox
            name='liveFollowerMode'
            label='Live Follower Mode'
            ref={liveFollowerModeRef}
            onChange={(ev) => {
              batch(() => {
                setLiveFollowerMode(ev.target.checked);
                setDirty(true);
              });
            }}
            checked={settings().liveSettings.followerMode}
          />

          <InputLabeled label='Live Follower Mode Duration' for='liveFollowerModeDuration'>
            <InputRange
              name='liveFollowerModeDuration'
              min={0}
              max={129600}
              step={60}
              label='Duration:'
              unit='seconds'
              ref={liveFollowerModeDurationRef}
              onChange={(ev) => {
                batch(() => {
                  setLiveFollowerModeDuration(ev.target.valueAsNumber);
                  setDirty(true);
                });
              }}
              value={settings().liveSettings.followerModeDuration}
            />
          </InputLabeled>

          <InputCheckbox
            name='liveSlowMode'
            label='Live Slow Mode'
            ref={liveSlowModeRef}
            onChange={(ev) => {
              batch(() => {
                setLiveSlowMode(ev.target.checked);
                setDirty(true);
              });
            }}
            checked={settings().liveSettings.slowMode}
          />

          <InputLabeled label='Live Slow Mode Wait Time' for='liveSlowModeWaitTime'>
            <InputRange
              name='liveSlowModeWaitTime'
              min={3}
              max={120}
              label='Wait Time:'
              unit='seconds'
              ref={liveSlowModeWaitTimeRef}
              onChange={(ev) => {
                batch(() => {
                  setLiveSlowModeWaitTime(ev.target.valueAsNumber);
                  setDirty(true);
                });
              }}
              value={settings().liveSettings.slowModeWaitTime}
            />
          </InputLabeled>

          <InputCheckbox
            name='liveSubscriberMode'
            label='Live Subscriber Mode'
            ref={liveSubscriberModeRef}
            onChange={(ev) => {
              batch(() => {
                setLiveSubscriberMode(ev.target.checked);
                setDirty(true);
              });
            }}
            checked={settings().liveSettings.subscriberMode}
          />

          <InputCheckbox
            name='liveUniqueChatMode'
            label='Live Unique Chat Mode'
            ref={liveUniqueChatModeRef}
            onChange={(ev) => {
              batch(() => {
                setLiveUniqueChatMode(ev.target.checked);
                setDirty(true);
              });
            }}
            checked={settings().liveSettings.uniqueChatMode}
          />
        </div>
      </div>


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
          style={{ opacity: 0 }}
          disabled={!hasChanged()}
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

const OfflineChatSettingsWidget: Component = () => {
  const resource = createResource(fetchOfflineChatSettings, { initialValue: defaultValues });
  const [settings, { refetch: refetchSettings }] = resource;


  return (
    <Widget class={style.container} title='Offline Chat'>
      <ErrorBoundary fallback={
        <ErrorFallback
          class={style.fallback}
          refresh={refetchSettings}
          loading={settings.state === 'refreshing'}
        >
          Failed to load offline chat settings
        </ErrorFallback>
      }>
        <Suspense
          fallback={<FetchFallback>Fetching Offline Chat Settings</FetchFallback>}
        >
          <OfflineChatSettingsBase settings={resource}/>
        </Suspense>
      </ErrorBoundary>
    </Widget>
  );
};

export default OfflineChatSettingsWidget;
