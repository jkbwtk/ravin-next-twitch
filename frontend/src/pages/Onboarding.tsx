import Button from '#components/Button';
import Input from '#components/Input';
import { OnboardingForm } from '#types/api/onboarding';
import { faker } from '@faker-js/faker';
import AnchorText from '#components/AnchorText';
import AnimatedImage from '#components/AnimatedImage';
import { useNotification } from '#providers/NotificationProvider';

import style from '#styles/Onboarding.module.scss';
import borders from '#styles/borders.module.scss';
import registeringApplicationMp4 from '#assets/registeringApplication.mp4';
import registeringApplicationWebm from '#assets/registeringApplication.webm';
import unrelatedImage from '#assets/unrelatedImage.png';


const Onboarding: Component = () => {
  document.title = 'Ravin NeXT - Onboarding';
  const [, { addNotification }] = useNotification();

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  const key = params.get('key') ?? '';

  let botLogin = document.createElement('input');
  let botToken = document.createElement('input');
  let twitchClientId = document.createElement('input');
  let twitchClientSecret = document.createElement('input');
  let adminUsername = document.createElement('input');

  const handleSubmit = async (ev: SubmitEvent) => {
    ev.preventDefault();

    const form: OnboardingForm = {
      key,
      adminUsername: adminUsername.value,
      botLogin: botLogin.value,
      botToken: botToken.value,
      twitchClientId: twitchClientId.value,
      twitchClientSecret: twitchClientSecret.value,
    };

    const resp = await fetch('/onboarding/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (resp.ok) {
      addNotification({
        type: 'success',
        title: 'Onboarding Complete',
        message: 'You have successfully completed the onboarding process.',
        duration: 5000,
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Onboarding error',
        message: 'There was an error during the onboarding process. Please try again.',
        duration: 5000,
      });
    }
  };

  return (
    <div class={style.container}>
      <div class={style.formContainer}>
        <div class={style.header}>
          <span class={style.title}>Server Setup</span>

          <span class={style.description}>
            To complete the onboarding process, please fill out the following form.
          </span>
        </div>

        <form class={style.form} onSubmit={handleSubmit}>
          <Input
            type='text'
            required={true}
            name='adminUsername'
            id='adminUsername'
            label='Admin Username'
            ref={adminUsername}
          />

          <Input
            type='text'
            required={true}
            name='botLogin'
            id='botLogin'
            label='Bot Login'
            ref={botLogin}
          />

          <Input
            type='text'
            required={true}
            name='botToken'
            id='botToken'
            label='Bot Token'
            ref={botToken}
          />

          <Input
            type='text'
            required={true}
            name='twitchClientId'
            id='twitchClientId'
            label='Twitch Client ID'
            ref={twitchClientId}
          />

          <Input
            type='text'
            required={true}
            name='twitchClientSecret'
            id='twitchClientSecret'
            label='Twitch Client Secret'
            ref={twitchClientSecret}
          />

          <Button type='submit' size='big' class={style.submitButton}>Submit</Button>

          <Button type='submit' size='big' class={style.submitButton} onClick={() => {
            addNotification({
              type: 'success',
              title: 'Onboarding Complete',
              message: faker.lorem.paragraph(1),
            });
            addNotification({
              type: 'error',
              title: 'Onboarding error',
              message: faker.lorem.paragraph(1),
            });
            addNotification({
              type: 'info',
              title: 'Onboarding info',
              message: faker.lorem.paragraph(1),
            });
          }}>Test notifications</Button>
        </form>
      </div>

      <div classList={{
        [borders.border]: true,
        [borders.right]: true,
        [borders.bottom]: true,
      }} />

      <div class={style.guideContainer}>
        <div class={style.entry}>
          <span class={style.title}>Setting up Twitch Bot</span>
          <p>
            This isn't a proper guide on how to set everything up, it's just here to test the layout.
            <br />
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Molestias dolores sint nobis explicabo!
            Asperiores officia, impedit perferendis,
            quasi veritatis alias possimus beatae nesciunt, ducimus id commodi!
            Harum, quaerat consequuntur deleniti autem debitis rem maiores odit!
          </p>

          <video class={style.media} loop={true} autoplay={true} muted={true}>
            <source src={registeringApplicationWebm} type='video/webm' />
            <source src={registeringApplicationMp4} type='video/mp4' />
          </video>

          <p class={style.description}>
            This is just another line of text. Let's see how it looks. We can also add some links.
          </p>

          <p class={style.description}>
            So here is a link to the guide on how to set up a Twitch bot:
            <AnchorText href='https://dev.twitch.tv/docs/irc/authenticate-bot' />.
            And here are some more words to end this "paragraph".
          </p>

          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Minima dolor nulla numquam reiciendis autem id debitis,
            ad aliquam tempore at similique eius eligendi harum ipsa corporis rem culpa.
            Doloribus consequuntur, aliquam nobis laborum exercitationem soluta et tenetur modi,
            repellat saepe itaque porro! Tempora modi sed labore tenetur officia adipisci impedit.
          </p>

          <p>
          This should be the last line of this entry.
          </p>
        </div>

        <div class={style.entry}>
          <span class={style.title}>Setting up API access</span>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Reiciendis nam exercitationem maxime, explicabo at iusto corporis eveniet quis.
            Eaque soluta eos reprehenderit totam error placeat unde fuga quae,
            est excepturi eum ad magni sequi, eveniet, et nam quia delectus accusantium harum minima ratione.
            Autem nisi ipsa beatae eos vel labore illum, itaque hic alias voluptatibus aperiam iusto in at omnis.
            Omnis earum necessitatibus ab, numquam qui,
            porro, eum dolore id at saepe perspiciatis recusandae magni illo quod reiciendis.
            Similique, eveniet esse? Rerum nisi ipsam quis eligendi. Quam dolorem eum eius!
            Architecto praesentium ipsum tempore ratione blanditiis, in sunt amet ut unde similique!
            Commodi porro minus eaque inventore distinctio maxime consectetur nobis.
            Sed ratione tempora deserunt itaque ipsum fuga culpa earum!
          </p>

          <AnimatedImage class={style.media} src={unrelatedImage} draggable={false} />

          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Reiciendis nam exercitationem maxime, explicabo at iusto corporis eveniet quis.
            Eaque soluta eos reprehenderit totam error placeat unde fuga quae,
            est excepturi eum ad magni sequi, eveniet, et nam quia delectus accusantium harum minima ratione.
            Autem nisi ipsa beatae eos vel labore illum, itaque hic alias voluptatibus aperiam iusto in at omnis.
            Omnis earum necessitatibus ab, numquam qui,
            porro, eum dolore id at saepe perspiciatis recusandae magni illo quod reiciendis.
            Similique, eveniet esse? Rerum nisi ipsam quis eligendi. Quam dolorem eum eius!
            Architecto praesentium ipsum tempore ratione blanditiis, in sunt amet ut unde similique!
            Commodi porro minus eaque inventore distinctio maxime consectetur nobis.
            Sed ratione tempora deserunt itaque ipsum fuga culpa earum!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
