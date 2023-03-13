import Button from '#components/Button';
import type { Component, JSX } from 'solid-js';


const ButtonTest: Component = () => {
  const containerStyle: JSX.CSSProperties = {
    height: '100%',
    display: 'flex',
    'flex-direction': 'column',
    'align-items': 'center',
    'justify-content': 'center',
  };

  return (
    <div style={containerStyle}>
      <Button symbol='dashboard'>Test</Button>
      <figure></figure>
      <Button symbol='dashboard' color='primary'>Test</Button>
      <figure></figure>
      <Button>Test</Button>
      <figure></figure>
      <Button symbol='dashboard' size='big'>Test</Button>
      <figure></figure>
      <Button symbol='dashboard' color='primary' size='big'>Test</Button>
      <figure></figure>
      <Button size='big'>Test</Button>
    </div>
  );
};

export default ButtonTest;
