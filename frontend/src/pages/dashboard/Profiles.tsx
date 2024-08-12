import Button from '#components/Button';
import DashboardInfoBar from '#components/DashboardInfoBar';
import ProfileStatusWidget from '#components/widgets/ProfileStatusWidget';
import ProfilesTableWidget from '#components/widgets/ProfilesTableWidget';
import { BehaviorProfilesEditorProvider, useBehaviorProfilesEditor } from '#providers/BehaviorProfilesEditorProvider';

import style from '#styles/dashboard/Profiles.module.scss';


const InfoBar: RouteComponent = (props) => {
  const [, { open }] = useBehaviorProfilesEditor();

  return (
    <DashboardInfoBar metadata={props.data?.metadata}>
      <Button color='primary' size='big' onClick={() => open()}>Add Profile</Button>
    </DashboardInfoBar>
  );
};

const Profiles: RouteComponent = (props) => {
  let containerRef = document.createElement('div');

  return (
    <BehaviorProfilesEditorProvider>
      <div class={style.container}>
        <InfoBar {...props} />
        <div ref={containerRef} class={style.widgets}>
          <ProfileStatusWidget/>
          <ProfilesTableWidget />
        </div>
      </div>
    </BehaviorProfilesEditorProvider>
  );
};

export default Profiles;
