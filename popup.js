document.getElementById("parseButton").addEventListener("click", async () => {
  function getStorage(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([key], (value) => {
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

  //product_no 얻기
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: function () {
        function setStorage(item) {
          return new Promise((resolve, reject) => {
            chrome.storage.sync.set(item, () => {
              if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
              }
              return resolve();
            });
          });
        }

        const queryParams = new URL(document.location).searchParams;
        const productNo = queryParams.get("product_no");
        setStorage({ product_no: productNo });
      },
    });
  });
  const productNo = await waitForDataWithTimeout(getStorage("product_no"));

  //경로 변경하기
  await chrome.tabs.query(
    { active: true, currentWindow: true },
    function (tabs) {
      chrome.tabs.update(
        tabs[0].id,
        {
          url:
            "https://marketb.kr/product/image_zoom.html?product_no=" +
            productNo,
        },
        function (tab) {
          function setStorage(item) {
            return new Promise((resolve, reject) => {
              chrome.storage.sync.set(item, () => {
                if (chrome.runtime.lastError) {
                  return reject(chrome.runtime.lastError);
                }
                return resolve();
              });
            });
          }

          setStorage({ tab2Status: "started" });
        }
      );
    }
  );
  const tab2Status = await waitForDataWithTimeout(getStorage("tab2Status"));

  //데이터 파싱하기
  await chrome.tabs.query(
    { active: true, currentWindow: true },
    function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: function () {
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
          // alert("title" + title);
          const customPrice = parseFloat(
            document
              .querySelector("#span_product_price_custom")
              .innerText.replace(/[^\d.-]/g, "")
          );
          // alert("customPrice" + customPrice);
          const salesPrice = parseFloat(
            document
              .querySelector("#span_product_price_text")
              .innerText.replace(/[^\d.-]/g, "")
          );
          // alert("salesPrice" + salesPrice);
          const code = getValueByTags("tr.xans-record-", "상품코드");
          // alert("code" + code);

          //TODO: 추가 정보 파싱
          //TODO: 이미지 다운로드
        },
      });
    }
  );
});
