export const PopUpTypes = Object.freeze({
    GameInfo: {id: 1}
});

export const popUp = {
    type: null,
    element: document.getElementById('popup'),
    background: document.getElementById('popup-background'),

    ChangeType(newType) {
        this.type = newType;
    },

    async UpdateElements() {
        console.log('Updating elements...');
        const titleElement = document.getElementById('popup-title');
        const descriptionElement = document.getElementById('popup-description');
        const playButton = document.getElementById('popup-button');

        if (this.type === PopUpTypes.GameInfo) {
            titleElement.textContent = this.info.title;
            descriptionElement.innerHTML = this.info.description;
            playButton.textContent = this.info.canPlay ? "JOGAR" : "NAO PODE JOGAR HOJE";
            playButton.disabled = !this.info.canPlay;

            if (this.info.canPlay) {
                playButton.onclick = () => {
                    window.location.href = this.info.playUrl;
                };
            } else {
                playButton.onclick = null;
            }
        }
    },

    async Show() {
        console.log('Showing pop-up...');
        this.background.classList.remove('hidden');
    },

    async Hide() {
        console.log('Hiding pop-up...');
        this.background.classList.add('hidden');
    },

    SetInfo(info) {
        console.log('Setting info:', info);
        this.info = info;
    }
};

export function PopulatePopUp() {
    return new Promise((resolve) => {
        popUp.ChangeType(PopUpTypes.GameInfo);
        resolve();
    });
}