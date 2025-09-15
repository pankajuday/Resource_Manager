import { ipcMain, WebContents, WebFrameMain } from "electron";
import { getUiPath } from "./pathResolver.js";
import { pathToFileURL } from "url";

export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

export function ipcMainHandle<key extends keyof EventPayloadMapping>(
  key: key,
  handler: () => EventPayloadMapping[key]
) {
  ipcMain.handle(key, (event) => {
    if (event.senderFrame) {
      validateEventFrame(event.senderFrame);
    } else {
      throw new Error("Event sender frame is null");
    }
    return handler();
  });
}
export function ipcMainOn<key extends keyof EventPayloadMapping>(
  key: key,
  handler: (payload: EventPayloadMapping[key]) => void 
) {
  ipcMain.on(key, (event,payload) => {
    if (event.senderFrame) {
      validateEventFrame(event.senderFrame);
    } else {
      throw new Error("Event sender frame is null");
    }
    return handler(payload);
  });
}

export function ipcWebContentsSend<key extends keyof EventPayloadMapping>(
  key: key,
  webContents: WebContents,
  payload: EventPayloadMapping[key]
) {
  webContents.send(key, payload);
}

export function validateEventFrame(frame: WebFrameMain) {
  console.log(frame.url);
  if (isDev() && new URL(frame.url).host === "localhost:5123") {
    return;
  }
  if (frame.url !== pathToFileURL(getUiPath()).toString()) {
    throw new Error("Malicious Event");
  }
}
