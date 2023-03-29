import MaterialSymbol from '#components/MaterialSymbol';


export interface SidebarRoute {
  symbol: string;
  name: string;
  href: string;
  auxRoutes?: SidebarRoute[];
  component?: Component;
}

const SidebarElementBase: Component<SidebarRoute> = (props) => {
  return (<>
    <MaterialSymbol symbol={props.symbol} />
    <span>{props.name}</span>
  </>);
};

export default SidebarElementBase;
