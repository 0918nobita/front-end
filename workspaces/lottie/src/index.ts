import lottie from 'lottie-web';

const container = document.getElementById('app');
const playButton = document.getElementById('play');

const item = lottie.loadAnimation(
    {
        name: 'ae',
        path: 'data.json',
        container: container as Element,
        renderer: 'svg',
        autoplay: false,
    }
);

item.loop = false;

playButton?.addEventListener('click', () => {
    item.play();
});
