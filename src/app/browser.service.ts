import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  public onPageChange: EventEmitter<{ url: string, title: string }> =
    new EventEmitter();
  title: any;
  constructor() {
    if (!this.electronAPI) {
      this.electronAPI = {
        onUrlChanged: () => { },
        currentUrl: async () => { return "" }
      }
    }
    const updateUrl = (event: any, url: any, title: any) => {
      this.url = url;
      this.title = title;
      this.setToCurrentUrl();
      this.emitPageChange();
    };
    this.electronAPI.onUrlChanged(updateUrl);
  }
  emitPageChange() {
    this.onPageChange.emit({ url: this.url, title: this.title });
  }


  url = 'https://amiens.unilasalle.fr';
  canGoBack = false;
  canGoForward = false;

  // @ts-ignore
  electronAPI = window.electronAPI;

  toogleDevTool() {
    this.electronAPI.toogleDevTool();
  }

  goBack() {
    this.electronAPI.goBack();
    this.updateHistory();
  }

  goForward() {
    this.electronAPI.goForward();
    this.updateHistory();
  }

  refresh() {
    this.electronAPI.refresh();
  }

  goToPage(url: string) {
    this.electronAPI.goToPage(url)
      .then(() => this.updateHistory());
  }

  setToCurrentUrl() {
    this.electronAPI.currentUrl()
      .then((url: string) => {
        this.url = url;
      });
  }

  updateHistory() {
    this.setToCurrentUrl();

    this.electronAPI.canGoBack()
      .then((canGoBack: boolean) => this.canGoBack = canGoBack);

    this.electronAPI.canGoForward()
      .then((canGoForward: boolean) => this.canGoForward = canGoForward);
  }
}