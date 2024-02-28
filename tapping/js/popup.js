function handleResponse(m) {
    console.log('from back:', m.response)
    resemble(m.response.img1).compareTo(m.response.img2).onComplete(function (data) {
        let percent = data.misMatchPercentage;
        let img = data.getImageDataUrl();
        console.log('result', percent, img)
        document.getElementById('percent').textContent = percent + '%';
        document.getElementById('diffu').src = img;
    })
}

function notify(e) {
    chrome.runtime.sendMessage({}, res => {
        handleResponse(res)
    })
}
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#captureBtn').onclick = notify
});
