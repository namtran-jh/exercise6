let yourStory = "";
let allStories = "";

const accountGlobal = {};
const storyGlobal = {};

let mode, loadingBar;
const modeSwitch = { type: 0 };

// Initial data for all stories
data.forEach(val => {
    // yourStory
    if (val.id === 0) {
        yourStory += '<div class="story-itemAvatar">';
        yourStory += '<img class="story-avatar" src="' + val.avatar + '" alt="My Avatar" />';
        yourStory += '</div>';
        yourStory += '<div class="story-itemInfo">';
        yourStory += '<p class="itemInfo-name">' + val.name + '</p>';
        yourStory += '<div class="itemInfo-detail">';
        yourStory += '<p class="itemInfo-detailQuantity">' + val.news.length + ' new' + '</p>';
        yourStory += '<p class="itemInfo-detailTime">' + '&nbsp;&#183; ' + timeDisplay(val.time) + '</p>';
        yourStory += '</div>';
        yourStory += '</div>';
        yourStory += '<div id="story-itemButton"><span>&#43;</span></div>';
        return;
    }

    // allStories
    allStories += '<div id="story' + val.id + '" class="storyItem" onclick="changeStory(' + val.id + ')">';
    allStories += '<div class="story-itemAvatar">';
    allStories += '<img class="story-avatar" src="' + val.avatar + '" alt="' + val.name + ' avatar" />';
    allStories += '</div>';
    allStories += '<div class="story-itemInfo">';
    allStories += '<p class="itemInfo-name">' + val.name + '</p>';
    allStories += '<div class="itemInfo-detail">';
    allStories += '<p class="itemInfo-detailQuantity">' + val.news.length + ' new' + '</p>';
    allStories += '<p class="itemInfo-detailTime">' + '&nbsp;&#183; ' + timeDisplay(val.time) + '</p>';
    allStories += '</div>';
    allStories += '</div>';
    allStories += '</div>';
})

document.getElementById("story0").innerHTML = yourStory;
document.getElementById("allStories-items").innerHTML = allStories;

data.forEach(val => {
    if (val.status === 0) {
        document.getElementById("story" + val.id).getElementsByClassName("story-itemAvatar")[0].classList.add("storySeen");
    }
})

function timeDisplay(time) {
    const tiktak = Math.round((new Date() - new Date(time)) / 1000);
    let hour = 0,
        minute = 0,
        second = 0;

    if (tiktak >= 60) {
        minute = Math.floor(tiktak / 60);
        second = Math.round(tiktak % 60);
        if (minute >= 60) {
            hour = Math.floor(minute / 60);
            minute = Math.round(minute % 60);
            return hour + "h " + minute + "m ";
        } else {
            return minute + "m " + second + "s";
        }
    } else {
        return tiktak + "s";
    }
}

// Function change another story
function changeStory(id, order) {
    let tmp = {};
    let step = 0;
    document.getElementsByClassName("itemFocus")[0].classList.remove("itemFocus");

    data.some(val => {
        if (val.id === id) {
            val.status = 0;
            tmp = val;
            val.news.some((val, index) => {
                if (val.id === order) {
                    step = index;
                    return true;
                }
            })
            return true;
        }
    })

    setAnimation();
    setGlobal(tmp, step);
    setDocumentStory(tmp, step);
    start();
}

// Function set animation story
function setAnimation() {
    const element = document.getElementById("mainStory-content");
    element.classList.remove("animationMainStory");
    void element.offsetWidth;
    element.classList.add("animationMainStory");
}

// Function set global variable
function setGlobal(story, step) {
    accountGlobal.id = story.id;
    accountGlobal.name = story.name;
    accountGlobal.time = story.time;
    accountGlobal.avatar = story.avatar;
    accountGlobal.news = story.news;
    accountGlobal.status = story.status;

    storyGlobal.id = story.news[step].id;
    storyGlobal.link = story.news[step].link;
    storyGlobal.status = story.news[step].status;
}

// Function set document UI
function setDocumentStory(story, step) {
    document.getElementById("story" + story.id).getElementsByClassName("story-itemAvatar")[0].classList.add("storySeen");
    document.getElementById("story" + story.id).classList.add("itemFocus");

    // document.getElementById("mainStory-background").getElementsByTagName("img")[0].src = story.news[step].link;

    // numberOfNews
    let numberOfNews = "";
    let loadingBars = "";
    story.news.forEach(val => numberOfNews += '<div class="numberOfNews-bar"></div>');
    story.news.forEach(val => loadingBars += '<div class="loading-bar"></div>');
    document.getElementById("content-numberOfNews").innerHTML = numberOfNews;
    document.getElementById("content-loadingBars").innerHTML = loadingBars;

    // info
    document.getElementById("avatar").src = story.avatar;
    document.getElementById("name").innerHTML = story.name;

    // main
    document.getElementById("main-image").src = story.news[step].link;

    // navigation
    if (story.news.length === 1) {
        document.getElementById("mainStory-navigation").style.display = "none";
    } else {
        document.getElementById("mainStory-navigation").style.display = "flex";
        if (step === 0) {
            document.getElementById("goBackward").style.display = "none";
            document.getElementById("goForward").style.display = "block";
            document.getElementById("mainStory-navigation").style.justifyContent = "flex-end";
        }
        if (step === story.news.length - 1) {
            document.getElementById("goForward").style.display = "none";
            document.getElementById("goBackward").style.display = "block";
            document.getElementById("mainStory-navigation").style.justifyContent = "flex-start";
        }
        if (step > 0 && step < story.news.length - 1) {
            document.getElementById("goForward").style.display = "block";
            document.getElementById("goBackward").style.display = "block";
            document.getElementById("mainStory-navigation").style.justifyContent = "space-between";
        }
    }
}

// Function move forward or backward
function move(n) {
    if (accountGlobal.news.length === storyGlobal.id) {
        changeStory(accountGlobal.id + 1, 1)
    } else {
        changeStory(accountGlobal.id, storyGlobal.id + n);
    }
    if (modeSwitch.type === 1) start();
}

// Function stop auto
function stop() {
    modeSwitch.type = 0;
    clearInterval(mode);
}

// Function auto
function start() {
    clearInterval(mode);
    modeSwitch.type = 1;
    // let tmp = mainImage.id
    mode = setInterval(function() {
        move(1);

    }, 5000)

    let width = 0;
    loadingBar = setInterval(frame, 5);

    function frame() {
        if (width == 100) {
            clearInterval(loadingBar);
        } else {
            width++;
            document.getElementById("content-loadingBars").style.width = width + '%';
        }
    }
}

document.getElementById("mainStory-reactionBar").onclick = function() {
    stop();
}

document.getElementById("mainStory-content").onclick = function() {
    start();
}

changeStory(0, 1);