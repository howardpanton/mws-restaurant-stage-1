export class MessageService {
    toaster;
    message;

    constructor() {
        const closeBtn = document.getElementsByClassName('close')[0];
        closeBtn.addEventListener('click', this.close);
        this.toaster = document.getElementsByClassName('toaster')[0];
        this.message = document.getElementsByClassName('message')[0];
        const haveMessageMaybe = localStorage.getItem('message');
        if (haveMessageMaybe) {
            this.post(haveMessageMaybe);
        }

    }

    // Post Message to UI
    post = (message) => {
        // Show new Message
        this.message.insertAdjacentHTML('afterbegin', message);
        this.toaster.classList.add('open');
        //
    }

    close = () => {
        // close message and remove
        this.message.innerHTML = "";
        this.toaster.classList.remove('open');
        window.localStorage.removeItem('message');
    }
}
