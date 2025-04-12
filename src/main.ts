import { app, BrowserWindow, screen, Display } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

/**
 * 创建一个窗口并在指定显示器上全屏显示
 * @param display 目标显示器
 * @param index 窗口索引（用于标识不同窗口）
 */
const createWindowOnDisplay = (display: Display, index: number) => {
  // 创建浏览器窗口，位置和大小与目标显示器匹配
  const win = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    width: display.bounds.width,
    height: display.bounds.height,
    fullscreen: true, // 设置为全屏
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 加载应用内容
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // 仅在第一个窗口上打开开发者工具
  if (index === 0) {
    win.webContents.openDevTools();
  }

  // 窗口标题显示显示器信息
  win.setTitle(`游戏浏览器 - 显示器 ${index + 1} (${display.size.width}x${display.size.height})`);

  return win;
};

// 初始化应用并创建窗口
const initApp = () => {
  // 获取所有可用显示器
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  
  console.log(`检测到 ${displays.length} 个显示器`);
  
  // 如果有多个显示器，则在每个显示器上创建全屏窗口
  if (displays.length >= 2) {
    console.log('检测到多个显示器，将在每个显示器上创建全屏窗口');
    displays.forEach((display, i) => {
      createWindowOnDisplay(display, i);
    });
  } else {
    // 如果只有一个显示器，则在主显示器上创建全屏窗口
    console.log('仅检测到单个显示器，将创建全屏窗口');
    createWindowOnDisplay(primaryDisplay, 0);
  }
};

// 在 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready', initApp);

// 当所有窗口关闭时退出应用，macOS除外
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在 macOS 上，当点击 dock 图标且没有其他窗口打开时，
  // 通常会在应用程序中重新创建一个窗口
  if (BrowserWindow.getAllWindows().length === 0) {
    initApp();
  }
});

// 在这个文件中，你可以包含应用程序主进程的其余代码
// 你也可以将它们放在单独的文件中并在这里导入
