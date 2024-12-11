document.addEventListener("DOMContentLoaded", function () {
  //*Merge all windows to current window
  const mergeWindowsButton = document.getElementById("mergeWindows");

  mergeWindowsButton.addEventListener("click", () => {
    chrome.windows.getCurrent((currWindow) => {
      chrome.runtime.sendMessage({
        action: "mergeWindows",
        windowId: currWindow.id,
      });
    });
  });

  //*Merge single tab to another window
  const windowSelect = document.getElementById("windowSelect");
  // const mergeTabBtn = document.getElementById("mergeTabButton");

  // Get the current window ID and exclude it from the dropdown
  chrome.windows.getCurrent({}, function (currentWindow) {
    const currentWindowId = currentWindow.id;

    // Populate the dropdown with available windows excluding the current window
    chrome.windows.getAll({ populate: true }, function (windows) {
      windows.forEach((window) => {
        if (window.id !== currentWindowId) {
          const option = document.createElement("option");
          option.value = window.id;
          option.textContent = `Window ${window.id} (${window.tabs.length})`;
          windowSelect.appendChild(option);
        }
      });
    });
  });

  windowSelect.addEventListener("change", function () {
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
