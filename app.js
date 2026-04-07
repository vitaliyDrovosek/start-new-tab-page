import Audio from './modules/Audio.js';
import Particles from './modules/Particles.js';
import Video from './modules/Video.js';
import Storage from './modules/Storage.js';
import HUD from './modules/HUD.js';
import Weather from './modules/Weather.js';
import Background from './modules/Background.js';
import History from './modules/History.js';
import Search from './modules/Search.js';
import Groups from './modules/Group.js';

class App {
    constructor() {
        this.searchEngines = {
            yandex: { name: 'Yandex', url: 'https://yandex.ru/search/?text=' },
            google: { name: 'Google', url: 'https://www.google.com/search?q=' }
        };

        this.storage = new Storage(this);
        this.data = this.storage.load();

        this.hud = new HUD(this);
        this.video = new Video(this);
        this.audio = new Audio(this);
        this.weather = new Weather(this);
        this.history = new History(this);
        this.search = new Search(this);
        this.groups = new Groups(this);
        this.background = new Background(this);
        this.particles = new Particles(this.data.particlesSettings);

        window.app = this;
        this.init();
    }

    init() {
        this.hud.init();
        this.audio.init();
        this.weather.init();
        this.history.init();
        this.search.updateUI();
        this.background.apply();
        this.groups.render();

        if (this.data.particlesEnabled === false) {
            this.particles.toggle();
        }

        this.search.loadReplaceTab();
        this.setupEventListeners();
        this.startVideoTimeSave();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown-menu, .dropdown-button, .search-input, .history-item, .volume-slider')) {
                this.hud.resetTimer();
            }

            if (!e.target.closest('.volume-control, .volume-icon, .volume-slider')) {
                this.background.unmuteIfNeeded();
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                const video = document.getElementById('bgVideo');
                if (video.style.display !== 'none' && video.paused) {
                    video.play().catch(() => {});
                }
                this.background.unmuteIfNeeded();
            }
        });

        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                setTimeout(() => {
                    const video = document.getElementById('bgVideo');
                    if (video.style.display !== 'none' && video.paused) {
                        video.play().catch(() => {});
                    }
                    this.background.unmuteIfNeeded();
                }, 100);
            }
        });
    }

    startVideoTimeSave() {
        setInterval(() => {
            const video = document.getElementById('bgVideo');
            if (video?.style.display !== 'none' && !video.paused) {
                this.data.videoCurrentTime = video.currentTime;
                this.storage.save();
            }
        }, 3000);
    }
}

const app = new App();

window.addEventListener('beforeunload', () => {
    app.storage.saveBeforeUnload();
});