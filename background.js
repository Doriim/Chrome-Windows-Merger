chrome.runtime.onInstalled.addListener(() => {
  console.log("Tab Merger extension installed.");
});

chrome.action.onClicked.addListener((currentTab) => {
  chrome.windows.getCurrent((currWindow) => {
    mergeTabs(currWindow.id);
  });
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   const { action, windowId } = request;
//   if (action === "mergeTabs") {
//     mergeTabs(windowId);
//     sendResponse({ status: "Merging tabs" });
//   }
// });

async function mergeTabs(windowId) {
  try {
    const windows = await chrome.windows.getAll({ populate: true });

    if (windows.length < 2) {
      console.log("There are less than two windows open.");
      return;
    }

    console.log("Event has occurred on", windowId);
    console.log(windows);

    // Select the window to move tabs to
    const selectedWindow = windows.find((window) => window.id === windowId);

    // Get all the windows to move tabs from
    const windowsToMove = windows.filter((window) => window.id !== windowId);
    console.log("Window To Move", windowsToMove);

    let tabsToMove = [];

    // Get all the tabs to move from the other windows
    windowsToMove.forEach((window) => {
      tabsToMove.push(...window.tabs.map((tab) => tab.id));
    });
    console.log("tabsToMove", tabsToMove);
    /**
     * chrome.tabs.move(
            tabIds: number | number[],
            moveProperties: {windowId, index},
            callback?: function,
            )
     */
    // Move tabs to selected window
    // Index -1 means the tabs will be moved to the end of the tabs in the window.
    await chrome.tabs.move(tabsToMove, { windowId: selectedWindow.id, index: -1 });

    console.log("Tabs merged successfully.");
  } catch (error) {
    console.error("Error merging tabs:", error);
  }
}
