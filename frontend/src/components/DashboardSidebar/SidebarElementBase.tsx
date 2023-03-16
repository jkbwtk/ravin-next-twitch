import MaterialSymbol from '#components/MaterialSymbol';
import { Component } from 'solid-js';


export interface SidebarRoute {
  symbol: string;
  name: string;
  href: string;
  auxRoutes?: SidebarRoute[];
}

const SidebarElementBase: Component<SidebarRoute> = (props) => {
  return (<>
    <MaterialSymbol symbol={props.symbol} />
    <span>{props.name}</span>
  </>);
};

export default SidebarElementBase;
