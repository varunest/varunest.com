var botui = new BotUI('chat-box');

function describeInDetail() {
    return botui.message.add({
        loading: true,
        delay: 1000,
        content: "Cool !! 😎"
    }).then(function () {
        return botui.message.add({
            loading: true,
            delay: 2000,
            content: "I've always been interested in design and development. I believe for most of the products, both of these go hand in hand."
        })
    }).then(function () {
        return botui.message.add({
            loading: true,
            delay: 3000,
            content: "Because of this enthusiasm towards tech & UX I have come across wide variety of technologies and projects, which I try to update here on this website."
        })
    }).then(function () {
        return botui.message.add({
            loading: true,
            delay: 5000,
            content: "Crap 😱"
        })
    }).then(function () {
        return botui.message.add({
            loading: true,
            delay: 3000,
            content: "Server on fire🔥🔥🔥"
        })
    }).then(function () {
        return botui.message.add({
            loading: true,
            delay: 500,
            content: "GTG!!"
        })
    }).then(function () {
        return botui.message.add({
            loading: true,
            delay: 3000,
            content: "Meanwhile, feel free to explore the website."
        })
    }).then(function () {
        return botui.message.add({
            loading: true,
            delay: 1000,
            content: "byee 👋"
        })
    });
}

function wrapUpShort() {
    return botui.message.add({
        loading: true,
        delay: 1000,
        content: "<br>😔 Okay!!<br>"
    }).then(function () {
        return botui.message.add({
            loading: true,
            delay: 2000,
            content: "![](https://media.giphy.com/media/NTY1kHmcLsCsg/giphy.gif) It seems you are in a hurry! <br>Feel free to explore website or drop me a mail at [mailvarunest@gmail.com](mailto:mailvarunest@gmail.com)"
        });
    })
}

botui.message.add({
    delay: 1000,
    content: 'Hi there!'
}).then(function () { // wait till previous message has been shown.
    return botui.message.add({
        delay: 2000,
        loading: true,
        content: 'My name is Varun and most of my time is spent designing and developing stuff. Do you wish to know more about me?'
    });
}).then(function () {
    return botui.action.button({
        human: true,
        delay: 1000,
        action: [
            {
                text: 'Yes 👍',
                value: 1
            },
            {
                text: "Shut up already! 😷",
                value: 2
            }
        ]
    })
}).then(function (res) {
    if (res.value === 1) {
        return describeInDetail();
    } else {
        return wrapUpShort();
    }
});