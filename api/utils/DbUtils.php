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
            "currentMove" => NULL,
            "isGameGoing" => true,
            "pointsThrown" => NULL,
            "moveStartedAt" => 0,
            "playersCount" => 1,
            "pawnsToMove" => NULL,
            "hasThrownDice" => false,
            "finishedPawns" => [
                "red" => 0,
                "blue" => 0,
                "green" => 0,
                "yellow" => 0
            ],
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
        $game["moveStartedAt"] = time() * 1000;

        $games->replaceOne(
            ["_id" => $game["_id"]],
            $game
        );

        return $game;
    }

    public static function restartTurn(MongoDB\Collection $games, array|object $game): array|object
    {
        $game["pawnsToMove"] = NULL;
        $game["hasThrownDice"] = false;
        $game["currentMove"] = NULL;
        $game["moveStartedAt"] = time() * 1000;

        $games->replaceOne(
            ["_id" => $game["_id"]],
            $game
        );

        return $game;
    }

    public static function passMove(MongoDB\Collection $games, array|object $game): array|object
    {
        $game["pawnsToMove"] = NULL;
        $game["hasThrownDice"] = false;
        $game["currentMove"] = NULL;
        $game["currentColor"] = self::getNextColor($game);
        $game["moveStartedAt"] = time() * 1000;

        $games->replaceOne(
            ["_id" => $game["_id"]],
            $game
        );

        return $game;
    }

    public static function getNextColor(array|object $game): string
    {
        $currentColorIndex = 0;
        $colors = ["red", "blue", "green", "yellow"];

        foreach ($colors as $key => $color) {
            if ($color == $game["currentColor"]) {
                $currentColorIndex = $key;
                break;
            }
        }

        return $colors[($currentColorIndex + 1) % $game["playersCount"]];
    }

    public static function getActualPosition(int $position, string $color): int
    {
        if ($position == 0) {
            return 0;
        }

        // Pawn cannot be beaten
        if ($position > 40) {
            return -1;
        }

        return match ($color) {
            "red" => $position,
            "blue" => $position + 10 > 40 ? ($position + 10) % 41 + 1 : $position + 10,
            "green" => $position + 20 > 40 ? ($position + 20) % 41 + 1 : $position + 20,
            "yellow" => $position + 30 > 40 ? ($position + 30) % 41 + 1 : $position + 30,
            default => -1,
        };
    }
}