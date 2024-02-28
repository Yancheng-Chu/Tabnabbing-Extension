let currentId = 0
let changed = false
let returned = false
let img1 = null
let img2 = null
let winId = 0

function downloadUrl(url) {
    chrome.downloads.download({
        url: url,
        filename: 'screenshot.png',
        saveAs: false
    });
}

chrome.action.onClicked.addListener(function (tab) {
    chrome.action.setBadgeText({ text: "ON" });
});


chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    console.log("chrome tab removed, tabId: " + tabId);
});


chrome.windows.onRemoved.addListener(function (windowId) {
    console.log("chrome tab removed, windowId: " + windowId);
});


chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#00FF00' });
    chrome.storage.local.clear();
    console.log("chrome extension is install.");
});


chrome.tabs.onActivated.addListener(activeInfo => {
    console.log("Tab switched: ", activeInfo);
    winId = activeInfo.windowId
    chrome.storage.local.get([activeInfo.tabId.toString()]).then((result) => {
        if (result[activeInfo.tabId.toString()] != null) {
            // returned = true
            chrome.action.setBadgeBackgroundColor(
                { color: '#FF0000' },
                () => {
                    chrome.action.setBadgeText({ text: '??' });
                },
            );
            setTimeout(() => {
                chrome.tabs.captureVisibleTab(activeInfo.windowId, { format: "png" }, function (dataUrl) {
                    console.log('NEWNEW Comparing');
                    img1 = dataUrl
                    img2 = result[activeInfo.tabId.toString()]
                    // compare(dataUrl, result[activeInfo.tabId.toString()])
                });
            }, 1000);
        } else {
            chrome.action.setBadgeBackgroundColor(
                { color: '#00FF00' },
                () => {
                    chrome.action.setBadgeText({ text: 'ON' });
                }
            )
        }
    })
})


chrome.runtime.onMessage.addListener(handleMessage);
async function handleMessage(request, sender, sendResponse) {
    // console.log('background, get content', request.info)
    sendResponse({
        response: {
            img1:img1,
            img2:img2
        }
    })

    return true
}


async function capture(i) {
    // let i = await getId()
    chrome.windows.getCurrent(function (tab) {
        chrome.tabs.captureVisibleTab(tab.id, { format: "png" }, function (dataUrl) {
            if (chrome.runtime.lastError)
                return;
            if (i != null) {
                chrome.storage.local.get([i.toString()]).then((result) => {
                    // console.log(result)
                    let data = result[i.toString()] || null;
                    // console.log('data',data)
                    if (data != null) {
                        if (!changed) {
                            console.log('update')
                            let storageItem = {};
                            if (dataUrl != null) {
                                storageItem[i] = dataUrl;
                                console.log('Set', storageItem)
                                chrome.storage.local.set(storageItem);
                                chrome.action.setBadgeBackgroundColor(
                                    { color: '#00FF00' },
                                    () => {
                                        chrome.action.setBadgeText({ text: 'ON' });
                                    }
                                )
                            }
                        } else {
                            console.log('Comparing')
                            chrome.action.setBadgeBackgroundColor(
                                { color: '#FF0000' },
                                () => { chrome.action.setBadgeText({ text: '!!' }); },
                            );
                        }
                    } else {
                        let storageItem = {};
                        if (dataUrl != null) {
                            storageItem[i] = dataUrl;
                            console.log('Set', storageItem)
                            chrome.storage.local.set(storageItem);
                        }
                        chrome.action.setBadgeBackgroundColor(
                            { color: '#00FF00' },
                            () => {
                                chrome.action.setBadgeText({ text: 'ON' });
                            }
                        )
                    }
                })
            }
        })
    })
}

async function getId() {
    let queryOptions = { active: true, currentWindow: true };
    let tabs = await chrome.tabs.query(queryOptions);
    if (tabs.length > 0 && tabs[0]) {
        if (currentId != 0 && currentId != tabs[0].id) {
            changed = true
        } else {
            changed = false
        }
        currentId = tabs[0].id
        console.log("Current id is", currentId);
        // chrome.storage.local.set({ key: tabs[0].id }).then(() => {
        //     console.log("Value is set", tabs[0].id);
        // });
        // return tabs[0].id
        capture(tabs[0].id)
    }
}


setInterval(getId, 10000); 