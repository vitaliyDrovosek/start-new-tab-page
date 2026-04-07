class Storage {
    constructor(app) {
        this.app = app;
        this.STORAGE_KEY = "startV2";
    }

    load() {
        const savedData = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
        
        const defaultParticlesSettings = {
            STAR_COUNT: 50,
            REPEL_FORCE: 0.3,
            REPEL_RADIUS: 200,
            BASE_SPEED: 0.15,
            BOUNCE: 0.2,
            LINE_DISTANCE: 150,
            OVERLAP_DISTANCE: 5,
            PARTICLE_REPEL_FORCE: 0.01,
            PARTICLE_REPEL_RADIUS: 60
        };
        
        return {
            groups: savedData.groups || [],
            background: savedData.background || null,
            youtubeId: savedData.youtubeId || null,
            youtubePlaylistId: savedData.youtubePlaylistId || null,
            isMuted: savedData.isMuted ?? true,
            volume: savedData.volume ?? 50,
            searchEngine: savedData.searchEngine || 'yandex',
            searchHistory: savedData.searchHistory || [],
            historyEnabled: savedData.historyEnabled ?? true,
            weatherEnabled: savedData.weatherEnabled ?? false,
            sleepModeEnabled: savedData.sleepModeEnabled ?? true,
            blurEnabled: savedData.blurEnabled ?? true,
            particlesEnabled: savedData.particlesEnabled ?? true,
            videoCurrentTime: savedData.videoCurrentTime || 0,
            replaceTab: savedData.replaceTab ?? true,
            particlesSettings: savedData.particlesSettings || defaultParticlesSettings
        };
    }

    save() {
        if (this.app.particles) {
            this.app.data.particlesEnabled = this.app.particles.enabled;
            this.app.data.particlesSettings = {
                STAR_COUNT: this.app.particles.STAR_COUNT,
                REPEL_FORCE: this.app.particles.REPEL_FORCE,
                REPEL_RADIUS: this.app.particles.REPEL_RADIUS,
                BASE_SPEED: this.app.particles.BASE_SPEED,
                BOUNCE: this.app.particles.BOUNCE,
                LINE_DISTANCE: this.app.particles.LINE_DISTANCE,
                OVERLAP_DISTANCE: this.app.particles.OVERLAP_DISTANCE,
                PARTICLE_REPEL_FORCE: this.app.particles.PARTICLE_REPEL_FORCE,
                PARTICLE_REPEL_RADIUS: this.app.particles.PARTICLE_REPEL_RADIUS
            };
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.app.data));
    }

    saveBeforeUnload() {
        const video = document.getElementById('bgVideo');
        if (video.style.display !== 'none') {
            this.app.data.videoCurrentTime = video.currentTime;
        }
        this.save();
    }

    copyConfig() {
        const config = JSON.stringify(this.app.data, null, 2);
        navigator.clipboard.writeText(config)
            .then(() => alert("Конфигурация скопирована в буфер обмена"))
            .catch(this.fallbackCopy.bind(this, config));
    }

    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert("Конфигурация скопирована в буфер обмена");
    }

    pasteConfig() {
        navigator.clipboard.readText()
            .then(text => this.applyConfig(text))
            .catch(() => alert("Не удалось прочитать буфер обмена"));
    }

    applyConfig(text) {
        try {
            const newConfig = JSON.parse(text);
            Object.assign(this.app.data, newConfig);
            
            if (this.app.particles && newConfig.particlesSettings) {
                this.app.particles.updateSettings(newConfig.particlesSettings);
            }
            
            this.save();
            this.applyChanges();
            alert("Конфигурация применена");
        } catch {
            alert("Неверный формат конфигурации");
        }
    }

    applyChanges() {
        this.app.background.apply();
        this.app.groups.render();
        this.app.search.updateUI();
        this.app.history.render();
        this.app.audio.updateIcon(this.app.data.volume, this.app.data.isMuted);
        
        if (this.app.weather.widget) {
            this.app.weather.widget.classList.toggle('visible', this.app.data.weatherEnabled);
            if (this.app.data.weatherEnabled) this.app.weather.fetch();
        }
    }

    resetConfig() {
        if (confirm("Вы уверены, что хотите сбросить все настройки?")) {
            localStorage.removeItem(this.STORAGE_KEY);
            this.app.data = this.load();
            
            if (this.app.particles && this.app.data.particlesSettings) {
                this.app.particles.updateSettings(this.app.data.particlesSettings);
            }
            
            this.applyChanges();
            
            if (this.app.weather.widget) {
                this.app.weather.widget.classList.remove('visible');
            }

            if (this.app.particles) {
                this.app.particles.enabled = this.app.data.particlesEnabled;
                const indicator = document.getElementById('particlesIndicator');
                if (indicator) {
                    indicator.classList.toggle('off', !this.app.particles.enabled);
                }
            }

            alert("Конфигурация сброшена");
        }
    }
}

export default Storage;