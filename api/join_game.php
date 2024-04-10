<?php
require_once __DIR__ . "/vendor/autoload.php";

use MongoDB\Client;

$uri = 'mongodb+srv://jabila:6798241510695@cluster0.n80rzlt.mongodb.net/?retryWrites=true&w=majority';

$client = new MongoDB\Client($uri);

$db = $client->selectDatabase("chinczyk");

$collection = $db->games;

$document = $collection->findOne(["full" => false]);

if (is_null($document)) {
    $document = $collection->insertOne([
        "_id" => rand(),
        "players" => [
            ["name" => $_GET["nickname"], "color" => "red", "ready" => false],
            ["name" => NULL, "color" => "blue", "ready" => false],
            ["name" => NULL, "color" => "green", "ready" => false],
            ["name" => NULL, "color" => "yellow", "ready" => false]
        ],
        "turn" => 0,
        "current_move" => NULL,
        "positions" => [
            "red" => [0, 0, 0, 0],
            "blue" => [0, 0, 0, 0],
            "green" => [0, 0, 0, 0],
            "yellow" => [0, 0, 0, 0]
        ],
        "created_at" => date('Y-m-d H:i:s'),
        "full" => false
    ]);
} else {
    foreach ($document["players"] as $player) {
        if ($player["color"] == "yellow") {
            $document["full"] = true;
        }

        if (is_null($player["name"])) {
            $player["name"] = $_GET["nickname"];
            break;
        }
    }

    $collection->replaceOne(
        ["_id" => $document["_id"]],
        $document
    );
}

echo json_encode(["id" => $document["_id"]]);