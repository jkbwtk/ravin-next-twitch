import { useNavigate } from '@solidjs/router';

const Redirect: Component<string> = (props) => {
  const navigate = useNavigate();

  navigate(props);

  return <span>Navigating to {props}</span>;
};

export default Redirect;
