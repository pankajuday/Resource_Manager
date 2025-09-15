const electron = require("electron");

electron.contextBridge.exposeInMainWorld("electron", {
  subscribeStatistics: (callback) =>
    ipcOn("statistics", (statistics) => {
      callback(statistics);
    }),

  getStaticData: () => ipcInvoke("getStaticData"),

  subscribeChangeView: (callback) =>
    ipcOn("changeView", (view) => {
      callback(view);
    }),

  sendFrameAction: (payload) => ipcSend("sendFrameAction",payload),
} satisfies Window["electron"]);

function ipcInvoke<key extends keyof EventPayloadMapping>(
  key: key
): Promise<EventPayloadMapping[key]> {
  return electron.ipcRenderer.invoke(key);
}

function ipcOn<key extends keyof EventPayloadMapping>(
  key: key,
  callback: (pyload: EventPayloadMapping[key]) => void
) {
  const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload);
  electron.ipcRenderer.on(key, cb);
  return () => electron.ipcRenderer.off(key, cb);
}

function ipcSend<key extends keyof EventPayloadMapping>(
  key: key,
  payload: EventPayloadMapping[key]
) {
  electron.ipcRenderer.send(key, payload);
}
