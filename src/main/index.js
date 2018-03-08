import { app, BrowserWindow, Menu ,ipcMain} from 'electron'
import { fail } from 'assert';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, newPageWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

//监听NewPage页面发来的消息
ipcMain.on('MainMsgFromNewPage', function (event, arg) {
  if(arg=='cancel'){
    newPageWindow.hide();
  }
})
function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    title: 'blog',
  })
  newPageWindow = new BrowserWindow({
    parent: mainWindow,
    width: 400,
    height: 300,
    show: false,
    modal: true,
    useContentSize: true,
    webPreferences: {
      devTools: false
    }
  });

  newPageWindow.loadURL(winURL + '/#/newPage');

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const template = [
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: '文件',
    submenu: [
      {
        label: '新建文章',
        click() {
          newPageWindow.show();
        }
      }
    ]
  },
  {
    label: '设置',
    submenu: [
      {
        label: '应用目录',
        click() { require('electron').shell.openExternal('https://electronjs.org') }
      }
    ]
  },
  {
    label: '帮助',
    submenu: [
      {
        label: 'Learn More',
        click() { require('electron').shell.openExternal('https://electronjs.org') }
      }
    ]
  }
]

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
