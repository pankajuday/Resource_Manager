import { test, expect, _electron } from "@playwright/test";

let electronApp: Awaited<ReturnType<typeof _electron.launch>>;

let mainPage: Awaited<ReturnType<typeof electronApp.firstWindow>>;
async function waitForPreloadScript() {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const electronBridge = await mainPage.evaluate(() => {
        return (window as Window & {electron?: any}).electron;
      });
      if(electronBridge){
        clearInterval(interval);
        resolve(true)
      }
    }, 100);
  });
}


test.beforeEach(async () => {
  electronApp = await _electron.launch({
    args: ["."],
    env: { NODE_ENV: "development" },
  });
  mainPage = await electronApp.firstWindow();
  await waitForPreloadScript();
});



test.afterEach(async () => {
  await electronApp.close();
});

test("custom frame should minimize the mainWindow", async () => {
  await mainPage.click("#minimize");
  const isMinimized = await electronApp.evaluate((electron) => {
    return electron.BrowserWindow.getAllWindows()[0].isMinimized();
  });
  expect(isMinimized).toBeTruthy();
});


test('should create a custom menu', async () => {
  const menu = await electronApp.evaluate((electron) => {
    const appMenu = electron.Menu.getApplicationMenu();
    if (!appMenu) return null;
    
    // Return all visible menu items
    return {
      items: appMenu.items.filter(item => item.visible)
    };
  });
  expect(menu).not.toBeNull();
  expect(menu?.items).toHaveLength(3);
  
  // Verify App menu
  expect(menu?.items[0].label).toBe('App');
  expect(menu?.items[0].submenu?.items.length).toBeGreaterThan(0);
  
  // Verify View menu
  expect(menu?.items[1].label).toBe('View');
  expect(menu?.items[1].submenu?.items).toHaveLength(3);
  
  // Verify Tools menu (the third menu item)
  expect(menu?.items[2].label).toBe('Tools');
});
