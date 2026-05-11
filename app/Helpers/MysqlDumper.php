<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PDO;

/**
 * Pure-PHP MySQL dump utility.
 *
 * Generates a mysqldump-compatible SQL file using only PDO — no subprocess
 * is spawned, so Windows Winsock errors (10106) from the web server context
 * cannot occur.
 */
class MysqlDumper
{
    private PDO $pdo;

    private string $database;

    /**
     * Run a full dump of the given connection and write it to $outputFile.
     *
     * @param  string  $connection  Laravel DB connection name (default: DB_CONNECTION)
     */
    public static function dump(string $outputFile, string $connection = 'mysql'): void
    {
        (new self($connection))->writeDump($outputFile);
    }

    private function __construct(string $connection)
    {
        $cfg = config("database.connections.{$connection}");

        $this->database = $cfg['database'];

        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            $cfg['host'],
            $cfg['port'] ?? 3306,
            $cfg['database'],
            $cfg['charset'] ?? 'utf8mb4',
        );

        $this->pdo = new PDO($dsn, $cfg['username'], $cfg['password'] ?? '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
    }

    private function writeDump(string $outputFile): void
    {
        $dir = dirname($outputFile);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $fh = fopen($outputFile, 'w');
        if ($fh === false) {
            throw new \RuntimeException("Cannot open output file for writing: {$outputFile}");
        }

        try {
            $this->writeHeader($fh);

            $tables = $this->getTables();
            foreach ($tables as $table) {
                $this->writeTable($fh, $table);
            }

            $this->writeFooter($fh);
        } finally {
            fclose($fh);
        }

        Log::info("[MysqlDumper] Dump written to: {$outputFile} (".round(filesize($outputFile) / 1024, 1).' KB)');
    }

    /** @param  resource  $fh */
    private function writeHeader($fh): void
    {
        $ts = date('Y-m-d H:i:s');
        fwrite($fh, "-- MySQL dump (PHP-native, no subprocess)\n");
        fwrite($fh, "-- Generated: {$ts}\n");
        fwrite($fh, "-- Database: {$this->database}\n");
        fwrite($fh, "-- --------------------------------------------------------\n\n");
        fwrite($fh, "SET FOREIGN_KEY_CHECKS=0;\n");
        fwrite($fh, "SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';\n");
        fwrite($fh, "SET NAMES utf8mb4;\n\n");
    }

    /** @param  resource  $fh */
    private function writeFooter($fh): void
    {
        fwrite($fh, "\nSET FOREIGN_KEY_CHECKS=1;\n");
    }

    /** @return string[] */
    private function getTables(): array
    {
        $stmt = $this->pdo->query('SHOW FULL TABLES WHERE Table_type = \'BASE TABLE\'');
        $tables = [];
        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $tables[] = $row[0];
        }

        return $tables;
    }

    /** @param  resource  $fh */
    private function writeTable($fh, string $table): void
    {
        $quoted = "`{$table}`";

        // -- Structure --
        fwrite($fh, "\n-- --------------------------------------------------------\n");
        fwrite($fh, "-- Table structure for table {$quoted}\n");
        fwrite($fh, "-- --------------------------------------------------------\n\n");
        fwrite($fh, "DROP TABLE IF EXISTS {$quoted};\n");

        $createStmt = $this->pdo->query("SHOW CREATE TABLE {$quoted}");
        $createRow = $createStmt->fetch(PDO::FETCH_NUM);
        fwrite($fh, $createRow[1].";\n\n");

        // -- Data --
        $countStmt = $this->pdo->query("SELECT COUNT(*) FROM {$quoted}");
        $count = (int) $countStmt->fetchColumn();

        if ($count === 0) {
            return;
        }

        fwrite($fh, "-- Dumping data for table {$quoted}\n\n");
        fwrite($fh, "LOCK TABLES {$quoted} WRITE;\n");
        fwrite($fh, "/*!40000 ALTER TABLE {$quoted} DISABLE KEYS */;\n");

        $batchSize = 500;
        $offset = 0;

        while ($offset < $count) {
            $stmt = $this->pdo->query("SELECT * FROM {$quoted} LIMIT {$batchSize} OFFSET {$offset}");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($rows)) {
                break;
            }

            $columns = '`'.implode('`, `', array_keys($rows[0])).'`';
            $valueLines = [];

            foreach ($rows as $row) {
                $vals = array_map(fn ($v) => $v === null ? 'NULL' : $this->pdo->quote((string) $v), $row);
                $valueLines[] = '('.implode(', ', $vals).')';
            }

            fwrite($fh, "INSERT INTO {$quoted} ({$columns}) VALUES\n");
            fwrite($fh, implode(",\n", $valueLines).";\n");

            $offset += $batchSize;
        }

        fwrite($fh, "/*!40000 ALTER TABLE {$quoted} ENABLE KEYS */;\n");
        fwrite($fh, "UNLOCK TABLES;\n");
    }
}
