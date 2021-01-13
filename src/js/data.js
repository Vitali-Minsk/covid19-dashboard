import api from './api';

export default class Data {
  constructor() {
    this.data = null;
  }

  async load() {
    await fetch(api.countries)
      .then((response) => {
        if (!response.ok) {
          Data.showErrorScreen(response.status);
          throw Error(`Error: ${response.status}`);
        }
        this.data = response.json();
      })
      .catch((err) => {
        Data.showErrorScreen(err);
      });
    return this.data;
  }

  static showErrorScreen(errorText) {
    const screen = document.createElement('div');
    screen.setAttribute('class', 'error-screen');
    screen.insertAdjacentHTML('afterbegin', `<h3>Error: ${errorText}, try later...</h3>`);
    document.body.prepend(screen);
  }
}
