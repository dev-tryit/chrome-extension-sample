chrome.runtime.onInstalled.addListener(function () {
  //   chrome.storage.sync.set({ color: "#3aa757" }, function () {
  //     console.log("The color is green.");
  //   });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
 if (request.action === "openUrl") {
    if (request.url) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // const currentTab = tabs[0];
        // chrome.tabs.update(currentTab.id, { url: request.url });
        chrome.windows.create({
          url: request.url,
          type: "normal", // "normal"은 일반적인 창, "popup"은 팝업 창
          state: "normal" // 새 창의 상태 (maximized, minimized, normal 등)
        });
      });
    }
  }
});