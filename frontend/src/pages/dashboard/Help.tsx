import DashboardInfoBar from '#components/DashboardInfoBar';
import AnchorText from '#components/AnchorText';
import AnimatedImage from '#components/AnimatedImage';

import style from '#styles/dashboard/Help.module.scss';
import registeringApplicationMp4 from '#assets/registeringApplication.mp4';
import registeringApplicationWebm from '#assets/registeringApplication.webm';
import unrelatedImage from '#assets/unrelatedImage.png';


const Help: Component = () => {
  return (
    <div class={style.container}>
      <DashboardInfoBar />

      <div class={style.helpContainer}>
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

export default Help;
