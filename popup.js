document.getElementById("mergeTabsButton").addEventListener("click", () => {
  chrome.windows.getCurrent((currWindow) => {
    chrome.runtime.sendMessage({ action: "mergeTabs", windowId: currWindow.id });
  });
});
