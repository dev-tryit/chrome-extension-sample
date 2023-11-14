document
  .getElementById("hashTagToInsertButton")
  .addEventListener("click", async () => {
    function setStorage(item) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set(item, () => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          return resolve();
        });
      });
    }

    const hashTag = document.querySelector("#hashTagInput").value;
    setStorage({ hashTag: hashTag });

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: function () {
        function sleep(ms) {
          return new Promise((r) => setTimeout(r, ms));
        }
        //함수 정의
        function getStorage(key) {
          return new Promise((resolve, reject) => {
            chrome.storage.local.get([key], (value) => {
              if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
              }
              return resolve(value[key]);
            });
          });
        }

        getStorage("hashTag").then(function (str) {
          const list = str.split(" ");
          var timerId = setInterval(async function () {
            const hashTagStr = list.pop().toString();
            if (!hashTagStr) {
              timerId && clearTimeout(timerId);
              return;
            }

            const tag = document.querySelector(
              'input[placeholder="태그를 입력해주세요."]'
            );
            if (!tag) return;
            tag.value = hashTagStr.replaceAll("#", "");

            tag.focus();
            tag.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 13 }));
            tag.dispatchEvent(new KeyboardEvent("keyup", { keyCode: 13 }));

            await sleep(500);

            tag.focus();
            tag.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 13 }));
            tag.dispatchEvent(new KeyboardEvent("keyup", { keyCode: 13 }));
          }, 2000);
        });
      },
    });
  });

document
  .getElementById("hashTagToMakeButton")
  .addEventListener("click", async () => {
    //함수 정의
    function getStorage(key) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (value) => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          return resolve(value[key]);
        });
      });
    }

    function waitForDataWithTimeout(fetcher) {
      let timer; // 타이머 변수

      return new Promise((resolve, reject) => {
        timer = setInterval(() => {
          fetcher.then((data) => {
            if (data) {
              clearTimeout(timer);
              timer = undefined;
              resolve(data);
            }
          });
        }, 2000);
      });
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: function () {
        function setStorage(item) {
          return new Promise((resolve, reject) => {
            chrome.storage.local.set(item, () => {
              if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
              }
              return resolve();
            });
          });
        }

        const list = document.querySelectorAll(
          "#INTRODUCE > div > div.jqaBjC05ww > ul > li"
        );

        let tagStr = "";
        for (const each of list) {
          if (each.textContent) tagStr += " " + each.textContent;
        }

        setStorage({ tagStr: tagStr });
      },
    });

    const tagStr = await waitForDataWithTimeout(getStorage("tagStr"));
    chrome.storage.local.clear();

    document.querySelector("#hashTag").innerText = tagStr;
  });

document
  .getElementById("downloadTextButton")
  .addEventListener("click", async () => {
    //탭 열어서 제품 정보 파싱하여 다운로드하기
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: function () {
        //함수 정의
        function downloadTextFile(fileName, text) {
          const blob = new Blob([text], { type: "text/plain" });
          const url = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();

          URL.revokeObjectURL(url);
        }

        function getValueByTags(querySelector, keyToFind) {
          const tags = document.querySelectorAll(querySelector);
          for (const tag of tags) {
            const text = tag.innerText;
            if (text.includes(keyToFind)) {
              const valueToFind = tag.children[1].innerText.trim();
              return valueToFind;
            }
          }
        }

        const title = document.querySelector("div.infoArea > h3").innerText;

        let customPrice;
        try {
          customPrice = parseFloat(
            document
              .querySelector("#span_product_price_custom")
              .innerText.replace(/[^\d.-]/g, "")
          );
        } catch (e) {}

        const salesPrice = parseFloat(
          document
            .querySelector("#span_product_price_text")
            .innerText.replace(/[^\d.-]/g, "")
        );

        let discountPrice;
        if (customPrice) {
          discountPrice = customPrice - salesPrice;
        } else {
          discountPrice = 0;
        }

        const code = getValueByTags("tr.xans-record-", "상품코드");

        downloadTextFile(
          "product.csv",
          `제품명, ${title}\n소비자가, ${customPrice}\n판매가, ${salesPrice}\n상품코드, ${code}\n할인가, ${discountPrice}`
        );
      },
    });
  });

document
  .getElementById("downloadImageButton")
  .addEventListener("click", async () => {
    //함수 정의
    function getStorage(key) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (value) => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          return resolve(value[key]);
        });
      });
    }

    function waitForDataWithTimeout(fetcher) {
      let timer; // 타이머 변수

      return new Promise((resolve, reject) => {
        timer = setInterval(() => {
          fetcher.then((data) => {
            if (data) {
              clearTimeout(timer);
              timer = undefined;
              resolve(data);
            }
          });
        }, 2000);
      });
    }

    //탭 열어서 이미지 url 모으기
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: function () {
        function setStorage(item) {
          return new Promise((resolve, reject) => {
            chrome.storage.local.set(item, () => {
              if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
              }
              return resolve();
            });
          });
        }

        const thumbnailImageUrl = document.querySelector(
          ".keyImg > .thumbnail .BigImage"
        ).src;
        const thumbnailImageUrls = Array.from(
          document.querySelectorAll(".ThumbImage")
        ).map((img) =>
          img.src.replaceAll("tiny", "big").replaceAll("small", "big")
        );
        const detailImageUrls = Array.from(
          document.querySelectorAll("div.cont img")
        ).map((img) => img.src);
        setStorage({
          imageUrlObj: {
            thumbnailImageUrls: [thumbnailImageUrl, ...thumbnailImageUrls],
            detailImageUrls: [...detailImageUrls],
          },
        });
      },
    });
    const imageUrlObj = await waitForDataWithTimeout(getStorage("imageUrlObj"));
    chrome.storage.local.clear();

    //이미지 url 다운로드 (chrome.downloads.download이어서 위 코드랑 분리하였음)
    imageUrlObj.thumbnailImageUrls.forEach((imageUrl, index) => {
      const fileName = `thumbnailImageUrl_${index + 1}.jpg`;
      chrome.downloads.download({
        url: imageUrl,
        filename: fileName,
      });
    });
    imageUrlObj.detailImageUrls.forEach((imageUrl, index) => {
      const fileName = `detailImageUrl_${index + 1}.jpg`;
      chrome.downloads.download({
        url: imageUrl,
        filename: fileName,
      });
    });
  });
