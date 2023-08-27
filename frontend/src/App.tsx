import { useRoutes } from '@solidjs/router';
import { getRoutes } from './routes';


const App: Component = () => {
  const Routes = useRoutes(getRoutes());

  return (
    <Routes />
  );
};

export default App;
