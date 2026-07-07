<?php

namespace App\Console\Commands;

use App\Models\Child;
use Illuminate\Console\Command;

class UppercaseChildNames extends Command
{
    protected $signature = 'children:uppercase-names {--barangay= : Barangay to scope to}';

    protected $description = 'Uppercase first_name, last_name, middle_initial, address, parent_caregiver_name for existing children';

    public function handle()
    {
        $query = Child::query();
        if ($barangay = $this->option('barangay')) {
            $query->where('barangay', $barangay);
        }

        $count = 0;
        $query->chunk(100, function ($children) use (&$count) {
            foreach ($children as $c) {
                $dirty = false;

                if ($c->first_name && $c->first_name !== strtoupper($c->first_name)) {
                    $c->first_name = strtoupper($c->first_name);
                    $dirty = true;
                }
                if ($c->last_name && $c->last_name !== strtoupper($c->last_name)) {
                    $c->last_name = strtoupper($c->last_name);
                    $dirty = true;
                }
                if ($c->middle_initial && $c->middle_initial !== strtoupper($c->middle_initial)) {
                    $c->middle_initial = strtoupper($c->middle_initial);
                    $dirty = true;
                }
                if ($c->address && $c->address !== strtoupper($c->address)) {
                    $c->address = strtoupper($c->address);
                    $dirty = true;
                }
                if ($c->parent_caregiver_name && $c->parent_caregiver_name !== strtoupper($c->parent_caregiver_name)) {
                    $c->parent_caregiver_name = strtoupper($c->parent_caregiver_name);
                    $dirty = true;
                }

                if ($dirty) {
                    $c->save();
                    $count++;
                    $this->line("  Fixed: {$c->fullname}");
                }
            }
        });

        $this->info("Fixed {$count} children.");
    }
}
