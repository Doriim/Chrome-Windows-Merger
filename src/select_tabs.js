document.addEventListener("DOMContentLoaded", () => {
  // const openDialogButton = document.getElementById("openDialog");
  const dialog = document.getElementById("dialog");
  const dialogOverlay = document.getElementById("dialogOverlay");
  const tabList = document.getElementById("tabList");
  const selectionBox = document.getElementById("selectionBox");
  const selectAllButton = document.getElementById("selectAll");
  const deselectAllButton = document.getElementById("deselectAll");
  const cancelButton = document.getElementById("cancelButton");
  const moveLabel = document.getElementById("moveLabel");
  const selectedCountSpan = document.getElementById("selectedCount");

  let tabs = [];
  let selectedTabs = new Set();
  let isDragging = false;
  let dragStart = null;

  function renderTabs() {
    tabList.innerHTML = "";
    tabs.forEach((tab) => {
      const tabElement = document.createElement("div");
      tabElement.className = `tab-item${
        selectedTabs.has(tab.id) ? " selected" : ""
      }`;
      tabElement.setAttribute("data-id", tab.id);
      tabElement.innerHTML = `
              <div>
                  <strong>${
                    tab.title.length > 35
                      ? tab.title.slice(0, 35) + "..."
                      : tab.title
                  }</strong>
                  <div>${
                    tab.url.length > 50 ? tab.url.slice(0, 50) + "..." : tab.url
                  }</div>
                  ${
                    selectedTabs.has(tab.id)
                      ? '<img class="tick" src="/icons/checkbox-checked.svg" alt="Checked" />'
                      : '<img class="tick" src="/icons/checkbox-unchecked.svg" alt="Unchecked" />'
                  }
              </div>
          `;
      tabElement.addEventListener("click", () => toggleTab(tab.id));
      tabList.appendChild(tabElement);
    });
    updateSelectedCount();
  }

  function toggleTab(tabId) {
    if (selectedTabs.has(tabId)) {
      selectedTabs.delete(tabId);
    } else {
      selectedTabs.add(tabId);
    }
    renderTabs();
  }

  function updateSelectedCount() {
    const count = selectedTabs.size;
    selectedCountSpan.textContent = count;
    moveLabel.textContent = `Merge ${count} tab${count > 1 ? "s to" : " to"}`;
  }

  function showDialog() {
    dialog.style.display = "flex";
    dialogOverlay.style.display = "block";
  }

  function closeWindow() {
    window.close();
  }

  function handleMouseDown(e) {
    // console.log(e);
    // console.log("ClientX:", e.clientX, "ClientY:", e.clientY);
    // console.log("PageX:", e.pageX, "PageY:", e.pageY);
    // console.log("OffsetX:", e.offsetX, "OffsetY:", e.offsetY);
    // console.log("---------------------------------------------------");
    if (e.button !== 0) return;
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    selectionBox.style.left = `${dragStart.x}px`;
    selectionBox.style.top = `${dragStart.y}px`;
    selectionBox.style.width = "0px";
    selectionBox.style.height = "0px";
    selectionBox.style.display = "block";
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    // This will work if we comment out this
    // .dialog {
    //     top: 50%;
    //     left: 50%;
    //     transform: translate(-50%, -50%);
    //   }
    // and we don't need to subtract 25 and 37 from the clientX and clientY

    const currentX = e.clientX;
    const currentY = e.clientY;

    const left = Math.min(dragStart.x, currentX);
    const top = Math.min(dragStart.y, currentY);
    const width = Math.abs(currentX - dragStart.x);
    const height = Math.abs(currentY - dragStart.y);

    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;

    // const diffX = e.clientX - dragStart.x - 25;
    // const diffY = e.clientY - dragStart.y - 37;

    // selectionBox.style.left =
    //   diffX < 0 ? dragStart.x + diffX + "px" : dragStart.x + "px";
    // selectionBox.style.top =
    //   diffY < 0 ? dragStart.y + diffY + "px" : dragStart.y + "px";
    // selectionBox.style.height = Math.abs(diffY) + "px";
    // selectionBox.style.width = Math.abs(diffX) + "px";

    const selectionRect = selectionBox.getBoundingClientRect();
    document.querySelectorAll(".tab-item").forEach((tab) => {
      const tabRect = tab.getBoundingClientRect();
      if (
        !(
          tabRect.right < selectionRect.left ||
          tabRect.left > selectionRect.right ||
          tabRect.bottom < selectionRect.top ||
          tabRect.top > selectionRect.bottom
        )
      ) {
        const tabId = Number(tab.getAttribute("data-id"));
        if (!selectedTabs.has(tabId)) {
          selectedTabs.add(tabId);
        }
      }
    });
    renderTabs();
  }

  /**
   * Handle mouse up event
   */
  function handleMouseUp() {
    isDragging = false;
    dragStart = null;
    selectionBox.style.display = "none";
  }

  /**
   * Get the query parameter from the URL
   * @param {string} name
   * @returns query parameter value or null
   */
  function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  //* Display all tabs in the initial window to the tabList and other windows to the windowSelect dropdown
  const initialWindowId = Number(getQueryParameter("initialWindowId"));
  const windowSelect = document.getElementById("windowSelect");

  chrome.windows.getCurrent({}, function (currentWindow) {
    chrome.windows.getAll({ populate: true }, function (windows) {
      windows.forEach((window) => {
        //* Display all tabs in the initial window to the tabList
        if (window.id === initialWindowId) {
          tabs = tabs.concat(window.tabs);
        }
        //* Display other windows to the windowSelect dropdown
        if (
          window.id !== currentWindow.id &&
          window.id !== initialWindowId &&
          window.type === "normal"
        ) {
          const option = document.createElement("option");
          option.value = window.id;
          option.textContent = `Window ${window.id} (${window.tabs.length})`;
          windowSelect.appendChild(option);
        }
      });
      showDialog();
      renderTabs();
    });
  });

  //*Merge selected tabs to another window
  windowSelect.addEventListener("change", function () {
    const selectedWindowId = windowSelect.value;
    if (selectedWindowId) {
      const tabIds = Array.from(selectedTabs);
      chrome.tabs.move(
        tabIds,
        {
          windowId: parseInt(selectedWindowId),
          index: -1,
        },
        function () {
          console.log(`Moved ${tabIds.length} tabs to window ${selectedWindowId}`);
          selectedTabs.clear();
          closeWindow();
          renderTabs();
        }
      );
    } else {
      alert("Please select a window to merge the tab into.");
    }
  });

  selectAllButton.addEventListener("click", () => {
    selectedTabs = new Set(tabs.map((tab) => tab.id));
    renderTabs();
  });

  deselectAllButton.addEventListener("click", () => {
    selectedTabs.clear();
    renderTabs();
  });

  cancelButton.addEventListener("click", closeWindow);

  // moveButton.addEventListener("click", () => {
  //   console.log("Moving tabs:", Array.from(selectedTabs));
  //   closeWindow();
  // });

  tabList.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  //Close dialog when Escape key is pressed
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeWindow();
    }
  });

  // let screenLog = document.querySelector("#cursor-log");
  // tabList.addEventListener("mousemove", logKey);
  // function logKey(e) {
  //   screenLog.innerText = `
  //     Screen X/Y: ${e.screenX}, ${e.screenY}
  //     Client X/Y: ${e.clientX}, ${e.clientY}`;
  // }
});
