import Select from '@suid/material/Select/Select';
import style from '#styles/Paginator.module.scss';
import { MenuItem } from '@suid/material';
import { Accessor, Setter, Signal } from 'solid-js';
import { SelectChangeEvent } from '@suid/material/Select/SelectInputProps';
import MaterialSymbol from '#components/MaterialSymbol';
import Button from '#components/Button';


export type PaginatorProps = {
  page: Signal<number>;
  limit: Signal<number>;
  total: Accessor<number>;
};

const Paginator: Component<PaginatorProps> = (props) => {
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
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
      </div>

      <div class={style.controls}>
        <span class={style.pageInfo}>
          {props.page[0]() * props.limit[0]() + 1} - {props.limit[0]() + props.page[0]() * props.limit[0]()} of {props.total()}
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
