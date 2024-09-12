// document.getElementById("mergeTabButton").addEventListener("click", () => {
//   // chrome.windows.getCurrent((currWindow) => {
//   //   chrome.runtime.sendMessage({ action: "mergeTabs", windowId: currWindow.id });
//   // });
//   console.log("Merge Tab To");
// });
document.getElementById("mergeAllTabsButton").addEventListener("click", () => {
  chrome.windows.getCurrent((currWindow) => {
    chrome.runtime.sendMessage({ action: "mergeTabs", windowId: currWindow.id });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const windowSelect = document.getElementById("windowSelect");
  const mergeTabBtn = document.getElementById("mergeTabButton");
  // Get the current window ID and exclude it from the dropdown
  chrome.windows.getCurrent({}, function (currentWindow) {
    const currentWindowId = currentWindow.id;

    // Populate the dropdown with available windows excluding the current window
    chrome.windows.getAll({}, function (windows) {
      windows.forEach((window) => {
        if (window.id !== currentWindowId) {
          const option = document.createElement("option");
          option.value = window.id;
          option.textContent = `Window ${window.id}`;
          windowSelect.appendChild(option);
        }
      });
    });
  });

  // Handle the button click
  mergeTabBtn.addEventListener("click", function () {
    const selectedWindowId = windowSelect.value;
    if (selectedWindowId) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        chrome.tabs.move(currentTab.id, {
          windowId: parseInt(selectedWindowId),
          index: -1,
        });
      });
    } else {
      alert("Please select a window to merge the tab into.");
    }
  });
});
