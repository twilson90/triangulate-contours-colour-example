const { app, BrowserWindow, ipcMain } = require('electron')
const path = require("path");
const fs = require("fs");

/** @type {BrowserWindow} */
var win;
app.whenReady().then(()=>{
    createWindow();
});
const createWindow = ()=>{
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.resolve(__dirname, "preload.js"),
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: true,
            nativeWindowOpen: true,
        }
    })
    // win.webContents.openDevTools();
    win.loadURL("about:blank");
    win.webContents.on('dom-ready', () => {
        run();
    });
}

async function run(){
    var Tess2 = require("./Tess2");
    
    var data = JSON.parse(fs.readFileSync("./data.json"));

    win.webContents.send('clear');
    for (var obj of data) {
        var res = Tess2.tesselate({
            contours: obj.contours,
            windingRule: Tess2.WINDING_NEGATIVE,
            elementType: Tess2.POLYGONS,
            polySize: 3,
            vertexSize: 2
        })
        for (var i=0; i<res.elementCount; i++) {
            let vertices = [];
            for (var j=0;j<3;j++) {
                let k = res.elements[i*3+j];
                vertices[j*2] = res.vertices[k*2];
                vertices[j*2+1] = res.vertices[k*2+1];
            }
            let color = obj.fill.color;
            win.webContents.send('draw_poly', [vertices, color, "#222222", 1.0, 0.4]);
        }
        /* await new Promise((resolve)=>{
            ipcMain.once("next",resolve);
        }) */
    }
}