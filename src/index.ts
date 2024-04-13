const form = document.querySelector(".player-info-form")!;
const nicknameInput = document.querySelector("#nickname") as HTMLInputElement;

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!nicknameInput.value) return;

    const playerId = +`${Math.floor(Math.random() * 1000)}${Date.now()}`;

    const response = await fetch(`/chinczyk/api/join_game.php?nickname=${nicknameInput.value}&playerId=${playerId}`);
    const payload = await response.json();

    if (response.ok) {
        window.location.href = `/chinczyk/game.html?gameId=${payload.id}&nickname=${nicknameInput.value}&playerId=${playerId}`;
    } else {
        alert(payload.message);
    }
})