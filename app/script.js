var userId = localStorage.getItem("userId") || randomId();
localStorage.setItem("userId", userId);

console.info("Hi I'm a user #", userId);
var messageCache;

function randomId() {
    return Math.floor(Math.random() * 1e11);
}

var socket = io.connect('http://localhost:3000', {'forceNew': true});

socket.on("messages", function(data) {
    messageCache = data;
    render();    
});

function render() {
    /*
        This function gets called on load, via socket.emit(messages), to load the messages list from backend

    */
    var data = messageCache;
    let html = data.sort(function(a,b) {
        return a.ts-b.ts;
    }).map(function(data, index) {
        return (`
            <form class="message" onsubmit="return likeMessage(messageCache[${index}])">
                <div class="name">
                    ${data.userName}
                </div>
                <a href=${data.content.link} class="message" target="_blank">
                    ${data.content.text}
                </a>
                <div class="time">${moment(data.ts).fromNow()}</div>
                <input type="submit" class="likes-count" value="${data.likedBy.length} Likes">
            </form>
        `);
    }).join("\n");

    document.getElementById("messages").innerHTML = html;
}

function likeMessage(message) {
    // Check if the userId exists, index = -1 says userId doesn't exist else it exists,
    // either way we are concerned about the length of the likedBy array
    var index = message.likedBy.indexOf(userId);
    if(index < 0) {
        // if userId doesn't exist, add
        message.likedBy.push(userId);
    } else {
        // if userId exists, pop it out
        message.likedBy.pop(userId);
    }

    socket.emit("update-message", message);
    return false;
}

function addMessage(e) {
    var payload = {
        messageId: randomId(),
        userName: document.getElementById("username").value,
        content: {
            text: document.getElementById("message").value,
            link: document.getElementById("linkAddress").value
        },
        likedBy: [],
        ts: Date.now()
    }
    socket.emit("new-message", payload);

    return false;
}