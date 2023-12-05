import MaterialSymbol from '#components/MaterialSymbol';
import TemplateButton from '#components/TemplateButton';
import { clamp, RequiredDefaults } from '#shared/utils';
import { createEffect, createSignal, JSX, mergeProps, onCleanup, onMount, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Transition } from 'solid-transition-group';

import style from '#styles/Modal.module.scss';


export type ModalProps = {
  open: boolean;
  onClose?: () => void;

  title?: string;
};

export const defaultProps: RequiredDefaults<ModalProps> = {
  onClose: () => void 0,
  title: '',
};

const Modal: ParentComponent<ModalProps> = (userProps) => {
  const props = mergeProps(defaultProps, userProps);
  const [isDragging, setIsDragging] = createSignal(false);

  let containerRef = document.createElement('div');
  let modalRef = document.createElement('div');

  let offsetX = 0;
  let offsetY = 0;

  let startX = 0;
  let startY = 0;

  const clampOffset = (): { x: number, y: number } => {
    const box = modalRef.getBoundingClientRect();
    const parentbox = containerRef.getBoundingClientRect();

    const clampedX = clamp(offsetX, -((parentbox.width - box.width) / 2) + 30, ((parentbox.width - box.width) / 2) - 30);
    const clampedY = clamp(offsetY, -((parentbox.height - box.height) / 2) + 30, ((parentbox.height - box.height) / 2) - 30);

    return { x: clampedX, y: clampedY };
  };

  const setModalPosition = () => {
    const { x: clampedX, y: clampedY } = clampOffset();

    modalRef.style.setProperty('--modal-offset-x', `${clampedX}px`);
    modalRef.style.setProperty('--modal-offset-y', `${clampedY}px`);
  };

  const onDrag = (ev: MouseEvent) => {
    ev.preventDefault();

    offsetX = ev.clientX - startX;
    offsetY = ev.clientY - startY;

    setModalPosition();
  };

  const onDragEnd = (ev: MouseEvent) => {
    ev.preventDefault();

    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('mousemove', onDrag);

    setTimeout(() => {
      setIsDragging(false);
    });
  };

  const onDragStart: JSX.DOMAttributes<HTMLDivElement>['onMouseDown'] = (ev) => {
    ev.preventDefault();

    const { x: clampedX, y: clampedY } = clampOffset();

    startX = ev.clientX - clampedX;
    startY = ev.clientY - clampedY;

    setIsDragging(true);

    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('mousemove', onDrag);
  };

  const handleResize = () => {
    setModalPosition();
  };

  onMount(() => {
    window.addEventListener('resize', handleResize);
  });

  onCleanup(() => {
    window.removeEventListener('resize', handleResize);
  });

  createEffect(() => {
    if (props.open) {
      offsetX = 0;
      offsetY = 0;

      setModalPosition();
    }
  });

  return (
    <Portal>
      <Transition
        enterActiveClass={style.modalOpen}
        exitActiveClass={style.modalClose}
      >
        <Show when={props.open}>
          <div
            ref={containerRef}
            class={style.container}
            onClick={(ev) => {
              if (ev.target === ev.currentTarget && !isDragging()) props.onClose();
            }}
          >
            <div ref={modalRef} class={style.modal}>
              <div
                class={style.titleBar}
                onMouseDown={onDragStart}
                classList={{
                  [style.dragged]: isDragging(),
                }}
              >
                <span class={style.title}>{props.title}</span>

                <TemplateButton onClick={props.onClose}>
                  <MaterialSymbol symbol='close' color='gray' highlightColor='primary' interactive />
                </TemplateButton>
              </div>

              {props.children}
            </div>
          </div>
        </Show>
      </Transition>
    </Portal>
  );
};

export default Modal;
