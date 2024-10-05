import { useNotification } from '#providers/NotificationProvider';
import { ServerErrorResponse } from '#types/api/serverError';
import { mergeOptions } from '#shared/utils';
import { createContext, For, JSX, onCleanup, onMount, useContext } from 'solid-js';
import { isDev } from 'solid-js/web';


export type PopupApiErrorOptions = {
  title: string;
  action: string;

  duration?: number;

  genericMessage?: string;
  detailedListMessage?: string;
};


export type ErrorHandlersContextValue = {
  popupApiError(response: Response, options: PopupApiErrorOptions): Promise<void>;
};

const ErrorHandlersContext = createContext<ErrorHandlersContextValue>({
  popupApiError: () => {
    throw new Error('ErrorHandlersContext: popupApiError() called before provider');
  },
});

export const ErrorHandlersProvider: ParentComponent = (props) => {
  const [, { addNotification }] = useNotification();


  const popupApiError = async (response: Response, options: PopupApiErrorOptions) => {
    const mergedOptions = mergeOptions(options, {
      duration: 10000,
      genericMessage: `An error occurred while ${options.action}.`,
      detailedListMessage: `The following errors occurred while ${options.action}:`,
    });

    let message: string | JSX.Element = `Unknown error occurred while ${options.action}`;

    try {
      const body = await response.json();
      const error = ServerErrorResponse.safeParse(body);

      if (error.success) {
        if (error.data.details?.errors === undefined) {
          message = `${mergedOptions.genericMessage} ${error.data.message}`;
        } else {
          message = (
            <>
              <p>{mergedOptions.detailedListMessage}</p>

              <ul>
                <For each={error.data.details.errors}>
                  {(error) => (
                    <li>
                      <p>
                        <code>
                          {error.path.join(':').toUpperCase()}
                        </code>
                      </p>
                      <p>
                        {error.message}
                      </p>
                    </li>
                  )}
                </For>
              </ul>
            </>
          );
        }
      }
    } catch (err) {
      if (isDev) {
        console.error(err);
      }
    }

    addNotification({
      title: options.title,
      type: 'error',
      duration: mergedOptions.duration,
      message,
    });
  };

  const errorEventHandler = (event: ErrorEvent) => {
    const href = `${event.filename}:${event.lineno}:${event.colno}`;

    addNotification({
      title: 'An error occurred',
      type: 'error',
      duration: 3000,
      message: (
        <>
          <code style={{ 'font-size': '1.6rem' }}>
            {event.message}
          </code>
          <a href={href} style={{ 'font-size': '1.6rem', 'text-decoration': 'none' }}>
            {href}
          </a>
        </>
      ),
    });
  };

  onMount(() => {
    if (isDev) {
      window.addEventListener('error', errorEventHandler);
    }
  });

  onCleanup(() => {
    if (isDev) {
      window.removeEventListener('error', errorEventHandler);
    }
  });

  return (
    <ErrorHandlersContext.Provider
      value={{
        popupApiError,
      }}
    >
      {props.children}
    </ErrorHandlersContext.Provider>
  );
};

export const useErrorHandlers = (): ErrorHandlersContextValue => useContext(ErrorHandlersContext);
