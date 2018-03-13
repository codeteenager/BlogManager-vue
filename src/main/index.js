import { app, BrowserWindow, Menu, ipcMain ,dialog,systemPreferences} from 'electron'
import { fail } from 'assert';
const { exec } = require("child_process");

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
  if (arg == 'cancel') {
    newPageWindow.hide();
  }else if(arg == 'updateArticle'){
    mainWindow.webContents.send('updateArticle', arg)
  }
})
//监听Main页面发来的消息
ipcMain.on('MainMsgFromMain', function (event, arg) {
  if (arg == 'selectDir') {
    dialog.showOpenDialog({properties: [ 'openDirectory','createDirectory'],message:'请选择路径'},function(filePaths){
      if(filePaths!==undefined){
        systemPreferences.setUserDefault('path', 'string', filePaths[0]);
        event.sender.send('selectDir', filePaths[0]);
      }
    });
  }else if(arg == 'getPath'){
    event.sender.send('getPath', systemPreferences.getUserDefault('path', 'string'));
  }
});
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
        accelerator: 'Shift+CmdOrCtrl+N',
        click() {
          newPageWindow.show();
        }
      },
      {
        label: '清除缓存文件',
        accelerator: 'Shift+CmdOrCtrl+C',
        click() {
          exec(
            'hexo clean',
            { cwd: systemPreferences.getUserDefault('path', 'string') },
            (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                return;
              }
              dialog.showMessageBox({type:'info',buttons:['确认'],title:'提示框',message:'清除成功'})
            }
          );
        }
      },
      {
        label: '生成静态文件',
        accelerator: 'Shift+CmdOrCtrl+G',
        click() {
          exec(
            'hexo g',
            { cwd: systemPreferences.getUserDefault('path', 'string') },
            (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                return;
              }
              dialog.showMessageBox({type:'info',buttons:['确认'],title:'提示框',message:'生成成功'})
            }
          );
        }
      },
      {
        label: '部署到Github',
        accelerator: 'Shift+CmdOrCtrl+D',
        click() {
          exec(
            'hexo d',
            { cwd: systemPreferences.getUserDefault('path', 'string') },
            (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                return;
              }
              dialog.showMessageBox({type:'info',buttons:['确认'],title:'提示框',message:'部署成功'})
            }
          );
        }
      },
      // {
      //   label: '启动服务',
      //   accelerator: 'Shift+CmdOrCtrl+S',
      //   click() {
      //     exec(
      //       'hexo server',
      //       { cwd: "/Users/jiangshuaijie/Desktop/blog/" },
      //       (error, stdout, stderr) => {
      //         if (error) {
      //           console.error(`exec error: ${error}`);
      //           return;
      //         }
      //       }
      //     );
      //      require('electron').shell.openExternal('http://localhost:4000/')
      //   }
      // }
    ]
  },
  // {
  //   label: 'Github',
  //   submenu: [
  //     {
  //       label: '拉取',
  //       accelerator: 'Shift+CmdOrCtrl+L',
  //       click() {

  //       }
  //     }
  //   ]
  // },
  {
    label: '帮助',
    submenu: [
      {
        label: '了解更多',
        click() { require('electron').shell.openExternal('http://www.github.com/codeteenager/BlogManager-vue') }
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
