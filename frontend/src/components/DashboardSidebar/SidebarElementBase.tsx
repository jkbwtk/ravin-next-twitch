import MaterialSymbol from '#components/MaterialSymbol';
import { ExtendedRouteDefinition } from '#routers/utils';


export type SidebarElementProps = ExtendedRouteDefinition & {
  absolutePath?: string;
};

const SidebarElementBase: Component<SidebarElementProps> = (props) => {
  return (<>
    <MaterialSymbol symbol={props.metadata?.symbol ?? 'question_mark'} />
    <span>{props.metadata?.name ?? props.path ?? '[EMPTY_ROUTE]'}</span>
  </>);
};

export default SidebarElementBase;
