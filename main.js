const { app, WebContentsView, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const axios = require('axios');

app.whenReady().then(() => {

  // BrowserWindow initiate the rendering of the angular toolbar
  const win = new BrowserWindow({
    width: 900,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (app.isPackaged) {
    win.loadFile('dist/browser-template/browser/index.html');
  } else {
    win.loadURL('http://localhost:4200')
  }


  // WebContentsView initiate the rendering of a second view to browser the web
  const view = new WebContentsView();
  win.contentView.addChildView(view);

  // Mise à jour de l'adresse web en 2 événements
  //1. On récupère l'URL de la page web rendue
  view.webContents.on('did-naviagte-in-page', (event, url) => {
    console.log(`Navigation started to: ${url}`);
    //Envoyer l'URL à la barre d'outils
    win.webContents.send('url-changed', url);
  });

  //2. Mise à jour de l'URL dans la barre d'outils
  view.webContents.on('did-stop-loading', () => {
    const url = view.webContents.getURL();
    console.log(`Navigation started to: ${url}`);
    //Envoyer l'URL à la barre d'outils
    win.webContents.send('url-changed', url);
  });

  // Always fit the web rendering with the electron windows
  function fitViewToWin() {
    const winSize = win.webContents.getOwnerBrowserWindow().getBounds();
    view.setBounds({ x: 0, y: 55, width: winSize.width, height: winSize.height });
  }

  win.webContents.openDevTools({ mode: 'detach' });

  // Register events handling from the toolbar
  ipcMain.on('toogle-dev-tool', () => {
    if (winContent.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    } else {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  ipcMain.on('go-back', () => {
    view.webContents.navigationHistory.goBack();
  });

  ipcMain.handle('can-go-back', () => {
    return view.webContents.navigationHistory.canGoBack();
  });

  ipcMain.on('go-forward', () => {
    view.webContents.navigationHistory.goForward();
  });

  ipcMain.handle('can-go-forward', () => {
    return view.webContents.navigationHistory.canGoForward();
  });

  ipcMain.on('refresh', () => {
    view.webContents.reload();
  });

  /*ipcMain.handle('go-to-page', (event, url) => {
    return view.webContents.loadURL(url);
  });*/

  ipcMain.handle('go-to-page', (event, siteUrl) => {
    const urlWithoutProtocol = siteUrl.replace(/(^\w+:|^)\/\//, ''); // Suppression du protocole (http/https)

    const httpsUrl = `https://${urlWithoutProtocol}`;

    return checkUrl(httpsUrl) // Test HTTPS
      .then(() => {
        return view.webContents.loadURL(httpsUrl); // Si HTTPS fonctionne, retourner cette URL
      })
      .catch(() => {
        const httpUrl = `http://${urlWithoutProtocol}`;
        return checkUrl(httpUrl) // Si HTTPS échoue, tester HTTP
          .then(() => {
            return view.webContents.loadURL(httpUrl); // Si HTTP fonctionne, retourner cette URL
          })
          .catch(() => {
            throw new Error(`Le site ${siteUrl} n'est pas accessible via HTTP ni HTTPS`);
          });
      });
  });

  function checkUrl(url) {
    console.log(`Vérification de l'URL : ${url}`);
    return axios.get(url, {
      timeout: 5000, // Timeout de 5 secondes
      maxRedirects: 5, // Limite le nombre de redirections à suivre
      validateStatus: function (status) {
        return status >= 200 && status < 300; // Accepter les réponses entre 200 et 299
      },
    })
      .then((response) => {
        console.log(`Réponse reçue pour ${url} : ${response.status}`);
        return true;
      })
      .catch((error) => {
        console.error(`Erreur lors de la vérification de l'URL : ${error.message}`);
        throw new Error(`Échec de la connexion à ${url}: ${error.message}`);
      });
  }



  ipcMain.handle('current-url', () => {
    return view.webContents.getURL();
  });

  //Register events handling from the main windows
  win.once('ready-to-show', () => {
    fitViewToWin();
    view.webContents.loadURL('https://amiens.unilasalle.fr');
  });

  win.on('resized', () => {
    fitViewToWin();
  });
})
