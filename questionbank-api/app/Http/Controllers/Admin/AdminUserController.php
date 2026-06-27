<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;

class AdminUserController extends Controller
{
    public function index()
    {
        $users = User::latest()->get();
        return response()->json($users);
    }

    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|string|in:admin,user',
        ]);

        $user = User::findOrFail($id);
        
        // Prevent admins from demoting themselves (optional but recommended!)
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot change your own role.'], 400);
        }

        $user->update(['role' => $request->role]);
        
        return response()->json(['message' => 'User role updated successfully', 'user' => $user]);
    }
}
