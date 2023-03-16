import SidebarElementBase, { SidebarRoute } from '#components/DashboardSidebar/SidebarElementBase';
import { hasAuxRoutes } from '#components/DashboardSidebar/SidebarUtils';
import { Link } from '@solidjs/router';
import { Component } from 'solid-js';

import style from '#styles/DashboardSidebar.module.scss';


const SidebarElementSimple: Component<SidebarRoute> = (props) => {
  return (
    <Link
      href={props.href}
      class={style.element}
      activeClass={style.active}
      end={!hasAuxRoutes(props)}
      draggable={false}
    >
      <SidebarElementBase {...props} />
    </Link>
  );
};

export default SidebarElementSimple;
