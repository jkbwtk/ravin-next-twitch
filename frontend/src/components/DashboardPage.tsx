import { JSX } from 'solid-js';
import { Link } from '@solidjs/router';
import ravinLogo from '#assets/ravinLogo.svg';
import DashboardSidebar from '#components/DashboardSidebar';
import dashboardElements from '#assets/dashboardRoutes';
import MaterialSymbol from '#components/MaterialSymbol';

import style from '#styles/DashboardPage.module.scss';
import borders from '#styles/borders.module.scss';


const DashboardPage: Component<JSX.HTMLAttributes<HTMLButtonElement>> = (props) => {
  return (
    <div class={style.container}>
      <Link href='/' classList={{
        [style.logoContainer]: true,
        [borders.border]: true,
        [borders.bottom]: true,
        [borders.right]: true,
      }}>
        <img src={ravinLogo} class={style.logo} />
      </Link>

      <div classList={{
        [style.topBarContainer]: true,
        [borders.border]: true,
        [borders.bottom]: true,
      }}>
        <div class={style.activityIcons}>
          <MaterialSymbol symbol='notifications' size='big' color='gray' interactive={true} highlightColor={'gray'} />
          <MaterialSymbol symbol='account_circle' size='big' color='gray' interactive={true} highlightColor={'gray'} />
        </div>
      </div>

      <div classList={{
        [style.sidebarContainer]: true,
        [borders.border]: true,
        [borders.right]: true,
      }}>
        <DashboardSidebar elements={dashboardElements} />
      </div>

      {props.children}
    </div>
  );
};

export default DashboardPage;
