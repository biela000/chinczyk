<?php

require_once __DIR__ . "/vendor/autoload.php";
require_once __DIR__ . "/utils/DbUtils.php";

$database = DbUtils::connect();

$games = $database->selectCollection("games");

$gameId = (int)$_GET["gameId"];
$playerId = (int)$_GET["playerId"];
$pawnId = (int)$_GET["pawnIndex"];

$game = $games->findOne(["_id" => $gameId]);

$playerColor = null;

foreach ($game["players"] as $player) {
    if ($player["_id"] == $playerId) {
        $playerColor = $player["color"];
    }
}

if ($playerColor != $game["currentColor"] || !$game["hasThrownDice"]) {
    echo json_encode(["error" => "Not your turn"]);
    return;
}

$found = false;

foreach ($game["pawnsToMove"] as $pawn) {
    if ($pawn == $pawnId) {
        $found = true;
    }
}

if (!$found) {
    echo json_encode(["error" => "This pawn is not in the list of pawns to move"]);
    return;
}

if ($game["positions"][$playerColor][$pawnId] == 0) {
    $game["positions"][$playerColor][$pawnId] += 1;
} else {
    $game["positions"][$playerColor][$pawnId] += $game["pointsThrown"];
}

if ($game["positions"][$playerColor][$pawnId] == 45) {
    $game["finishedPawns"][$playerColor]++;
}

foreach ($game["positions"] as $color => $positions) {
    if ($color == $playerColor) {
        continue;
    }

    foreach ($positions as $itPawnId => $position) {
        $actualPosition = DBUtils::getActualPosition($position, $color);
        if ($actualPosition == DBUtils::getActualPosition($game["positions"][$playerColor][$pawnId], $playerColor) && $actualPosition > 0 && $position > 1) {
            $game["positions"][$color][$itPawnId] = 0;
        }
    }
}

$games->replaceOne(["_id" => $gameId], $game);

if ($game["pointsThrown"] == 6) {
    DbUtils::restartTurn($games, $game);
} else {
    DbUtils::passMove($games, $game);
}


echo json_encode($game);