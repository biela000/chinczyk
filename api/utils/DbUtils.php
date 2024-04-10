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
        return $games->findOne(["full" => false]);
    }

    public static function createGame(
        MongoDb\Collection $games,
        string $player_nickname
    ): array|object
    {
        $game = [
            "_id" => rand(),
            "players" => [
                ["name" => $player_nickname, "color" => "red", "ready" => false],
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
        ];

        $insertedGameId = $games->insertOne($game)->getInsertedId();

        return $games->findOne(["_id" => $insertedGameId]);
    }

    public static function addPlayer(
        MongoDB\Collection $games,
        array|object $game,
        string $player_nickname
    ): array|object
    {
        foreach ($game["players"] as $player) {
            if ($player["color"] == "yellow") {
                $game["full"] = true;
            }

            if (is_null($player["name"])) {
                $player["name"] = $player_nickname;
                break;
            }
        }

        $games->replaceOne(
            ["_id" => $game["_id"]],
            $game
        );

        return $game;
    }
}