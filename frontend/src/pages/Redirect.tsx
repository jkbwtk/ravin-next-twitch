import { useNavigate } from '@solidjs/router';

export type RedirectProps = {
  to: string;
};

const Redirect: RouteComponent<{}, RedirectProps> = (props) => {
  const navigate = useNavigate();

  if (props.data?.to) {
    navigate(props.data.to);
  }

  return <span>Navigating to {props.data?.to}</span>;
};

export default Redirect;
