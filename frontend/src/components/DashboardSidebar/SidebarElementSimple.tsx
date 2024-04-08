import SidebarElementBase, { SidebarElementProps } from '#components/DashboardSidebar/SidebarElementBase';
import { hasAuxRoutes, joinPaths } from '#routers/utils';
import { A } from '@solidjs/router';

import style from '#styles/DashboardSidebar.module.scss';


const SidebarElementSimple: Component<SidebarElementProps> = (props) => {
  return (
    <A
      href={joinPaths(props.absolutePath, props.path)}
      class={style.element}
      activeClass={style.active}
      end={!hasAuxRoutes(props)}
      draggable={false}
    >
      <SidebarElementBase {...props} />
    </A>
  );
};

export default SidebarElementSimple;
