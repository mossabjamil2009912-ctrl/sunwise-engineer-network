const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const URL = "https://sunwise-engineer-network.lovable.app";
function create() {
  const win = new BrowserWindow({
    width: 420, height: 860, minWidth: 380, minHeight: 640, maxWidth: 520,
    resizable: true, autoHideMenuBar: true, backgroundColor: "#141b2d",
    title: "ACTES", icon: path.join(__dirname, "icon.png"),
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  win.setMenu(null);
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  win.loadURL(URL);
}
app.whenReady().then(create);
app.on("window-all-closed", () => app.quit());
