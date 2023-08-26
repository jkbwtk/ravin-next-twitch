import { useRoutes } from '@solidjs/router';
import { routes } from './routes';


const App: Component = () => {
  const Routes = useRoutes(routes);

  return (
    <Routes />
  );
};

export default App;
