<?php

require_once __DIR__ . "/../vendor/autoload.php";

class DbUtils
{
    public static function connect(): MongoDB\Database
    {
        self::loadEnvironmentVariables();
        $db_link = self::createDbLink();
        return (new MongoDB\Client($db_link))->selectDatabase($_ENV['DB_NAME']);
    }

    private static function loadEnvironmentVariables(): void
    {
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . "/..");
        $dotenv->load();
    }

    private static function createDbLink(): string
    {
        $db_link = $_ENV['DB'];

        $db_link = str_replace("<username>", $_ENV['DB_USERNAME'], $db_link);
        $db_link = str_replace("<password>", $_ENV['DB_PASSWORD'], $db_link);

        return $db_link;
    }

    public static function findEmptyGame(MongoDB\Collection $games): array|null|object
    {
        return $games->findOne(["full" => false, "hasGameStarted" => false]);
    }

    public static function createGame(
        MongoDb\Collection $games,
        string $player_nickname,
        int $player_id
    ): array|object
    {
        $game = [
            "_id" => rand(),
            "players" => [
                ["_id" => $player_id, "name" => $player_nickname, "color" => "red", "ready" => false],
                ["_id" => NULL, "name" => NULL, "color" => "blue", "ready" => false],
                ["_id" => NULL, "name" => NULL, "color" => "green", "ready" => false],
                ["_id" => NULL, "name" => NULL, "color" => "yellow", "ready" => false]
            ],
            "currentColor" => NULL,
            "positions" => [
                "red" => [0, 0, 0, 0],
                "blue" => [0, 0, 0, 0],
                "green" => [0, 0, 0, 0],
                "yellow" => [0, 0, 0, 0]
            ],
            "createdAt" => date('Y-m-d H:i:s'),
            "full" => false,
            "hasGameStarted" => false,
            "moveCountdown" => 0,
            "currentMove" => NULL,
            "isGameGoing" => true,
            "pointsThrown" => 0,
        ];

        $insertedGameId = $games->insertOne($game)->getInsertedId();

        return $games->findOne(["_id" => $insertedGameId]);
    }

    public static function addPlayer(
        MongoDB\Collection $games,
        array|object $game,
        string $player_nickname,
        int $player_id
    ): array|object
    {
        foreach ($game["players"] as $player) {
            if ($player["color"] == "yellow") {
                $game["full"] = true;
            }

            if (is_null($player["name"])) {
                $player["name"] = $player_nickname;
                $player["_id"] = $player_id;
                break;
            }
        }

        $games->replaceOne(
            ["_id" => $game["_id"]],
            $game
        );

        return $game;
    }

    public static function startGame(MongoDB\Collection $games, array|object $game): array|object
    {
        $game["hasGameStarted"] = true;
        $game["currentColor"] = "red";

        $games->replaceOne(
            ["_id" => $game["_id"]],
            $game
        );

        return $game;
    }

    public static function startMoveCountdown(MongoDB\Collection $games, array|object $game): array|object
    {
        $game["moveCountdown"] = MOVE_TIME;
        $lastMove = $game["currentMove"];

        while ($game["moveCountdown"] > 0 && $game["isGameGoing"]) {
            sleep(1);
            $game = $games->findOne(["_id" => $game["_id"]]);
            if (isset($game["currentMove"]) && $game["currentMove"]["_id"] != $lastMove["_id"]) {
                $game["moveCountdown"] = MOVE_TIME;
            }
            $game["moveCountdown"]--;
            $games->replaceOne(
                ["_id" => $game["_id"]],
                $game
            );
        }

        $currentQueuePosition = array_search($game["currentColor"], array_column($game["players"], "color"));
        $nextQueuePosition = ($currentQueuePosition + 1) % 4;

        $game["currentColor"] = $game["players"][$nextQueuePosition]["color"];
        $game["currentMove"] = NULL;

        if ($game["isGameGoing"]) {
            $games->replaceOne(
                ["_id" => $game["_id"]],
                $game
            );

            self::startMoveCountdown($games, $game);
        }
    }
}