<?php

require_once __DIR__ . "/vendor/autoload.php";
require_once __DIR__ . "/utils/DbUtils.php";

$database = DbUtils::connect();

$games = $database->selectCollection("games");

$game_id = (int)$_GET["gameId"];

$game = $games->findOne(["_id" => $game_id]);

if ($game->hasGameStarted) {
    echo json_encode($game);
    return;
}

$players = $game["players"];
$playersCount = 0;
$readyPlayersCount = 0;

foreach ($players as $key => $player) {
    if ($player["_id"] == $_GET["playerId"]) {
        $players[$key]["ready"] = true;
    }

    if (isset($player["_id"])) {
        $playersCount++;

        if ($player["ready"]) {
            $readyPlayersCount++;
        }
    }
}

$games->updateOne(["_id" => $game_id], ['$set' => ["players" => $players]]);

$areAllPlayersReady = $playersCount == $readyPlayersCount && $playersCount > 1;

if ($areAllPlayersReady) {
    DbUtils::startGame($games, $game);

    echo json_encode($games->findOne(["_id" => $game_id]));

    DbUtils::startMoveCountdown($games, $game);
} else {
    echo json_encode($games->findOne(["_id" => $game_id]));
}

