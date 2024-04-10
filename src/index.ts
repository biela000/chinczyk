const form = document.querySelector(".player-info-form")!;
const nicknameInput = document.querySelector("#nickname") as HTMLInputElement;

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!nicknameInput.value) return;

    const response = await fetch(`/chinczyk/api/join_game.php?nickname=${nicknameInput.value}`);
    const data = await response.json();

    if (response.ok) {
        window.location.href = `/chinczyk/game.html?gameId=${data.id}&nickname=${nicknameInput.value}`;
    }
})