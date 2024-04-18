import Select from '@suid/material/Select/Select';
import { MenuItem } from '@suid/material';
import { Accessor, For, Signal } from 'solid-js';
import { SelectChangeEvent } from '@suid/material/Select/SelectInputProps';
import Button from '#components/Button';
import { useSession } from '#providers/SessionProvider';

import style from '#styles/Paginator.module.scss';


export type PaginatorProps = {
  page: Signal<number>;
  limit: Signal<number>;
  total: Accessor<number>;
};

const Paginator: Component<PaginatorProps> = (props) => {
  const [session] = useSession();
  const handleLimitChange = (event: SelectChangeEvent) => {
    props.limit[1](parseInt(event.target.value));
    props.page[1](0);
  };


  return (
    <div class={style.paginator}>
      <div class={style.limitPicker}>
        <span>Rows per page:</span>

        <Select
          class={style.select}
          value={props.limit[0]()}
          onChange={handleLimitChange}
        >
          <For each={session.config.paginationLimitOptions}>
            {(value) => <MenuItem value={value}>{value}</MenuItem>}
          </For>
        </Select>
      </div>

      <div class={style.controls}>
        <span class={style.pageInfo}>
          {props.page[0]() * props.limit[0]() + 1} - {Math.min(props.limit[0]() + props.page[0]() * props.limit[0](), props.total())} of {props.total()}
        </span>

        <Button
          customClass={style.pageButton}
          symbol='chevron_left'
          size='big'
          plain
          onClick={() => props.page[1](props.page[0]() - 1)}
          disabled={props.page[0]() === 0}
        />

        <Button
          customClass={style.pageButton}
          symbol='chevron_right'
          size='big'
          plain
          onClick={() => props.page[1](props.page[0]() + 1)}
          disabled={props.page[0]() >= Math.ceil(props.total() / props.limit[0]()) - 1}
        />
      </div>
    </div>
  );
};

export default Paginator;
