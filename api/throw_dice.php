<?php

require_once __DIR__ . "/vendor/autoload.php";
require_once __DIR__ . "/utils/DbUtils.php";

$database = DbUtils::connect();

$games = $database->selectCollection("games");

$gameId = (int)$_GET["gameId"];
$playerId = (int)$_GET["playerId"];

$game = $games->findOne(["_id" => $gameId]);

$playerColor = NULL;

foreach ($game["players"] as $player) {
    if ($player["_id"] == $playerId) {
        $playerColor = $player["color"];
        break;
    }
}

if ($playerColor == $game["currentColor"] && !$game["hasThrownDice"]) {
    $pointsThrown = rand(1, 6);

    $pawnsToMove = [];

    foreach ($game["positions"][$playerColor] as $index => $position) {
        if ($position == 0 && ($pointsThrown == 6 || $pointsThrown == 1)) {
            $pawnsToMove[] = $index;
        } else if ($position != 0 && $position + $pointsThrown <= 45) {
            $pawnsToMove[] = $index;
        }
    }

    $games->updateOne(
        ["_id" => $gameId],
        [
            '$set' => [
                "pointsThrown" => $pointsThrown,
                "pawnsToMove" => $pawnsToMove,
                "hasThrownDice" => true
            ]
        ]
    );

    echo json_encode(["pointsThrown" => $pointsThrown, "pawnsToMove" => $pawnsToMove]);
} else {
    echo json_encode(["error" => "It's not your turn"]);
}
