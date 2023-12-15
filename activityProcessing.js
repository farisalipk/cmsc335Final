
const difficultyChoice = document.getElementsByName("chooseDifficulty");
[...difficultyChoice].forEach((btn) => {
    btn.addEventListener("change", () => {
        const difficultyBlock = document.querySelector("#accCond")
        const style = window.getComputedStyle(difficultyBlock).display
        if(style === "none" && btn.value == "Yes" && btn.checked){
            difficultyBlock.style.display = "block"
        } else {
            difficultyBlock.style.display = "none"
        }
    });
});

const priceChoice = document.getElementsByName("choosePrice");
[...priceChoice].forEach((btn) => {
    btn.addEventListener("change", () => {
        const priceBlock = document.querySelector("#accPrice")
        const style = window.getComputedStyle(priceBlock).display
        if(style === "none" && btn.value == "Yes" && btn.checked){
            priceBlock.style.display = "block"
        } else {
            priceBlock.style.display = "none"
        }
    });
});

const partChoice = document.getElementsByName("choosePart");
[...partChoice].forEach((btn) => {
    btn.addEventListener("change", () => {
        const partBlock = document.querySelector("#accPart")
        const style = window.getComputedStyle(partBlock).display
        if(style === "none" && btn.value == "Yes" && btn.checked){
            partBlock.style.display = "block"
        } else {
            partBlock.style.display = "none"
        }
    });
});