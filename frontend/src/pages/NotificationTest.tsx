import Button from '#components/Button';
import { useNotification } from '#providers/NotificationProvider';
import type { JSX } from 'solid-js';
import { faker } from '@faker-js/faker';


const NotificationTest: Component = () => {
  const [, { addNotification }] = useNotification();

  const containerStyle: JSX.CSSProperties = {
    height: '90%',
    width: '100%',
    display: 'flex',
    'align-items': 'flex-end',
    'justify-content': 'center',
    'flex-wrap': 'wrap',
    'align-content': 'flex-end',
    gap: '2rem',
  };

  return (
    <div style={containerStyle}>
      <Button
        onClick={() => {
          addNotification({
            title: 'Test notification',
            type: 'info',
            duration: 5000,
            message: faker.lorem.paragraph(1),
          });
        }}
      >
        5s 1p info
      </Button>

      <Button
        onClick={() => {
          addNotification({
            title: 'Test notification',
            type: 'info',
            duration: 5000,
            message: (<>
              <p>{faker.lorem.paragraph(1)}</p>
              <p>{faker.lorem.paragraph(1)}</p>
            </>),
          });
        }}
      >
        5s 2p info
      </Button>

      <Button
        onClick={() => {
          addNotification({
            title: 'Test notification',
            type: 'error',
            message: (<>
              <p>{faker.lorem.paragraph(1)}</p>
              <p>{faker.lorem.paragraph(1)}</p>
              <p>{faker.lorem.paragraph(1)}</p>
              <p>{faker.lorem.paragraph(1)}</p>
              <p>{faker.lorem.paragraph(1)}</p>
            </>),
          });
        }}
      >
        inf 5p error
      </Button>

      <Button
        onClick={() => {
          addNotification({
            title: 'Test notification',
            type: 'success',
            duration: 5000,
            message: faker.lorem.paragraph(1),
          });

          addNotification({
            title: 'Test notification',
            type: 'info',
            duration: 5000,
            message: faker.lorem.paragraph(1),
          });

          addNotification({
            title: 'Test notification',
            type: 'error',
            duration: 5000,
            message: faker.lorem.paragraph(1),
          });
        }}
      >
        all types 5s
      </Button>

      <Button
        onClick={() => {
          addNotification({
            type: 'success',
            title: 'Onboarding Complete',
            message: (<>
              <p>You have successfully completed the onboarding process.</p>
              <p>The server will shut down in 15 seconds</p>
            </>),
            duration: 15000,
          });
        }}
      >
        Onboarding submit
      </Button>
    </div>
  );
};

export default NotificationTest;
