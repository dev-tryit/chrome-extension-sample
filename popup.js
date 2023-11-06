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
        const customPrice = parseFloat(
          document
            .querySelector("#span_product_price_custom")
            .innerText.replace(/[^\d.-]/g, "")
        );
        const salesPrice = parseFloat(
          document
            .querySelector("#span_product_price_text")
            .innerText.replace(/[^\d.-]/g, "")
        );
        const code = getValueByTags("tr.xans-record-", "상품코드");

        downloadTextFile(
          "product.csv",
          `제품명, ${title}\n소비자가, ${customPrice}\n판매가, ${salesPrice}\n상품코드, ${code}`
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
