class Groups {
    constructor(app) {
        this.app = app;
    }

    render() {
        const container = document.getElementById("groups");
        if (!container) return;

        container.innerHTML = "";

        this.app.data.groups.forEach((group, gi) => {
            const div = document.createElement("div");
            div.className = "group";

            div.onclick = (e) => {
                if (e.target.tagName === 'A' ||
                    (e.target.tagName === 'SPAN' && e.target.textContent === '✕') ||
                    e.target === title.children[0]) {
                    return;
                }
                this.addTab(gi);
            };

            const title = document.createElement("div");
            title.className = "group-title";
            title.innerHTML = `<span>${group.name}</span><span>✕</span>`;

            title.children[0].onclick = (e) => {
                e.stopPropagation();
                const n = prompt("Новое имя группы:", group.name);
                if (n) { group.name = n; this.app.storage.save(); this.render(); }
            };

            title.children[1].onclick = (e) => {
                e.stopPropagation();
                this.app.data.groups.splice(gi, 1);
                this.app.storage.save();
                this.render();
            };
            div.appendChild(title);

            group.links.forEach(link => {
                const a = document.createElement("a");
                a.className = "link";
                a.href = link.url;
                a.target = "";
                a.textContent = link.customName || link.name;

                a.oncontextmenu = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const display = prompt("Отображаемое имя:", link.customName || link.name);
                    const real = prompt("URL:", link.url);
                    if (display && real) {
                        link.customName = display;
                        link.url = real;
                        this.app.storage.save();
                        this.render();
                    }
                };

                div.appendChild(a);
            });

            container.appendChild(div);
        });
    }

    add() {
        const name = prompt("Название группы:");
        if (name) {
            this.app.data.groups.push({ name: name, links: [] });
            this.app.storage.save();
            this.render();
        }
    }

    addTab(groupIndex) {
        const display = prompt("Отображаемое имя:");
        if (!display) return;
        const url = prompt("URL:");
        if (!url) return;
        this.app.data.groups[groupIndex].links.push({ customName: display, url: url });
        this.app.storage.save();
        this.render();
    }
}
export default Groups