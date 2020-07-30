// Variables for holding string (innerHTML of) each story
let yourStory = "";
let allStories = "";

// Variables for current state (which account/story)
const accountGlobal = {};
const storyGlobal = {};

// Variables for setInterval
let modeInterval, loadingBarInterval;
const stopMode = 0;
const startMode = 1;
const modeSwitch = { type: stopMode };

// Variables for story menu
const storyMenu = { button: false };

// Initial data for all stories
function addInnerHTMLUI() {
    data.forEach(val => {
        // yourStory
        if (val.id === 0) {
            yourStory = `
        <div class="story-itemAvatar">
            <img class="story-avatar" src="${val.avatar}" alt="My Avatar" />
        </div>
        <div class="story-itemInfo">
            <p class="itemInfo-name"> ${val.name} </p>
            <div class="itemInfo-detail">
                <p class="itemInfo-detailQuantity"> ${val.news.length} new </p>
                <p class="itemInfo-detailTime"> &nbsp;&#183; ${timeDisplay(val.time)} </p>
            </div>
        </div>
        <div id="story-itemButton"><span>&#43;</span></div>`;
            return;
        }

        if (val.status === 0) { return } else {
            // allStories
            allStories += `
        <div id="story${val.id}" class="storyItem" onclick="changeStory(${val.id})">
            <div class="story-itemAvatar">
                <img class="story-avatar" src="${val.avatar}" alt="${val.name} avatar" />
            </div>
            <div class="story-itemInfo">
                <p class="itemInfo-name"> ${val.name} </p>
                <div class="itemInfo-detail">
                    <p class="itemInfo-detailQuantity"> ${val.news.length} new </p>
                    <p class="itemInfo-detailTime"> &nbsp;&#183; ${timeDisplay(val.time)} </p>
                </div>
            </div>
            <div id="story${val.id}-itemBug" class="story-itemBug"><img src="./images/icon/realbug.png" alt="Real bug" title="This story is bug"/></div>
        </div>`;
        }
    })
}

// Set innerHTML for list of stories
function renderUI() {
    document.getElementById("story0").innerHTML = yourStory;
    document.getElementById("allStories-items").innerHTML = allStories;
}

// Render UI
addInnerHTMLUI();
renderUI();

// Function restart UI
function restartUI() {
    allStories = "";
    addInnerHTMLUI();
    renderUI();

    data.forEach(val => {
        if (val.bug.initial === 1 && val.status === 1) {
            document.getElementById(`story${val.id}-itemBug`).style.display = "flex";
            document.getElementById(`story${val.id}`).getElementsByClassName("story-itemAvatar")[0].classList.add("storyBug");
        }
    })
}

// Set css greyBorder to story which is seen
data.forEach(val => {
    if (val.status === 0) {
        document.getElementById("story" + val.id).getElementsByClassName("story-itemAvatar")[0].classList.add("storySeen");
    }
})

// Function display time of story
function timeDisplay(time) {
    const tiktak = Math.round((new Date() - new Date(time)) / 1000);
    let day = 0,
        hour = 0,
        minute = 0,
        second = 0;

    if (tiktak >= 60) {
        minute = Math.floor(tiktak / 60);
        second = Math.round(tiktak % 60);
        hour = Math.floor(minute / 60);
        if (hour >= 24) {
            day = Math.floor(hour / 24);
            hour = Math.round(hour % 24);
            return day + "d " + hour + "h ";
        } else {
            if (minute >= 60) {
                hour = Math.floor(minute / 60);
                minute = Math.round(minute % 60);
                return hour + "h " + minute + "m ";
            } else {
                return minute + "m " + second + "s";
            }
        }
    } else {
        return tiktak + "s";
    }
}

// Function change another story
function changeStory(id, order) {
    let tmp = {};
    let step = 0;
    let itemFocus = document.getElementsByClassName("itemFocus")
    if (itemFocus.length !== 0) itemFocus[0].classList.remove("itemFocus");
    if (storyMenu.button) {
        storyMenu.button = !storyMenu.button;
        document.getElementById("storyMenu").style.display = "none";
    }

    data.some(val => {
        if (val.id === id) {
            if (val.status === 1) tmp = val;
            else tmp = data[id + 1];
            if (tmp === undefined) tmp = { id: null };
            val.news.some((val, index) => {
                if (val.id === order) {
                    step = index;
                    return true;
                }
            })
            return true;
        }
    })

    if (tmp.id != null && tmp.bug.status === 1) {
        setGlobal(tmp, step);
        // document.getElementById("hidenValue").value = accountGlobal.id;
        document.getElementById("bugWarning").setAttribute("data-myattr-bugstory", accountGlobal.id);
        document.getElementById("bugWarning").style.display = "flex";
        stop();
    } else {
        if (tmp.id === 0) document.getElementById("info-button").style.display = "none";
        else document.getElementById("info-button").style.display = "block";

        if (tmp.id == null) { closeStory() } else {
            document.getElementById("mainStory-hide").style.zIndex = "-3";

            setAnimation();
            setGlobal(tmp, step);
            setDocumentStory(tmp, step);
            widthStoryRestart();
            start(step);
        }
    }
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
    accountGlobal.bug = story.bug;

    storyGlobal.id = story.news[step].id;
    storyGlobal.link = story.news[step].link;
    storyGlobal.status = story.news[step].status;
    storyGlobal.width = story.news[step].width;
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
    story.news.forEach(val => loadingBars += `<div id="loading${val.id}" class="loading-bar"><div class="loadingBar-bg"></div></div>`);
    document.getElementById("content-numberOfNews").innerHTML = numberOfNews;
    document.getElementById("content-loading").innerHTML = loadingBars;

    // info
    document.getElementById("avatar").src = story.avatar;
    document.getElementById("name").innerHTML = story.name;

    // main
    document.getElementById("main-image").src = story.news[step].link;
    document.getElementById("mainStory-background").getElementsByTagName("img")[0].src = story.news[step].link;

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

// Function restart width of every story instead of showing story
function widthStoryRestart() {
    data.forEach(val => {
        if (val.id !== accountGlobal.id) {
            for (let i = 0; i < val.news.length; i++) {
                val.news[i].width = 0;
            }
        } else {
            for (let i = 0; i < val.news.length; i++) {
                if (val.news[i].id !== storyGlobal.id)
                    val.news[i].width = 0;
            }
        }
    })
}

// Function move forward or backward (navigation)
function move(n) {
    if (accountGlobal.news.length === storyGlobal.id && n === 1) {
        changeStory(accountGlobal.id + 1, 1);
    } else {
        changeStory(accountGlobal.id, storyGlobal.id + n);
    }

    if (modeSwitch.type === startMode) start();
}

// Function close story
function closeStory() {
    stop();
    document.getElementById("mainStory-hide").style.zIndex = "3";
}

// Function stop auto
function stop() {
    modeSwitch.type = stopMode;
    clearInterval(modeInterval);
    clearInterval(loadingBarInterval);
}

// Function auto
function start() {
    clearInterval(loadingBarInterval);
    clearInterval(modeInterval);

    let width, time;
    if (storyGlobal.width === 100 || storyGlobal.width === 0) {
        width = 0;
        time = 50;
    } else {
        width = reassignWidth();
        time = ((100 - width) * 50 / 100);
    }

    modeSwitch.type = startMode;

    // console.log({ width, time });

    // Loading bar
    loadingBarInterval = setInterval(function() {
        for (let i = 1; i < storyGlobal.id; i++) {
            document.getElementById("loading" + i).getElementsByClassName("loadingBar-bg")[0].style.width = '100%';
        }
        if (width == 100) {
            clearInterval(loadingBarInterval);
        } else {
            width++;
            storyGlobal.width = data[accountGlobal.id].news[storyGlobal.id - 1].width = width;
            document.getElementById("loading" + storyGlobal.id).getElementsByClassName("loadingBar-bg")[0].style.width = width + '%';
        }
    }, 50)

    // Story
    modeInterval = setInterval(function() {
        move(1);
    }, time * 100)
}

// Function reassign story width
function reassignWidth() {
    return data[accountGlobal.id].news[storyGlobal.id - 1].width;
}

// Catch onClick event of showing story
document.getElementById("content-main").onclick = function() {
    if (storyMenu.button) {
        storyMenu.button = !storyMenu.button;
        document.getElementById("storyMenu").style.display = "none";
    }
    start();
}

// Function change source image when hover
function hoverReaction(element) {
    element.setAttribute("src", `./images/reaction/${element.title}.gif`);
}
// Function change source image when unhover
function unhoverReaction(element) {
    element.setAttribute("src", `./images/reaction/${element.title}.png`);
}

// Function onClick on a story menu
function storyMenuClick() {
    storyMenu.button = !storyMenu.button;
    if (storyMenu.button === true) {
        stop();
        document.getElementById("storyMenu").style.display = "block";
    } else {
        start();
        document.getElementById("storyMenu").style.display = "none";
    }
}

// Function report bug of story
function storyMenuReport() {
    storyMenuClick();
    if (accountGlobal.id === 0) return;
    data.forEach((val, index) => {
        if (val.id === accountGlobal.id) {
            data[index].bug.status = 1;
            data[index].bug.initial = 1;
            return;
        }
    })
    document.getElementById(`story${accountGlobal.id}-itemBug`).style.display = "flex";
    document.getElementById(`story${accountGlobal.id}`).getElementsByClassName("story-itemAvatar")[0].classList.add("storyBug");

    changeStory(accountGlobal.id + 1, 1);
}

// Function hide story
function storyMenuHide() {
    storyMenuClick();
    stop();
    document.getElementById("hideWarning").style.display = "flex";
}

// Onclick all mainStory reactionBar
document.getElementById("mainStory-reactionBar").onclick = function() {
    if (storyMenu.button) {
        storyMenu.button = !storyMenu.button;
        document.getElementById("storyMenu").style.display = "none";
    }
    stop();
}

// Onclick cancel notification box
function cancelBtn() {
    document.getElementById("bugWarning").style.display = "none";
    document.getElementById("hideWarning").style.display = "none";

    // let id = parseInt(document.getElementById("hidenValue").value);
    let id = parseInt(document.getElementById("bugWarning").getAttribute("data-myattr-bugstory"));
    if (data[id].bug.status === 1) {
        changeStory(id + 1, 1);
    } else {
        start();
    }
}

// Onclick confirm view though the story is bug
function confirmView() {
    document.getElementById("bugWarning").style.display = "none";

    // let id = parseInt(document.getElementById("hidenValue").value);
    let id = parseInt(document.getElementById("bugWarning").getAttribute("data-myattr-bugstory"));
    if (data[id].bug.status === 1) {
        data[id].bug.status = 0;
        changeStory(id, 1);
    } else {
        start()
    }
}

// Onclick confirm hide the story
function confirmHide() {
    document.getElementById("hideWarning").style.display = "none";
    data[accountGlobal.id].status = 0;
    restartUI();
    changeStory(accountGlobal.id + 1, 1);
}

// Function handle story' reactions
document.getElementById("likeReaction").onclick = function() { storyReaction("like") }
document.getElementById("loveReaction").onclick = function() { storyReaction("love") }
document.getElementById("hahaReaction").onclick = function() { storyReaction("haha") }
document.getElementById("wowReaction").onclick = function() { storyReaction("wow") }
document.getElementById("cryReaction").onclick = function() { storyReaction("cry") }
document.getElementById("angryReaction").onclick = function() { storyReaction("angry") }

function storyReaction(str) {
    let top = Math.floor(Math.random() * 500);
    let left = Math.floor(Math.random() * 300);
    let react = document.createElement("img");
    react.classList.add("reactionBar-button");
    react.classList.add("random-position");
    if (top < 50) react.style.top = `70px`;
    else react.style.top = `${top}px`;
    react.style.left = `${left}px`;
    react.src = `./images/reaction/${str}.gif`;
    document.getElementById("mainStory-content").appendChild(react);
    setTimeout(function() {
        if (document.getElementsByClassName("reactionBar-button").length > 0) {
            document.getElementsByClassName("reactionBar-button")[0].remove();
        }
    }, 1000)
}

// Start my own story at first time loading
changeStory(0, 1);